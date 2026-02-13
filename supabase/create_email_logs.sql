-- Create email_logs table for tracking daily counts
CREATE TABLE IF NOT EXISTS public.email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    recipient TEXT NOT NULL,
    subject TEXT NOT NULL,
    provider TEXT NOT NULL, -- 'gmail' or 'resend'
    status TEXT NOT NULL, -- 'success' or 'error'
    error_message TEXT -- Store error details if any
);

-- Enable RLS
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Allow service role (server) to manage logs
-- (Assuming the API uses the service role or authenticated admin)
-- For simplicity, let's allow all authenticated users (admins) to see logs
CREATE POLICY "Admins can view email logs" ON public.email_logs
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow system to insert email logs" ON public.email_logs
    FOR INSERT WITH CHECK (true);
