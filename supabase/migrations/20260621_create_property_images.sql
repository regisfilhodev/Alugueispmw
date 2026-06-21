create table public.property_images (
  id uuid not null default extensions.uuid_generate_v4 (),
  property_id uuid not null,
  image_url text not null,
  is_primary boolean null default false,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  constraint property_images_pkey primary key (id),
  constraint property_images_property_id_fkey foreign KEY (property_id) references properties (id) on delete CASCADE
) TABLESPACE pg_default;
