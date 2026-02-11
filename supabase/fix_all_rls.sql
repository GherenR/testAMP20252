-- ============================================
-- COMPREHENSIVE RLS FIX FOR ALL APP TABLES
-- Run this ENTIRE script in Supabase SQL Editor
-- ============================================

-- =====================
-- 1. USERS TABLE
-- =====================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Authenticated users can read all users" ON users;
DROP POLICY IF EXISTS "Allow authenticated full access users" ON users;

-- Users can read their own profile
CREATE POLICY "Users can read own profile" ON users
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile (for signup)
CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Admin: authenticated users can read all (for admin dashboard user checks)
CREATE POLICY "Authenticated users can read all users" ON users
    FOR SELECT USING (auth.role() = 'authenticated');

GRANT ALL ON users TO authenticated;

-- =====================
-- 2. MENTORS TABLE
-- =====================
ALTER TABLE mentors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read mentors" ON mentors;
DROP POLICY IF EXISTS "Allow authenticated full access mentors" ON mentors;

-- Everyone can read mentors (public facing)
CREATE POLICY "Allow public read mentors" ON mentors
    FOR SELECT USING (true);

-- Authenticated users have full access (admin CRUD)
CREATE POLICY "Allow authenticated full access mentors" ON mentors
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

GRANT SELECT ON mentors TO anon;
GRANT ALL ON mentors TO authenticated;

-- =====================
-- 3. TRYOUTS TABLE
-- =====================
ALTER TABLE tryouts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read active tryouts" ON tryouts;
DROP POLICY IF EXISTS "Allow admin full access to tryouts" ON tryouts;
DROP POLICY IF EXISTS "Allow authenticated users to read active tryouts" ON tryouts;
DROP POLICY IF EXISTS "Allow authenticated full access" ON tryouts;
DROP POLICY IF EXISTS "Allow authenticated full access tryouts" ON tryouts;

-- Everyone can read active tryouts
CREATE POLICY "Allow public read active tryouts" ON tryouts
    FOR SELECT USING (is_active = true);

-- Authenticated users have full access
CREATE POLICY "Allow authenticated full access tryouts" ON tryouts
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

GRANT SELECT ON tryouts TO anon;
GRANT ALL ON tryouts TO authenticated;

-- =====================
-- 4. TRYOUT_SOAL TABLE
-- =====================
ALTER TABLE tryout_soal ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read soal" ON tryout_soal;
DROP POLICY IF EXISTS "Allow authenticated full access soal" ON tryout_soal;

-- Everyone can read soal for active tryouts
CREATE POLICY "Allow public read soal" ON tryout_soal
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM tryouts 
            WHERE tryouts.id = tryout_soal.tryout_id 
            AND tryouts.is_active = true
        )
    );

-- Authenticated users have full access
CREATE POLICY "Allow authenticated full access soal" ON tryout_soal
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

GRANT SELECT ON tryout_soal TO anon;
GRANT ALL ON tryout_soal TO authenticated;

-- =====================
-- 5. TRYOUT_ATTEMPTS TABLE (if exists)
-- =====================
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'tryout_attempts') THEN
        ALTER TABLE tryout_attempts ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Users can manage own attempts" ON tryout_attempts;
        
        CREATE POLICY "Users can manage own attempts" ON tryout_attempts
            FOR ALL
            USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);
            
        GRANT ALL ON tryout_attempts TO authenticated;
    END IF;
END $$;

-- =====================
-- 6. PAGE_VIEWS TABLE (analytics)
-- =====================
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'page_views') THEN
        ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Allow anon insert page_views" ON page_views;
        DROP POLICY IF EXISTS "Allow authenticated full access page_views" ON page_views;
        
        -- Anyone can insert (track page views)
        CREATE POLICY "Allow anon insert page_views" ON page_views
            FOR INSERT WITH CHECK (true);
        
        -- Authenticated users can read (admin analytics)
        CREATE POLICY "Allow authenticated full access page_views" ON page_views
            FOR ALL
            USING (auth.role() = 'authenticated')
            WITH CHECK (auth.role() = 'authenticated');
        
        GRANT INSERT ON page_views TO anon;
        GRANT ALL ON page_views TO authenticated;
    END IF;
END $$;

