-- Staff Time Slots + optional date-only scheduled admission.
-- When time_slots_enabled is false in app_config, guests pick a date only
-- (enter any time that day). Staff manage admission_dates capacity instead.

-- ─── admission_dates (date-only mode) ────────────────────────────────────────

create table if not exists admission_dates (
  id                  uuid primary key default gen_random_uuid(),
  date                date not null unique,
  capacity            int not null default 500,
  capacity_remaining  int not null default 500,
  is_active           boolean not null default true,
  created_at          timestamptz default now()
);

create index if not exists admission_dates_date on admission_dates(date);

alter table admission_dates enable row level security;

drop policy if exists "admission_dates_read" on admission_dates;
create policy "admission_dates_read" on admission_dates
  for select using (true);

drop policy if exists "admission_dates_staff_all" on admission_dates;
create policy "admission_dates_staff_all" on admission_dates
  for all using (
    exists (select 1 from staff where user_id = auth.uid())
  );

-- ─── scheduled_date on order_items + tickets (date-only scheduled tickets) ─

alter table order_items add column if not exists scheduled_date date;
alter table tickets add column if not exists scheduled_date date;

-- ─── Staff write access on time_slots ────────────────────────────────────────

drop policy if exists "time_slots_staff_all" on time_slots;
create policy "time_slots_staff_all" on time_slots
  for all using (
    exists (select 1 from staff where user_id = auth.uid())
  );

-- ─── app_config: scheduled admission toggle ───────────────────────────────────

insert into app_config (key, value) values (
  'scheduled_admission',
  '{"time_slots_enabled": true}'
) on conflict (key) do nothing;

-- Seed admission_dates from existing slot dates so date-only mode has data
insert into admission_dates (date, capacity, capacity_remaining, is_active)
select distinct
  ts.date,
  coalesce(max(ts.capacity_remaining), 500),
  coalesce(sum(ts.capacity_remaining), 500),
  true
from time_slots ts
where ts.is_active = true
group by ts.date
on conflict (date) do nothing;
