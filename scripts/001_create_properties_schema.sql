-- Create properties table
create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text not null,
  price numeric not null,
  address text not null,
  bedrooms integer not null,
  bathrooms integer not null,
  area_sqm integer not null,
  property_type text not null check (property_type in ('house', 'apartment', 'condo')),
  status text not null default 'available' check (status in ('available', 'rented', 'pending')),
  whatsapp text not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create amenities table
create table if not exists public.amenities (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  icon text
);

-- Create property_amenities junction table
create table if not exists public.property_amenities (
  property_id uuid not null references public.properties(id) on delete cascade,
  amenity_id uuid not null references public.amenities(id) on delete cascade,
  primary key (property_id, amenity_id)
);

-- Create property_images table
create table if not exists public.property_images (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  image_url text not null,
  is_primary boolean default false,
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table public.properties enable row level security;
alter table public.amenities enable row level security;
alter table public.property_amenities enable row level security;
alter table public.property_images enable row level security;

-- Properties RLS Policies
create policy "Anyone can view available properties"
  on public.properties for select
  using (status = 'available' or auth.uid() = owner_id);

create policy "Owners can insert their own properties"
  on public.properties for insert
  with check (auth.uid() = owner_id);

create policy "Owners can update their own properties"
  on public.properties for update
  using (auth.uid() = owner_id);

create policy "Owners can delete their own properties"
  on public.properties for delete
  using (auth.uid() = owner_id);

-- Amenities RLS Policies (everyone can read, only authenticated users can insert)
create policy "Anyone can view amenities"
  on public.amenities for select
  to public
  using (true);

create policy "Authenticated users can insert amenities"
  on public.amenities for insert
  to authenticated
  with check (true);

-- Property Amenities RLS Policies
create policy "Anyone can view property amenities"
  on public.property_amenities for select
  to public
  using (true);

create policy "Owners can manage their property amenities"
  on public.property_amenities for all
  using (
    exists (
      select 1 from public.properties
      where properties.id = property_amenities.property_id
      and properties.owner_id = auth.uid()
    )
  );

-- Property Images RLS Policies
create policy "Anyone can view property images"
  on public.property_images for select
  to public
  using (true);

create policy "Owners can manage their property images"
  on public.property_images for all
  using (
    exists (
      select 1 from public.properties
      where properties.id = property_images.property_id
      and properties.owner_id = auth.uid()
    )
  );
