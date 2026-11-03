create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id text not null,
  color text not null,
  path text not null,
  sort int not null default 0,
  created_at timestamptz not null default now()
);
create index product_images_product_idx on public.product_images (product_id, color, sort);
grant select on public.product_images to anon, authenticated;
grant insert, delete on public.product_images to authenticated;
grant all on public.product_images to service_role;
alter table public.product_images enable row level security;
create policy "Anyone views product images" on public.product_images for select to anon, authenticated using (true);
create policy "Admins add product images" on public.product_images for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins remove product images" on public.product_images for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

create policy "Admins upload product photos" on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images' and public.has_role(auth.uid(), 'admin'));
create policy "Admins delete product photos" on storage.objects for delete to authenticated
  using (bucket_id = 'product-images' and public.has_role(auth.uid(), 'admin'));