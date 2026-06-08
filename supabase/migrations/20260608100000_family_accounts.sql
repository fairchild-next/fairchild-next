-- Family Accounts: child profiles under a parent membership.
-- Children are NOT separate auth users — they are named sub-profiles.
-- All existing rows in kids_discoveries and kids_user_badges keep
-- child_profile_id = NULL and continue to work exactly as before.

-- ============================================================
-- 1. kids_child_profiles
-- ============================================================
create table if not exists kids_child_profiles (
  id               uuid primary key default gen_random_uuid(),
  parent_user_id   uuid not null references auth.users(id) on delete cascade,
  name             text not null,
  avatar_emoji     text not null default '🌿',
  created_at       timestamptz default now()
);

create index if not exists kids_child_profiles_parent on kids_child_profiles(parent_user_id);

alter table kids_child_profiles enable row level security;

drop policy if exists "kids_child_profiles_select_own" on kids_child_profiles;
create policy "kids_child_profiles_select_own" on kids_child_profiles
  for select using (auth.uid() = parent_user_id);

drop policy if exists "kids_child_profiles_insert_own" on kids_child_profiles;
create policy "kids_child_profiles_insert_own" on kids_child_profiles
  for insert with check (auth.uid() = parent_user_id);

drop policy if exists "kids_child_profiles_delete_own" on kids_child_profiles;
create policy "kids_child_profiles_delete_own" on kids_child_profiles
  for delete using (auth.uid() = parent_user_id);

-- ============================================================
-- 2. Add child_profile_id to kids_discoveries (nullable / backward-compatible)
-- ============================================================
alter table kids_discoveries
  add column if not exists child_profile_id uuid references kids_child_profiles(id) on delete cascade;

create index if not exists kids_discoveries_child_id on kids_discoveries(child_profile_id)
  where child_profile_id is not null;

-- ============================================================
-- 3. Add child_profile_id to kids_user_badges + replace unique constraint
-- ============================================================
alter table kids_user_badges
  add column if not exists child_profile_id uuid references kids_child_profiles(id) on delete cascade;

-- Drop the old global unique constraint so two children can earn the same badge.
-- We replace it with two partial unique indexes that preserve the original
-- behavior for parent (null) rows while allowing per-child uniqueness.
alter table kids_user_badges
  drop constraint if exists kids_user_badges_user_id_badge_id_key;

-- Parent mode: one badge per (user, badge) when no child profile is active.
create unique index if not exists kids_user_badges_parent_unique
  on kids_user_badges(user_id, badge_id)
  where child_profile_id is null;

-- Child mode: one badge per (user, badge, child) per child profile.
create unique index if not exists kids_user_badges_child_unique
  on kids_user_badges(user_id, badge_id, child_profile_id)
  where child_profile_id is not null;

create index if not exists kids_user_badges_child_id on kids_user_badges(child_profile_id)
  where child_profile_id is not null;
