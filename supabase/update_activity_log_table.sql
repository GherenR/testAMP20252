-- Update admin_activity_log table to add missing columns
-- Run this in Supabase SQL Editor

-- Add entity_type and entity_id columns if they don't exist
DO $$ 
BEGIN
    -- Add entity_type column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'admin_activity_log' AND column_name = 'entity_type'
    ) THEN
        ALTER TABLE admin_activity_log ADD COLUMN entity_type VARCHAR(64);
    END IF;
    
    -- Add entity_id column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'admin_activity_log' AND column_name = 'entity_id'
    ) THEN
        ALTER TABLE admin_activity_log ADD COLUMN entity_id VARCHAR(255);
    END IF;
    
    -- Rename 'detail' to 'details' if needed
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'admin_activity_log' AND column_name = 'detail'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'admin_activity_log' AND column_name = 'details'
    ) THEN
        ALTER TABLE admin_activity_log RENAME COLUMN detail TO details;
    END IF;
END $$;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON admin_activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_action ON admin_activity_log(action);
CREATE INDEX IF NOT EXISTS idx_activity_log_entity ON admin_activity_log(entity_type);

-- Enable RLS
ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert (for logging)
DROP POLICY IF EXISTS "Allow authenticated insert" ON admin_activity_log;
CREATE POLICY "Allow authenticated insert" ON admin_activity_log
    FOR INSERT TO authenticated
    WITH CHECK (true);

-- Allow admins to read all logs
DROP POLICY IF EXISTS "Allow admin read" ON admin_activity_log;
CREATE POLICY "Allow admin read" ON admin_activity_log
    FOR SELECT TO authenticated
    USING (
        auth.jwt() ->> 'email' IN (
            'gherenramandra@gmail.com',
            'saputragheren@gmail.com'
        )
    );
