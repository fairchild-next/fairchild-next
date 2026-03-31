-- Special Events schema (client-agnostic, adaptable for future data sources)
-- Run in Supabase Dashboard: SQL Editor → Paste → Run

-- ============================================
-- 1. events
-- ============================================
create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  start_date date not null,
  end_date date not null,
  start_time time,
  end_time time,
  image_url text,
  is_festival boolean not null default false,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz default now()
);

-- ============================================
-- 2. Add event_id to ticket_types (null = daily admission)
-- ============================================
alter table ticket_types add column if not exists event_id uuid references events(id);
create index if not exists ticket_types_event_id on ticket_types(event_id);

-- ============================================
-- 3. Add event_id to order_items and tickets
-- ============================================
alter table order_items add column if not exists event_id uuid references events(id);
alter table tickets add column if not exists event_id uuid references events(id);
create index if not exists order_items_event_id on order_items(event_id);
create index if not exists tickets_event_id on tickets(event_id);

-- Event orders: ticket_type_id references ticket_types where event_id is set
-- (We create event-specific rows in ticket_types)

-- RLS
alter table events enable row level security;
drop policy if exists "events_read" on events;
create policy "events_read" on events for select using (true);
