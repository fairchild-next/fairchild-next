-- Kids Mode: discoveries and badges
-- Run in Supabase Dashboard: SQL Editor

-- ============================================
-- 1. discoveries table
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
create policy "kids_discoveries_select_own" on kids_discoveries for select using (auth.uid() = user_id);

drop policy if exists "kids_discoveries_insert_own" on kids_discoveries;
create policy "kids_discoveries_insert_own" on kids_discoveries for insert with check (auth.uid() = user_id);

-- ============================================
-- 2. badges table (seed data)
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

-- ============================================
-- 3. user_badges table
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
create policy "kids_user_badges_select_own" on kids_user_badges for select using (auth.uid() = user_id);

drop policy if exists "kids_user_badges_insert_own" on kids_user_badges;
create policy "kids_user_badges_insert_own" on kids_user_badges for insert with check (auth.uid() = user_id);

-- ============================================
-- 4. Storage bucket for discovery photos
-- ============================================
insert into storage.buckets (id, name, public)
values ('kids-discovery-photos', 'kids-discovery-photos', true)
on conflict (id) do nothing;

drop policy if exists "kids_discovery_photos_select" on storage.objects;
create policy "kids_discovery_photos_select" on storage.objects
  for select using (bucket_id = 'kids-discovery-photos');

drop policy if exists "kids_discovery_photos_insert" on storage.objects;
create policy "kids_discovery_photos_insert" on storage.objects
  for insert with check (bucket_id = 'kids-discovery-photos' and auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================
-- 5. Seed badges
-- ============================================
insert into kids_badges (badge_key, badge_name, description, icon_url, badge_type, sort_order) values
  ('butterfly-finder', 'Butterfly Finder', 'Find 1 butterfly', null, 'discovery', 1),
  ('flower-spotter', 'Flower Spotter', 'Find 1 flower', null, 'discovery', 2),
  ('tree-explorer', 'Tree Explorer', 'Find 1 tree', null, 'discovery', 3),
  ('flower-collector', 'Flower Collector', 'Find 3 flowers', null, 'discovery', 4),
  ('pollinator-pal', 'Pollinator Pal', 'Find a butterfly, bee, and flower', null, 'discovery', 5),
  ('nature-photographer', 'Nature Photographer', 'Upload 3 photos', null, 'creativity', 6),
  ('nature-detective', 'Nature Detective', 'Find 5 items', null, 'completion', 7),
  ('garden-traveler', 'Garden Traveler', 'Find items in 3 different areas', null, 'completion', 8),
  ('garden-explorer', 'Garden Explorer', 'Complete the entire quest list!', null, 'completion', 9),
  ('secret-garden', 'Secret Garden Badge', 'A special surprise for curious explorers!', null, 'secret', 10)
on conflict (badge_key) do nothing;
