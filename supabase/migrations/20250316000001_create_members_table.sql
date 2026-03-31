-- Create members table (run in Supabase SQL Editor if it doesn't exist)
create table if not exists members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  member_id text not null unique,
  membership_type text not null default 'Individual',
  display_name text,
  expires_at date not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists members_user_id on members(user_id);
create index if not exists members_expires_at on members(expires_at);

alter table members enable row level security;

drop policy if exists "members_select_own" on members;
create policy "members_select_own" on members for select using (auth.uid() = user_id);
