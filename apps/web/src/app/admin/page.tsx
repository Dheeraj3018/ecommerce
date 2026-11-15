import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const instant = false;

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/account");
  const [{ count: products }, { count: applications }, { count: categories }, { count: lowStock }] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("wholesale_applications").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("categories").select("*", { count: "exact", head: true }),
    supabase.from("product_variants").select("id", { count: "exact", head: true }).lte("stock_qty", 30),
  ]);
  return <main className="mx-auto max-w-6xl px-6 py-16">
    <div className="flex flex-wrap items-center justify-between gap-4"><div><span className="text-xs font-bold uppercase tracking-widest text-emerald-800">Admin workspace</span><h1 className="mt-2 text-3xl font-bold">Store administration</h1></div><Link href="/" className="text-emerald-800 hover:underline">View storefront →</Link></div>
    <p className="mt-3 text-zinc-600">Manage your catalog and stock. Order and payment features are still under development.</p>
    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {([["Products",products],["Categories",categories],["Pending wholesale",applications],["Variants at or below 30",lowStock]] as const).map(([label,value])=>
        <section key={label} className="rounded-xl border p-5"><h2 className="text-sm text-zinc-600">{label}</h2><p className="mt-3 text-3xl font-bold">{value ?? "—"}</p></section>
      )}
    </div>
    <div className="mt-10 grid gap-5 sm:grid-cols-2">
      <Link href="/admin/categories" className="rounded-2xl border p-7 transition hover:border-emerald-600 hover:shadow-lg"><h2 className="text-xl font-bold">Manage categories →</h2><p className="mt-2 text-sm text-zinc-600">Create, edit, publish and remove store categories.</p></Link>
      <Link href="/admin/products" className="rounded-2xl border p-7 transition hover:border-emerald-600 hover:shadow-lg"><h2 className="text-xl font-bold">Manage products →</h2><p className="mt-2 text-sm text-zinc-600">Manage products, sizes, SKUs, prices, wholesale minimums and stock levels.</p></Link>
      <Link href="/admin/orders" className="rounded-2xl border p-7 transition hover:border-emerald-600 hover:shadow-lg"><h2 className="text-xl font-bold">Orders & tracking →</h2><p className="mt-2 text-sm text-zinc-600">View order details, payments, delivery addresses and tracking events.</p></Link>
      <Link href="/admin/wholesale" className="rounded-2xl border p-7 transition hover:border-emerald-600 hover:shadow-lg"><h2 className="text-xl font-bold">Wholesale applications →</h2><p className="mt-2 text-sm text-zinc-600">Review and approve or reject wholesale buyers.</p></Link>
    </div>
  </main>;
}
