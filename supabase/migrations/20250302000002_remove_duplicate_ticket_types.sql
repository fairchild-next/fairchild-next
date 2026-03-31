-- Remove duplicate ticket_types (e.g. duplicate Adult)
-- Run in Supabase SQL Editor → New query → Paste → Run

-- 1. Point order_items at the kept ticket_type
update order_items oi
set ticket_type_id = d.keep_id
from (
  select id, first_value(id) over (partition by name, price order by created_at) as keep_id
  from ticket_types
) d
where oi.ticket_type_id = d.id and d.id != d.keep_id;

-- 2. Point tickets at the kept ticket_type
update tickets t
set ticket_type_id = d.keep_id
from (
  select id, first_value(id) over (partition by name, price order by created_at) as keep_id
  from ticket_types
) d
where t.ticket_type_id = d.id and d.id != d.keep_id;

-- 3. Delete duplicate rows
delete from ticket_types
where id in (
  select id from (
    select id, row_number() over (partition by name, price order by created_at) as rn
    from ticket_types
  ) x where rn > 1
);
