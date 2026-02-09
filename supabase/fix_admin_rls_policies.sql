-- ENABLE RLS & CREATE POLICIES FOR ALL ADMIN TABLES

-- page_views
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated read" ON public.page_views FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert" ON public.page_views FOR INSERT TO authenticated WITH CHECK (true);

-- mentor_interactions
ALTER TABLE public.mentor_interactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated read" ON public.mentor_interactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert" ON public.mentor_interactions FOR INSERT TO authenticated WITH CHECK (true);

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
