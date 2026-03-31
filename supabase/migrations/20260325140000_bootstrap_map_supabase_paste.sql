-- =============================================================================
-- PASTE THIS ENTIRE FILE INTO: Supabase → SQL Editor → New query → Run
-- Creates map tables if missing, seeds default map, adds kids/wedding/events.
-- Safe to re-run: uses IF NOT EXISTS / ON CONFLICT DO NOTHING / DROP POLICY IF EXISTS.
-- Note: map_layers.event_id has NO foreign key so you do not need an `events` table.
-- =============================================================================

-- 1. map_config
create table if not exists map_config (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  center_lat numeric not null,
  center_lng numeric not null,
  default_zoom int not null default 17,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. map_layers (event_id optional; no FK to events)
create table if not exists map_layers (
  id uuid primary key default gen_random_uuid(),
  map_config_id uuid not null references map_config(id) on delete cascade,
  slug text not null,
  name text not null,
  sort_order int not null default 0,
  is_default boolean not null default false,
  event_id uuid,
  layer_type text not null default 'overlay',
  created_at timestamptz default now(),
  unique(map_config_id, slug)
);

create index if not exists map_layers_config on map_layers(map_config_id);

-- 3. map_pois
create table if not exists map_pois (
  id uuid primary key default gen_random_uuid(),
  map_config_id uuid not null references map_config(id) on delete cascade,
  layer_id uuid references map_layers(id) on delete set null,
  name text not null,
  description text,
  lat numeric not null,
  lng numeric not null,
  sort_order int not null default 0,
  created_at timestamptz default now()
);

alter table map_pois add column if not exists category text default 'exhibit';
alter table map_pois add column if not exists image_url text;
alter table map_pois add column if not exists details text;

create index if not exists map_pois_config on map_pois(map_config_id);
create index if not exists map_pois_layer on map_pois(layer_id);

-- 4. map_overlays
create table if not exists map_overlays (
  id uuid primary key default gen_random_uuid(),
  layer_id uuid not null references map_layers(id) on delete cascade,
  image_url text not null,
  bounds_sw_lat numeric not null,
  bounds_sw_lng numeric not null,
  bounds_ne_lat numeric not null,
  bounds_ne_lng numeric not null,
  opacity numeric not null default 0.8 check (opacity >= 0 and opacity <= 1),
  created_at timestamptz default now()
);

-- 5. map_routes
create table if not exists map_routes (
  id uuid primary key default gen_random_uuid(),
  layer_id uuid not null references map_layers(id) on delete cascade,
  name text,
  path_geojson jsonb not null,
  color text default '#2e7d57',
  weight int default 4,
  created_at timestamptz default now()
);

-- 6. map_zones
create table if not exists map_zones (
  id uuid primary key default gen_random_uuid(),
  map_config_id uuid not null references map_config(id) on delete cascade,
  name text,
  geometry_geojson jsonb not null,
  created_at timestamptz default now()
);

-- 7. location_events
create table if not exists location_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  lat numeric not null,
  lng numeric not null,
  zone_id uuid references map_zones(id),
  event_type text not null default 'ping',
  created_at timestamptz default now()
);

create index if not exists location_events_created on location_events(created_at);
create index if not exists location_events_zone on location_events(zone_id);

-- RLS
alter table map_config enable row level security;
alter table map_layers enable row level security;
alter table map_pois enable row level security;
alter table map_overlays enable row level security;
alter table map_routes enable row level security;
alter table map_zones enable row level security;
alter table location_events enable row level security;

drop policy if exists "map_read" on map_config;
create policy "map_read" on map_config for select using (true);

drop policy if exists "map_layers_read" on map_layers;
create policy "map_layers_read" on map_layers for select using (true);

drop policy if exists "map_pois_read" on map_pois;
create policy "map_pois_read" on map_pois for select using (true);

drop policy if exists "map_overlays_read" on map_overlays;
create policy "map_overlays_read" on map_overlays for select using (true);

drop policy if exists "map_routes_read" on map_routes;
create policy "map_routes_read" on map_routes for select using (true);

drop policy if exists "map_zones_read" on map_zones;
create policy "map_zones_read" on map_zones for select using (true);

drop policy if exists "location_events_insert" on location_events;
create policy "location_events_insert" on location_events for insert with check (true);

drop policy if exists "location_events_select_own" on location_events;
create policy "location_events_select_own" on location_events for select using (auth.uid() = user_id);

-- Seed: default map config
insert into map_config (slug, name, center_lat, center_lng, default_zoom)
values ('default', 'Fairchild Tropical Botanic Garden', 25.677, -80.273, 17)
on conflict (slug) do nothing;

-- Seed: default layer
insert into map_layers (map_config_id, slug, name, sort_order, is_default, layer_type)
select id, 'default', 'Garden Map', 0, true, 'overlay'
from map_config
where slug = 'default'
on conflict (map_config_id, slug) do nothing;

-- Seed: starter POIs (only if default config has none)
insert into map_pois (map_config_id, name, description, lat, lng, sort_order, category)
select mc.id, v.name, v.description, v.lat, v.lng, v.ord, v.cat
from map_config mc
cross join (values
  ('Visitor Center', 'Start your visit here. Information desk, restrooms, and gift shop.', 25.6775, -80.2725, 1, 'info'),
  ('Rainforest Exhibit', 'Explore the lush tropical rainforest and exotic plant life.', 25.6765, -80.2735, 2, 'exhibit'),
  ('Waterfall Garden', 'Tranquil waterfall and lily pond area.', 25.6768, -80.272, 3, 'exhibit'),
  ('Palm Grove', 'Stunning collection of palm trees from around the world.', 25.6778, -80.2738, 4, 'exhibit'),
  ('Butterfly Garden', 'Watch colorful butterflies among flowering plants.', 25.6762, -80.2718, 5, 'exhibit'),
  ('Waterfront Trail', 'Scenic path along the water with tropical views.', 25.676, -80.274, 6, 'exhibit')
) as v(name, description, lat, lng, ord, cat)
where mc.slug = 'default'
  and not exists (select 1 from map_pois mp where mp.map_config_id = mc.id);

-- Optional: garden boundary for default (replace if you already drew one in editor)
delete from map_zones
where map_config_id in (select id from map_config where slug = 'default')
  and name = 'Fairchild Garden';

insert into map_zones (map_config_id, name, geometry_geojson)
select id,
       'Fairchild Garden',
       '{
         "type": "Polygon",
         "coordinates": [[
           [-80.2762, 25.6748],
           [-80.2710, 25.6748],
           [-80.2710, 25.6820],
           [-80.2762, 25.6820],
           [-80.2762, 25.6748]
         ]]
       }'::jsonb
from map_config
where slug = 'default';

-- Per-mode map configs (kids, wedding, events)
insert into map_config (slug, name, center_lat, center_lng, default_zoom)
select v.slug,
       v.name,
       coalesce(d.center_lat, 25.677)::numeric,
       coalesce(d.center_lng, -80.273)::numeric,
       coalesce(d.default_zoom, 17)
from (values
  ('kids', 'Kids mode map'),
  ('wedding', 'Wedding mode map'),
  ('events', 'Events mode map')
) as v(slug, name)
left join lateral (
  select center_lat, center_lng, default_zoom
  from map_config
  where slug = 'default'
  limit 1
) d on true
on conflict (slug) do nothing;
