-- ENABLE RLS & CREATE POLICIES FOR ALL ADMIN TABLES

-- First, drop all existing policies to avoid conflicts
DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename IN ('page_views', 'mentor_interactions', 'admin_activity_log', 'admin_notifications', 'admin_pending_approvals', 'admin_error_logs', 'admin_notes', 'feature_clicks')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', pol.policyname, pol.schemaname, pol.tablename);
    END LOOP;
END $$;

-- page_views
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated read" ON public.page_views FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert" ON public.page_views FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow anonymous insert" ON public.page_views FOR INSERT TO anon WITH CHECK (true);

-- mentor_interactions
ALTER TABLE public.mentor_interactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated read" ON public.mentor_interactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert" ON public.mentor_interactions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow anonymous insert" ON public.mentor_interactions FOR INSERT TO anon WITH CHECK (true);

-- admin_activity_log
ALTER TABLE public.admin_activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated read" ON public.admin_activity_log FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert" ON public.admin_activity_log FOR INSERT TO authenticated WITH CHECK (true);

-- admin_notifications
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated read" ON public.admin_notifications FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert" ON public.admin_notifications FOR INSERT TO authenticated WITH CHECK (true);

-- admin_pending_approvals
ALTER TABLE public.admin_pending_approvals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated read" ON public.admin_pending_approvals FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert" ON public.admin_pending_approvals FOR INSERT TO authenticated WITH CHECK (true);

-- admin_error_logs
ALTER TABLE public.admin_error_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated read" ON public.admin_error_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert" ON public.admin_error_logs FOR INSERT TO authenticated WITH CHECK (true);

-- admin_notes
ALTER TABLE public.admin_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated read" ON public.admin_notes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert" ON public.admin_notes FOR INSERT TO authenticated WITH CHECK (true);

-- feature_clicks
ALTER TABLE public.feature_clicks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated read" ON public.feature_clicks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert" ON public.feature_clicks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow anonymous insert" ON public.feature_clicks FOR INSERT TO anon WITH CHECK (true);
