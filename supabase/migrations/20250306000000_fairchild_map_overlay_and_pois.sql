-- Fairchild map: overlay + curated POIs with smaller pins
-- Overlay bounds: SW 25.6745,-80.2762 to NE 25.6825,-80.2708
-- If overlay misaligns, update map_overlays bounds in DB (use opacity slider to compare)

-- 0. Zoom out so whole garden fits
update map_config set default_zoom = 16 where slug = 'default';

-- 1. Add overlay (remove first in case of re-run)
delete from map_overlays where image_url = '/map/fairchild-garden-map.png';
insert into map_overlays (layer_id, image_url, bounds_sw_lat, bounds_sw_lng, bounds_ne_lat, bounds_ne_lng, opacity)
select ml.id, '/map/fairchild-garden-map.png', 25.6745, -80.2762, 25.6825, -80.2708, 0.9
from map_layers ml
join map_config mc on ml.map_config_id = mc.id
where mc.slug = 'default' and ml.slug = 'default'
limit 1;

-- 2. Curated POIs: fewer, better-spaced, key services only (overlay has full legend)
-- Coords approximate; refine after verifying overlay alignment
delete from map_pois where map_config_id in (select id from map_config where slug = 'default');
insert into map_pois (map_config_id, name, description, lat, lng, sort_order)
select mc.id, v.name, v.description, v.lat, v.lng, v.ord
from map_config mc
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
) as v(name, description, lat, lng, ord)
where mc.slug = 'default';
