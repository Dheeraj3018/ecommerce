-- Internal trigger function is never an endpoint.
revoke execute on function public.create_profile_for_new_user() from public, anon, authenticated;
-- RLS helper is needed by signed-in users, not anonymous visitors.
revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;
-- public.catalog_variants() intentionally permits anon/authenticated callers,
-- returning public retail fields while checking wholesale approval server-side.
