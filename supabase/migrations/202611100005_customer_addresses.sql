-- Customer delivery address book, restricted to the signed-in owner.
create table if not exists public.customer_addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  label text not null default 'Home' check (length(label) between 1 and 30),
  full_name text not null check (length(full_name) between 2 and 120),
  phone text not null check (phone ~ '^[6-9][0-9]{9}$'),
  line1 text not null check (length(line1) between 5 and 180),
  line2 text check (line2 is null or length(line2) <= 180),
  landmark text check (landmark is null or length(landmark) <= 120),
  city text not null check (length(city) between 2 and 100),
  state text not null check (length(state) between 2 and 100),
  postal_code text not null check (postal_code ~ '^[1-9][0-9]{5}$'),
  country_code text not null default 'IN' check (country_code = 'IN'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists customer_addresses_user_idx on public.customer_addresses (user_id);
alter table public.customer_addresses enable row level security;
create policy "Customers read own addresses" on public.customer_addresses for select to authenticated using (user_id = (select auth.uid()));
create policy "Customers add own addresses" on public.customer_addresses for insert to authenticated with check (user_id = (select auth.uid()));
create policy "Customers update own addresses" on public.customer_addresses for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "Customers delete own addresses" on public.customer_addresses for delete to authenticated using (user_id = (select auth.uid()));
grant select,insert,update,delete on public.customer_addresses to authenticated;
revoke all on public.customer_addresses from anon;