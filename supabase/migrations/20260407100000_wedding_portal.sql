-- Wedding Couple Portal schema
-- Creates 4 tables for the couple coordination portal:
--   wedding_bookings, wedding_checklist_items, wedding_messages, wedding_documents
-- Coordinators are identified by having a row in the existing `staff` table.
-- Couples are identified by wedding_bookings.couple_user_id = auth.uid().

-- ─── wedding_bookings ────────────────────────────────────────────────────────

create table if not exists wedding_bookings (
  id                uuid        primary key default gen_random_uuid(),
  -- nullable until coordinator links the couple's account via email lookup
  couple_user_id    uuid        references auth.users(id) on delete set null,
  -- the coordinator assigned to this booking (references staff table)
  coordinator_id    uuid        references auth.users(id) on delete set null,
  -- basic couple info
  couple_name       text        not null,
  partner_name      text        not null default '',
  wedding_date      date,
  venue             text,       -- e.g. "Allee Overlook", "Art Center"
  package           text,       -- e.g. "Garden Ceremony"
  status            text        not null default 'inquiry'
                    check (status in ('inquiry','contract_signed','planning','confirmed','complete')),
  -- event logistics
  ceremony_time     text,       -- stored as "HH:MM" string for simplicity
  cocktail_time     text,
  reception_time    text,
  guest_count       int,
  catering_notes    text,
  -- coordinator-only private notes (RLS: couples cannot read this column)
  coordinator_notes text,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

create index if not exists wb_couple_user   on wedding_bookings(couple_user_id);
create index if not exists wb_coordinator   on wedding_bookings(coordinator_id);
create index if not exists wb_wedding_date  on wedding_bookings(wedding_date);

alter table wedding_bookings enable row level security;

-- Couples: read/update their own booking (no coordinator_notes column access is
-- enforced by the select policy below which excludes that column via the app layer;
-- for true column-level security a separate view would be needed — for V1 the
-- API route strips coordinator_notes before returning to couple clients)
drop policy if exists "wb_couple_select"   on wedding_bookings;
drop policy if exists "wb_couple_update"   on wedding_bookings;
drop policy if exists "wb_staff_all"       on wedding_bookings;

create policy "wb_couple_select" on wedding_bookings
  for select using (auth.uid() = couple_user_id);

create policy "wb_couple_update" on wedding_bookings
  for update using (auth.uid() = couple_user_id)
  with check (auth.uid() = couple_user_id);

-- Staff (coordinators) can do everything
create policy "wb_staff_all" on wedding_bookings
  for all using (
    exists (select 1 from staff where user_id = auth.uid())
  );


-- ─── wedding_checklist_items ─────────────────────────────────────────────────

create table if not exists wedding_checklist_items (
  id           uuid        primary key default gen_random_uuid(),
  booking_id   uuid        not null references wedding_bookings(id) on delete cascade,
  title        text        not null,
  description  text,
  due_date     date,
  completed    boolean     not null default false,
  completed_at timestamptz,
  completed_by uuid        references auth.users(id) on delete set null,
  sort_order   int         not null default 0,
  created_at   timestamptz default now()
);

create index if not exists wci_booking on wedding_checklist_items(booking_id);

alter table wedding_checklist_items enable row level security;

drop policy if exists "wci_couple_select"  on wedding_checklist_items;
drop policy if exists "wci_couple_update"  on wedding_checklist_items;
drop policy if exists "wci_staff_all"      on wedding_checklist_items;

create policy "wci_couple_select" on wedding_checklist_items
  for select using (
    exists (
      select 1 from wedding_bookings wb
      where wb.id = booking_id and wb.couple_user_id = auth.uid()
    )
  );

-- Couples can mark items complete themselves
create policy "wci_couple_update" on wedding_checklist_items
  for update using (
    exists (
      select 1 from wedding_bookings wb
      where wb.id = booking_id and wb.couple_user_id = auth.uid()
    )
  );

create policy "wci_staff_all" on wedding_checklist_items
  for all using (
    exists (select 1 from staff where user_id = auth.uid())
  );


-- ─── wedding_messages ────────────────────────────────────────────────────────

create table if not exists wedding_messages (
  id          uuid        primary key default gen_random_uuid(),
  booking_id  uuid        not null references wedding_bookings(id) on delete cascade,
  sender_id   uuid        not null references auth.users(id) on delete cascade,
  sender_role text        not null check (sender_role in ('couple', 'coordinator')),
  message     text        not null,
  created_at  timestamptz default now()
);

create index if not exists wm_booking    on wedding_messages(booking_id);
create index if not exists wm_created_at on wedding_messages(booking_id, created_at);

alter table wedding_messages enable row level security;

drop policy if exists "wm_couple_select" on wedding_messages;
drop policy if exists "wm_couple_insert" on wedding_messages;
drop policy if exists "wm_staff_all"     on wedding_messages;

create policy "wm_couple_select" on wedding_messages
  for select using (
    exists (
      select 1 from wedding_bookings wb
      where wb.id = booking_id and wb.couple_user_id = auth.uid()
    )
  );

create policy "wm_couple_insert" on wedding_messages
  for insert with check (
    auth.uid() = sender_id
    and sender_role = 'couple'
    and exists (
      select 1 from wedding_bookings wb
      where wb.id = booking_id and wb.couple_user_id = auth.uid()
    )
  );

create policy "wm_staff_all" on wedding_messages
  for all using (
    exists (select 1 from staff where user_id = auth.uid())
  );


-- ─── wedding_documents ───────────────────────────────────────────────────────

create table if not exists wedding_documents (
  id          uuid        primary key default gen_random_uuid(),
  booking_id  uuid        not null references wedding_bookings(id) on delete cascade,
  uploaded_by uuid        not null references auth.users(id) on delete cascade,
  file_name   text        not null,
  file_url    text        not null,
  category    text        not null default 'other'
              check (category in ('contract','floor_plan','menu','inspiration','other')),
  created_at  timestamptz default now()
);

create index if not exists wd_booking on wedding_documents(booking_id);

alter table wedding_documents enable row level security;

drop policy if exists "wd_couple_select" on wedding_documents;
drop policy if exists "wd_couple_insert" on wedding_documents;
drop policy if exists "wd_staff_all"     on wedding_documents;

create policy "wd_couple_select" on wedding_documents
  for select using (
    exists (
      select 1 from wedding_bookings wb
      where wb.id = booking_id and wb.couple_user_id = auth.uid()
    )
  );

create policy "wd_couple_insert" on wedding_documents
  for insert with check (
    auth.uid() = uploaded_by
    and exists (
      select 1 from wedding_bookings wb
      where wb.id = booking_id and wb.couple_user_id = auth.uid()
    )
  );

create policy "wd_staff_all" on wedding_documents
  for all using (
    exists (select 1 from staff where user_id = auth.uid())
  );


-- ─── Storage bucket for wedding documents ────────────────────────────────────
-- Run separately in Supabase dashboard if needed:
-- insert into storage.buckets (id, name, public) values ('wedding-docs', 'wedding-docs', false)
-- on conflict (id) do nothing;
