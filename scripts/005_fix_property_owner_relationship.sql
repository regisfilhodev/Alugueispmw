-- Fix the foreign key relationship to reference profiles instead of auth.users
-- This allows Supabase REST API to properly join properties with profiles

-- First, drop the existing foreign key constraint
alter table public.properties 
  drop constraint if exists properties_owner_id_fkey;

-- Add new foreign key constraint referencing profiles
alter table public.properties 
  add constraint properties_owner_id_fkey 
  foreign key (owner_id) 
  references public.profiles(id) 
  on delete cascade;

-- Update profiles RLS policy to allow public to view profiles for available properties
drop policy if exists "Users can view their own profile" on public.profiles;

-- Allow users to view their own profile
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Allow anyone to view profiles of property owners (for public listings)
create policy "Anyone can view property owner profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.properties
      where properties.owner_id = profiles.id
      and properties.status = 'available'
    )
  );
