-- Fairchild Ticket Schema Migration
-- Run this in Supabase Dashboard: SQL Editor → New query → Paste → Run

-- ============================================
-- 1. ticket_types
-- ============================================
create table if not exists ticket_types (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric(10, 2) not null,
  is_active boolean not null default true,
  created_at timestamptz default now()
);

insert into ticket_types (name, price, is_active)
select v.name, v.price, v.is_active
from (values
  ('Adult (18–64)', 30.00, true),
  ('Child (6–17)', 20.00, true),
  ('Student', 25.00, true),
  ('Senior (65+)', 22.00, true)
) as v(name, price, is_active)
where not exists (select 1 from ticket_types limit 1);

-- ============================================
-- 2. time_slots
-- ============================================
create table if not exists time_slots (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  start_time time not null,
  end_time time not null,
  capacity_remaining int not null default 100,
  is_active boolean not null default true,
  created_at timestamptz default now()
);

-- Seed 2 weeks of slots (morning + afternoon) - only if table is empty
insert into time_slots (date, start_time, end_time, capacity_remaining, is_active)
select
  (current_date + n)::date,
  t.st,
  t.et,
  100,
  true
from generate_series(0, 13) as n,
     (values ('09:00'::time, '12:00'::time), ('12:00'::time, '17:00'::time)) as t(st, et)
where not exists (select 1 from time_slots limit 1);

-- ============================================
-- 3. orders
-- ============================================
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'pending',
  currency text not null default 'usd',
  payment_provider text,
  customer_email text,
  user_id uuid references auth.users(id),
  external_payment_id text,
  created_at timestamptz default now()
);

-- ============================================
-- 4. order_items
-- ============================================
create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  ticket_type_id uuid not null references ticket_types(id),
  slot_id uuid references time_slots(id),
  quantity int not null,
  unit_price int not null,
  created_at timestamptz default now()
);

-- ============================================
-- 5. tickets
-- ============================================
create table if not exists tickets (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id),
  order_item_id uuid not null references order_items(id),
  ticket_type_id uuid not null references ticket_types(id),
  slot_id uuid references time_slots(id),
  qr_code text not null unique,
  status text not null default 'unused',
  user_id uuid references auth.users(id),
  created_at timestamptz default now()
);

-- ============================================
-- 6. visits
-- ============================================
create table if not exists visits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  ticket_id uuid not null references tickets(id),
  visit_date date not null,
  created_at timestamptz default now()
);

-- ============================================
-- RLS policies
-- ============================================
alter table ticket_types enable row level security;
alter table time_slots enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table tickets enable row level security;
alter table visits enable row level security;

drop policy if exists "ticket_types_read" on ticket_types;
create policy "ticket_types_read" on ticket_types for select using (true);

drop policy if exists "time_slots_read" on time_slots;
create policy "time_slots_read" on time_slots for select using (true);

drop policy if exists "orders_insert" on orders;
create policy "orders_insert" on orders for insert with check (true);
drop policy if exists "orders_update" on orders;
create policy "orders_update" on orders for update using (true);
drop policy if exists "orders_select_own" on orders;
create policy "orders_select_own" on orders for select using (auth.uid() = user_id);

drop policy if exists "order_items_insert" on order_items;
create policy "order_items_insert" on order_items for insert with check (true);
drop policy if exists "order_items_select" on order_items;
create policy "order_items_select" on order_items for select using (true);

drop policy if exists "tickets_insert" on tickets;
create policy "tickets_insert" on tickets for insert with check (true);
drop policy if exists "tickets_update" on tickets;
create policy "tickets_update" on tickets for update using (true);
drop policy if exists "tickets_select_own" on tickets;
create policy "tickets_select_own" on tickets for select using (auth.uid() = user_id);

drop policy if exists "visits_insert" on visits;
create policy "visits_insert" on visits for insert with check (true);
drop policy if exists "visits_select_own" on visits;
create policy "visits_select_own" on visits for select using (auth.uid() = user_id);