-- =====================
-- 7. FEATURE_CLICKS TABLE (analytics)
-- =====================
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'feature_clicks') THEN
        ALTER TABLE feature_clicks ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Allow anon insert feature_clicks" ON feature_clicks;
        DROP POLICY IF EXISTS "Allow authenticated full access feature_clicks" ON feature_clicks;
        
        -- Anyone can insert (track clicks)
        CREATE POLICY "Allow anon insert feature_clicks" ON feature_clicks
            FOR INSERT WITH CHECK (true);
        
        -- Authenticated users can read (admin analytics)
        CREATE POLICY "Allow authenticated full access feature_clicks" ON feature_clicks
            FOR ALL
            USING (auth.role() = 'authenticated')
            WITH CHECK (auth.role() = 'authenticated');
        
        GRANT INSERT ON feature_clicks TO anon;
        GRANT ALL ON feature_clicks TO authenticated;
    END IF;
END $$;

-- =====================
-- 8. MENTOR_INTERACTIONS TABLE (analytics)
-- =====================
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'mentor_interactions') THEN
        ALTER TABLE mentor_interactions ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Allow anon insert mentor_interactions" ON mentor_interactions;
        DROP POLICY IF EXISTS "Allow authenticated full access mentor_interactions" ON mentor_interactions;
        
        -- Anyone can insert (track interactions)
        CREATE POLICY "Allow anon insert mentor_interactions" ON mentor_interactions
            FOR INSERT WITH CHECK (true);
        
        -- Authenticated users can read (admin analytics)
        CREATE POLICY "Allow authenticated full access mentor_interactions" ON mentor_interactions
            FOR ALL
            USING (auth.role() = 'authenticated')
            WITH CHECK (auth.role() = 'authenticated');
        
        GRANT INSERT ON mentor_interactions TO anon;
        GRANT ALL ON mentor_interactions TO authenticated;
    END IF;
END $$;

-- =====================
-- 9. ADMIN_ACTIVITY_LOG TABLE
-- =====================
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'admin_activity_log') THEN
        ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Allow authenticated access activity" ON admin_activity_log;
        DROP POLICY IF EXISTS "Allow authenticated full access activity_log" ON admin_activity_log;
        
        CREATE POLICY "Allow authenticated full access activity_log" ON admin_activity_log
            FOR ALL
            USING (auth.role() = 'authenticated')
            WITH CHECK (auth.role() = 'authenticated');
        
        GRANT ALL ON admin_activity_log TO authenticated;
    END IF;
END $$;

-- =====================
-- 10. ADMIN_NOTIFICATIONS TABLE
-- =====================
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'admin_notifications') THEN
        ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Allow authenticated full access notifications" ON admin_notifications;
        
        CREATE POLICY "Allow authenticated full access notifications" ON admin_notifications
            FOR ALL
            USING (auth.role() = 'authenticated')
            WITH CHECK (auth.role() = 'authenticated');
        
        GRANT ALL ON admin_notifications TO authenticated;
    END IF;
END $$;

-- =====================
-- 11. ADMIN_PENDING_APPROVALS TABLE
-- =====================
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'admin_pending_approvals') THEN
        ALTER TABLE admin_pending_approvals ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Allow authenticated access pending" ON admin_pending_approvals;
        DROP POLICY IF EXISTS "Allow authenticated full access pending" ON admin_pending_approvals;
        
        CREATE POLICY "Allow authenticated full access pending" ON admin_pending_approvals
            FOR ALL
            USING (auth.role() = 'authenticated')
            WITH CHECK (auth.role() = 'authenticated');
        
        GRANT ALL ON admin_pending_approvals TO authenticated;
    END IF;
END $$;

-- =====================
-- 12. ADMIN_ERROR_LOGS TABLE
-- =====================
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'admin_error_logs') THEN
        ALTER TABLE admin_error_logs ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Allow authenticated access errors" ON admin_error_logs;
        DROP POLICY IF EXISTS "Allow authenticated full access errors" ON admin_error_logs;
        
        CREATE POLICY "Allow authenticated full access errors" ON admin_error_logs
            FOR ALL
            USING (auth.role() = 'authenticated')
            WITH CHECK (auth.role() = 'authenticated');
        
        GRANT ALL ON admin_error_logs TO authenticated;
    END IF;
END $$;

-- =====================
-- 13. ADMIN_NOTES TABLE
-- =====================
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'admin_notes') THEN
        ALTER TABLE admin_notes ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Allow authenticated access notes" ON admin_notes;
        DROP POLICY IF EXISTS "Allow authenticated full access notes" ON admin_notes;
        
        CREATE POLICY "Allow authenticated full access notes" ON admin_notes
            FOR ALL
            USING (auth.role() = 'authenticated')
            WITH CHECK (auth.role() = 'authenticated');
        
        GRANT ALL ON admin_notes TO authenticated;
    END IF;
END $$;

-- =====================
-- GRANT SEQUENCES
-- =====================
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- =====================
-- VERIFY: List all tables and their RLS status
-- =====================
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
