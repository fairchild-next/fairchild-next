-- Staff Portal Phase D: overlay opacity, wedding vendors, quizzes CMS, members staff access.

-- ─── Map overlay opacity ───────────────────────────────────────────────────────

alter table map_config add column if not exists overlay_opacity numeric default 0.7
  check (overlay_opacity >= 0 and overlay_opacity <= 1);

-- ─── Wedding vendors (couple portal preferred vendors) ───────────────────────────

create table if not exists wedding_vendors (
  id              uuid primary key default gen_random_uuid(),
  category_slug   text not null,
  category_label  text not null,
  category_emoji  text,
  name            text not null,
  description     text not null default '',
  website         text,
  phone           text,
  email           text,
  note            text,
  sort_order      int not null default 0,
  is_active       boolean not null default true,
  created_at      timestamptz default now()
);

create index if not exists wedding_vendors_category on wedding_vendors(category_slug);

alter table wedding_vendors enable row level security;

drop policy if exists "wedding_vendors_read" on wedding_vendors;
create policy "wedding_vendors_read" on wedding_vendors
  for select using (is_active = true);

drop policy if exists "wedding_vendors_staff_all" on wedding_vendors;
create policy "wedding_vendors_staff_all" on wedding_vendors
  for all using (
    exists (select 1 from staff where user_id = auth.uid())
  );

-- Seed default vendors (idempotent — only if empty)
insert into wedding_vendors (category_slug, category_label, category_emoji, name, description, website, phone, email, note, sort_order)
select v.*
from (values
  ('catering', 'Catering', '🍽️', 'Fairchild In-House Catering', 'Exclusive on-site catering partner for all Fairchild weddings. Custom menus featuring locally sourced ingredients.', null, '(305) 667-1651', 'weddings@fairchildgarden.org', 'Required for all events held on Fairchild grounds.', 0),
  ('florals', 'Florals & Décor', '💐', 'Tropical Florals Miami', 'Specializing in lush tropical arrangements that complement Fairchild''s botanical setting.', 'https://tropicalfloralmiami.com', '(305) 555-0101', null, null, 0),
  ('florals', 'Florals & Décor', '💐', 'Blooms & Botanicals', 'Award-winning floral design studio with deep experience in garden weddings and outdoor ceremonies.', 'https://bloomsandbotanicals.com', '(305) 555-0142', null, null, 1),
  ('photography', 'Photography & Video', '📷', 'Garden Light Photography', 'Fine art wedding photographers specializing in natural-light botanical garden settings.', 'https://gardenlightphoto.com', '(786) 555-0201', null, null, 0),
  ('photography', 'Photography & Video', '📷', 'Coral Gables Films', 'Cinematic wedding videography capturing the magic of garden ceremonies.', 'https://coralgablesfilms.com', '(786) 555-0234', null, null, 1),
  ('music', 'Music & Entertainment', '🎶', 'Miami String Quartet', 'Elegant string quartet perfect for outdoor ceremonies and cocktail hours.', null, '(305) 555-0301', 'info@miamistringquartet.com', null, 0),
  ('music', 'Music & Entertainment', '🎶', 'South Florida DJ Collective', 'Professional DJs experienced with outdoor venue acoustics and sound setup.', 'https://sfdjcollective.com', '(305) 555-0345', null, null, 1),
  ('officiant', 'Officiants', '🪄', 'Sacred Unions Miami', 'Non-denominational officiants providing personalized ceremonies for couples of all backgrounds.', 'https://sacredunionsmiami.com', '(305) 555-0401', null, null, 0),
  ('hair_makeup', 'Hair & Makeup', '💄', 'Blossom Bridal Beauty', 'On-location bridal hair and makeup services available throughout South Florida.', 'https://blossombridalbeauty.com', '(305) 555-0501', null, null, 0),
  ('hair_makeup', 'Hair & Makeup', '💄', 'Radiance Bridal Studio', 'Full-service bridal party hair and makeup with a dedicated on-site team.', null, '(786) 555-0512', 'hello@radiancebridalmia.com', null, 1)
) as v(category_slug, category_label, category_emoji, name, description, website, phone, email, note, sort_order)
where not exists (select 1 from wedding_vendors limit 1);

-- ─── Quizzes CMS ───────────────────────────────────────────────────────────────

create table if not exists quizzes (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,
  title           text not null,
  description     text,
  question_count  int,
  questions       jsonb not null default '[]',
  is_active       boolean not null default true,
  updated_at      timestamptz default now()
);

alter table quizzes enable row level security;

drop policy if exists "quizzes_read" on quizzes;
create policy "quizzes_read" on quizzes
  for select using (is_active = true);

drop policy if exists "quizzes_staff_all" on quizzes;
create policy "quizzes_staff_all" on quizzes
  for all using (
    exists (select 1 from staff where user_id = auth.uid())
  );

-- ─── Members: staff read + display_name update ───────────────────────────────

drop policy if exists "members_staff_read" on members;
create policy "members_staff_read" on members
  for select using (
    exists (select 1 from staff where user_id = auth.uid())
  );

drop policy if exists "members_staff_update" on members;
create policy "members_staff_update" on members
  for update using (
    exists (select 1 from staff where user_id = auth.uid())
  )
  with check (
    exists (select 1 from staff where user_id = auth.uid())
  );
