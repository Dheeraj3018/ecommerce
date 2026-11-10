import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { saveCategory, deleteCategory } from "../actions";

export const instant = false;

export default async function CategoriesPage() {
  const db = await createClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await db.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/account");
  const { data: categories, error } = await db.from("categories").select("id,name,slug,active").order("name");
  return <main className="mx-auto max-w-6xl px-6 py-12">
    <Link href="/admin" className="text-sm text-emerald-800 hover:underline">← Dashboard</Link>
    <h1 className="mt-4 text-3xl font-bold">Categories</h1>
    <p className="mt-2 text-zinc-600">Organize products into storefront categories.</p>
    {error && <p role="alert" className="mt-6 text-red-700">Could not load categories.</p>}
    <section className="mt-8 rounded-2xl border p-6">
      <h2 className="text-xl font-semibold">Add a category</h2>
      <form action={saveCategory} className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1 text-sm">Name<input required maxLength={160} name="name" placeholder="Masalas & Spice Mixes" className="rounded-lg border p-3" /></label>
        <label className="grid gap-1 text-sm">URL slug (optional)<input name="slug" placeholder="masalas-spice-mixes" className="rounded-lg border p-3" /></label>
        <label className="flex items-center gap-2"><input name="active" type="checkbox" defaultChecked />Visible in store</label>
        <button className="rounded-lg bg-emerald-800 px-5 py-3 text-white">Add category</button>
      </form>
    </section>
    <section className="mt-8 grid gap-4">
      {categories?.map(category => <div key={category.id} className="rounded-xl border p-5">
        <form action={saveCategory} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <input type="hidden" name="id" value={category.id} />
          <label className="grid gap-1 text-sm">Name<input name="name" required defaultValue={category.name} className="rounded-lg border p-2" /></label>
          <label className="grid gap-1 text-sm">Slug<input name="slug" required defaultValue={category.slug} className="rounded-lg border p-2" /></label>
          <button className="rounded-lg border px-4 py-2">Save</button>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" defaultChecked={category.active} />Published</label>
        </form>
        <form action={deleteCategory} className="mt-3"><input name="id" value={category.id} type="hidden"/><button className="text-sm text-red-700 hover:underline">Delete category</button></form>
      </div>)}
      {categories?.length === 0 && <p className="text-zinc-500">No categories added yet.</p>}
    </section>
  </main>;
}
