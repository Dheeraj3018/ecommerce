import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const instant = false;

type Product = { id: string; name: string; slug: string; description: string | null };
type Variant = { id: string; product_id: string; sku: string; retail_price_paise: number; wholesale_price_paise: number | null; wholesale_min_qty: number | null; in_stock: boolean; attributes: Record<string, string> };

function rupees(paise: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(paise / 100);
}

export default async function ProductsPage() {
  const supabase = await createClient();
  const [{ data: products, error: productsError }, { data: variants, error: variantsError }] = await Promise.all([
    supabase.from("products").select("id,name,slug,description").eq("active", true).order("name"),
    supabase.rpc("catalog_variants"),
  ]);
  if (productsError || variantsError) {
    return <main className="mx-auto max-w-6xl px-6 py-16"><h1 className="text-3xl font-bold">Products</h1><p className="mt-4">Our catalog is temporarily unavailable.</p></main>;
  }
  const allVariants = (variants ?? []) as Variant[];
  return <main className="mx-auto w-full max-w-6xl px-6 py-16">
    <div className="flex items-center justify-between gap-4"><h1 className="text-3xl font-bold">Shop products</h1><Link href="/account" className="underline">My account</Link></div>
    <p className="mt-3 text-zinc-600">Browse our catalog. Checkout will be available after payments and shipping are configured.</p>
    <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {((products ?? []) as Product[]).map((product) => {
        const choices = allVariants.filter((variant) => variant.product_id === product.id);
        return <article key={product.id} className="rounded-2xl border border-zinc-200 p-6">
          <h2 className="text-xl font-semibold">{product.name}</h2>
          {product.description && <p className="mt-2 text-sm text-zinc-600">{product.description}</p>}
          <div className="mt-5 space-y-3">{choices.map((v) => <div key={v.id} className="border-t pt-3 text-sm">
            <div className="font-medium">{Object.values(v.attributes ?? {}).join(" · ") || v.sku}</div>
            <div className="mt-1">{rupees(v.retail_price_paise)} <span className="text-zinc-500">retail</span></div>
            {v.wholesale_price_paise !== null && <div>{rupees(v.wholesale_price_paise)} wholesale · min {v.wholesale_min_qty}</div>}
            <p className={v.in_stock ? "text-green-700" : "text-red-700"}>{v.in_stock ? "In stock" : "Out of stock"}</p>
          </div>)}</div>
        </article>;
      })}
    </div>
    {!products?.length && <p className="mt-8 text-zinc-600">Products will appear here when published by an administrator.</p>}
  </main>;
}
