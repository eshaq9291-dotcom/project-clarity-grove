create policy "Anyone views product photos" on storage.objects for select to anon, authenticated
  using (bucket_id = 'product-images');