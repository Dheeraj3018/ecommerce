-- Payment-safe read-only order ledger. Order creation is reserved for a trusted backend.
create table if not exists public.orders (
 id uuid primary key default gen_random_uuid(),
 order_number bigint generated always as identity unique,
 user_id uuid not null references auth.users(id),
 address_snapshot jsonb not null,
 currency text not null default 'INR' check (currency = 'INR'),
 fulfillment_status text not null default 'pending_payment' check (fulfillment_status in ('pending_payment','processing','packed','shipped','delivered','cancelled')),
 payment_status text not null default 'pending' check (payment_status in ('pending','paid','failed','refunded','partially_refunded')),
 subtotal_paise bigint not null check (subtotal_paise >= 0),
 shipping_paise bigint not null check (shipping_paise >= 0),
 discount_paise bigint not null default 0 check (discount_paise >= 0),
 total_paise bigint generated always as (subtotal_paise + shipping_paise - discount_paise) stored,
 payment_provider text,
 provider_order_id text unique,
 provider_payment_id text unique,
 paid_at timestamptz,
 cancelled_at timestamptz,
 packed_at timestamptz,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 constraint order_discount_cap check (discount_paise <= subtotal_paise + shipping_paise),
 constraint order_paid_has_timestamp check (payment_status <> 'paid' or paid_at is not null),
 constraint order_status_requires_payment check (fulfillment_status in ('pending_payment','cancelled') or payment_status in ('paid','refunded','partially_refunded'))
);
create index if not exists orders_user_created_idx on public.orders(user_id,created_at desc);
create index if not exists orders_status_created_idx on public.orders(fulfillment_status,created_at desc);
create table if not exists public.order_items (
 id uuid primary key default gen_random_uuid(),
 order_id uuid not null references public.orders(id) on delete cascade,
 variant_id uuid references public.product_variants(id) on delete set null,
 product_name text not null,
 sku text not null,
 variant_label text not null,
 quantity integer not null check (quantity between 1 and 9999),
 unit_price_paise bigint not null check (unit_price_paise >= 0),
 line_total_paise bigint generated always as (quantity * unit_price_paise) stored,
 pricing_tier text not null default 'retail' check (pricing_tier in ('retail','wholesale'))
);
create index if not exists order_items_order_idx on public.order_items(order_id);
create table if not exists public.order_events (
 id uuid primary key default gen_random_uuid(),
 order_id uuid not null references public.orders(id) on delete cascade,
 status text not null check (status in ('created','payment_confirmed','processing','packed','shipped','delivered','cancelled','payment_failed','refund_initiated','refunded')),
 note text,
 carrier text,
 tracking_number text,
 created_at timestamptz not null default now()
);
create index if not exists order_events_order_created_idx on public.order_events(order_id,created_at desc);
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_events enable row level security;
create policy "Customers and admins read orders" on public.orders for select to authenticated using (user_id = (select auth.uid()) or public.is_admin());
create policy "Customers and admins read order items" on public.order_items for select to authenticated using (exists (select 1 from public.orders o where o.id = order_id and (o.user_id = (select auth.uid()) or public.is_admin())));
create policy "Customers and admins read order events" on public.order_events for select to authenticated using (exists (select 1 from public.orders o where o.id = order_id and (o.user_id = (select auth.uid()) or public.is_admin())));
revoke all on public.orders,public.order_items,public.order_events from anon;
revoke all on public.orders,public.order_items,public.order_events from authenticated;
grant select on public.orders,public.order_items,public.order_events to authenticated;
comment on table public.orders is 'Read-only order ledger for browser users. Orders must be created by a trusted, validated payment/order service.';
