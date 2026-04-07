-- Update did_you_know field for all seeded plants to be exciting and readable
-- for children ages 5–10. Facts are accurate and based on the existing plant data.

update plants
set did_you_know = 'This tree is basically a dragon! Its trunk is covered in giant sharp spines — some as big as your thumb — to scare away animals. It also stores water inside its puffy trunk like a camel. When the seed pods pop open, fluffy silk comes out that people used to stuff pillows with!'
where slug = 'silk-floss-tree';

update plants
set did_you_know = 'You can actually eat this flower! The buds taste tangy and a little spicy, and cooks in Asia use them like a vegetable. This plant is also a cousin of the ginger you might have tasted in food — and that giant red spike grows straight up from the ground with no normal stem at all!'
where slug = 'red-torch-ginger';

update plants
set did_you_know = 'The Sabal Palm is like a superhero tree — it can survive hurricanes, floods, salty ocean air, AND droughts! It''s so tough that both Florida AND South Carolina made it their official state tree. Some of these palms have been alive for over 200 years — way longer than anyone you''ve ever met!'
where slug = 'sabal-palm';

update plants
set did_you_know = 'This flower only blooms in the dark! It opens around 9 o''clock at night and completely disappears by morning — gone in just a few hours. Each flower can grow as wide as your face and smells absolutely amazing. If you want to see it, you''d have to stay up way past your bedtime!'
where slug = 'monarch-orchid';

update plants
set did_you_know = 'A single pineapple takes almost TWO WHOLE YEARS to grow — that''s longer than some kids have been alive! Pineapples also have a secret superpower: they contain a chemical that dissolves meat. That''s why your tongue feels tingly after eating too much pineapple — it''s actually trying to digest you right back!'
where slug = 'bromeliad';
