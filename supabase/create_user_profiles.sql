-- User Profiles Table for SNBT/SNBP Area
-- Run this in Supabase SQL Editor

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    school TEXT,
    target_university TEXT,
    target_major TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY "Users can read own profile"
    ON public.user_profiles
    FOR SELECT
    USING (auth.uid() = id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile"
    ON public.user_profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON public.user_profiles
    FOR UPDATE
    USING (auth.uid() = id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Optional: Create table for storing user tryout results
CREATE TABLE IF NOT EXISTS public.tryout_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    correct_answers INTEGER NOT NULL,
    time_spent_seconds INTEGER,
    subtes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on tryout_results
ALTER TABLE public.tryout_results ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own results
CREATE POLICY "Users can read own tryout results"
    ON public.tryout_results
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can insert their own results
CREATE POLICY "Users can insert own tryout results"
    ON public.tryout_results
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create index
CREATE INDEX IF NOT EXISTS idx_tryout_results_user_id ON public.tryout_results(user_id);

-- Optional: Create table for storing saved prodi (favorit prodi)
CREATE TABLE IF NOT EXISTS public.saved_prodi (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    prodi_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, prodi_id)
);

-- Enable RLS
ALTER TABLE public.saved_prodi ENABLE ROW LEVEL SECURITY;

-- Policies for saved_prodi
CREATE POLICY "Users can manage own saved prodi"
    ON public.saved_prodi
    FOR ALL
    USING (auth.uid() = user_id);

COMMENT ON TABLE public.user_profiles IS 'User profiles for SNBT/SNBP Area feature';
COMMENT ON TABLE public.tryout_results IS 'Stores user tryout history and scores';
COMMENT ON TABLE public.saved_prodi IS 'Stores user saved/favorited prodi';
