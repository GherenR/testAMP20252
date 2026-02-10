-- Add role column to user_profiles table
-- Run this in Supabase SQL Editor

-- =====================
-- ADD ROLE COLUMN
-- =====================

-- Add role column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'role') THEN
        ALTER TABLE user_profiles ADD COLUMN role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin'));
    END IF;
END $$;

-- Update existing users without role to 'user'
UPDATE user_profiles SET role = 'user' WHERE role IS NULL;

-- =====================
-- SET INITIAL ADMINS
-- =====================

-- Set your admin accounts (change emails as needed)
UPDATE user_profiles SET role = 'super_admin' WHERE email = 'gherenramandra@gmail.com';
UPDATE user_profiles SET role = 'super_admin' WHERE email = 'saputragheren@gmail.com';

-- =====================
-- UPDATE TRIGGER TO SET DEFAULT ROLE
-- =====================

-- Update the trigger function to set role='user' by default
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        'user'  -- All new signups get 'user' role
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================
-- UPDATE RLS POLICIES
-- =====================

-- Drop old policies
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT
    USING (auth.uid() = id);

-- Policy: Admins can view ALL profiles
CREATE POLICY "Admins can view all profiles" ON user_profiles
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() 
            AND up.role IN ('admin', 'super_admin')
        )
    );

-- Policy: Users can update their own profile (but NOT role)
CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Policy: Admins can update ALL profiles (including role)
CREATE POLICY "Admins can update all profiles" ON user_profiles
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() 
            AND up.role IN ('admin', 'super_admin')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() 
            AND up.role IN ('admin', 'super_admin')
        )
    );

-- Policy: Users can insert their own profile (on signup)
CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- =====================
-- VERIFY SETUP
-- =====================

SELECT 
    id,
    email,
    full_name,
    role,
    created_at
FROM user_profiles
ORDER BY 
    CASE role 
        WHEN 'super_admin' THEN 1 
        WHEN 'admin' THEN 2 
        ELSE 3 
    END,
    created_at DESC;
