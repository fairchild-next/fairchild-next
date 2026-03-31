-- MapLibre: add category to POIs + Fairchild boundary polygon
-- Run in Supabase SQL Editor

-- 1. Add category to map_pois (restrooms, cafe, exhibit, entrance, etc.)
alter table map_pois add column if not exists category text default 'exhibit';

-- 2. Add Fairchild garden boundary to map_zones (approximate polygon - refine in editor)
-- Coords from 83-acre footprint, center 25.67866, -80.27374
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

-- 3. Set categories for existing POIs
update map_pois set category = 'entrance' where name ilike '%entrance%' and map_config_id in (select id from map_config where slug = 'default');
update map_pois set category = 'restroom' where (name ilike '%restroom%' or name ilike '%bathroom%') and map_config_id in (select id from map_config where slug = 'default');
update map_pois set category = 'cafe' where (name ilike '%cafe%' or name ilike '%café%' or name ilike '%food%') and map_config_id in (select id from map_config where slug = 'default');
update map_pois set category = 'shop' where name ilike '%shop%' and map_config_id in (select id from map_config where slug = 'default');
update map_pois set category = 'info' where (name ilike '%information%' or name ilike '%visitor center%') and map_config_id in (select id from map_config where slug = 'default');
update map_pois set category = 'tram' where name ilike '%tram%' and map_config_id in (select id from map_config where slug = 'default');
update map_pois set category = 'exhibit' where category is null or category = 'exhibit';

-- 4. Seed basic POIs if none exist
insert into map_pois (map_config_id, name, description, lat, lng, sort_order, category)
select mc.id, v.name, v.description, v.lat, v.lng, v.ord, v.cat
from map_config mc
cross join (values
  ('North Entrance', 'Main entrance, Old Cutler Road.', 25.6805, -80.2760, 1, 'entrance'),
  ('Shehan Visitor Center', 'Info, restrooms, gift shop.', 25.6798, -80.2755, 2, 'info'),
  ('Restrooms', 'Near Visitor Center.', 25.6796, -80.2753, 3, 'restroom'),
  ('Glasshouse Café', 'Food and beverages.', 25.6778, -80.2738, 4, 'cafe'),
  ('Wings of the Tropics', 'Butterfly house.', 25.6770, -80.2720, 5, 'exhibit'),
  ('Clinton Conservatory', 'Tropical conservatory.', 25.6775, -80.2735, 6, 'exhibit'),
  ('Montgomery Palmetum', 'Palm collection.', 25.6782, -80.2745, 7, 'exhibit')
) as v(name, description, lat, lng, ord, cat)
where mc.slug = 'default'
and not exists (select 1 from map_pois mp where mp.map_config_id = mc.id);
