# Supabase SQL – Paste in Order

## Exact steps to run

1. Open your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New query**
5. For each step below:
   - Copy **only the SQL code** (the lines between ```sql and ``` — not the heading or the ``` symbols)
   - Paste into the SQL Editor
   - Click **Run** (or Cmd/Ctrl + Enter)
   - Wait for "Success" **before** moving to the next step
6. Run steps **in order**—some steps depend on earlier ones

**Steps:** 1 → 2 → 3 → 4 → 5 or 6 → 7 → 8

---

## Step 1: Members & is_members_only

```sql
-- Members and members-only events
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

alter table events add column if not exists is_members_only boolean not null default false;
```

---

## Step 2: Fix event image URLs (if events already exist)

```sql
update events set image_url = '/events/sunrise-tea-ceremony.jpg' where slug = 'sunrise-tea-ceremony';
update events set image_url = '/events/artists-in-bloom.png' where slug = 'artists-in-bloom';
update events set image_url = '/events/bunny-hoppening.png' where slug = 'bunny-hoppening';
update events set image_url = '/events/mothers-day.png' where slug = 'mothers-day';
update events set image_url = '/events/gala-in-the-garden.png' where slug = 'gala-in-the-garden';
update events set image_url = '/events/mango-festival.png' where slug = 'mango-festival';
```

---

## Step 3: Map schema

```sql
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

create table if not exists map_layers (
  id uuid primary key default gen_random_uuid(),
  map_config_id uuid not null references map_config(id) on delete cascade,
  slug text not null,
  name text not null,
  sort_order int not null default 0,
  is_default boolean not null default false,
  event_id uuid references events(id),
  layer_type text not null default 'overlay',
  created_at timestamptz default now(),
  unique(map_config_id, slug)
);

create index if not exists map_layers_config on map_layers(map_config_id);

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

create index if not exists map_pois_config on map_pois(map_config_id);
create index if not exists map_pois_layer on map_pois(layer_id);

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

create table if not exists map_routes (
  id uuid primary key default gen_random_uuid(),
  layer_id uuid not null references map_layers(id) on delete cascade,
  name text,
  path_geojson jsonb not null,
  color text default '#2e7d57',
  weight int default 4,
  created_at timestamptz default now()
);

create table if not exists map_zones (
  id uuid primary key default gen_random_uuid(),
  map_config_id uuid not null references map_config(id) on delete cascade,
  name text,
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

create index if not exists location_events_created on location_events(created_at);
create index if not exists location_events_zone on location_events(zone_id);

alter table map_config enable row level security;
alter table map_layers enable row level security;
alter table map_pois enable row level security;
alter table map_overlays enable row level security;
alter table map_routes enable row level security;
alter table map_zones enable row level security;
alter table location_events enable row level security;

drop policy if exists "map_read" on map_config;
drop policy if exists "map_layers_read" on map_layers;
drop policy if exists "map_pois_read" on map_pois;
drop policy if exists "map_overlays_read" on map_overlays;
drop policy if exists "map_routes_read" on map_routes;
drop policy if exists "map_zones_read" on map_zones;
drop policy if exists "location_events_insert" on location_events;
drop policy if exists "location_events_select_own" on location_events;

create policy "map_read" on map_config for select using (true);
create policy "map_layers_read" on map_layers for select using (true);
create policy "map_pois_read" on map_pois for select using (true);
create policy "map_overlays_read" on map_overlays for select using (true);
create policy "map_routes_read" on map_routes for select using (true);
create policy "map_zones_read" on map_zones for select using (true);
create policy "location_events_insert" on location_events for insert with check (true);
create policy "location_events_select_own" on location_events for select using (auth.uid() = user_id);
```

---

## Step 4: Map seed (Fairchild POIs)

```sql
insert into map_config (slug, name, center_lat, center_lng, default_zoom)
values ('default', 'Fairchild Tropical Botanic Garden', 25.677, -80.273, 17)
on conflict (slug) do nothing;

insert into map_layers (map_config_id, slug, name, sort_order, is_default, layer_type)
select id, 'default', 'Garden Map', 0, true, 'overlay'
from map_config where slug = 'default'
on conflict (map_config_id, slug) do nothing;

insert into map_pois (map_config_id, name, description, lat, lng, sort_order)
select mc.id, v.name, v.description, v.lat, v.lng, v.ord
from map_config mc
cross join (values
  ('Visitor Center', 'Start your visit here. Information desk, restrooms, and gift shop.', 25.6775, -80.2725, 1),
  ('Rainforest Exhibit', 'Explore the lush tropical rainforest and exotic plant life.', 25.6765, -80.2735, 2),
  ('Waterfall Garden', 'Tranquil waterfall and lily pond area.', 25.6768, -80.272, 3),
  ('Palm Grove', 'Stunning collection of palm trees from around the world.', 25.6778, -80.2738, 4),
  ('Butterfly Garden', 'Watch colorful butterflies among flowering plants.', 25.6762, -80.2718, 5),
  ('Waterfront Trail', 'Scenic path along the water with tropical views.', 25.676, -80.274, 6)
) as v(name, description, lat, lng, ord)
where mc.slug = 'default'
and not exists (select 1 from map_pois mp where mp.map_config_id = mc.id);
```

---

## Step 5: Fairchild POIs (optional – skip if using Step 6 MapLibre)

Legacy overlay approach. If using the new MapLibre map (Step 6), run Step 6 instead and add POIs via the map editor.

```sql
update map_config set default_zoom = 16 where slug = 'default';

delete from map_overlays where image_url = '/map/fairchild-garden-map.png';
insert into map_overlays (layer_id, image_url, bounds_sw_lat, bounds_sw_lng, bounds_ne_lat, bounds_ne_lng, opacity)
select ml.id, '/map/fairchild-garden-map.png', 25.6745, -80.2762, 25.6825, -80.2708, 0.9
from map_layers ml join map_config mc on ml.map_config_id = mc.id
where mc.slug = 'default' and ml.slug = 'default' limit 1;

delete from map_pois where map_config_id in (select id from map_config where slug = 'default');
insert into map_pois (map_config_id, name, description, lat, lng, sort_order)
select mc.id, v.name, v.description, v.lat, v.lng, v.ord from map_config mc
cross join (values
  ('North Entrance', 'Main entrance, Old Cutler Road.', 25.6805, -80.2760, 1),
  ('South Entrance', 'Self-parking entrance.', 25.6748, -80.2750, 2),
  ('Shehan Visitor Center', 'Info, restrooms, gift shop.', 25.6798, -80.2755, 3),
  ('Restrooms', 'Near Visitor Center.', 25.6796, -80.2753, 4),
  ('ATM', 'Near main entrance.', 25.6797, -80.2756, 5),
  ('Tram Plaza', 'Tram boarding area.', 25.6758, -80.2742, 6),
  ('Glasshouse Café', 'Food and beverages.', 25.6778, -80.2738, 7),
  ('Lakeside Café', 'Café by the lakes.', 25.6772, -80.2712, 8),
  ('Wings of the Tropics', 'Butterfly house.', 25.6770, -80.2720, 9),
  ('Clinton Conservatory', 'Tropical conservatory.', 25.6775, -80.2735, 10),
  ('Montgomery Palmetum', 'Palm collection.', 25.6782, -80.2745, 11)
) as v(name, description, lat, lng, ord) where mc.slug = 'default';
```

---

## Step 6: MapLibre – category + boundary (new map architecture)

Adds POI categories and Fairchild boundary polygon. Run before using the new map.

```sql
alter table map_pois add column if not exists category text default 'exhibit';

delete from map_zones where map_config_id in (select id from map_config where slug = 'default');
insert into map_zones (map_config_id, name, geometry_geojson)
select id, 'Fairchild Garden', '{
  "type": "Polygon",
  "coordinates": [[
    [-80.2762, 25.6748],
    [-80.2710, 25.6748],
    [-80.2710, 25.6820],
    [-80.2762, 25.6820],
    [-80.2762, 25.6748]
  ]]
}'::jsonb
from map_config where slug = 'default';

update map_pois set category = 'entrance' where name ilike '%entrance%' and map_config_id in (select id from map_config where slug = 'default');
update map_pois set category = 'restroom' where (name ilike '%restroom%' or name ilike '%bathroom%') and map_config_id in (select id from map_config where slug = 'default');
update map_pois set category = 'cafe' where (name ilike '%cafe%' or name ilike '%café%' or name ilike '%food%') and map_config_id in (select id from map_config where slug = 'default');
update map_pois set category = 'shop' where name ilike '%shop%' and map_config_id in (select id from map_config where slug = 'default');
update map_pois set category = 'info' where (name ilike '%information%' or name ilike '%visitor center%') and map_config_id in (select id from map_config where slug = 'default');
update map_pois set category = 'tram' where name ilike '%tram%' and map_config_id in (select id from map_config where slug = 'default');
update map_pois set category = 'exhibit' where category is null or category = 'exhibit';
```

---

## Step 7: Add yourself as a test member (after sign-up)

1. Sign up at `/login`
2. Replace `YOUR_EMAIL@example.com` with your email
3. Run:

```sql
insert into members (user_id, member_id, membership_type, display_name, expires_at)
select id, '2457893', 'Dual Membership', 'John Doe', '2025-08-25'
from auth.users where email = 'YOUR_EMAIL@example.com' limit 1;
```

---

## Step 8: Plants (Learn section)

Enables the Browse Plants database for the Learn tab.

```sql
create table if not exists plants (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  common_name text not null,
  scientific_name text not null,
  description text,
  did_you_know text,
  image_url text,
  plant_type text,
  location text,
  characteristics text[] default '{}',
  sort_order int not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists plants_slug on plants(slug);
create index if not exists plants_type on plants(plant_type);
create index if not exists plants_location on plants(location);

alter table plants enable row level security;
create policy "plants_read" on plants for select using (true);

insert into plants (slug, common_name, scientific_name, description, did_you_know, image_url, plant_type, location, characteristics, sort_order)
values
  ('silk-floss-tree', 'Silk Floss Tree', 'Ceiba speciosa', 'One of Fairchild''s most striking trees, the Silk Floss Tree features a dramatic trunk, showy pink flowers, and silky fibers. Native to South America, it thrives in warm climates and typically blooms in fall. The thick, cone-shaped spines on its trunk protect it from animals, and it stores water in its swollen trunk to survive dry conditions.', 'The Silk Floss Tree is related to the kapok tree and is often planted as an ornamental tree in tropical and subtropical regions around the world.', '/stock/garden-1.png', 'Tree', 'Palm Grove', ARRAY['flowering', 'drought-tolerant', 'showy'], 1),
  ('red-torch-ginger', 'Red Torch Ginger', 'Etlingera elatior', 'A spectacular tropical plant with bold red flower spikes that emerge from the ground. Native to Indonesia, Malaysia, and New Guinea, it is a member of the ginger family and thrives in humid, warm conditions.', 'The young flower buds of Red Torch Ginger are edible and used in Asian cuisine for their tangy, slightly spicy flavor.', '/stock/rainforest.png', 'Flower', 'Rainforest Exhibit', ARRAY['tropical', 'ornamental', 'edible'], 2),
  ('sabal-palm', 'Sabal Palm', 'Sabal palmetto', 'The Sabal Palm is the state tree of Florida and South Carolina. This hardy native palm is highly adaptable, tolerating salt spray, drought, and occasional flooding.', 'The heart of the palm was once harvested as "hearts of palm"—a practice that kills the tree. Today, cultivation methods allow harvest without killing the plant.', '/stock/waterfront.png', 'Palm', 'Palm Grove', ARRAY['native', 'drought-tolerant', 'salt-tolerant'], 3),
  ('monarch-orchid', 'Queen of the Night', 'Epiphyllum oxypetalum', 'A night-blooming cereus known for its large, fragrant white flowers that open after dark and wilt by dawn. Native to Central and South America.', 'The flowers typically open between 9 PM and midnight and close by morning—earning it the nickname "Queen of the Night."', '/stock/garden-2.png', 'Flower', 'Rainforest Exhibit', ARRAY['night-blooming', 'fragrant', 'epiphytic'], 4),
  ('bromeliad', 'Pineapple Bromeliad', 'Ananas comosus', 'The same species that produces the pineapple fruit. Native to South America, it has been cultivated for thousands of years.', 'Pineapple is the only edible fruit in the Bromeliaceae family, which includes thousands of ornamental species.', '/stock/rainforest-2.png', 'Shrub', 'Rainforest Exhibit', ARRAY['edible', 'tropical', 'ornamental'], 5)
on conflict (slug) do nothing;
```
