import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { money } from "@/lib/cart";

export const instant = false;

type Product = { id: string; name: string; slug: string; description: string | null; image_path: string | null };
type Variant = { id: string; product_id: string; retail_price_paise: number; in_stock: boolean };

export default async function ProductsPage() {
  const db = await createClient();
  const [{ data: products, error: productsError }, { data: variants, error: variantsError }] = await Promise.all([
    db.from("products").select("id,name,slug,description,image_path").eq("active", true).order("name"),
    db.rpc("catalog_variants"),
  ]);
  const list = (products ?? []) as Product[];
  const options = (variants ?? []) as Variant[];
  return <main className="mx-auto w-full max-w-7xl px-6 py-12">
    <nav className="mb-6 flex flex-wrap items-center justify-between gap-4 text-sm font-semibold text-emerald-900">
      <Link href="/" className="hover:underline">← Home</Link>
      <div className="flex gap-5"><Link href="/cart" className="hover:underline">Your cart →</Link><Link href="/account" className="hover:underline">Account</Link></div>
    </nav>
    <div className="rounded-3xl bg-emerald-950 px-7 py-12 text-white"><p className="text-xs font-bold uppercase tracking-widest text-amber-300">Discover our products</p><h1 className="mt-3 text-4xl font-extrabold">Shop our collection</h1><p className="mt-4 max-w-xl text-emerald-100">Explore our available products. Add your favourites to a preview cart. Checkout is coming soon.</p></div>
    {(productsError || variantsError) && <p role="alert" className="mt-8 text-red-700">Our catalog is temporarily unavailable. Please try again later.</p>}
    <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {list.map(product => {
        const choices = options.filter(v => v.product_id === product.id);
        const lowestPrice = choices.length ? Math.min(...choices.map(v => v.retail_price_paise)) : null;
        const photo = product.image_path ? db.storage.from("product-images").getPublicUrl(product.image_path).data.publicUrl : null;
        return <article key={product.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
          <Link href={`/products/${product.slug}`} className="block">
            <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-emerald-50">{photo ? <Image src={photo} alt={product.name} width={640} height={480} unoptimized className="h-full w-full object-cover"/> : <span className="text-7xl" aria-hidden="true">📦</span>}</div>
            <div className="p-6"><h2 className="text-xl font-bold text-slate-900">{product.name}</h2>{product.description && <p className="mt-2 line-clamp-2 text-sm text-slate-600">{product.description}</p>}
              <div className="mt-5 flex items-center justify-between gap-3"><div>{lowestPrice === null ? <span className="text-sm text-slate-500">Price coming soon</span> : <p><span className="text-xs text-slate-500">From </span><span className="font-bold text-emerald-900">{money(lowestPrice)}</span></p>}</div><span className="text-sm font-bold text-emerald-800">View options →</span></div>
            </div>
          </Link>
        </article>;
      })}
    </div>
    {!productsError && list.length === 0 && <div className="mt-12 rounded-2xl border p-12 text-center"><div className="text-5xl">📦</div><h2 className="mt-4 text-xl font-bold">New arrivals coming soon</h2><p className="mt-2 text-slate-600">Products will appear once published by the store administrator.</p></div>}
  </main>;
}
