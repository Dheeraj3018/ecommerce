import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { saveProduct, saveVariant, deleteVariant } from "../../actions";
import { ProductImageUpload } from "@/components/product-image-upload";

export const instant = false;

function money(paise: number | null) {
  return paise === null ? "" : (paise / 100).toFixed(2);
}

export default async function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const db = await createClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await db.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/account");
  const [{ data: product }, { data: categories }, { data: variants, error }] = await Promise.all([
    db.from("products").select("id,name,slug,description,category_id,active,image_path").eq("id", id).single(),
    db.from("categories").select("id,name").order("name"),
    db.from("product_variants").select("id,product_id,sku,attributes,retail_price_paise,wholesale_price_paise,wholesale_min_qty,stock_qty,low_stock_threshold,active").eq("product_id", id).order("sku"),
  ]);
  if (!product) notFound();
  return <main className="mx-auto max-w-6xl px-6 py-12">
    <Link href="/admin/products" className="text-sm text-emerald-800 hover:underline">← All products</Link>
    <h1 className="mt-4 text-3xl font-bold">{product.name}</h1>
    <p className="mt-2 text-zinc-600">Edit product details, sizes, retail and wholesale prices, and available stock.</p>
    <section className="mt-8 rounded-2xl border p-6">
      <h2 className="text-xl font-semibold">Product details</h2>
      <form action={saveProduct} className="mt-4 grid gap-4 sm:grid-cols-2">
        <input name="id" type="hidden" value={product.id}/>
        <label className="grid gap-1 text-sm">Name<input name="name" required defaultValue={product.name} className="rounded-lg border p-3"/></label>
        <label className="grid gap-1 text-sm">Slug<input name="slug" required defaultValue={product.slug} className="rounded-lg border p-3"/></label>
        <label className="grid gap-1 text-sm">Category<select name="category_id" defaultValue={product.category_id ?? ""} className="rounded-lg border p-3"><option value="">Uncategorized</option>{categories?.map(c=><option value={c.id} key={c.id}>{c.name}</option>)}</select></label>
        <label className="grid gap-1 text-sm">Description<textarea name="description" defaultValue={product.description ?? ""} className="rounded-lg border p-3" rows={3}/></label>
        <label className="flex items-center gap-2 text-sm"><input name="active" type="checkbox" defaultChecked={product.active}/>Published</label>
        <button className="rounded-lg bg-emerald-800 px-5 py-3 text-white">Save product</button>
      </form>
    </section>
    <section className="mt-8 rounded-2xl border p-6">
      <h2 className="text-xl font-semibold">Product photo</h2>
      <ProductImageUpload productId={product.id} currentUrl={product.image_path ? db.storage.from("product-images").getPublicUrl(product.image_path).data.publicUrl : null}/>
    </section>
    <section className="mt-8 rounded-2xl border p-6">
      <h2 className="text-xl font-semibold">Add a size or variant</h2>
      <p className="mt-2 text-sm text-zinc-600">Prices are entered in rupees. Stock is counted in units. Low-stock warning defaults to 30 units.</p>
      <form action={saveVariant} className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <input type="hidden" name="product_id" value={product.id}/>
        <label className="grid gap-1 text-sm">SKU<input required name="sku" placeholder="APP-CUMIN-250G" className="rounded-lg border p-3"/></label>
        <label className="grid gap-1 text-sm">Size / pack label<input name="label" placeholder="250 g" className="rounded-lg border p-3"/></label>
        <label className="grid gap-1 text-sm">Retail price ₹<input required name="retail_price" inputMode="decimal" placeholder="120.00" className="rounded-lg border p-3"/></label>
        <label className="grid gap-1 text-sm">Wholesale price ₹ (optional)<input name="wholesale_price" inputMode="decimal" className="rounded-lg border p-3"/></label>
        <label className="grid gap-1 text-sm">Wholesale minimum quantity<input type="number" min={1} name="wholesale_min_qty" defaultValue={1} required className="rounded-lg border p-3"/></label>
        <label className="grid gap-1 text-sm">Stock units<input type="number" min={0} name="stock_qty" defaultValue={0} required className="rounded-lg border p-3"/></label>
        <label className="grid gap-1 text-sm">Low-stock warning at<input type="number" min={0} name="low_stock_threshold" defaultValue={30} required className="rounded-lg border p-3"/></label>
        <label className="flex items-center gap-2 text-sm"><input name="active" type="checkbox" defaultChecked/>Variant active</label>
        <button className="rounded-lg bg-emerald-800 px-5 py-3 text-white">Add variant</button>
      </form>
    </section>
    {error && <p role="alert" className="mt-6 text-red-700">Could not load variants.</p>}
    <section className="mt-8 space-y-5">
      <h2 className="text-xl font-semibold">Existing variants</h2>
      {variants?.map(v=><article key={v.id} className="rounded-2xl border p-6">
        <h3 className="font-semibold">{v.sku} {v.stock_qty <= v.low_stock_threshold && <span className="ml-2 text-sm font-normal text-orange-700">Low stock</span>}</h3>
        <form action={saveVariant} className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <input type="hidden" name="id" value={v.id}/><input type="hidden" name="product_id" value={product.id}/>
          <label className="grid gap-1 text-sm">SKU<input name="sku" required defaultValue={v.sku} className="rounded-lg border p-2"/></label>
          <label className="grid gap-1 text-sm">Pack label<input name="label" defaultValue={String((v.attributes as Record<string, unknown> | null)?.size ?? "")} className="rounded-lg border p-2"/></label>
          <label className="grid gap-1 text-sm">Retail price ₹<input name="retail_price" required defaultValue={money(v.retail_price_paise)} className="rounded-lg border p-2"/></label>
          <label className="grid gap-1 text-sm">Wholesale price ₹<input name="wholesale_price" defaultValue={money(v.wholesale_price_paise)} className="rounded-lg border p-2"/></label>
          <label className="grid gap-1 text-sm">Wholesale min quantity<input name="wholesale_min_qty" type="number" min={1} required defaultValue={v.wholesale_min_qty} className="rounded-lg border p-2"/></label>
          <label className="grid gap-1 text-sm">Stock units<input name="stock_qty" type="number" min={0} required defaultValue={v.stock_qty} className="rounded-lg border p-2"/></label>
          <label className="grid gap-1 text-sm">Low-stock warning<input name="low_stock_threshold" type="number" min={0} required defaultValue={v.low_stock_threshold} className="rounded-lg border p-2"/></label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" defaultChecked={v.active}/>Active</label>
          <button className="rounded-lg bg-emerald-800 px-4 py-2 text-white">Save variant</button>
        </form>
        <form action={deleteVariant} className="mt-4"><input type="hidden" name="id" value={v.id}/><button className="text-sm text-red-700 hover:underline">Delete variant</button></form>
      </article>)}
      {variants?.length === 0 && <p className="text-zinc-500">No variants yet. Add one above.</p>}
    </section>
  </main>;
}
