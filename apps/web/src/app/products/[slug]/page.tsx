import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StoreHeader, StoreFooter } from "@/components/store-shell";
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
  const { data: product, error } = await db.from("products")
    .select("id,name,slug,description,image_path,active")
    .eq("slug", slug).eq("active", true).maybeSingle();
  if (error || !product) notFound();
  const { data } = await db.rpc("catalog_variants");
  const variants = ((data ?? []) as CatalogVariant[]).filter(v => v.product_id === product.id);
  const imageUrl = product.image_path ? db.storage.from("product-images").getPublicUrl(product.image_path).data.publicUrl : null;
  return <div className="store-site">
    <StoreHeader/>
    <main className="detail-page">
      <nav className="detail-breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/products">The collection</Link><span>/</span><span aria-current="page">{product.name}</span></nav>
      <div className="detail-grid">
        <div className="detail-media">
          <span className="detail-image-label">THE EVERYDAY EDIT / SELECTED FOR YOU</span>
          {imageUrl ? <Image src={imageUrl} alt={product.name} width={860} height={860} unoptimized className="detail-photo"/> : <div className="detail-placeholder" aria-label="Product photography coming soon"><div className="detail-placeholder-circle"/><div className="detail-placeholder-vessel"><span>THE<br/>EVERYDAY<br/>EDIT</span></div></div>}
          <span className="detail-image-index">01 / PRODUCT VIEW</span>
        </div>
        <div className="detail-info">
          <span className="detail-kicker">FROM THE COLLECTION <span>—</span> AVAILABLE PRODUCTS</span>
          <h1>{product.name}<span>.</span></h1>
          <p className="detail-description">{product.description || "Thoughtfully selected for all the little moments that make up your day."}</p>
          <div className="detail-rule"/>
          <div className="detail-option-heading"><h2>Choose your option</h2><span>{String(variants.length).padStart(2,"0")} AVAILABLE SIZES</span></div>
          <div className="detail-options">{variants.map(variant => {
            const label = Object.values(variant.attributes ?? {}).join(" · ") || variant.sku;
            return <div key={variant.id} className="detail-option">
              <div className="detail-option-name"><h3>{label}</h3><span>{variant.in_stock ? "IN STOCK" : "OUT OF STOCK"}</span></div>
              <div className="detail-option-buy">
                <div><strong>{money(variant.retail_price_paise)}</strong>{variant.wholesale_price_paise !== null && <p>Wholesale: {money(variant.wholesale_price_paise)} · Min. {variant.wholesale_min_qty}</p>}</div>
                <AddToCart available={variant.in_stock} item={{ variantId: variant.id, productId: product.id, slug: product.slug, name: product.name, label, unitPricePaise: variant.retail_price_paise, imageUrl }}/>
              </div>
            </div>;
          })}</div>
          {variants.length === 0 && <p className="detail-empty">Options and pricing are being prepared. Check back soon.</p>}
          <Link href="/cart" className="detail-view-cart">View your cart <span aria-hidden="true">↗</span></Link>
          <p className="detail-disclaimer">Checkout is not yet enabled. Pricing and inventory will be verified at order placement.</p>
        </div>
      </div>
      <div className="detail-bottom"><span>GOOD THINGS. BETTER EVERY DAYS.</span><Link href="/products">← Back to the full collection</Link></div>
    </main>
    <StoreFooter/>
  </div>;
}
