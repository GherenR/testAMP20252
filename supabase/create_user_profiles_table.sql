-- Create user_profiles table with extended fields
-- Run this in Supabase SQL Editor

-- =====================
-- USER_PROFILES TABLE
-- =====================

-- Drop existing table if you want to recreate (be careful!)
-- DROP TABLE IF EXISTS user_profiles CASCADE;

CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    
    -- School info
    kelas TEXT, -- e.g., '12-1', '12-2', ... '12-7'
    angkatan INTEGER, -- e.g., 2025, 2026
    school TEXT,
    
    -- Contact info
    phone TEXT,
    instagram TEXT,
    
    -- Target 1
    target_university_1 TEXT,
    target_major_1 TEXT,
    
    -- Target 2
    target_university_2 TEXT,
    target_major_2 TEXT,
    
    -- Legacy fields (for backward compatibility)
    target_university TEXT,
    target_major TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add new columns if table already exists
DO $$
BEGIN
    -- Add kelas column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'kelas') THEN
        ALTER TABLE user_profiles ADD COLUMN kelas TEXT;
    END IF;
    
    -- Add angkatan column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'angkatan') THEN
        ALTER TABLE user_profiles ADD COLUMN angkatan INTEGER;
    END IF;
    
    -- Add phone column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'phone') THEN
        ALTER TABLE user_profiles ADD COLUMN phone TEXT;
    END IF;
    
    -- Add instagram column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'instagram') THEN
        ALTER TABLE user_profiles ADD COLUMN instagram TEXT;
    END IF;
    
    -- Add target_university_1 column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'target_university_1') THEN
        ALTER TABLE user_profiles ADD COLUMN target_university_1 TEXT;
    END IF;
    
    -- Add target_major_1 column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'target_major_1') THEN
        ALTER TABLE user_profiles ADD COLUMN target_major_1 TEXT;
    END IF;
    
    -- Add target_university_2 column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'target_university_2') THEN
        ALTER TABLE user_profiles ADD COLUMN target_university_2 TEXT;
    END IF;
    
    -- Add target_major_2 column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'target_major_2') THEN
        ALTER TABLE user_profiles ADD COLUMN target_major_2 TEXT;
    END IF;
END $$;

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT
    USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Policy: Users can insert their own profile (on signup)
CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Grant permissions
GRANT ALL ON user_profiles TO authenticated;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;

CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- Verify table was created
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_profiles'
ORDER BY ordinal_position;
