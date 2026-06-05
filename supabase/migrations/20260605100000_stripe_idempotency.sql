-- Stripe Webhook Idempotency
-- Prevents double-fulfillment when Stripe retries a webhook.
-- The PRIMARY KEY on the Stripe event ID is the lock: the first INSERT wins;
-- a concurrent duplicate INSERT raises error 23505 (unique_violation) which
-- the handler treats as "already processed → return 200 immediately".
-- Run in Supabase Dashboard: SQL Editor → New query → Paste → Run

create table if not exists stripe_webhook_events (
  id           text        primary key,   -- Stripe event ID  e.g. evt_xxx
  processed_at timestamptz default now()
);

-- Service role only — no client should ever read or write this table.
alter table stripe_webhook_events enable row level security;
-- (No policies created → only service-role/admin key can access)
