-- Staff table: users who can access scanner and map editor
-- Run in Supabase SQL Editor (after members migration)

create table if not exists staff (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  created_at timestamptz default now()
);

create index if not exists staff_user_id on staff(user_id);

alter table staff enable row level security;

-- Staff can read their own row
drop policy if exists "staff_select_own" on staff;
create policy "staff_select_own" on staff for select using (auth.uid() = user_id);

-- Only service role can insert/update (for admin setup)
-- To add a staff member, run: insert into staff (user_id) select id from auth.users where email = 'staff@fairchild.org';
