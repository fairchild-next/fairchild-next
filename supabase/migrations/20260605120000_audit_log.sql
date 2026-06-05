create table if not exists audit_log (
  id            uuid        primary key default gen_random_uuid(),
  created_at    timestamptz default now(),
  user_id       uuid        references auth.users(id) on delete set null,
  action        text        not null,
  resource_type text,
  resource_id   text,
  metadata      jsonb,
  ip_address    text
);

create index if not exists audit_log_created_at  on audit_log(created_at desc);
create index if not exists audit_log_user_id     on audit_log(user_id);
create index if not exists audit_log_action      on audit_log(action);

alter table audit_log enable row level security;
