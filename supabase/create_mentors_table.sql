-- =====================================================
-- MENTORS TABLE - Alumni Mentorship Project
-- Run this SQL in Supabase SQL Editor
-- =====================================================

-- Create the mentors table
CREATE TABLE IF NOT EXISTS public.mentors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    university VARCHAR(255) NOT NULL,
    major VARCHAR(255) NOT NULL,
    path VARCHAR(255) NOT NULL DEFAULT 'Mandiri',
    category VARCHAR(10) NOT NULL DEFAULT 'PTN' CHECK (category IN ('PTN', 'PTS', 'PTLN')),
    angkatan INTEGER NOT NULL DEFAULT 2025,
    whatsapp VARCHAR(100),
    instagram VARCHAR(100),
    email VARCHAR(255),
    achievements TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster searches
CREATE INDEX IF NOT EXISTS idx_mentors_name ON public.mentors(name);
CREATE INDEX IF NOT EXISTS idx_mentors_university ON public.mentors(university);
CREATE INDEX IF NOT EXISTS idx_mentors_category ON public.mentors(category);
CREATE INDEX IF NOT EXISTS idx_mentors_angkatan ON public.mentors(angkatan);

-- Enable Row Level Security
ALTER TABLE public.mentors ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read mentors (public data)
CREATE POLICY "Allow public read access" ON public.mentors
    FOR SELECT
    TO public
    USING (true);

-- Policy: Only authenticated users can insert
CREATE POLICY "Allow authenticated insert" ON public.mentors
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Policy: Only authenticated users can update
CREATE POLICY "Allow authenticated update" ON public.mentors
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Policy: Only authenticated users can delete
CREATE POLICY "Allow authenticated delete" ON public.mentors
    FOR DELETE
    TO authenticated
    USING (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_mentors_updated_at
    BEFORE UPDATE ON public.mentors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT SELECT ON public.mentors TO anon;
GRANT SELECT ON public.mentors TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.mentors TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.mentors_id_seq TO authenticated;
