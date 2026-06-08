-- Staff Portal Phase A: allow staff to write garden_status rows.
-- The original garden_status migration left writes to service_role only;
-- this adds the staff-based insert/update policy promised in that comment.

-- Staff can upsert any garden_status row (they manage the whole garden).
drop policy if exists "garden_status_staff_write" on garden_status;
create policy "garden_status_staff_write" on garden_status
  for all
  using (
    exists (select 1 from staff where staff.user_id = auth.uid())
  )
  with check (
    exists (select 1 from staff where staff.user_id = auth.uid())
  );
