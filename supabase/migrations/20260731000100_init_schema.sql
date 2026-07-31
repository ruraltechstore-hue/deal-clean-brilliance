-- =============================================================================
-- DEAL Cleaning Products — initial schema
-- Run against YOUR OWN Supabase project (see README.md).
-- =============================================================================

create extension if not exists "pgcrypto";

-- updated_at trigger helper ---------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =============================================================================
-- 1. profiles
-- =============================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_role_idx on public.profiles (role);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto-create a profile row whenever a user is created in Supabase Auth.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data ->> 'full_name', new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Admin role helper (SECURITY DEFINER — avoids recursive RLS on profiles) -----
create or replace function public.is_admin(_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = _user_id and role = 'admin'
  );
$$;

create or replace function public.current_user_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin(auth.uid());
$$;

create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

grant execute on function public.is_admin(uuid) to authenticated;
grant execute on function public.current_user_role() to authenticated;
grant execute on function public.current_user_is_admin() to authenticated;

-- =============================================================================
-- 2. products
-- =============================================================================
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric(10,2) not null default 0,
  image_url text,
  stock_quantity integer not null default 0,
  is_available boolean not null default true,
  benefits jsonb,
  usage_instructions text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_available_idx on public.products (is_available);

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- =============================================================================
-- 3. customers
-- =============================================================================
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  name text,
  phone text,
  email text,
  created_at timestamptz not null default now()
);

create index if not exists customers_user_id_idx on public.customers (user_id);
create index if not exists customers_email_idx on public.customers (email);
create index if not exists customers_phone_idx on public.customers (phone);

-- =============================================================================
-- 4. orders
-- =============================================================================
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  customer_id uuid references public.customers(id) on delete set null,
  product_id uuid references public.products(id) on delete set null,
  quantity integer not null check (quantity > 0),
  product_price numeric(10,2) not null,
  delivery_charge numeric(10,2) not null default 0,
  total_amount numeric(10,2) not null,
  payment_status text not null default 'pending'
    check (payment_status in ('pending','paid','failed','refunded')),
  order_status text not null default 'new'
    check (order_status in ('new','processing','shipped','delivered','cancelled')),
  razorpay_order_id text,
  razorpay_payment_id text,
  shipping_address text,
  city text,
  state text,
  pincode text,
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_customer_idx on public.orders (customer_id);
create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_payment_status_idx on public.orders (payment_status);
create index if not exists orders_order_status_idx on public.orders (order_status);
create unique index if not exists orders_razorpay_order_id_idx
  on public.orders (razorpay_order_id) where razorpay_order_id is not null;

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

-- =============================================================================
-- 5. order_status_history
-- =============================================================================
create table if not exists public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  previous_status text,
  new_status text,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists order_status_history_order_idx
  on public.order_status_history (order_id, created_at desc);

create or replace function public.log_order_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.order_status is distinct from old.order_status then
    insert into public.order_status_history (order_id, previous_status, new_status, updated_by)
    values (new.id, old.order_status, new.order_status, auth.uid());
  end if;
  return new;
end;
$$;

drop trigger if exists orders_log_status_change on public.orders;
create trigger orders_log_status_change
  after update on public.orders
  for each row execute function public.log_order_status_change();

-- =============================================================================
-- 6. reviews
-- =============================================================================
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  customer_name text,
  rating integer check (rating between 1 and 5),
  review text,
  approval_status text not null default 'pending'
    check (approval_status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);

create index if not exists reviews_approval_idx on public.reviews (approval_status, created_at desc);

-- =============================================================================
-- 7. contact_messages
-- =============================================================================
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text,
  phone text,
  email text,
  message text,
  status text not null default 'new'
    check (status in ('new','read','responded','archived')),
  created_at timestamptz not null default now()
);

create index if not exists contact_messages_status_idx
  on public.contact_messages (status, created_at desc);

-- =============================================================================
-- 8. business_settings
-- =============================================================================
create table if not exists public.business_settings (
  id uuid primary key default gen_random_uuid(),
  business_name text,
  business_email text,
  phone_number_1 text,
  phone_number_2 text,
  whatsapp_number text,
  delivery_charge numeric(10,2) not null default 0,
  free_delivery_threshold numeric(10,2),
  order_prefix text not null default 'DEAL-',
  updated_at timestamptz not null default now()
);

drop trigger if exists business_settings_set_updated_at on public.business_settings;
create trigger business_settings_set_updated_at
  before update on public.business_settings
  for each row execute function public.set_updated_at();

-- =============================================================================
-- GRANTS (PostgREST needs explicit privileges; RLS still applies on top)
-- =============================================================================
grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;

