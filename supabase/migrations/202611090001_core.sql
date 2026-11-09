-- Initial ecommerce schema. Apply through Supabase SQL editor after review.
create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role text not null default 'customer' check (role in ('customer','admin')),
  created_at timestamptz not null default now()
);
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  active boolean not null default true
);
create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id),
  name text not null,
  slug text not null unique,
  description text,
  active boolean not null default false,
  created_at timestamptz not null default now()
);
create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  sku text not null unique,
  attributes jsonb not null default '{}'::jsonb,
  retail_price_paise bigint not null check (retail_price_paise >= 0),
  wholesale_price_paise bigint check (wholesale_price_paise >= 0),
  wholesale_min_qty integer not null default 1 check (wholesale_min_qty >= 1),
  stock_qty integer not null default 0 check (stock_qty >= 0),
  low_stock_threshold integer not null default 30 check (low_stock_threshold >= 0),
  active boolean not null default true
);
create table public.wholesale_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  business_name text not null,
  gstin text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);
create unique index wholesale_one_pending_per_user on public.wholesale_applications(user_id) where status='pending';

-- Roles are stored in a protected table, never in user-editable auth metadata.
create function public.is_admin() returns boolean
language sql stable security definer set search_path = ''
as $$ select exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin') $$;

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.wholesale_applications enable row level security;

create policy "Read own profile" on public.profiles for select to authenticated using (id = (select auth.uid()) or public.is_admin());
create policy "Admin manages profiles" on public.profiles for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Read active categories" on public.categories for select to anon, authenticated using (active or public.is_admin());
create policy "Admin manages categories" on public.categories for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Read active products" on public.products for select to anon, authenticated using (active or public.is_admin());
create policy "Admin manages products" on public.products for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Read active variants" on public.product_variants for select to anon, authenticated using (
  (active and exists (select 1 from public.products p where p.id = product_id and p.active)) or public.is_admin()
);
create policy "Admin manages variants" on public.product_variants for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Read own applications" on public.wholesale_applications for select to authenticated using (user_id = (select auth.uid()) or public.is_admin());
create policy "Apply for wholesale" on public.wholesale_applications for insert to authenticated with check (user_id = (select auth.uid()) and status = 'pending' and reviewed_at is null);
create policy "Admin reviews wholesale" on public.wholesale_applications for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- Prevent granting admin through self-service profile creation.
create function public.create_profile_for_new_user() returns trigger
language plpgsql security definer set search_path = ''
as $$ begin
  insert into public.profiles(id, display_name, role) values (new.id, null, 'customer');
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.create_profile_for_new_user();

-- Do not expose wholesale prices to anonymous or unapproved users through this table.
-- Before enabling storefront reads, move wholesale pricing to a restricted table or
-- expose only a security-invoker view with safe retail fields. This migration keeps
-- variant reads admin-only until that is implemented.
drop policy "Read active variants" on public.product_variants;
create policy "Admin reads variants" on public.product_variants for select to authenticated using (public.is_admin());
