-- Milestone A: authenticated, atomic checkout with expiring inventory holds.
alter table public.orders add column if not exists checkout_key uuid;
alter table public.orders add column if not exists checkout_fingerprint text;
alter table public.orders add column if not exists reservation_expires_at timestamptz;
create unique index if not exists orders_checkout_key_unique on public.orders(user_id,checkout_key) where checkout_key is not null;
create index if not exists orders_active_reservation_idx on public.orders(reservation_expires_at) where fulfillment_status='pending_payment' and payment_status='pending';
create index if not exists order_items_variant_idx on public.order_items(variant_id);
create schema if not exists checkout_private;
revoke all on schema checkout_private from public, anon;
grant usage on schema checkout_private to authenticated;

create or replace function checkout_private.checkout_core(p_items jsonb,p_address uuid,p_mode text,p_key uuid,p_expected text,p_create boolean)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
 u uuid := auth.uid();
 a public.customer_addresses%rowtype;
 r record;
 v record;
 normalized jsonb;
 lines jsonb := '[]'::jsonb;
 request_hash text;
 price_hash text;
 subtotal bigint := 0;
 unit bigint;
 held bigint;
 tier text;
 existing public.orders%rowtype;
 oid uuid;
 n bigint;
 expires timestamptz;
 begin_time timestamptz := clock_timestamp();
