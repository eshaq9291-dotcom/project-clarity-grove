create table public.store_settings (
  id int primary key default 1 check (id = 1),
  yer_per_sar numeric not null default 140 check (yer_per_sar > 0),
  yer_per_usd numeric not null default 530 check (yer_per_usd > 0),
  wallets jsonb not null default '[]'::jsonb,
  zones jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid
);
grant select on public.store_settings to anon, authenticated;
grant update on public.store_settings to authenticated;
grant all on public.store_settings to service_role;
alter table public.store_settings enable row level security;
create policy "Anyone reads store settings" on public.store_settings for select to anon, authenticated using (true);
create policy "Admins update store settings" on public.store_settings for update to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));