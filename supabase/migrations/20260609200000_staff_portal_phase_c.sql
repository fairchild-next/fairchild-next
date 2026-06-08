-- Staff Portal Phase C: plants editor + garden quest editor.

-- ============================================================
-- 1. Staff write policy on plants
-- ============================================================
drop policy if exists "plants_staff_all" on plants;
create policy "plants_staff_all" on plants
  for all
  using (exists (select 1 from staff where staff.user_id = auth.uid()))
  with check (exists (select 1 from staff where staff.user_id = auth.uid()));

-- ============================================================
-- 2. plant-images storage bucket
-- ============================================================
insert into storage.buckets (id, name, public)
values ('plant-images', 'plant-images', true)
on conflict (id) do nothing;

drop policy if exists "plant_images_public_read" on storage.objects;
create policy "plant_images_public_read" on storage.objects
  for select using (bucket_id = 'plant-images');

drop policy if exists "plant_images_staff_upload" on storage.objects;
create policy "plant_images_staff_upload" on storage.objects
  for insert with check (
    bucket_id = 'plant-images'
    and exists (select 1 from staff where staff.user_id = auth.uid())
  );

drop policy if exists "plant_images_staff_update" on storage.objects;
create policy "plant_images_staff_update" on storage.objects
  for update using (
    bucket_id = 'plant-images'
    and exists (select 1 from staff where staff.user_id = auth.uid())
  );

-- ============================================================
-- 3. garden_quest_items — DB-driven quest list (was hardcoded)
-- ============================================================
create table if not exists garden_quest_items (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  hint        text not null default '',
  image_url   text,
  quest_type  text,            -- 'butterfly' | 'flower' | 'tree' | ...
  zone        text,            -- 'pavilion' | 'rainforest' | 'garden' | ...
  name_color  text,            -- 'blue' | 'red' | null
  sort_order  int not null default 99,
  is_active   boolean not null default true,
  created_at  timestamptz default now()
);

alter table garden_quest_items enable row level security;

drop policy if exists "garden_quest_items_read" on garden_quest_items;
create policy "garden_quest_items_read" on garden_quest_items
  for select using (true);

drop policy if exists "garden_quest_items_staff_all" on garden_quest_items;
create policy "garden_quest_items_staff_all" on garden_quest_items
  for all
  using (exists (select 1 from staff where staff.user_id = auth.uid()))
  with check (exists (select 1 from staff where staff.user_id = auth.uid()));

-- Seed the 3 existing hardcoded quest items
insert into garden_quest_items (name, hint, image_url, quest_type, zone, name_color, sort_order)
values
  ('blue butterfly', 'Check out the Butterfly Pavilion or look near flowers.',
   '/kids/quest-blue-butterfly.png', 'butterfly', 'pavilion', 'blue', 1),
  ('red flower',     'Look in the Rainforest Exhibit or along the main garden path.',
   '/kids/quest-red-flower.png',     'flower',    'rainforest', 'red', 2),
  ('palm tree',      'Look up! They are very tall.',
   '/kids/quest-palm-tree.png',      'tree',      'garden',    null,  3)
on conflict do nothing;

-- ============================================================
-- 4. Staff write policy on kids_badges (for icon/description updates)
-- ============================================================
drop policy if exists "kids_badges_staff_all" on kids_badges;
create policy "kids_badges_staff_all" on kids_badges
  for all
  using (exists (select 1 from staff where staff.user_id = auth.uid()))
  with check (exists (select 1 from staff where staff.user_id = auth.uid()));

-- ============================================================
-- 5. badge-images storage bucket
-- ============================================================
insert into storage.buckets (id, name, public)
values ('badge-images', 'badge-images', true)
on conflict (id) do nothing;

drop policy if exists "badge_images_public_read" on storage.objects;
create policy "badge_images_public_read" on storage.objects
  for select using (bucket_id = 'badge-images');

drop policy if exists "badge_images_staff_upload" on storage.objects;
create policy "badge_images_staff_upload" on storage.objects
  for insert with check (
    bucket_id = 'badge-images'
    and exists (select 1 from staff where staff.user_id = auth.uid())
  );
