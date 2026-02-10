-- Fix RLS policies for tryouts and related admin tables
-- Run this in Supabase SQL Editor

-- =====================
-- TRYOUTS TABLE
-- =====================

-- Enable RLS
ALTER TABLE tryouts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow public read active tryouts" ON tryouts;
DROP POLICY IF EXISTS "Allow admin full access to tryouts" ON tryouts;
DROP POLICY IF EXISTS "Allow authenticated users to read active tryouts" ON tryouts;

-- Policy 1: Everyone can read active tryouts
CREATE POLICY "Allow public read active tryouts" ON tryouts
    FOR SELECT
    USING (is_active = true);

-- Policy 2: Authenticated users can read all tryouts (for admin)
CREATE POLICY "Allow authenticated full access" ON tryouts
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- =====================
-- TRYOUT_SOAL TABLE
-- =====================

-- Enable RLS
ALTER TABLE tryout_soal ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow public read soal" ON tryout_soal;
DROP POLICY IF EXISTS "Allow authenticated full access soal" ON tryout_soal;

-- Policy 1: Everyone can read soal for active tryouts
CREATE POLICY "Allow public read soal" ON tryout_soal
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM tryouts 
            WHERE tryouts.id = tryout_soal.tryout_id 
            AND tryouts.is_active = true
        )
    );

-- Policy 2: Authenticated users have full access
CREATE POLICY "Allow authenticated full access soal" ON tryout_soal
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- =====================
-- TRYOUT_ATTEMPTS TABLE
-- =====================

-- Enable RLS
ALTER TABLE tryout_attempts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can manage own attempts" ON tryout_attempts;
DROP POLICY IF EXISTS "Allow authenticated read attempts" ON tryout_attempts;

-- Policy: Users can manage their own attempts
CREATE POLICY "Users can manage own attempts" ON tryout_attempts
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- =====================
-- ADMIN TABLES (if they exist)
-- =====================

-- admin_pending_approvals
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'admin_pending_approvals') THEN
        ALTER TABLE admin_pending_approvals ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Allow authenticated access pending" ON admin_pending_approvals;
        
        CREATE POLICY "Allow authenticated access pending" ON admin_pending_approvals
            FOR ALL
            USING (auth.role() = 'authenticated')
            WITH CHECK (auth.role() = 'authenticated');
    END IF;
END $$;

-- admin_error_logs
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'admin_error_logs') THEN
        ALTER TABLE admin_error_logs ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Allow authenticated access errors" ON admin_error_logs;
        
        CREATE POLICY "Allow authenticated access errors" ON admin_error_logs
            FOR ALL
            USING (auth.role() = 'authenticated')
            WITH CHECK (auth.role() = 'authenticated');
    END IF;
END $$;

-- admin_notes
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'admin_notes') THEN
        ALTER TABLE admin_notes ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Allow authenticated access notes" ON admin_notes;
        
        CREATE POLICY "Allow authenticated access notes" ON admin_notes
            FOR ALL
            USING (auth.role() = 'authenticated')
            WITH CHECK (auth.role() = 'authenticated');
    END IF;
END $$;

-- admin_activity_log
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'admin_activity_log') THEN
        ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Allow authenticated access activity" ON admin_activity_log;
        
        CREATE POLICY "Allow authenticated access activity" ON admin_activity_log
            FOR ALL
            USING (auth.role() = 'authenticated')
            WITH CHECK (auth.role() = 'authenticated');
    END IF;
END $$;

-- =====================
-- GRANT PERMISSIONS
-- =====================

-- Grant usage on tables to authenticated and anon roles
GRANT SELECT ON tryouts TO anon;
GRANT ALL ON tryouts TO authenticated;

GRANT SELECT ON tryout_soal TO anon;
GRANT ALL ON tryout_soal TO authenticated;

GRANT ALL ON tryout_attempts TO authenticated;

-- If sequences exist, grant usage
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Verify setup
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('tryouts', 'tryout_soal', 'tryout_attempts')
ORDER BY tablename;
