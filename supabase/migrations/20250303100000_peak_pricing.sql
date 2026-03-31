-- Peak/Off-Peak pricing for Scheduled and Flex tickets
-- Flex = Scheduled + $5 for corresponding day type
-- Run in Supabase Dashboard: SQL Editor → New query → Paste → Run

-- ============================================
-- 1. Add price_peak to ticket_types (off-peak = price, peak = price_peak)
-- ============================================
alter table ticket_types add column if not exists price_peak numeric(10, 2);

-- Backfill: treat current price as off-peak, add peak (approx +$7 for peak)
-- UX: Adult off $17 peak $24, Child off $8 peak $12, etc.
update ticket_types set price_peak = price + 7 where price_peak is null;

-- Set explicit values from UX design
update ticket_types set price = 17.00, price_peak = 24.00 where name = 'Adult (18–64)' or name like 'Adult%';
update ticket_types set price = 8.00, price_peak = 12.00 where name = 'Child (6–17)' or name like 'Child%';
update ticket_types set price = 10.00, price_peak = 14.00 where name = 'Student';
update ticket_types set price = 10.00, price_peak = 14.00 where name = 'Military';
update ticket_types set price = 5.00, price_peak = 8.00 where name = 'Senior (65+)' or name like 'Senior%';

-- Add Military if missing
insert into ticket_types (name, price, price_peak, is_active)
select 'Military', 10.00, 14.00, true
where not exists (select 1 from ticket_types where name like 'Military%');

-- ============================================
-- 2. Add is_peak to order_items (for flex tickets: true=weekend, false=weekday)
-- ============================================
alter table order_items add column if not exists is_peak boolean;

comment on column order_items.is_peak is 'For flex tickets: true = weekend/peak, false = weekday/off-peak. Null for scheduled (derived from slot date).';
