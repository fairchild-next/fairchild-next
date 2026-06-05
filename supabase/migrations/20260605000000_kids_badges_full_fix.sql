-- Kids Badges Full Fix (idempotent)
-- Ensures tables, seed data, and all RLS policies are correct.
-- Safe to run even if tables already exist.
-- Run in Supabase Dashboard: SQL Editor → New query → Paste → Run

-- ============================================
-- 1. kids_badges (badge catalog)
-- ============================================
create table if not exists kids_badges (
  id uuid primary key default gen_random_uuid(),
  badge_key text not null unique,
  badge_name text not null,
  description text not null,
  icon_url text,
  badge_type text not null check (badge_type in ('discovery', 'completion', 'creativity', 'secret')),
  sort_order int not null default 0
);

alter table kids_badges enable row level security;

drop policy if exists "kids_badges_public_read" on kids_badges;
create policy "kids_badges_public_read" on kids_badges
  for select using (true);
-- No insert/update policy → only service role (server) can modify badge definitions.

-- ============================================
-- 2. kids_user_badges (per-user earned badges)
-- ============================================
create table if not exists kids_user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  badge_id uuid not null references kids_badges(id) on delete cascade,
  earned_at timestamptz default now(),
  unique(user_id, badge_id)
);

create index if not exists kids_user_badges_user_id on kids_user_badges(user_id);

alter table kids_user_badges enable row level security;

drop policy if exists "kids_user_badges_select_own" on kids_user_badges;
create policy "kids_user_badges_select_own" on kids_user_badges
  for select using (auth.uid() = user_id);

drop policy if exists "kids_user_badges_insert_own" on kids_user_badges;
create policy "kids_user_badges_insert_own" on kids_user_badges
  for insert with check (auth.uid() = user_id);

drop policy if exists "kids_user_badges_delete_own" on kids_user_badges;
create policy "kids_user_badges_delete_own" on kids_user_badges
  for delete using (auth.uid() = user_id);

-- ============================================
-- 3. kids_discoveries (ensure policies exist)
-- ============================================
create table if not exists kids_discoveries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  quest_item text not null,
  photo_url text,
  note text,
  created_at timestamptz default now()
);

create index if not exists kids_discoveries_user_id on kids_discoveries(user_id);
create index if not exists kids_discoveries_created_at on kids_discoveries(created_at);

alter table kids_discoveries enable row level security;

drop policy if exists "kids_discoveries_select_own" on kids_discoveries;
create policy "kids_discoveries_select_own" on kids_discoveries
  for select using (auth.uid() = user_id);

drop policy if exists "kids_discoveries_insert_own" on kids_discoveries;
create policy "kids_discoveries_insert_own" on kids_discoveries
  for insert with check (auth.uid() = user_id);

drop policy if exists "kids_discoveries_delete_own" on kids_discoveries;
create policy "kids_discoveries_delete_own" on kids_discoveries
  for delete using (auth.uid() = user_id);

-- ============================================
-- 4. Seed badge catalog
-- ============================================
insert into kids_badges (badge_key, badge_name, description, icon_url, badge_type, sort_order) values
  ('butterfly-finder',    'Butterfly Finder',    'Spot your first butterfly in the garden!',              null, 'discovery',   1),
  ('flower-spotter',      'Flower Spotter',      'Find your first flower on the quest!',                  null, 'discovery',   2),
  ('tree-explorer',       'Tree Explorer',       'Discover your first tree!',                             null, 'discovery',   3),
  ('flower-collector',    'Flower Collector',    'Find 3 different flowers — you''re a real botanist!',   null, 'discovery',   4),
  ('pollinator-pal',      'Pollinator Pal',      'Find a butterfly and a flower together!',               null, 'discovery',   5),
  ('nature-photographer', 'Nature Photographer', 'Upload 3 photos of your discoveries!',                  null, 'creativity',  6),
  ('nature-detective',    'Nature Detective',    'Find 3 or more items on the quest!',                    null, 'completion',  7),
  ('garden-traveler',     'Garden Traveler',     'Explore 3 different areas of the garden!',              null, 'completion',  8),
  ('garden-explorer',     'Garden Explorer',     'Complete every item on the Garden Quest!',              null, 'completion',  9),
  ('secret-garden',       'Secret Garden',       'A special surprise for curious explorers!',             null, 'secret',     10)
on conflict (badge_key) do update
  set badge_name  = excluded.badge_name,
      description = excluded.description,
      sort_order  = excluded.sort_order;

-- ============================================
-- 5. Storage bucket for discovery photos
-- ============================================
insert into storage.buckets (id, name, public)
values ('kids-discovery-photos', 'kids-discovery-photos', true)
on conflict (id) do nothing;

drop policy if exists "kids_discovery_photos_select" on storage.objects;
create policy "kids_discovery_photos_select" on storage.objects
  for select using (bucket_id = 'kids-discovery-photos');

drop policy if exists "kids_discovery_photos_insert" on storage.objects;
create policy "kids_discovery_photos_insert" on storage.objects
  for insert with check (
    bucket_id = 'kids-discovery-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
