-- Add image_url and details to map_pois for preview cards and detail pages
alter table map_pois add column if not exists image_url text;
alter table map_pois add column if not exists details text;
