-- Ensure all event image_url paths point to correct files in public/events/
update events set image_url = '/events/sunrise-tea-ceremony.jpg' where slug = 'sunrise-tea-ceremony';
update events set image_url = '/events/artists-in-bloom.png' where slug = 'artists-in-bloom';
update events set image_url = '/events/bunny-hoppening.png' where slug = 'bunny-hoppening';
update events set image_url = '/events/mothers-day.png' where slug = 'mothers-day';
update events set image_url = '/events/gala-in-the-garden.png' where slug = 'gala-in-the-garden';
update events set image_url = '/events/mango-festival.png' where slug = 'mango-festival';
