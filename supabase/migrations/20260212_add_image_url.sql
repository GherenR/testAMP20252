-- ============================================
-- MIGRATION: ADD IMAGE SUPPORT & FLAGGING
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Add image_url to tryout_soal
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tryout_soal' AND column_name = 'image_url') THEN
        ALTER TABLE tryout_soal ADD COLUMN image_url TEXT;
    END IF;
END $$;

-- 2. Add flagged_questions to tryout_attempts
-- We store this as an array of question IDs
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tryout_attempts' AND column_name = 'flagged_questions') THEN
        ALTER TABLE tryout_attempts ADD COLUMN flagged_questions TEXT[] DEFAULT '{}';
    END IF;
END $$;

-- 3. Verify
SELECT 
    column_name, 
    data_type 
FROM 
    information_schema.columns 
WHERE 
    table_name IN ('tryout_soal', 'tryout_attempts') 
    AND column_name IN ('image_url', 'flagged_questions');