begin
 if u is null then raise exception 'CHECKOUT_AUTH'; end if;
 if p_mode is null or p_mode not in ('retail','wholesale') then raise exception 'CHECKOUT_MODE'; end if;
 if p_items is null or jsonb_typeof(p_items) <> 'array' then raise exception 'CHECKOUT_CART'; end if;
 if jsonb_array_length(p_items) not between 1 and 30 then raise exception 'CHECKOUT_CART'; end if;
 if exists (select 1 from jsonb_array_elements(p_items) x where jsonb_typeof(x) <> 'object' or coalesce(x->>'variantId','') !~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' or jsonb_typeof(x->'quantity') is distinct from 'number' or coalesce(x->>'quantity','') !~ '^[1-9][0-9]{0,1}$') then raise exception 'CHECKOUT_CART'; end if;
 if (select count(distinct (x->>'variantId')::uuid) from jsonb_array_elements(p_items) x) <> jsonb_array_length(p_items) then raise exception 'CHECKOUT_DUPLICATE_LINE'; end if;
 select jsonb_agg(jsonb_build_object('variantId',(x->>'variantId')::uuid,'quantity',(x->>'quantity')::integer) order by (x->>'variantId')::uuid) into normalized from jsonb_array_elements(p_items) x;
 request_hash := md5(jsonb_build_object('items',normalized,'address',p_address,'mode',p_mode)::text);
 if p_create then
   if p_key is null or p_expected is null then raise exception 'CHECKOUT_KEY'; end if;
   perform pg_advisory_xact_lock(hashtextextended(u::text,0));
   select * into existing from public.orders where user_id=u and checkout_key=p_key;
   if found then
     if existing.checkout_fingerprint <> request_hash then raise exception 'CHECKOUT_KEY_REUSED'; end if;
     return jsonb_build_object('orderId',existing.id,'orderNumber',existing.order_number,'totalPaise',existing.total_paise,'expiresAt',existing.reservation_expires_at,'replayed',true);
   end if;
   -- A different key cannot create a second live unpaid reservation for this customer.
   if exists(select 1 from public.orders where user_id=u and fulfillment_status='pending_payment' and payment_status='pending' and reservation_expires_at > clock_timestamp()) then raise exception 'CHECKOUT_EXISTING'; end if;
 end if;
 select * into a from public.customer_addresses where id=p_address and user_id=u;
 if not found then raise exception 'CHECKOUT_ADDRESS'; end if;
 if p_mode='wholesale' and not exists(select 1 from public.wholesale_applications where user_id=u and status='approved') then raise exception 'CHECKOUT_WHOLESALE'; end if;
 -- All callers acquiring variant locks use the same UUID order. Holds are counted only while live.
 if p_create then
   perform pv.id from public.product_variants pv where pv.id in (select (x->>'variantId')::uuid from jsonb_array_elements(normalized) x) order by pv.id for update;
 end if;
 begin_time := clock_timestamp();
 for r in select (x->>'variantId')::uuid as id,(x->>'quantity')::integer as qty from jsonb_array_elements(normalized) x loop
   select pv.*,p.name as product_name,p.active as product_active,c.active as category_active,c.name as category_name,c.slug as category_slug
     into v from public.product_variants pv join public.products p on p.id=pv.product_id left join public.categories c on c.id=p.category_id where pv.id=r.id;
   if not found or not v.active or not v.product_active or v.category_active is false then raise exception 'CHECKOUT_UNAVAILABLE'; end if;
   select coalesce(sum(oi.quantity),0) into held from public.order_items oi join public.orders o on o.id=oi.order_id where oi.variant_id=r.id and o.fulfillment_status='pending_payment' and o.payment_status='pending' and o.reservation_expires_at > begin_time;
   if v.stock_qty-held < r.qty then raise exception 'CHECKOUT_STOCK'; end if;
   tier := 'retail'; unit := v.retail_price_paise;
   if p_mode='wholesale' then
     if v.wholesale_price_paise is null or coalesce(v.category_slug,'') ~* '(^|[-_ ])(mobile|mobiles|smartphone|smartphones)([-_ ]|$)' or coalesce(v.category_name,'') ~* '(^|[-_ ])(mobile|mobiles|smartphone|smartphones)([-_ ]|$)' then raise exception 'CHECKOUT_RETAIL_ONLY'; end if;
     if r.qty < v.wholesale_min_qty then raise exception 'CHECKOUT_MOQ'; end if;
     unit := v.wholesale_price_paise; tier := 'wholesale';
   end if;
   if unit < 0 or unit > 100000000 then raise exception 'CHECKOUT_PRICE'; end if;
   subtotal := subtotal + unit*r.qty;
   if subtotal > 100000000 then raise exception 'CHECKOUT_PRICE'; end if;
   lines := lines || jsonb_build_array(jsonb_build_object('variantId',r.id,'name',v.product_name,'label',coalesce(nullif(v.attributes->>'size',''),v.sku),'sku',v.sku,'quantity',r.qty,'unitPricePaise',unit,'amountPaise',unit*r.qty,'wholesale',tier='wholesale','inStock',true));
 end loop;
 price_hash := md5(jsonb_build_object('request',request_hash,'lines',lines,'subtotal',subtotal)::text);
 if not p_create then return jsonb_build_object('ok',true,'lines',lines,'subtotalPaise',subtotal,'quoteToken',price_hash,'qualifiesForFreeShipping',subtotal>=100000,'canCreate',subtotal>=100000 and subtotal>0); end if;
 if p_expected <> price_hash then raise exception 'CHECKOUT_PRICE_CHANGED'; end if;
 -- No paid shipping fee or serviceability rules have been configured yet.
 if subtotal < 100000 then raise exception 'CHECKOUT_SHIPPING'; end if;
 expires := begin_time + interval '15 minutes';
 insert into public.orders(user_id,address_snapshot,subtotal_paise,shipping_paise,checkout_key,checkout_fingerprint,reservation_expires_at)
 values(u,to_jsonb(a)-'user_id'-'id'-'created_at'-'updated_at',subtotal,0,p_key,request_hash,expires) returning id,order_number into oid,n;
 insert into public.order_items(order_id,variant_id,product_name,sku,variant_label,quantity,unit_price_paise,pricing_tier)
 select oid,(x->>'variantId')::uuid,x->>'name',x->>'sku',x->>'label',(x->>'quantity')::integer,(x->>'unitPricePaise')::bigint,case when (x->>'wholesale')::boolean then 'wholesale' else 'retail' end from jsonb_array_elements(lines) x;
 insert into public.order_events(order_id,status,note) values(oid,'created','Unpaid checkout reservation. Payment and dispatch are disabled.');
 return jsonb_build_object('orderId',oid,'orderNumber',n,'totalPaise',subtotal,'expiresAt',expires,'replayed',false);
end $$;
revoke all on function checkout_private.checkout_core(jsonb,uuid,text,uuid,text,boolean) from public, anon, authenticated;
grant execute on function checkout_private.checkout_core(jsonb,uuid,text,uuid,text,boolean) to authenticated;

create or replace function public.checkout_quote(p_items jsonb,p_address uuid,p_mode text default 'retail')
returns jsonb language sql security invoker set search_path='' as $$
 select checkout_private.checkout_core(p_items,p_address,p_mode,null,null,false);
$$;
create or replace function public.checkout_create(p_items jsonb,p_address uuid,p_mode text,p_key uuid,p_expected text)
returns jsonb language sql security invoker set search_path='' as $$
 select checkout_private.checkout_core(p_items,p_address,p_mode,p_key,p_expected,true);
$$;
revoke all on function public.checkout_quote(jsonb,uuid,text),public.checkout_create(jsonb,uuid,text,uuid,text) from public, anon, authenticated;
grant execute on function public.checkout_quote(jsonb,uuid,text),public.checkout_create(jsonb,uuid,text,uuid,text) to authenticated;
