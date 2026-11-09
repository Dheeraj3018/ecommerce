-- Public catalog API exposes retail pricing only; approved buyers may see wholesale.
-- The underlying variant table remains admin-only under RLS.
create or replace function public.catalog_variants()
returns table (
  id uuid, product_id uuid, sku text, attributes jsonb,
  retail_price_paise bigint, wholesale_price_paise bigint,
  wholesale_min_qty integer, in_stock boolean
)
language sql stable security definer set search_path = ''
as $$
  select v.id, v.product_id, v.sku, v.attributes,
         v.retail_price_paise,
         case when exists (
           select 1 from public.wholesale_applications a
           where a.user_id = (select auth.uid()) and a.status = 'approved'
         ) then v.wholesale_price_paise else null end,
         case when exists (
           select 1 from public.wholesale_applications a
           where a.user_id = (select auth.uid()) and a.status = 'approved'
         ) then v.wholesale_min_qty else null end,
         v.stock_qty > 0
  from public.product_variants v
  join public.products p on p.id = v.product_id
  where v.active and p.active;
$$;
revoke all on function public.catalog_variants() from public;
grant execute on function public.catalog_variants() to anon, authenticated;

-- Explicitly prevent anonymous access to unpublished categories/products.
-- Admins continue to manage draft content through existing RLS.
create index if not exists products_category_idx on public.products(category_id);
create index if not exists variants_product_idx on public.product_variants(product_id);
create index if not exists wholesale_approved_user_idx on public.wholesale_applications(user_id) where status = 'approved';
