-- Wedding Coordinators: dedicated access tier for wedding coordination.
-- Coordinators access the couple portal (/couple/) with coordinator role.
-- They are NOT required to be in the staff table.
-- Dual-role users (Fairchild employees who also coordinate) have rows in BOTH tables.

-- ─── wedding_coordinators ────────────────────────────────────────────────────

create table if not exists wedding_coordinators (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade unique,
  name        text,
  is_active   boolean not null default true,
  created_at  timestamptz default now()
);

create index if not exists wc_user_id on wedding_coordinators(user_id);

alter table wedding_coordinators enable row level security;

-- Coordinators can read their own row (needed for client-side auth checks)
drop policy if exists "wc_self_read" on wedding_coordinators;
create policy "wc_self_read" on wedding_coordinators
  for select using (auth.uid() = user_id);

-- Staff can manage coordinators
drop policy if exists "wc_staff_all" on wedding_coordinators;
create policy "wc_staff_all" on wedding_coordinators
  for all using (
    exists (select 1 from staff where user_id = auth.uid())
  );

-- ─── Update RLS on all 4 wedding tables ──────────────────────────────────────
-- Replace the single `staff` check with: staff OR active coordinator.
-- The helper macro used inline to keep it readable.

-- wedding_bookings
drop policy if exists "wb_staff_all" on wedding_bookings;
create policy "wb_coordinator_all" on wedding_bookings
  for all using (
    exists (select 1 from staff where user_id = auth.uid())
    or exists (select 1 from wedding_coordinators where user_id = auth.uid() and is_active = true)
  )
  with check (
    exists (select 1 from staff where user_id = auth.uid())
    or exists (select 1 from wedding_coordinators where user_id = auth.uid() and is_active = true)
  );

-- wedding_checklist_items
drop policy if exists "wci_staff_all" on wedding_checklist_items;
create policy "wci_coordinator_all" on wedding_checklist_items
  for all using (
    exists (select 1 from staff where user_id = auth.uid())
    or exists (select 1 from wedding_coordinators where user_id = auth.uid() and is_active = true)
  )
  with check (
    exists (select 1 from staff where user_id = auth.uid())
    or exists (select 1 from wedding_coordinators where user_id = auth.uid() and is_active = true)
  );

-- wedding_messages
drop policy if exists "wm_staff_all" on wedding_messages;
create policy "wm_coordinator_all" on wedding_messages
  for all using (
    exists (select 1 from staff where user_id = auth.uid())
    or exists (select 1 from wedding_coordinators where user_id = auth.uid() and is_active = true)
  )
  with check (
    exists (select 1 from staff where user_id = auth.uid())
    or exists (select 1 from wedding_coordinators where user_id = auth.uid() and is_active = true)
  );

-- wedding_documents
drop policy if exists "wd_staff_all" on wedding_documents;
create policy "wd_coordinator_all" on wedding_documents
  for all using (
    exists (select 1 from staff where user_id = auth.uid())
    or exists (select 1 from wedding_coordinators where user_id = auth.uid() and is_active = true)
  )
  with check (
    exists (select 1 from staff where user_id = auth.uid())
    or exists (select 1 from wedding_coordinators where user_id = auth.uid() and is_active = true)
  );
