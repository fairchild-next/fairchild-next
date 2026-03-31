-- Add "Secret Rainforest" back to the Kids mode map after an accidental "Copy from main".
-- Run once in Supabase → SQL Editor. Then open Staff → Map Editor → Kids mode to move/edit.
-- Tweak lat/lng or text below if you remember your original placement.

insert into map_pois (map_config_id, name, description, lat, lng, sort_order, category)
select c.id,
  'Secret Rainforest',
  'A quiet spot in the rainforest—update this text in the map editor if you like.',
  25.6765,
  -80.2735,
  coalesce((select max(p.sort_order) from map_pois p where p.map_config_id = c.id), -1) + 1,
  'exhibit'
from map_config c
where c.slug = 'kids';
