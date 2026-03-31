-- Per-mode map configs (kids, wedding, events). Center/zoom match main map when `default` exists.

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
