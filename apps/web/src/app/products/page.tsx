import { createClient } from "@/lib/supabase/server";
import { StoreHeader, StoreFooter } from "@/components/store-shell";
import { ProductCollection, type ProductListing } from "@/components/product-collection";

export const instant = false;

type Product = { id: string; name: string; slug: string; description: string | null; image_path: string | null; category_id: string | null };
type Variant = { id: string; product_id: string; retail_price_paise: number; in_stock: boolean };

export default async function ProductsPage() {
  const db = await createClient();
  const [{ data: products, error: productsError }, { data: variants, error: variantsError }, { data: categories, error: categoriesError }] = await Promise.all([
    db.from("products").select("id,name,slug,description,image_path,category_id").eq("active", true).order("name"),
    db.rpc("catalog_variants"),
    db.from("categories").select("id,name").eq("active", true).order("name"),
  ]);
  const options = (variants ?? []) as Variant[];
  const listings: ProductListing[] = ((products ?? []) as Product[]).map(product => {
    const choices = options.filter(v => v.product_id === product.id);
    return {
      id: product.id, name: product.name, slug: product.slug, description: product.description,
      categoryId: product.category_id,
      imageUrl: product.image_path ? db.storage.from("product-images").getPublicUrl(product.image_path).data.publicUrl : null,
      fromPrice: choices.length ? Math.min(...choices.map(v => v.retail_price_paise)) : null,
      available: choices.some(v => v.in_stock),
    };
  });
  return <div className="store-site">
    <StoreHeader/>
    <main>
      <section className="catalog-hero">
        <div className="catalog-hero-inner">
          <div className="catalog-hero-kicker"><span>01</span> / THE EVERYDAY EDIT</div>
          <div className="catalog-hero-row"><h1>Find your<br/><em>good things.</em></h1><div><span>YOUR NEXT FAVOURITE STARTS HERE</span><p>A considered collection for all the little moments that make up a good day.</p></div></div>
        </div>
        <div className="catalog-hero-roundel" aria-hidden="true">✳</div>
      </section>
      {(productsError || variantsError || categoriesError) ? <div role="alert" className="catalog-error">The collection is temporarily unavailable. Please try again later.</div> : <ProductCollection products={listings} categories={categories ?? []}/>}
    </main>
    <StoreFooter/>
  </div>;
}
