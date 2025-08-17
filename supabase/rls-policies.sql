-- Row Level Security (RLS) Policies
-- Run this after creating the schema

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboards ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin of a group
CREATE OR REPLACE FUNCTION public.is_group_admin(group_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.group_members gm 
        WHERE gm.group_id = $1 
        AND gm.user_id = $2 
        AND gm.role = 'admin' 
        AND gm.is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is member of a group
CREATE OR REPLACE FUNCTION public.is_group_member(group_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.group_members gm 
        WHERE gm.group_id = $1 
        AND gm.user_id = $2 
        AND gm.is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PROFILES TABLE POLICIES
-- Users can view all active profiles (for search, mentions etc.)
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (is_active = true);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- LEAGUES TABLE POLICIES
-- Everyone can view active leagues
CREATE POLICY "Leagues are viewable by everyone" ON public.leagues
    FOR SELECT USING (is_active = true);

-- Only authenticated users can create leagues (for now)
CREATE POLICY "Authenticated users can create leagues" ON public.leagues
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- TEAMS TABLE POLICIES
-- Everyone can view active teams
CREATE POLICY "Teams are viewable by everyone" ON public.teams
    FOR SELECT USING (is_active = true);

-- Only authenticated users can create teams
CREATE POLICY "Authenticated users can create teams" ON public.teams
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- GROUPS TABLE POLICIES
-- Users can view groups they are members of
CREATE POLICY "Users can view their groups" ON public.groups
    FOR SELECT USING (
        is_active = true 
        AND EXISTS (
            SELECT 1 FROM public.group_members gm 
            WHERE gm.group_id = id 
            AND gm.user_id = auth.uid() 
            AND gm.is_active = true
        )
    );

-- Users can create groups
CREATE POLICY "Users can create groups" ON public.groups
    FOR INSERT WITH CHECK (auth.uid() = admin_id);

-- Only group admins can update groups
CREATE POLICY "Group admins can update groups" ON public.groups
    FOR UPDATE USING (
        auth.uid() = admin_id 
        AND is_active = true
    );

-- GROUP_MEMBERS TABLE POLICIES
-- Users can view members of groups they belong to
CREATE POLICY "Users can view group members" ON public.group_members
    FOR SELECT USING (
        is_active = true 
        AND EXISTS (
            SELECT 1 FROM public.group_members gm2 
            WHERE gm2.group_id = group_id 
            AND gm2.user_id = auth.uid() 
            AND gm2.is_active = true
        )
    );

-- Users can join groups (insert their own membership)
CREATE POLICY "Users can join groups" ON public.group_members
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own membership settings
CREATE POLICY "Users can update own membership" ON public.group_members
    FOR UPDATE USING (auth.uid() = user_id);

-- Group admins can update any membership in their group
CREATE POLICY "Group admins can manage members" ON public.group_members
    FOR UPDATE USING (
        public.is_group_admin(group_id, auth.uid())
    );

-- MATCHES TABLE POLICIES
-- Users can view matches in their groups
CREATE POLICY "Users can view group matches" ON public.matches
    FOR SELECT USING (
        public.is_group_member(group_id, auth.uid())
    );

-- Users can create matches in groups they belong to
CREATE POLICY "Users can create group matches" ON public.matches
    FOR INSERT WITH CHECK (
        auth.uid() = created_by 
        AND public.is_group_member(group_id, auth.uid())
    );

-- Group admins can update matches (approve/reject)
CREATE POLICY "Group admins can update matches" ON public.matches
    FOR UPDATE USING (
        public.is_group_admin(group_id, auth.uid())
    );

-- Match creators can update their own pending matches
CREATE POLICY "Match creators can update own pending matches" ON public.matches
    FOR UPDATE USING (
        auth.uid() = created_by 
        AND status = 'pending'
        AND public.is_group_member(group_id, auth.uid())
    );

-- PREDICTIONS TABLE POLICIES
-- Users can view all predictions for matches in their groups
CREATE POLICY "Users can view group predictions" ON public.predictions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.matches m 
            WHERE m.id = match_id 
            AND public.is_group_member(m.group_id, auth.uid())
        )
    );

-- Users can create their own predictions
CREATE POLICY "Users can create own predictions" ON public.predictions
    FOR INSERT WITH CHECK (
        auth.uid() = user_id 
        AND NOT is_locked
        AND EXISTS (
            SELECT 1 FROM public.matches m 
            WHERE m.id = match_id 
            AND m.status = 'approved'
            AND public.is_group_member(m.group_id, auth.uid())
        )
    );

-- Users can update their own unlocked predictions
CREATE POLICY "Users can update own unlocked predictions" ON public.predictions
    FOR UPDATE USING (
        auth.uid() = user_id 
        AND NOT is_locked
    );

-- CHAT_MESSAGES TABLE POLICIES
-- Users can view messages in groups they belong to
CREATE POLICY "Users can view group chat messages" ON public.chat_messages
    FOR SELECT USING (
        public.is_group_member(group_id, auth.uid())
    );

-- Users can create messages in groups they belong to
CREATE POLICY "Users can create group chat messages" ON public.chat_messages
    FOR INSERT WITH CHECK (
        auth.uid() = user_id 
        AND public.is_group_member(group_id, auth.uid())
    );

-- Users can update their own messages (for editing)
CREATE POLICY "Users can update own messages" ON public.chat_messages
    FOR UPDATE USING (auth.uid() = user_id);

-- Group admins can delete any message in their group
CREATE POLICY "Group admins can delete messages" ON public.chat_messages
    FOR DELETE USING (
        public.is_group_admin(group_id, auth.uid())
    );

-- LEADERBOARDS TABLE POLICIES
-- Users can view leaderboards for groups they belong to
CREATE POLICY "Users can view group leaderboards" ON public.leaderboards
    FOR SELECT USING (
        public.is_group_member(group_id, auth.uid())
    );

-- System can insert/update leaderboard entries (via functions)
CREATE POLICY "System can manage leaderboards" ON public.leaderboards
    FOR ALL USING (auth.role() = 'service_role');

-- Additional security: Prevent data modification outside of app logic
-- Create policy to deny direct updates to points in group_members
CREATE POLICY "Prevent direct points updates" ON public.group_members
    FOR UPDATE USING (false) 
    WITH CHECK (false);

-- Allow service role to update points (for functions)
CREATE POLICY "Service role can update points" ON public.group_members
    FOR UPDATE USING (auth.role() = 'service_role') 
    WITH CHECK (auth.role() = 'service_role');

-- Create policy to lock predictions when match starts
CREATE OR REPLACE FUNCTION public.lock_predictions_for_match()
RETURNS TRIGGER AS $$
BEGIN
    -- Lock predictions when match status changes to 'live' or 'finished'
    IF NEW.status IN ('live', 'finished') AND OLD.status NOT IN ('live', 'finished') THEN
        UPDATE public.predictions 
        SET is_locked = true 
        WHERE match_id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER lock_predictions_trigger
    AFTER UPDATE ON public.matches
    FOR EACH ROW
    EXECUTE FUNCTION public.lock_predictions_for_match();

-- Create index for RLS performance
CREATE INDEX IF NOT EXISTS idx_group_members_user_group_active 
    ON public.group_members(user_id, group_id) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_group_members_group_role_active 
    ON public.group_members(group_id, role) WHERE is_active = true;