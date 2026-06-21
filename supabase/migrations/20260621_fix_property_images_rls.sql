-- Drop existing policies on property_images
DROP POLICY IF EXISTS "Anyone can view property images" ON public.property_images;
DROP POLICY IF EXISTS "Owners can manage their property images" ON public.property_images;
DROP POLICY IF EXISTS "Allow owners to insert property_images" ON public.property_images;
DROP POLICY IF EXISTS "Allow owners to select their property_images" ON public.property_images;
DROP POLICY IF EXISTS "Allow owners to update property_images" ON public.property_images;
DROP POLICY IF EXISTS "Allow owners to delete property_images" ON public.property_images;

-- Enable RLS
ALTER TABLE public.property_images ENABLE ROW LEVEL SECURITY;

-- Public SELECT policy: anyone can view all images
CREATE POLICY "Public can view all property images"
  ON public.property_images
  FOR SELECT
  USING (true);

-- INSERT: only property owners can insert images for their properties
CREATE POLICY "Owners can insert property images"
  ON public.property_images
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM public.properties
      WHERE id = property_images.property_id 
        AND owner_id = auth.uid()
    )
  );

-- UPDATE: only property owners can update their property images
CREATE POLICY "Owners can update property images"
  ON public.property_images
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 
      FROM public.properties
      WHERE id = property_images.property_id 
        AND owner_id = auth.uid()
    )
  );

-- DELETE: only property owners can delete their property images
CREATE POLICY "Owners can delete property images"
  ON public.property_images
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 
      FROM public.properties
      WHERE id = property_images.property_id 
        AND owner_id = auth.uid()
    )
  );
