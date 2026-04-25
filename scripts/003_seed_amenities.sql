-- Seed common amenities for rental properties in Palmas
insert into public.amenities (name, icon) values
  ('Ar Condicionado', 'wind'),
  ('Piscina', 'waves'),
  ('Garagem Coberta', 'car'),
  ('Área Gourmet', 'chef-hat'),
  ('Academia', 'dumbbell'),
  ('Varanda', 'home'),
  ('Quintal', 'tree-deciduous'),
  ('Portaria 24h', 'shield-check'),
  ('Elevador', 'arrow-up-down'),
  ('Churrasqueira', 'flame')
on conflict (name) do nothing;
