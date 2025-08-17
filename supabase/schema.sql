-- Football Prediction League Database Schema
-- Run this in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'moderator', 'member');
CREATE TYPE match_status AS ENUM ('pending', 'approved', 'rejected', 'live', 'finished', 'cancelled');
CREATE TYPE message_type AS ENUM ('text', 'prediction', 'match_result', 'system');

-- 1. Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    last_seen TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Leagues table
CREATE TABLE IF NOT EXISTS public.leagues (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    name TEXT NOT NULL,
    country TEXT,
    logo_url TEXT,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    external_id TEXT UNIQUE -- For API integration
);

-- 3. Teams table
CREATE TABLE IF NOT EXISTS public.teams (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    name TEXT NOT NULL,
    short_name TEXT,
    logo_url TEXT,
    league_id UUID REFERENCES public.leagues(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    external_id TEXT UNIQUE -- For API integration
);

-- 4. Groups table
CREATE TABLE IF NOT EXISTS public.groups (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    admin_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    invite_code TEXT UNIQUE DEFAULT substr(md5(random()::text), 1, 8),
    max_members INTEGER DEFAULT 50,
    settings JSONB DEFAULT '{}'::jsonb
);

-- 5. Group members table
CREATE TABLE IF NOT EXISTS public.group_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    role user_role DEFAULT 'member' NOT NULL,
    joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    points INTEGER DEFAULT 0 NOT NULL,
    notifications_enabled BOOLEAN DEFAULT TRUE NOT NULL,
    UNIQUE(group_id, user_id)
);

-- 6. Matches table
CREATE TABLE IF NOT EXISTS public.matches (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE NOT NULL,
    home_team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
    away_team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
    league_id UUID REFERENCES public.leagues(id) ON DELETE CASCADE NOT NULL,
    match_date DATE NOT NULL,
    match_time TIME NOT NULL,
    status match_status DEFAULT 'pending' NOT NULL,
    home_score INTEGER,
    away_score INTEGER,
    created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    share_link TEXT UNIQUE DEFAULT concat('https://ligat-hanichushim.com/match/', substr(md5(random()::text), 1, 12)),
    external_match_id TEXT, -- For API integration
    metadata JSONB DEFAULT '{}'::jsonb,
    CHECK (home_team_id != away_team_id),
    CHECK (match_date >= CURRENT_DATE - INTERVAL '1 day')
);

-- 7. Predictions table
CREATE TABLE IF NOT EXISTS public.predictions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    home_score INTEGER NOT NULL CHECK (home_score >= 0),
    away_score INTEGER NOT NULL CHECK (away_score >= 0),
    points_earned INTEGER DEFAULT 0,
    submitted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    is_locked BOOLEAN DEFAULT FALSE NOT NULL,
    UNIQUE(match_id, user_id)
);

-- 8. Chat messages table
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    message TEXT NOT NULL,
    message_type message_type DEFAULT 'text' NOT NULL,
    reply_to_id UUID REFERENCES public.chat_messages(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    is_edited BOOLEAN DEFAULT FALSE NOT NULL,
    edited_at TIMESTAMPTZ
);

