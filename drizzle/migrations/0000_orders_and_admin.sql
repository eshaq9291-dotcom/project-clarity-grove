create type public.app_role as enum ('admin', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "Users read own roles" on public.user_roles for select to authenticated using (user_id = auth.uid());

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.user_roles where user_id = _user_id and role = _role) $$;

-- The first account ever created becomes the store owner (admin).
create or replace function public.assign_first_admin()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  if not exists (select 1 from public.user_roles where role = 'admin') then
    insert into public.user_roles (user_id, role) values (new.id, 'admin');
  end if;
  return new;
end $$;
create trigger on_auth_user_created_admin after insert on auth.users
  for each row execute function public.assign_first_admin();

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  created_at timestamptz not null default now(),
  customer_name text not null,
  phone text not null,
  zone text not null,
  address text not null,
  items jsonb not null,
  subtotal_sar numeric not null,
  discount_sar numeric not null default 0,
  shipping_sar numeric not null default 0,
  total_sar numeric not null,
  total_yer numeric not null,
  display_currency text not null default 'YER',
  payment_method text not null check (payment_method in ('cod','wallet')),
  wallet text,
  receipt_path text,
  receipt_amount numeric,
  receipt_currency text,
  receipt_wallet text,
  receipt_reference text,
  receipt_notes text,
  extraction_status text not null default 'none',
  amount_mismatch boolean,
  status text not null default 'pending' check (status in ('pending','awaiting_confirmation','paid','cancelled')),
  paid_at timestamptz,
  confirmed_by uuid
);
grant select, update on public.orders to authenticated;
grant all on public.orders to service_role;
alter table public.orders enable row level security;
create policy "Admins read orders" on public.orders for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins update orders" on public.orders for update to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins read receipts" on storage.objects for select to authenticated using (bucket_id = 'receipts' and public.has_role(auth.uid(), 'admin'));