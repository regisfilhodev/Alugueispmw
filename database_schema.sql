-- Habilita a extensão de UUID (caso não esteja habilitada)
create extension if not exists "uuid-ossp";

-- 1. TABELA DE PERFIS (PROFILES)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text,
  phone text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Gatilho para criar um perfil automaticamente quando um usuário se cadastrar
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. TABELA DE IMÓVEIS (PROPERTIES)
create table public.properties (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text not null,
  price numeric not null,
  address text not null,
  bedrooms integer not null,
  bathrooms integer not null,
  area_sqm integer not null,
  property_type text not null,
  whatsapp text not null,
  status text not null default 'available'
);

-- 3. TABELA DE IMAGENS DOS IMÓVEIS (PROPERTY_IMAGES)
create table public.property_images (
  id uuid default uuid_generate_v4() primary key,
  property_id uuid references public.properties(id) on delete cascade not null,
  image_url text not null,
  is_primary boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. TABELA DE COMODIDADES (AMENITIES)
create table public.amenities (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  icon text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. TABELA DE RELAÇÃO IMÓVEL <-> COMODIDADE (PROPERTY_AMENITIES)
create table public.property_amenities (
  id uuid default uuid_generate_v4() primary key,
  property_id uuid references public.properties(id) on delete cascade not null,
  amenity_id uuid references public.amenities(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Inserindo algumas comodidades padrão para o formulário funcionar
insert into public.amenities (name, icon) values
  ('Piscina', 'pool'),
  ('Churrasqueira', 'grill'),
  ('Ar Condicionado', 'ac'),
  ('Garagem', 'garage'),
  ('Móveis Planejados', 'furniture'),
  ('Elevador', 'elevator'),
  ('Academia', 'dumbbell'),
  ('Varanda', 'balcony');
