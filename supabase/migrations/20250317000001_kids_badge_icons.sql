-- Add icon URLs for badge images (stored in public/kids/badges/)
-- Run after 20250317000000_kids_discoveries_badges.sql

update kids_badges set icon_url = '/kids/badges/butterfly-finder.png' where badge_key = 'butterfly-finder';
update kids_badges set icon_url = '/kids/badges/flower-spotter.png' where badge_key = 'flower-spotter';
update kids_badges set icon_url = '/kids/badges/tree-explorer.png' where badge_key = 'tree-explorer';
update kids_badges set icon_url = '/kids/badges/flower-collector.png' where badge_key = 'flower-collector';
update kids_badges set icon_url = '/kids/badges/pollinator-pal.png' where badge_key = 'pollinator-pal';
update kids_badges set icon_url = '/kids/badges/nature-detective.png' where badge_key = 'nature-detective';
