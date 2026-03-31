-- Add time_slots for March 2025 (run in Supabase SQL Editor)
-- Copy into SQL Editor → New query → Run

insert into time_slots (date, start_time, end_time, capacity_remaining, is_active)
select d, t.st, t.et, 100, true
from (
  select (date '2025-03-01' + (n || ' days')::interval)::date as d
  from generate_series(0, 30) as n
) dates,
(values ('09:00'::time, '12:00'::time), ('12:00'::time, '17:00'::time)) as t(st, et)
where not exists (
  select 1 from time_slots ts
  where ts.date = dates.d and ts.start_time = t.st and ts.end_time = t.et
);
