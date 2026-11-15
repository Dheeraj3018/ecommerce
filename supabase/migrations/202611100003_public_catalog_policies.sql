-- Public browsing should not invoke the admin helper which is intentionally
-- unavailable to unauthenticated users.
drop policy if exists "Read active categories" on public.categories;
create policy "Read active categories" on public.categories
for select to anon, authenticated using (active);

drop policy if exists "Read active products" on public.products;
create policy "Read active products" on public.products
for select to anon, authenticated using (active);
-- Administrator ALL policies grant permission to unpublished rows separately.
