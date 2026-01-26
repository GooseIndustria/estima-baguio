-- Create the feedback table
create table public.feedback (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  name text null,
  email text null,
  feedback_type text null,
  message text null,
  user_agent text null,
  constraint feedback_pkey primary key (id)
);

-- Enable Row Level Security
alter table public.feedback enable row level security;

-- Create policies

-- Allow anyone (including anonymous users) to insert feedback
create policy "Enable insert for all users" on "public"."feedback"
as PERMISSIVE for INSERT
to public
with check (true);

-- Allow only authenticated users (dashboard/admins) to read feedback
-- Note: 'authenticated' role or service_role key will be needed to read back the data in the future
create policy "Enable read for service role only" on "public"."feedback"
as PERMISSIVE for SELECT
to service_role
using (true);

-- If you want to allow authenticated users to read (e.g. if you build an admin panel later):
create policy "Enable read for authenticated users" on "public"."feedback"
as PERMISSIVE for SELECT
to authenticated
using (true);
