-- Create admin roles system
-- Run this in Supabase SQL Editor

-- =====================
-- OPTION 1: Add role column to user_profiles
-- =====================

-- Add role column to user_profiles if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'role') THEN
        ALTER TABLE user_profiles ADD COLUMN role TEXT DEFAULT 'user';
    END IF;
END $$;

-- =====================
-- OPTION 2: Create separate admin_users table (more secure)
-- =====================

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    is_active BOOLEAN DEFAULT true
);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Admin can view admin_users" ON admin_users;
DROP POLICY IF EXISTS "Super admin can manage admin_users" ON admin_users;
DROP POLICY IF EXISTS "Anyone can check if they are admin" ON admin_users;

-- Policy: Anyone can check if they are admin (for login check)
CREATE POLICY "Anyone can check if they are admin" ON admin_users
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Super admin can manage admin_users
CREATE POLICY "Super admin can manage admin_users" ON admin_users
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM admin_users au 
            WHERE au.user_id = auth.uid() 
            AND au.role = 'super_admin'
            AND au.is_active = true
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_users au 
            WHERE au.user_id = auth.uid() 
            AND au.role = 'super_admin'
            AND au.is_active = true
        )
    );

-- Grant permissions
GRANT SELECT ON admin_users TO authenticated;
GRANT ALL ON admin_users TO service_role;

-- =====================
-- INSERT INITIAL ADMIN USERS
-- =====================

-- Insert your admin emails (you need to get the user_id from auth.users)
-- First, let's create a function to easily add admins by email

CREATE OR REPLACE FUNCTION add_admin_by_email(admin_email TEXT, admin_role TEXT DEFAULT 'admin')
RETURNS TEXT AS $$
DECLARE
    found_user_id UUID;
BEGIN
    -- Find user by email
    SELECT id INTO found_user_id FROM auth.users WHERE email = admin_email;
    
    IF found_user_id IS NULL THEN
        RETURN 'Error: User with email ' || admin_email || ' not found. They need to sign up first.';
    END IF;
    
    -- Check if already admin
    IF EXISTS (SELECT 1 FROM admin_users WHERE user_id = found_user_id) THEN
        -- Update role if exists
        UPDATE admin_users SET role = admin_role, is_active = true WHERE user_id = found_user_id;
        RETURN 'Updated: ' || admin_email || ' is now ' || admin_role;
    END IF;
    
    -- Insert new admin
    INSERT INTO admin_users (user_id, email, role)
    VALUES (found_user_id, admin_email, admin_role);
    
    RETURN 'Success: ' || admin_email || ' added as ' || admin_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================
-- ADD YOUR ADMINS HERE
-- =====================
-- Run these after the users have signed up:

SELECT add_admin_by_email('gherenramandra@gmail.com', 'super_admin');
SELECT add_admin_by_email('saputragheren@gmail.com', 'super_admin');

-- To add more admins later, run:
-- SELECT add_admin_by_email('newemail@example.com', 'admin');

-- =====================
-- CREATE HELPER FUNCTION TO CHECK ADMIN STATUS
-- =====================

CREATE OR REPLACE FUNCTION is_admin(check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM admin_users 
        WHERE user_id = check_user_id 
        AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get admin role
CREATE OR REPLACE FUNCTION get_admin_role(check_user_id UUID)
RETURNS TEXT AS $$
DECLARE
    admin_role TEXT;
BEGIN
    SELECT role INTO admin_role FROM admin_users 
    WHERE user_id = check_user_id 
    AND is_active = true;
    
    RETURN admin_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================
-- VERIFY SETUP
-- =====================

SELECT 
    au.email,
    au.role,
    au.is_active,
    au.created_at
FROM admin_users au
ORDER BY au.created_at;