grant select, insert on public.reviews to anon, authenticated;
grant update, delete on public.reviews to authenticated;

grant insert on public.contact_messages to anon, authenticated;
grant select, update, delete on public.contact_messages to authenticated;

grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.customers to authenticated;
grant select, insert, update, delete on public.orders to authenticated;
grant select on public.order_status_history to authenticated;
grant select on public.business_settings to anon, authenticated;
grant update on public.business_settings to authenticated;

grant all on public.profiles, public.products, public.customers, public.orders,
  public.order_status_history, public.reviews, public.contact_messages,
  public.business_settings to service_role;

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================
alter table public.profiles             enable row level security;
alter table public.products             enable row level security;
alter table public.customers            enable row level security;
alter table public.orders               enable row level security;
alter table public.order_status_history enable row level security;
alter table public.reviews              enable row level security;
alter table public.contact_messages     enable row level security;
alter table public.business_settings    enable row level security;

-- profiles ---------------------------------------------------------------
create policy "Users read own profile"
  on public.profiles for select to authenticated
  using (id = auth.uid());

create policy "Admins read all profiles"
  on public.profiles for select to authenticated
  using (public.is_admin(auth.uid()));

create policy "Users update own profile"
  on public.profiles for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid() and role = public.current_user_role());

-- products ---------------------------------------------------------------
create policy "Public reads available products"
  on public.products for select to anon, authenticated
  using (is_available = true);

create policy "Admins read all products"
  on public.products for select to authenticated
  using (public.is_admin(auth.uid()));

create policy "Admins write products"
  on public.products for all to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- customers --------------------------------------------------------------
create policy "Admins read customers"
  on public.customers for select to authenticated
  using (public.is_admin(auth.uid()));

create policy "Users read own customer record"
  on public.customers for select to authenticated
  using (user_id = auth.uid());

create policy "Admins manage customers"
  on public.customers for all to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- orders -----------------------------------------------------------------
-- Orders are created ONLY by the Edge Functions (service role) after payment
-- verification, so there is deliberately no public/authenticated insert policy.
create policy "Admins read orders"
  on public.orders for select to authenticated
  using (public.is_admin(auth.uid()));

create policy "Users read own orders"
  on public.orders for select to authenticated
  using (
    exists (
      select 1 from public.customers c
      where c.id = orders.customer_id and c.user_id = auth.uid()
    )
  );

create policy "Admins update orders"
  on public.orders for update to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

create policy "Admins delete orders"
  on public.orders for delete to authenticated
  using (public.is_admin(auth.uid()));

-- order_status_history ---------------------------------------------------
create policy "Admins read order history"
  on public.order_status_history for select to authenticated
  using (public.is_admin(auth.uid()));

-- reviews ----------------------------------------------------------------
create policy "Public reads approved reviews"
  on public.reviews for select to anon, authenticated
  using (approval_status = 'approved');

create policy "Anyone can submit a review"
  on public.reviews for insert to anon, authenticated
  with check (approval_status = 'pending');

create policy "Admins read all reviews"
  on public.reviews for select to authenticated
  using (public.is_admin(auth.uid()));

create policy "Admins manage reviews"
  on public.reviews for all to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- contact_messages -------------------------------------------------------
create policy "Anyone can submit a contact message"
  on public.contact_messages for insert to anon, authenticated
  with check (true);

create policy "Admins read contact messages"
  on public.contact_messages for select to authenticated
  using (public.is_admin(auth.uid()));

create policy "Admins manage contact messages"
  on public.contact_messages for all to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- business_settings ------------------------------------------------------
-- Only public storefront info (name, phones, delivery charge) lives here.
create policy "Public reads business settings"
  on public.business_settings for select to anon, authenticated
  using (true);

create policy "Admins update business settings"
  on public.business_settings for update to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- =============================================================================
-- SEED — the single product and the default business settings row
-- =============================================================================
insert into public.products (name, description, price, stock_quantity, is_available, benefits, usage_instructions)
select
  'DEAL CLEAN – All in One',
  'A powerful multipurpose cleaning solution designed to clean, shine, and freshen a wide range of surfaces.',
  200,
  250,
  true,
  '["Multipurpose cleaning","Long lasting freshness","Streak-free shine","Safe on most surfaces"]'::jsonb,
  'Add the official dilution and usage instructions here as printed on the product label.'
where not exists (select 1 from public.products);

insert into public.business_settings (
  business_name, business_email, phone_number_1, phone_number_2,
  whatsapp_number, delivery_charge, order_prefix
)
select
  'SP Enterprises', 'spenterprises.deal@gmail.com', '+91 6300553190', '+91 9848855075',
  '916300553190', 60, 'DEAL-'
where not exists (select 1 from public.business_settings);
