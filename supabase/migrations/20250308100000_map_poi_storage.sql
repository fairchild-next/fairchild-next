-- Create public storage bucket for map POI images
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'map-poi-images',
  'map-poi-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

-- Allow public read access
drop policy if exists "map-poi-images public read" on storage.objects;
create policy "map-poi-images public read"
  on storage.objects for select
  using (bucket_id = 'map-poi-images');

-- Allow uploads (service role bypasses RLS for API uploads)
drop policy if exists "map-poi-images allow upload" on storage.objects;
create policy "map-poi-images allow upload"
  on storage.objects for insert
  with check (bucket_id = 'map-poi-images');
