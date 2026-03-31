-- Seed Fairchild map config and default POIs
-- Run after 20250305000000_map_schema.sql

insert into map_config (slug, name, center_lat, center_lng, default_zoom)
values ('default', 'Fairchild Tropical Botanic Garden', 25.677, -80.273, 17)
on conflict (slug) do nothing;

-- Default layer (always visible)
insert into map_layers (map_config_id, slug, name, sort_order, is_default, layer_type)
select id, 'default', 'Garden Map', 0, true, 'overlay'
from map_config where slug = 'default'
on conflict (map_config_id, slug) do nothing;

-- Fairchild POIs – adjust lat/lng when you have accurate coordinates
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

-- Example: Mango Festival layer (links to event; show during festival dates)
-- Uncomment and set event_id when ready:
-- insert into map_layers (map_config_id, slug, name, sort_order, is_default, event_id, layer_type)
-- select mc.id, 'mango-festival', 'Mango Festival Map', 1, false, e.id, 'overlay'
-- from map_config mc, events e
-- where mc.slug = 'default' and e.slug = 'mango-festival';
