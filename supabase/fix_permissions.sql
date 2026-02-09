-- =====================================================
-- FIX PERMISSIONS FOR MENTORS TABLE
-- Run this if you get "permission denied for schema public"
-- =====================================================

-- Grant schema access
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Grant table access
GRANT SELECT ON public.mentors TO anon;
GRANT ALL ON public.mentors TO authenticated;

-- Grant sequence access (for auto-increment id)
GRANT USAGE, SELECT ON SEQUENCE public.mentors_id_seq TO anon;
GRANT USAGE, SELECT ON SEQUENCE public.mentors_id_seq TO authenticated;

-- Verify RLS is enabled
ALTER TABLE public.mentors ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to recreate cleanly)
DROP POLICY IF EXISTS "Allow public read access" ON public.mentors;
DROP POLICY IF EXISTS "Allow authenticated insert" ON public.mentors;
DROP POLICY IF EXISTS "Allow authenticated update" ON public.mentors;
DROP POLICY IF EXISTS "Allow authenticated delete" ON public.mentors;

-- Recreate policies
CREATE POLICY "Allow public read access" ON public.mentors
    FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Allow authenticated insert" ON public.mentors
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Allow authenticated update" ON public.mentors
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow authenticated delete" ON public.mentors
    FOR DELETE
    TO authenticated
    USING (true);
