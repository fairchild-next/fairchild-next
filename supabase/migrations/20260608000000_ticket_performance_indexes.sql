-- Performance indexes for high-frequency ticket operations.
-- tickets.qr_code   → gate scanner lookup (scanned on every entry)
-- tickets.user_id   → wallet / my-tickets queries
-- tickets.status    → slot oversell checks and capacity queries

create index if not exists tickets_qr_code_idx on tickets (qr_code);
create index if not exists tickets_user_id_idx  on tickets (user_id);
create index if not exists tickets_status_idx   on tickets (status);
