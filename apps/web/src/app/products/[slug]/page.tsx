import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AddToCart } from "@/components/add-to-cart";
import { money } from "@/lib/cart";

export const instant = false;

type CatalogVariant = {
  id: string; product_id: string; sku: string; attributes: Record<string, string> | null;
  retail_price_paise: number; wholesale_price_paise: number | null;
  wholesale_min_qty: number | null; in_stock: boolean;
};

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = await createClient();
  const { data: product, error } = await db.from("products").select("id,name,slug,description,image_path,active").eq("slug", slug).eq("active", true).maybeSingle();
  if (error || !product) notFound();
  const { data } = await db.rpc("catalog_variants");
  const variants = ((data ?? []) as CatalogVariant[]).filter(v => v.product_id === product.id);
  const imageUrl = product.image_path ? db.storage.from("product-images").getPublicUrl(product.image_path).data.publicUrl : null;
  return <main className="mx-auto max-w-6xl px-6 py-12">
    <nav className="text-sm text-emerald-800"><Link href="/">Home</Link><span className="mx-2">/</span><Link href="/products">Products</Link><span className="mx-2">/</span>{product.name}</nav>
    <div className="mt-8 grid gap-10 md:grid-cols-2">
      <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-3xl bg-emerald-50">{imageUrl ? <Image src={imageUrl} alt={product.name} width={800} height={800} unoptimized className="h-full w-full object-contain"/> : <div className="text-center"><div className="text-8xl" aria-hidden="true">📦</div><p className="mt-3 text-sm text-emerald-800">Photo coming soon</p></div>}</div>
      <div><span className="text-xs font-bold uppercase tracking-widest text-orange-700">Product details</span><h1 className="mt-3 text-4xl font-bold tracking-tight">{product.name}</h1><p className="mt-5 leading-relaxed text-slate-600">{product.description || "Product details will be available soon."}</p>
      <h2 className="mt-9 text-xl font-semibold">Available options</h2>
      <div className="mt-4 space-y-4">{variants.map(variant => {
        const label = Object.values(variant.attributes ?? {}).join(" · ") || variant.sku;
        return <div key={variant.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border p-4">
          <div><p className="font-semibold">{label}</p><p className="mt-1 font-bold text-emerald-900">{money(variant.retail_price_paise)}</p>{variant.wholesale_price_paise !== null && <p className="mt-1 text-xs text-slate-600">Wholesale: {money(variant.wholesale_price_paise)} · Min. {variant.wholesale_min_qty} units</p>}<p className={variant.in_stock ? "mt-1 text-xs text-green-700" : "mt-1 text-xs text-red-700"}>{variant.in_stock ? "In stock" : "Out of stock"}</p></div>
          <AddToCart available={variant.in_stock} item={{ variantId: variant.id, productId: product.id, slug: product.slug, name: product.name, label, unitPricePaise: variant.retail_price_paise, imageUrl }}/>
        </div>;
      })}</div>
      {variants.length === 0 && <p className="mt-4 rounded-xl bg-zinc-50 p-5 text-slate-600">This product does not have any purchasable variants yet.</p>}
      <div className="mt-8 flex items-center gap-4"><Link href="/cart" className="rounded-xl border border-emerald-800 px-5 py-3 font-semibold text-emerald-800 hover:bg-emerald-50">View cart →</Link><Link href="/products" className="text-sm hover:underline">Back to catalog</Link></div>
      <p className="mt-8 text-xs text-slate-500">Preview checkout is disabled. Availability and pricing will be verified on the server before payments are enabled.</p>
      </div>
    </div>
  </main>;
}
