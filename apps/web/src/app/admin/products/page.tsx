import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { saveProduct, deleteProduct } from "../actions";

export const instant = false;

export default async function AdminProductsPage() {
  const db = await createClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await db.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/account");
  const [{ data: products, error }, { data: categories }] = await Promise.all([
    db.from("products").select("id,name,slug,description,category_id,active").order("name"),
    db.from("categories").select("id,name").order("name"),
  ]);
  return <main className="mx-auto max-w-6xl px-6 py-12">
    <Link href="/admin" className="text-sm text-emerald-800 hover:underline">← Dashboard</Link>
    <h1 className="mt-4 text-3xl font-bold">Manage products</h1>
    <p className="mt-2 text-zinc-600">Create products here, then add prices, variants and stock for each product.</p>
    {error && <p role="alert" className="mt-6 text-red-700">Unable to load products.</p>}
    <section className="mt-8 rounded-2xl border p-6">
      <h2 className="text-xl font-semibold">Add product</h2>
      <form action={saveProduct} className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1 text-sm">Product name<input required name="name" className="rounded-lg border p-3" placeholder="Cumin Rice Appalam" /></label>
        <label className="grid gap-1 text-sm">Slug (optional)<input name="slug" className="rounded-lg border p-3" /></label>
        <label className="grid gap-1 text-sm">Category<select name="category_id" className="rounded-lg border p-3"><option value="">Uncategorized</option>{categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
        <label className="grid gap-1 text-sm">Description<textarea name="description" rows={3} className="rounded-lg border p-3" /></label>
        <label className="flex items-center gap-2 text-sm"><input name="active" type="checkbox" />Publish immediately</label>
        <button className="rounded-lg bg-emerald-800 px-5 py-3 text-white">Add product</button>
      </form>
    </section>
    <section className="mt-8 grid gap-4">
      {products?.map(product => <article key={product.id} className="rounded-xl border p-5">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-lg font-semibold">{product.name}</h2><p className="text-sm text-zinc-500">{product.active ? "Published" : "Draft"} · {product.slug}</p></div><Link href={`/admin/products/${product.id}`} className="rounded-lg bg-emerald-800 px-4 py-2 text-white">Edit & manage variants</Link></div>
        <form action={deleteProduct} className="mt-4"><input name="id" value={product.id} type="hidden"/><button className="text-sm text-red-700 hover:underline">Delete product and its variants</button></form>
      </article>)}
      {products?.length === 0 && <p className="text-zinc-500">No products yet. Add your first product above.</p>}
    </section>
  </main>;
}
