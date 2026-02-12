-- Create user_reports table
create table public.user_reports (
  id uuid not null default gen_random_uuid (),
  user_id uuid null default auth.uid (),
  type text not null, -- 'soal', 'bug', 'feedback'
  description text not null,
  url text null,
  metadata jsonb null, -- Stores tryout_id, subtes, etc.
  status text not null default 'open'::text, -- 'open', 'resolved', 'ignored'
  created_at timestamp with time zone not null default now(),
  constraint user_reports_pkey primary key (id),
  constraint user_reports_user_id_fkey foreign KEY (user_id) references auth.users (id)
);

-- Enable RLS
alter table public.user_reports enable row level security;

-- Policy: Users can can insert their own reports
create policy "Users can insert their own reports" on public.user_reports
  for insert with check (auth.uid() = user_id);

-- Policy: Users can view their own reports
create policy "Users can view their own reports" on public.user_reports
  for select using (auth.uid() = user_id);

-- Policy: Admins can view all (Adjust 'admin' role check as needed for your setup)
-- For now, we allow authenticated users to view (or you can restrict it)
-- create policy "Admins can view all reports" on public.user_reports
--   for select using ( auth.jwt() ->> 'role' = 'service_role' );
