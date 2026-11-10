-- Product photo storage is public-read, admin-upload only.
alter table public.products add column if not exists image_path text;
alter table public.products drop constraint if exists products_image_path_safe;
alter table public.products add constraint products_image_path_safe
check (image_path is null or (length(image_path) <= 260 and image_path ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}[.](jpg|png|webp)$'));

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('product-images','product-images',true,3145728,array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = true, file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;

create policy "Admins upload product images" on storage.objects
for insert to authenticated
with check (bucket_id='product-images' and public.is_admin());
create policy "Admins remove product images" on storage.objects
for delete to authenticated
using (bucket_id='product-images' and public.is_admin());
