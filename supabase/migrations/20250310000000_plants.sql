-- Plants schema for Learn section
-- Browse plants database with filters (type, location, characteristics)

create table if not exists plants (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  common_name text not null,
  scientific_name text not null,
  description text,
  did_you_know text,
  image_url text,
  plant_type text,
  location text,
  characteristics text[] default '{}',
  sort_order int not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists plants_slug on plants(slug);
create index if not exists plants_type on plants(plant_type);
create index if not exists plants_location on plants(location);
create index if exists plants_search on plants using gin(to_tsvector('english', common_name || ' ' || scientific_name || ' ' || coalesce(description, '')));

alter table plants enable row level security;
create policy "plants_read" on plants for select using (true);

-- Seed example plants (Fairchild species from UX mockups)
insert into plants (slug, common_name, scientific_name, description, did_you_know, image_url, plant_type, location, characteristics, sort_order)
values
  (
    'silk-floss-tree',
    'Silk Floss Tree',
    'Ceiba speciosa',
    'One of Fairchild''s most striking trees, the Silk Floss Tree features a dramatic trunk, showy pink flowers, and silky fibers. Native to South America, it thrives in warm climates and typically blooms in fall. The thick, cone-shaped spines on its trunk protect it from animals, and it stores water in its swollen trunk to survive dry conditions. When the green seed pods mature, they split to reveal soft, cotton-like fibers historically used for stuffing pillows and cushions.',
    'The Silk Floss Tree is related to the kapok tree and is often planted as an ornamental tree in tropical and subtropical regions around the world.',
    '/stock/garden-1.png',
    'Tree',
    'Palm Grove',
    ARRAY['flowering', 'drought-tolerant', 'showy'],
    1
  ),
  (
    'red-torch-ginger',
    'Red Torch Ginger',
    'Etlingera elatior',
    'A spectacular tropical plant with bold red flower spikes that emerge from the ground. The torch-like inflorescences can reach over a foot in height, making them impossible to miss in the garden. Native to Indonesia, Malaysia, and New Guinea, it is a member of the ginger family and thrives in humid, warm conditions with rich soil.',
    'The young flower buds of Red Torch Ginger are edible and used in Asian cuisine for their tangy, slightly spicy flavor.',
    '/stock/rainforest.png',
    'Flower',
    'Rainforest Exhibit',
    ARRAY['tropical', 'ornamental', 'edible'],
    2
  ),
  (
    'sabal-palm',
    'Sabal Palm',
    'Sabal palmetto',
    'The Sabal Palm is the state tree of Florida and South Carolina. This hardy native palm is highly adaptable, tolerating salt spray, drought, and occasional flooding. Its fan-shaped leaves can span six feet, and the trunk is often covered with persistent leaf bases that form a distinctive cross-hatch pattern. Sabal palms can live for many decades and are a iconic symbol of the southeastern landscape.',
    'The heart of the palm (the growing tip) was once harvested as "hearts of palm"—a practice that kills the tree. Today, cultivation methods allow harvest without killing the plant.',
    '/stock/waterfront.png',
    'Palm',
    'Palm Grove',
    ARRAY['native', 'drought-tolerant', 'salt-tolerant'],
    3
  ),
  (
    'monarch-orchid',
    'Queen of the Night',
    'Epiphyllum oxypetalum',
    'A night-blooming cereus known for its large, fragrant white flowers that open after dark and wilt by dawn. The blooms can reach 12 inches across with a sweet, intoxicating fragrance. This epiphytic cactus is native to Central and South America and grows on trees in the wild, though it is often grown in containers.',
    'The flowers typically open between 9 PM and midnight and close by morning—earning it the nickname "Queen of the Night."',
    '/stock/garden-2.png',
    'Flower',
    'Rainforest Exhibit',
    ARRAY['night-blooming', 'fragrant', 'epiphytic'],
    4
  ),
  (
    'bromeliad',
    'Pineapple Bromeliad',
    'Ananas comosus',
    'The same species that produces the pineapple fruit, this bromeliad is a tropical plant with spiky leaves arranged in a rosette. Native to South America, it has been cultivated for thousands of years. The plant produces a central flower spike that develops into the familiar pineapple fruit. It thrives in full sun and well-drained soil.',
    'Pineapple is the only edible fruit in the Bromeliaceae family, which includes thousands of ornamental species.',
    '/stock/rainforest-2.png',
    'Shrub',
    'Rainforest Exhibit',
    ARRAY['edible', 'tropical', 'ornamental'],
    5
  )
on conflict (slug) do nothing;
