-- Enable RLS (if not already enabled) and add policy to allow owners to insert images

-- Note: run this in Supabase SQL editor or with psql against your project database.

-- Enable row level security on table
ALTER TABLE public.property_images ENABLE ROW LEVEL SECURITY;

-- Allow owners of the referenced property to INSERT rows into property_images
CREATE POLICY "Allow owners to insert property_images" ON public.property_images
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.properties p
      WHERE p.id = property_images.property_id AND p.owner_id = auth.uid()
    )
  );

-- Optionally allow property owners to SELECT their images
CREATE POLICY "Allow owners to select their property_images" ON public.property_images
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.properties p
      WHERE p.id = property_images.property_id AND p.owner_id = auth.uid()
    )
  );

-- Optionally allow owners to UPDATE their images
CREATE POLICY "Allow owners to update property_images" ON public.property_images
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.properties p
      WHERE p.id = property_images.property_id AND p.owner_id = auth.uid()
    )
  );

-- Optionally allow owners to DELETE their images
CREATE POLICY "Allow owners to delete property_images" ON public.property_images
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.properties p
      WHERE p.id = property_images.property_id AND p.owner_id = auth.uid()
    )
  );
