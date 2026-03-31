-- Garden status: hours overrides and last-minute closures
-- Staff can update this when the garden closes early (e.g. lightning, severe weather)
-- Run in Supabase Dashboard: SQL Editor → Paste → Run

create table if not exists garden_status (
  id uuid primary key default gen_random_uuid(),
  date date not null unique,
  is_closed boolean not null default false,
  closure_reason text,
  special_hours text,
  updated_at timestamptz default now()
);

create index if not exists garden_status_date on garden_status(date);

alter table garden_status enable row level security;
drop policy if exists "garden_status_read" on garden_status;
create policy "garden_status_read" on garden_status for select using (true);

-- No write policy: only service_role / dashboard can insert/update (e.g. via SQL Editor).
-- Add a staff-based write policy later when staff table exists.

comment on table garden_status is 'Override garden hours or mark closed for specific dates (e.g. lightning, severe weather)';
