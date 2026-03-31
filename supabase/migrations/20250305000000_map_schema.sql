-- Map schema: client-specific, supports overlays, routes, future nav & heat maps
-- Run in Supabase Dashboard: SQL Editor

-- ============================================
-- 1. map_config (one per client/site)
-- ============================================
create table if not exists map_config (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique default 'default',
  name text not null,
  center_lat numeric not null,
  center_lng numeric not null,
  default_zoom int not null default 17,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- 2. map_layers (toggleable: default, festival, audio-tour, etc.)
-- ============================================
create table if not exists map_layers (
  id uuid primary key default gen_random_uuid(),
  map_config_id uuid not null references map_config(id) on delete cascade,
  slug text not null,
  name text not null,
  sort_order int not null default 0,
  is_default boolean not null default false,
  -- Optional: show only during event date range
  event_id uuid references events(id),
  -- type: 'base' | 'overlay' | 'route'
  layer_type text not null default 'overlay',
  created_at timestamptz default now(),
  unique(map_config_id, slug)
);

create index if exists map_layers_config on map_layers(map_config_id);

-- ============================================
-- 3. map_pois (points of interest)
-- ============================================
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

create index if exists map_pois_config on map_pois(map_config_id);
create index if exists map_pois_layer on map_pois(layer_id);

-- ============================================
-- 4. map_overlays (image overlays: festival map, custom layout)
-- ============================================
create table if not exists map_overlays (
  id uuid primary key default gen_random_uuid(),
  layer_id uuid not null references map_layers(id) on delete cascade,
  image_url text not null,
  -- Bounds: SW lat, SW lng, NE lat, NE lng
  bounds_sw_lat numeric not null,
  bounds_sw_lng numeric not null,
  bounds_ne_lat numeric not null,
  bounds_ne_lng numeric not null,
  opacity numeric not null default 0.8 check (opacity >= 0 and opacity <= 1),
  created_at timestamptz default now()
);

-- ============================================
-- 5. map_routes (polygons/polylines: audio tour path, festival route)
-- ============================================
create table if not exists map_routes (
  id uuid primary key default gen_random_uuid(),
  layer_id uuid not null references map_layers(id) on delete cascade,
  name text,
  -- GeoJSON: [[lng, lat], [lng, lat], ...]
  path_geojson jsonb not null,
  color text default '#2e7d57',
  weight int default 4,
  created_at timestamptz default now()
);

-- ============================================
-- 6. location_events (future: heat maps, dwell time)
-- Anonymous pings when user opts in; aggregate by zone for staff analytics
-- ============================================
create table if not exists map_zones (
  id uuid primary key default gen_random_uuid(),
  map_config_id uuid not null references map_config(id) on delete cascade,
  name text,
  -- GeoJSON polygon
  geometry_geojson jsonb not null,
  created_at timestamptz default now()
);

create table if not exists location_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  lat numeric not null,
  lng numeric not null,
  zone_id uuid references map_zones(id),
  event_type text not null default 'ping',
  created_at timestamptz default now()
);

create index if exists location_events_created on location_events(created_at);
create index if exists location_events_zone on location_events(zone_id);

-- RLS
alter table map_config enable row level security;
alter table map_layers enable row level security;
alter table map_pois enable row level security;
alter table map_overlays enable row level security;
alter table map_routes enable row level security;
alter table map_zones enable row level security;
alter table location_events enable row level security;

create policy "map_read" on map_config for select using (true);
create policy "map_layers_read" on map_layers for select using (true);
create policy "map_pois_read" on map_pois for select using (true);
create policy "map_overlays_read" on map_overlays for select using (true);
create policy "map_routes_read" on map_routes for select using (true);
create policy "map_zones_read" on map_zones for select using (true);

create policy "location_events_insert" on location_events for insert with check (true);
-- Staff/scanner role could read for analytics; restrict for now
create policy "location_events_select_own" on location_events for select using (auth.uid() = user_id);
