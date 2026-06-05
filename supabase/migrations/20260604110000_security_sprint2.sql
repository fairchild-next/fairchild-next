-- Safety Sprint 2: kids_badges RLS + storage upload lockdown
-- Run in Supabase Dashboard: SQL Editor → New query → Paste → Run

-- ============================================
-- 1. Enable RLS on kids_badges (catalog table)
--    Was missing RLS entirely — anyone could read/modify badge definitions.
--    Reads are public (kids need to see badge catalog without auth).
--    Writes are service-role only (no client policy = only service role can insert/update).
-- ============================================
alter table kids_badges enable row level security;

drop policy if exists "kids_badges_public_read" on kids_badges;
create policy "kids_badges_public_read" on kids_badges
  for select
  using (true);

-- ============================================
-- 2. Lock map-poi-images storage uploads to staff only.
--    The old policy allowed any authenticated (or anon) user to upload.
--    All legitimate uploads go through /api/map/upload (requireStaff).
--    Service role bypasses RLS, so the API route still works fine.
--    This policy blocks direct browser uploads from non-staff.
-- ============================================
drop policy if exists "map-poi-images allow upload" on storage.objects;
create policy "map-poi-images staff upload only"
  on storage.objects for insert
  with check (
    bucket_id = 'map-poi-images'
    and exists (
      select 1 from public.staff s
      where s.user_id = auth.uid()
    )
  );
