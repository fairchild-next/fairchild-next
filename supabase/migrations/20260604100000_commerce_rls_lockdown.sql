-- Safety Sprint 1: Lock down commerce RLS
-- Writes to orders, order_items, tickets, visits must go through service-role API routes only.
-- Authenticated users retain read access to their own rows.

-- Orders: remove open insert/update; keep select own
drop policy if exists "orders_insert" on orders;
drop policy if exists "orders_update" on orders;

-- Order items: remove open insert/select-all; scope reads to order owner
drop policy if exists "order_items_insert" on order_items;
drop policy if exists "order_items_select" on order_items;

drop policy if exists "order_items_select_own" on order_items;
create policy "order_items_select_own" on order_items
  for select
  using (
    exists (
      select 1 from orders o
      where o.id = order_items.order_id
        and o.user_id = auth.uid()
    )
  );

-- Tickets: remove open insert/update; keep select own
drop policy if exists "tickets_insert" on tickets;
drop policy if exists "tickets_update" on tickets;

-- Visits: remove open insert; keep select own
drop policy if exists "visits_insert" on visits;
