-- Seed Special Events
-- Run after 20250303200000_events.sql

-- ============================================
-- 1. Insert events
-- ============================================
insert into events (name, slug, description, start_date, end_date, start_time, end_time, image_url, is_festival, is_active, sort_order)
values
  (
    'Sunrise Tea Ceremony',
    'sunrise-tea-ceremony',
    'Relax and rejuvenate with a tranquil sunrise tea ceremony in the garden. Experience the peaceful morning atmosphere with curated teas and mindful moments.',
    '2026-06-15',
    '2026-06-15',
    '06:00',
    '08:00',
    '/events/sunrise-tea-ceremony.jpg',
    false,
    true,
    0
  ),
  (
    'Artists in Bloom',
    'artists-in-bloom',
    'Get ready to immerse yourself in a whirlwind of color and creativity as Fairchild''s art instructors and students honor the beauty of nature in a fine art exhibition featuring their original works. Marvel at one-of-a-kind pieces crafted with passion and skill, spanning watercolor, oil, acrylic paints, and botanical illustrations. These masterpieces not only showcase the artists'' blossoming talent but also invite you to discover the tropical flora in a whole new light. Crafted under the careful eye of renowned botanical artist Pauline Goldsmith, this exhibition isn''t just about art—it''s a celebration of Fairchild''s mission to spread the joy of tropical gardening through creativity. *The exhibit is free for all Garden visitors with the purchase of General Admission tickets. *Selected pieces of artwork will be available for purchase.',
    '2026-05-10',
    '2026-05-12',
    '10:00',
    '16:00',
    '/events/artists-in-bloom.png',
    false,
    true,
    1
  ),
  (
    'The Bunny Hoppening: An Easter Eggstravaganza',
    'bunny-hoppening',
    'General Admission is included. Members login for FREE tickets. Important: Egg Hunt tickets are separate from Garden admission and sell out every year. Enhance your visit with additional ticketed experiences including Eggsplore Galore Egg Hunt, Mini Cocktail Flight, Mini Mimosa Flight, and Picnic Baskets.',
    '2026-04-05',
    '2026-04-05',
    '10:00',
    '17:00',
    '/events/bunny-hoppening.png',
    false,
    true,
    2
  ),
  (
    'Mother''s Day at Fairchild',
    'mothers-day',
    'Celebrate Mother''s Day at Fairchild Tropical Botanic Garden. General admission included. Save the Date!',
    '2026-05-10',
    '2026-05-10',
    '10:00',
    '17:00',
    '/events/mothers-day.png',
    false,
    true,
    3
  ),
  (
    'Gala in the Garden: Tropical Temptations',
    'gala-in-the-garden',
    'For over 30 years, Gala in the Garden has been a magical and revered event, named one of South Florida''s most beautiful gatherings. As the sun sets, enjoy Fairchild''s natural beauty with twinkling lights, live music, and an unforgettable dining experience curated by renowned chefs. Bid in our exclusive auction, directly supporting our conservation efforts. Dress your best and join us for a night of glamour, enchantment, and philanthropy.',
    '2026-03-20',
    '2026-03-20',
    '18:00',
    '23:00',
    '/events/gala-in-the-garden.png',
    false,
    true,
    4
  ),
  (
    'Mango Festival',
    'mango-festival',
    'The Juiciest Event of the Season! Fairchild''s Annual Mango Festival. General admission included. The Mango Festival is included with General admission.',
    '2026-03-28',
    '2026-03-29',
    '10:00',
    '17:00',
    '/events/mango-festival.png',
    true,
    true,
    5
  )
on conflict (slug) do nothing;

-- ============================================
-- 2. Event ticket types (prices per event)
-- ============================================
insert into ticket_types (name, price, price_peak, is_active, event_id)
select v.name, v.price, v.price_peak, true, e.id
from events e
cross join (values
  ('Adult', 35.00, 35.00),
  ('Child (6-17)', 18.00, 18.00),
  ('Senior (65+)', 28.00, 28.00)
) as v(name, price, price_peak)
where e.slug = 'sunrise-tea-ceremony'
and not exists (select 1 from ticket_types where event_id = e.id);

insert into ticket_types (name, price, price_peak, is_active, event_id)
select v.name, v.price, v.price_peak, true, e.id
from events e
cross join (values
  ('Adult', 24.95, 24.95),
  ('Child (6-17)', 12.95, 12.95),
  ('Senior (65+)', 19.95, 19.95)
) as v(name, price, price_peak)
where e.slug = 'artists-in-bloom'
and not exists (select 1 from ticket_types where event_id = e.id);

insert into ticket_types (name, price, price_peak, is_active, event_id)
select v.name, v.price, v.price_peak, true, e.id
from events e
cross join (values
  ('Adult', 28.95, 28.95),
  ('Child (3-11)', 17.95, 17.95),
  ('Senior (65+)', 22.95, 22.95)
) as v(name, price, price_peak)
where e.slug = 'bunny-hoppening'
and not exists (select 1 from ticket_types where event_id = e.id);

insert into ticket_types (name, price, price_peak, is_active, event_id)
select v.name, v.price, v.price_peak, true, e.id
from events e
cross join (values
  ('Adult', 24.95, 24.95),
  ('Child (6-17)', 12.95, 12.95),
  ('Senior (65+)', 19.95, 19.95)
) as v(name, price, price_peak)
where e.slug = 'mothers-day'
and not exists (select 1 from ticket_types where event_id = e.id);

insert into ticket_types (name, price, price_peak, is_active, event_id)
select 'Gala Ticket', 250.00, 250.00, true, e.id
from events e
where e.slug = 'gala-in-the-garden'
and not exists (select 1 from ticket_types where event_id = e.id);

insert into ticket_types (name, price, price_peak, is_active, event_id)
select v.name, v.price, v.price_peak, true, e.id
from events e
cross join (values
  ('Adult', 24.95, 24.95),
  ('Child (3-11)', 11.95, 11.95),
  ('Senior (65+)', 17.95, 17.95)
) as v(name, price, price_peak)
where e.slug = 'mango-festival'
and not exists (select 1 from ticket_types where event_id = e.id);
