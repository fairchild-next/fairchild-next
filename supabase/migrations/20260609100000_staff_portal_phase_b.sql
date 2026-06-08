-- Staff Portal Phase B: events management, ticket pricing, app config.

-- ============================================================
-- 1. Staff write policies on events
-- ============================================================
drop policy if exists "events_staff_all" on events;
create policy "events_staff_all" on events
  for all
  using (exists (select 1 from staff where staff.user_id = auth.uid()))
  with check (exists (select 1 from staff where staff.user_id = auth.uid()));

-- ============================================================
-- 2. Staff write policies on ticket_types
-- ============================================================
alter table ticket_types enable row level security;

drop policy if exists "ticket_types_read" on ticket_types;
create policy "ticket_types_read" on ticket_types
  for select using (true);

drop policy if exists "ticket_types_staff_all" on ticket_types;
create policy "ticket_types_staff_all" on ticket_types
  for all
  using (exists (select 1 from staff where staff.user_id = auth.uid()))
  with check (exists (select 1 from staff where staff.user_id = auth.uid()));

-- ============================================================
-- 3. app_config — key/value store for CMS-lite settings
-- ============================================================
create table if not exists app_config (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz default now(),
  updated_by uuid references auth.users(id)
);

alter table app_config enable row level security;

-- Public read (homepage needs this client-side)
drop policy if exists "app_config_read" on app_config;
create policy "app_config_read" on app_config
  for select using (true);

-- Staff write
drop policy if exists "app_config_staff_write" on app_config;
create policy "app_config_staff_write" on app_config
  for all
  using (exists (select 1 from staff where staff.user_id = auth.uid()))
  with check (exists (select 1 from staff where staff.user_id = auth.uid()));

-- ============================================================
-- 4. Seed default app_config values
-- ============================================================

-- Events Mode: whether the Events Mode button is shown + which event it points to
insert into app_config (key, value) values (
  'events_mode',
  '{"active": true, "featured_event_slug": "bunny-hoppening"}'
) on conflict (key) do nothing;

-- What's Blooming card (shown on guest + member home)
insert into app_config (key, value) values (
  'blooming_card',
  '{
    "title": "Tropical Flower Garden",
    "description": "Orchids, bromeliads & exotic blooms at their peak",
    "badge": "Peak Bloom",
    "image_url": "/home/browse-plans.png",
    "link_url": "https://fairchildgarden.org/plants-collections/plants/orchid-collection/"
  }'
) on conflict (key) do nothing;

-- ============================================================
-- 5. events-images storage bucket for staff uploads
-- ============================================================
insert into storage.buckets (id, name, public)
values ('events-images', 'events-images', true)
on conflict (id) do nothing;

drop policy if exists "events_images_public_read" on storage.objects;
create policy "events_images_public_read" on storage.objects
  for select using (bucket_id = 'events-images');

drop policy if exists "events_images_staff_upload" on storage.objects;
create policy "events_images_staff_upload" on storage.objects
  for insert with check (
    bucket_id = 'events-images'
    and exists (select 1 from staff where staff.user_id = auth.uid())
  );

drop policy if exists "events_images_staff_update" on storage.objects;
create policy "events_images_staff_update" on storage.objects
  for update using (
    bucket_id = 'events-images'
    and exists (select 1 from staff where staff.user_id = auth.uid())
  );
