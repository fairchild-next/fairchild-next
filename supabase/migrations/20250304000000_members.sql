-- Members and members-only events
-- Run in Supabase Dashboard: SQL Editor

-- ============================================
-- 1. members table (linked to auth.users)
-- ============================================
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

-- RLS
alter table members enable row level security;

drop policy if exists "members_select_own" on members;
create policy "members_select_own" on members for select using (auth.uid() = user_id);

-- ============================================
-- 2. is_members_only on events
-- ============================================
alter table events add column if not exists is_members_only boolean not null default false;

-- ============================================
-- 3. Optional: add_on support for future (Bunny egg hunts, cocktails, etc.)
-- order_items can later have parent_order_item_id or add_on_type
-- ============================================
-- alter table order_items add column if not exists parent_order_item_id uuid references order_items(id);
-- alter table order_items add column if not exists add_on_type text;
