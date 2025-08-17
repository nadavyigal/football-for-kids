-- Database Functions and Stored Procedures
-- Run this after schema and RLS policies

-- Function: Join group using invite code
CREATE OR REPLACE FUNCTION public.join_group_by_invite_code(invite_code TEXT)
RETURNS JSONB AS $$
DECLARE
    group_record RECORD;
    member_count INTEGER;
    result JSONB;
BEGIN
    -- Check if user is authenticated
    IF auth.uid() IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'User not authenticated');
    END IF;

    -- Find the group by invite code
    SELECT * INTO group_record 
    FROM public.groups g 
    WHERE g.invite_code = $1 AND g.is_active = true;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invalid invite code');
    END IF;

    -- Check if user is already a member
    IF EXISTS (
        SELECT 1 FROM public.group_members gm 
        WHERE gm.group_id = group_record.id 
        AND gm.user_id = auth.uid()
    ) THEN
        RETURN jsonb_build_object('success', false, 'error', 'Already a member of this group');
    END IF;

    -- Check if group has space for new members
    SELECT COUNT(*) INTO member_count 
    FROM public.group_members gm 
    WHERE gm.group_id = group_record.id AND gm.is_active = true;

    IF member_count >= group_record.max_members THEN
        RETURN jsonb_build_object('success', false, 'error', 'Group is full');
    END IF;

    -- Add user to group
    INSERT INTO public.group_members (group_id, user_id, role)
    VALUES (group_record.id, auth.uid(), 'member');

    -- Initialize leaderboard entry
    INSERT INTO public.leaderboards (group_id, user_id)
    VALUES (group_record.id, auth.uid())
    ON CONFLICT (group_id, user_id) DO NOTHING;

    RETURN jsonb_build_object(
        'success', true, 
        'group_id', group_record.id,
        'group_name', group_record.name
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Calculate points for a prediction
CREATE OR REPLACE FUNCTION public.calculate_prediction_points(
    predicted_home INTEGER,
    predicted_away INTEGER,
    actual_home INTEGER,
    actual_away INTEGER
)
RETURNS INTEGER AS $$
DECLARE
    points INTEGER := 0;
    predicted_result TEXT;
    actual_result TEXT;
BEGIN
    -- Determine predicted result
    IF predicted_home > predicted_away THEN
        predicted_result := 'home_win';
    ELSIF predicted_home < predicted_away THEN
        predicted_result := 'away_win';
    ELSE
        predicted_result := 'draw';
    END IF;

    -- Determine actual result
    IF actual_home > actual_away THEN
        actual_result := 'home_win';
    ELSIF actual_home < actual_away THEN
        actual_result := 'away_win';
    ELSE
        actual_result := 'draw';
    END IF;

    -- Perfect prediction: exact score
    IF predicted_home = actual_home AND predicted_away = actual_away THEN
        points := 5;
    -- Correct result and correct goal difference
    ELSIF predicted_result = actual_result AND 
          ABS(predicted_home - predicted_away) = ABS(actual_home - actual_away) THEN
        points := 3;
    -- Correct result only
    ELSIF predicted_result = actual_result THEN
        points := 1;
    -- No points for wrong prediction
    ELSE
        points := 0;
    END IF;

    RETURN points;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function: Update match result and calculate points
CREATE OR REPLACE FUNCTION public.update_match_result(
    match_id UUID,
    home_score INTEGER,
    away_score INTEGER
)
RETURNS JSONB AS $$
DECLARE
    match_record RECORD;
    prediction_record RECORD;
    points_earned INTEGER;
    predictions_count INTEGER := 0;
    updated_count INTEGER := 0;
BEGIN
    -- Check if user has permission (group admin)
    SELECT m.*, g.admin_id INTO match_record
    FROM public.matches m
    JOIN public.groups g ON m.group_id = g.id
    WHERE m.id = $1;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Match not found');
    END IF;

    -- Check if user is group admin
    IF NOT public.is_group_admin(match_record.group_id, auth.uid()) THEN
        RETURN jsonb_build_object('success', false, 'error', 'Permission denied');
    END IF;

    -- Update match result
    UPDATE public.matches 
    SET 
        home_score = $2,
        away_score = $3,
        status = 'finished',
        updated_at = NOW()
    WHERE id = $1;

    -- Calculate points for all predictions
    FOR prediction_record IN 
        SELECT * FROM public.predictions WHERE match_id = $1
    LOOP
        predictions_count := predictions_count + 1;
        
        -- Calculate points
        points_earned := public.calculate_prediction_points(
            prediction_record.home_score,
            prediction_record.away_score,
            $2, -- actual home score
            $3  -- actual away score
        );

        -- Update prediction with points earned
        UPDATE public.predictions 
        SET 
            points_earned = points_earned,
            is_locked = true,
            updated_at = NOW()
        WHERE id = prediction_record.id;

        updated_count := updated_count + 1;
    END LOOP;

    -- Refresh leaderboards for this group
    PERFORM public.refresh_group_leaderboard(match_record.group_id);

    RETURN jsonb_build_object(
        'success', true,
        'predictions_updated', updated_count,
        'total_predictions', predictions_count
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Refresh leaderboard for a group
CREATE OR REPLACE FUNCTION public.refresh_group_leaderboard(group_id UUID)
RETURNS VOID AS $$
DECLARE
    user_record RECORD;
    user_stats RECORD;
    user_rank INTEGER := 1;
    prev_points INTEGER := -1;
    rank_counter INTEGER := 0;
BEGIN
    -- Calculate stats for each user in the group
    FOR user_record IN 
        SELECT DISTINCT gm.user_id 
        FROM public.group_members gm 
        WHERE gm.group_id = $1 AND gm.is_active = true
    LOOP
        -- Get user's prediction statistics
        SELECT 
            COALESCE(SUM(p.points_earned), 0) as total_points,
            COUNT(p.id) as total_predictions,
            COUNT(CASE WHEN p.points_earned > 0 THEN 1 END) as correct_predictions,
            COUNT(CASE WHEN p.points_earned = 5 THEN 1 END) as perfect_predictions,
            MAX(p.submitted_at::date) as last_prediction_date
        INTO user_stats
        FROM public.predictions p
        JOIN public.matches m ON p.match_id = m.id
        WHERE p.user_id = user_record.user_id 
        AND m.group_id = $1
        AND m.status = 'finished';

        -- Update or insert leaderboard entry
        INSERT INTO public.leaderboards (
            group_id, 
            user_id, 
            total_points, 
            total_predictions, 
            correct_predictions, 
            perfect_predictions,
            last_prediction_date
        )
        VALUES (
            $1,
            user_record.user_id,
            user_stats.total_points,
            user_stats.total_predictions,
            user_stats.correct_predictions,
            user_stats.perfect_predictions,
            user_stats.last_prediction_date
        )
        ON CONFLICT (group_id, user_id) 
        DO UPDATE SET
            total_points = EXCLUDED.total_points,
            total_predictions = EXCLUDED.total_predictions,
            correct_predictions = EXCLUDED.correct_predictions,
            perfect_predictions = EXCLUDED.perfect_predictions,
            last_prediction_date = EXCLUDED.last_prediction_date,
            updated_at = NOW();
    END LOOP;

    -- Update ranks based on points (handle ties)
    FOR user_record IN 
        SELECT user_id, total_points
        FROM public.leaderboards 
        WHERE group_id = $1
        ORDER BY total_points DESC, correct_predictions DESC, perfect_predictions DESC
    LOOP
        rank_counter := rank_counter + 1;
        
        IF user_record.total_points != prev_points THEN
            user_rank := rank_counter;
        END IF;
        
        UPDATE public.leaderboards 
        SET rank = user_rank, updated_at = NOW()
        WHERE group_id = $1 AND user_id = user_record.user_id;
        
        prev_points := user_record.total_points;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get group leaderboard with user details
CREATE OR REPLACE FUNCTION public.get_group_leaderboard(group_id UUID)
RETURNS TABLE (
    user_id UUID,
    full_name TEXT,
    avatar_url TEXT,
    total_points INTEGER,
    total_predictions INTEGER,
    correct_predictions INTEGER,
    perfect_predictions INTEGER,
    accuracy NUMERIC,
    rank INTEGER,
    last_prediction_date DATE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        l.user_id,
        p.full_name,
        p.avatar_url,
        l.total_points,
        l.total_predictions,
        l.correct_predictions,
        l.perfect_predictions,
        CASE 
            WHEN l.total_predictions > 0 
            THEN ROUND((l.correct_predictions::NUMERIC / l.total_predictions::NUMERIC) * 100, 1)
            ELSE 0 
        END as accuracy,
        l.rank,
        l.last_prediction_date
    FROM public.leaderboards l
    JOIN public.profiles p ON l.user_id = p.id
    WHERE l.group_id = $1
    ORDER BY l.rank ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Create match and generate share link
CREATE OR REPLACE FUNCTION public.create_match_with_share_link(
    group_id UUID,
    home_team_id UUID,
    away_team_id UUID,
    league_id UUID,
    match_date DATE,
    match_time TIME
)
RETURNS JSONB AS $$
DECLARE
    new_match_id UUID;
    share_link TEXT;
BEGIN
    -- Check if user is member of the group
    IF NOT public.is_group_member($1, auth.uid()) THEN
        RETURN jsonb_build_object('success', false, 'error', 'Permission denied');
    END IF;

    -- Validate team selection
    IF $2 = $3 THEN
        RETURN jsonb_build_object('success', false, 'error', 'Home and away teams cannot be the same');
    END IF;

    -- Generate unique share link
    share_link := 'https://ligat-hanichushim.com/match/' || substr(md5(random()::text || clock_timestamp()::text), 1, 12);

    -- Create the match
    INSERT INTO public.matches (
        group_id,
        home_team_id,
        away_team_id,
        league_id,
        match_date,
        match_time,
        created_by,
        share_link
    )
    VALUES ($1, $2, $3, $4, $5, $6, auth.uid(), share_link)
    RETURNING id INTO new_match_id;

    RETURN jsonb_build_object(
        'success', true,
        'match_id', new_match_id,
        'share_link', share_link
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get match details with predictions
CREATE OR REPLACE FUNCTION public.get_match_with_predictions(match_id UUID)
RETURNS JSONB AS $$
DECLARE
    match_data JSONB;
    predictions_data JSONB;
BEGIN
    -- Get match details
    SELECT jsonb_build_object(
        'id', m.id,
        'created_at', m.created_at,
        'group_id', m.group_id,
        'group_name', g.name,
        'home_team', jsonb_build_object('id', ht.id, 'name', ht.name, 'logo_url', ht.logo_url),
        'away_team', jsonb_build_object('id', at.id, 'name', at.name, 'logo_url', at.logo_url),
        'league', jsonb_build_object('id', l.id, 'name', l.name, 'logo_url', l.logo_url),
        'match_date', m.match_date,
        'match_time', m.match_time,
        'status', m.status,
        'home_score', m.home_score,
        'away_score', m.away_score,
        'share_link', m.share_link
    ) INTO match_data
    FROM public.matches m
    JOIN public.groups g ON m.group_id = g.id
    JOIN public.teams ht ON m.home_team_id = ht.id
    JOIN public.teams at ON m.away_team_id = at.id
    JOIN public.leagues l ON m.league_id = l.id
    WHERE m.id = $1;

    IF match_data IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Match not found');
    END IF;

    -- Get predictions
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', p.id,
            'user_id', p.user_id,
            'user_name', pr.full_name,
            'user_avatar', pr.avatar_url,
            'home_score', p.home_score,
            'away_score', p.away_score,
            'points_earned', p.points_earned,
            'submitted_at', p.submitted_at
        ) ORDER BY p.submitted_at
    ) INTO predictions_data
    FROM public.predictions p
    JOIN public.profiles pr ON p.user_id = pr.id
    WHERE p.match_id = $1;

    RETURN jsonb_build_object(
        'success', true,
        'match', match_data,
        'predictions', COALESCE(predictions_data, '[]'::jsonb)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Send system message to group chat
CREATE OR REPLACE FUNCTION public.send_system_message(
    group_id UUID,
    message_text TEXT,
    metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    message_id UUID;
    system_user_id UUID;
BEGIN
    -- Use a system user (you can create a dedicated system user)
    -- For now, we'll use the first admin of the group
    SELECT gm.user_id INTO system_user_id
    FROM public.group_members gm
    WHERE gm.group_id = $1 AND gm.role = 'admin' AND gm.is_active = true
    LIMIT 1;

    INSERT INTO public.chat_messages (
        group_id,
        user_id,
        message,
        message_type,
        metadata
    )
    VALUES ($1, system_user_id, $2, 'system', $3)
    RETURNING id INTO message_id;

    RETURN message_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Send system message when match is approved
CREATE OR REPLACE FUNCTION public.notify_match_approved()
RETURNS TRIGGER AS $$
DECLARE
    home_team_name TEXT;
    away_team_name TEXT;
    message_text TEXT;
BEGIN
    -- Only trigger when status changes to 'approved'
    IF NEW.status = 'approved' AND OLD.status = 'pending' THEN
        -- Get team names
        SELECT ht.name, at.name INTO home_team_name, away_team_name
        FROM public.teams ht, public.teams at
        WHERE ht.id = NEW.home_team_id AND at.id = NEW.away_team_id;

        -- Create system message
        message_text := format('🎉 משחק חדש אושר: %s נגד %s ב-%s בשעה %s', 
            home_team_name, away_team_name, NEW.match_date, NEW.match_time);

        PERFORM public.send_system_message(
            NEW.group_id,
            message_text,
            jsonb_build_object(
                'match_id', NEW.id,
                'type', 'match_approved'
            )
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER notify_match_approved_trigger
    AFTER UPDATE ON public.matches
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_match_approved();