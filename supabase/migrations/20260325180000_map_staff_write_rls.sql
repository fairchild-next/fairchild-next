-- 1) Staff table (required for policies below). Safe if you already ran 20250309000000_staff.sql.
create table if not exists public.staff (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz default now(),
  unique (user_id)
);

create index if not exists staff_user_id on public.staff (user_id);

alter table public.staff enable row level security;

drop policy if exists "staff_select_own" on public.staff;
create policy "staff_select_own" on public.staff for select using (auth.uid() = user_id);

-- Add yourself as staff (SQL Editor → run once with your login email), or use Dashboard insert:
-- insert into public.staff (user_id)
-- select id from auth.users where email = 'you@example.com'
-- on conflict (user_id) do nothing;

-- 2) Map editor: authenticated users in staff can mutate POIs/zones/overlays via JWT (no service role on Vercel).

drop policy if exists "map_pois_staff_all" on public.map_pois;
create policy "map_pois_staff_all"
on public.map_pois
as permissive
for all
to authenticated
using (exists (select 1 from public.staff s where s.user_id = auth.uid()))
with check (exists (select 1 from public.staff s where s.user_id = auth.uid()));

drop policy if exists "map_zones_staff_all" on public.map_zones;
create policy "map_zones_staff_all"
on public.map_zones
as permissive
for all
to authenticated
using (exists (select 1 from public.staff s where s.user_id = auth.uid()))
with check (exists (select 1 from public.staff s where s.user_id = auth.uid()));

drop policy if exists "map_overlays_staff_update" on public.map_overlays;
create policy "map_overlays_staff_update"
on public.map_overlays
as permissive
for update
to authenticated
using (exists (select 1 from public.staff s where s.user_id = auth.uid()))
with check (exists (select 1 from public.staff s where s.user_id = auth.uid()));
