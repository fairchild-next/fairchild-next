create table if not exists stripe_webhook_events (
  id           text        primary key,
  processed_at timestamptz default now()
);

alter table stripe_webhook_events enable row level security;