-- 9. Leaderboards table (materialized view as table for performance)
CREATE TABLE IF NOT EXISTS public.leaderboards (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    total_points INTEGER DEFAULT 0 NOT NULL,
    correct_predictions INTEGER DEFAULT 0 NOT NULL,
    total_predictions INTEGER DEFAULT 0 NOT NULL,
    perfect_predictions INTEGER DEFAULT 0 NOT NULL,
    current_streak INTEGER DEFAULT 0 NOT NULL,
    longest_streak INTEGER DEFAULT 0 NOT NULL,
    last_prediction_date DATE,
    rank INTEGER DEFAULT 1 NOT NULL,
    UNIQUE(group_id, user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_last_seen ON public.profiles(last_seen);

CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON public.group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON public.group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_members_points ON public.group_members(group_id, points DESC);

CREATE INDEX IF NOT EXISTS idx_matches_group_id ON public.matches(group_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON public.matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_date ON public.matches(match_date, match_time);
CREATE INDEX IF NOT EXISTS idx_matches_teams ON public.matches(home_team_id, away_team_id);

CREATE INDEX IF NOT EXISTS idx_predictions_match_id ON public.predictions(match_id);
CREATE INDEX IF NOT EXISTS idx_predictions_user_id ON public.predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_predictions_submitted ON public.predictions(submitted_at);

CREATE INDEX IF NOT EXISTS idx_chat_messages_group_id ON public.chat_messages(group_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON public.chat_messages(user_id);

CREATE INDEX IF NOT EXISTS idx_leaderboards_group_id ON public.leaderboards(group_id, rank);
CREATE INDEX IF NOT EXISTS idx_leaderboards_points ON public.leaderboards(group_id, total_points DESC);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER leagues_updated_at BEFORE UPDATE ON public.leagues
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER teams_updated_at BEFORE UPDATE ON public.teams
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER groups_updated_at BEFORE UPDATE ON public.groups
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER matches_updated_at BEFORE UPDATE ON public.matches
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER predictions_updated_at BEFORE UPDATE ON public.predictions
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER leaderboards_updated_at BEFORE UPDATE ON public.leaderboards
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert default leagues
INSERT INTO public.leagues (name, country, external_id) VALUES
    ('ליגת העל הישראלית', 'Israel', 'isr_premier'),
    ('ליגת אלופות אירופה', 'Europe', 'ucl'),
    ('ליגת אירופה', 'Europe', 'uel'),
    ('פרמיירליג', 'England', 'epl'),
    ('לה ליגה', 'Spain', 'laliga'),
    ('בונדסליגה', 'Germany', 'bundesliga'),
    ('סרייה א', 'Italy', 'serie_a'),
    ('ליגה 1', 'France', 'ligue1')
ON CONFLICT (external_id) DO NOTHING;

-- Insert some Israeli teams
INSERT INTO public.teams (name, short_name, league_id, external_id) VALUES
    ('מכבי תל אביב', 'מתא', (SELECT id FROM public.leagues WHERE external_id = 'isr_premier'), 'maccabi_ta'),
    ('הפועל תל אביב', 'הפתא', (SELECT id FROM public.leagues WHERE external_id = 'isr_premier'), 'hapoel_ta'),
    ('מכבי חיפה', 'מכחי', (SELECT id FROM public.leagues WHERE external_id = 'isr_premier'), 'maccabi_haifa'),
    ('הפועל חיפה', 'הפחי', (SELECT id FROM public.leagues WHERE external_id = 'isr_premier'), 'hapoel_haifa'),
    ('בני סכנין', 'בסכ', (SELECT id FROM public.leagues WHERE external_id = 'isr_premier'), 'bnei_sakhnin'),
    ('מכבי פתח תקווה', 'מפת', (SELECT id FROM public.leagues WHERE external_id = 'isr_premier'), 'maccabi_pt'),
    ('הפועל באר שבע', 'הפבש', (SELECT id FROM public.leagues WHERE external_id = 'isr_premier'), 'hapoel_bs'),
    ('מכבי נתניה', 'מנת', (SELECT id FROM public.leagues WHERE external_id = 'isr_premier'), 'maccabi_netanya')
ON CONFLICT (external_id) DO NOTHING;

-- Insert some European teams
INSERT INTO public.teams (name, short_name, league_id, external_id) VALUES
    ('ריאל מדריד', 'רמד', (SELECT id FROM public.leagues WHERE external_id = 'laliga'), 'real_madrid'),
    ('ברצלונה', 'ברצ', (SELECT id FROM public.leagues WHERE external_id = 'laliga'), 'barcelona'),
    ('מנצ\'סטר סיטי', 'מסיטי', (SELECT id FROM public.leagues WHERE external_id = 'epl'), 'man_city'),
    ('ליברפול', 'ליבר', (SELECT id FROM public.leagues WHERE external_id = 'epl'), 'liverpool'),
    ('בייארן מינכן', 'ביירן', (SELECT id FROM public.leagues WHERE external_id = 'bundesliga'), 'bayern'),
    ('פריז סן ז\'רמן', 'פסז', (SELECT id FROM public.leagues WHERE external_id = 'ligue1'), 'psg')
ON CONFLICT (external_id) DO NOTHING;