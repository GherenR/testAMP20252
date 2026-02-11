-- Fix user authentication and RLS policies for /snbtarea
-- Run this in Supabase SQL Editor

-- =====================
-- STEP 1: Clean up duplicate/conflicting policies
-- =====================

-- Drop all existing policies for users table
DROP POLICY IF EXISTS "Allow all read" ON public.users;
DROP POLICY IF EXISTS "Allow all insert" ON public.users;
DROP POLICY IF EXISTS "Allow all update" ON public.users;
DROP POLICY IF EXISTS "Allow all delete" ON public.users;
DROP POLICY IF EXISTS "Users can view themselves" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can update users" ON public.users;
DROP POLICY IF EXISTS "Admins can insert users" ON public.users;
DROP POLICY IF EXISTS "Admins can delete users" ON public.users;
DROP POLICY IF EXISTS "Users can read own user row" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
DROP POLICY IF EXISTS "Users can read own row" ON public.users;
DROP POLICY IF EXISTS "Users can update own row" ON public.users;
DROP POLICY IF EXISTS "Users can insert own row" ON public.users;
DROP POLICY IF EXISTS "Users can delete own row" ON public.users;
DROP POLICY IF EXISTS "Users can read their own row" ON public.users;
DROP POLICY IF EXISTS "Users can update their own row" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own row" ON public.users;

-- =====================
-- STEP 2: Create clean, minimal policies
-- =====================

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Public read for authenticated users (needed for admin dashboard)
CREATE POLICY "Authenticated users can read all users" ON public.users
    FOR SELECT
    TO authenticated
    USING (true);

-- Users can insert their own profile (critical for signup)
CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Users can delete their own profile
CREATE POLICY "Users can delete own profile" ON public.users
    FOR DELETE
    TO authenticated
    USING (auth.uid() = id);

-- =====================
-- STEP 3: Sync existing orphaned auth users
-- =====================

-- Insert auth users who don't have users table entries
INSERT INTO public.users (id, email, name, full_name, role, created_at)
SELECT
    au.id,
    au.email,
    au.raw_user_meta_data->>'full_name',
    au.raw_user_meta_data->>'full_name',
    'user',
    au.created_at
FROM auth.users au
WHERE NOT EXISTS (
    SELECT 1 FROM public.users u WHERE u.id = au.id
)
AND au.email_confirmed_at IS NOT NULL
ON CONFLICT (id) DO NOTHING;

-- =====================
-- STEP 4: Verify policies
-- =====================

SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'users'
ORDER BY policyname;

-- =====================
-- STEP 5: Test query (run this manually)
-- =====================

-- Test as authenticated user (replace with actual user ID)
-- SELECT * FROM public.users WHERE id = 'user-id-here';

-- Test insert as authenticated user
-- INSERT INTO public.users (id, email, name, full_name, role, created_at)
-- VALUES ('user-id-here', 'test@example.com', 'Test User', 'Test User', 'user', NOW());
