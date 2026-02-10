-- Sync users and user_profiles tables
-- Run this in Supabase SQL Editor

-- =====================
-- STEP 1: Add role column to users table if not exists
-- =====================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'role') THEN
        ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin'));
    END IF;
END $$;

-- Update existing users without role to 'user'
UPDATE users SET role = 'user' WHERE role IS NULL;

-- =====================
-- STEP 2: Set your admin accounts in users table
-- =====================

UPDATE users SET role = 'super_admin' WHERE email = 'gherenramandra@gmail.com';
UPDATE users SET role = 'super_admin' WHERE email = 'saputragheren@gmail.com';

-- =====================
-- STEP 3: Add foreign key relationship
-- =====================

-- Add user_id column to user_profiles if not exists (for linking)
DO $$
BEGIN
    -- user_profiles.id should already reference auth.users(id)
    -- We just need to make sure both tables can be queried together
    NULL;
END $$;

-- =====================
-- STEP 4: Sync existing SNBT users to users table
-- =====================

-- Insert user_profiles users into users table if they don't exist
INSERT INTO users (id, email, name, role, created_at)
SELECT 
    up.id,
    up.email,
    up.full_name,
    COALESCE(up.role, 'user'),
    up.created_at
FROM user_profiles up
WHERE NOT EXISTS (
    SELECT 1 FROM users u WHERE u.id = up.id
)
ON CONFLICT (id) DO NOTHING;

-- =====================
-- STEP 5: Create trigger to auto-sync on signup
-- =====================

-- Function to sync new user_profiles entry to users table
CREATE OR REPLACE FUNCTION sync_user_profile_to_users()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert into users table when new user_profile is created
    INSERT INTO users (id, email, name, role, created_at)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.full_name,
        COALESCE(NEW.role, 'user'),
        NEW.created_at
    )
    ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        role = EXCLUDED.role;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS sync_profile_to_users ON user_profiles;
CREATE TRIGGER sync_profile_to_users
    AFTER INSERT ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION sync_user_profile_to_users();

-- =====================
-- STEP 6: Create trigger to sync role changes
-- =====================

-- When role is updated in users table, sync to user_profiles
CREATE OR REPLACE FUNCTION sync_users_role_to_profile()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.role IS DISTINCT FROM OLD.role THEN
        UPDATE user_profiles SET role = NEW.role WHERE id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS sync_role_to_profile ON users;
CREATE TRIGGER sync_role_to_profile
    AFTER UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION sync_users_role_to_profile();

-- =====================
-- STEP 7: Update RLS policies for users table
-- =====================

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view themselves" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can update users" ON users;

-- Anyone authenticated can view users (for admin dashboard)
CREATE POLICY "Authenticated can view users" ON users
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Only admins can update users
CREATE POLICY "Admins can update users" ON users
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = auth.uid() 
            AND u.role IN ('admin', 'super_admin')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = auth.uid() 
            AND u.role IN ('admin', 'super_admin')
        )
    );

-- Only admins can insert users
CREATE POLICY "Admins can insert users" ON users
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = auth.uid() 
            AND u.role IN ('admin', 'super_admin')
        )
    );

-- Only admins can delete users
CREATE POLICY "Admins can delete users" ON users
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = auth.uid() 
            AND u.role IN ('admin', 'super_admin')
        )
    );

-- =====================
-- VERIFY SYNC
-- =====================

SELECT 
    u.id,
    u.email,
    u.name,
    u.role as users_role,
    up.full_name,
    up.role as profile_role,
    up.kelas,
    up.angkatan
FROM users u
LEFT JOIN user_profiles up ON u.id = up.id
ORDER BY u.created_at DESC;
