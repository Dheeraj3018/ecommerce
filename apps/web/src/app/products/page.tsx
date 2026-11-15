import Link from "next/link";
import { StoreHeader,StoreFooter } from "@/components/store-shell";
import { ProductCollection } from "@/components/product-collection";
import { getPublicCatalog,catalogListings } from "@/lib/public-catalog";
import { seoPage } from "@/lib/seo";
import { categoryPath } from "@/lib/site";
export const instant=false;
export const metadata=seoPage("Shop FMCG Products Online","Browse food, spices, traditional essentials and household products. Discover current retail prices and product sizes.","/products");
export default async function ProductsPage(){
 const catalog=await getPublicCatalog();
 return <div className="store-site"><StoreHeader/><main>
 <section className="catalog-hero"><div className="catalog-hero-inner"><div className="catalog-hero-kicker">01 / THE EVERYDAY EDIT</div><div className="catalog-hero-row"><h1>Find your<br/><em>good things.</em></h1><div><span>SHOP FMCG & DAILY ESSENTIALS</span><p>Browse our collection of food and household products.</p></div></div></div><div className="catalog-hero-roundel" aria-hidden="true">✳</div></section>
 <nav aria-label="Product categories" className="mx-auto flex max-w-7xl flex-wrap gap-3 px-6 pt-8"><Link href="/categories" className="text-sm font-semibold text-emerald-800 underline">All categories</Link>{catalog.categories.map(c=><Link key={c.id} href={categoryPath(c.slug)} className="rounded-full border px-4 py-2 text-sm hover:bg-emerald-50">{c.name}</Link>)}</nav>
 <ProductCollection products={catalogListings(catalog.products,catalog.variants)} categories={catalog.categories}/>
 </main><StoreFooter/></div>;
}
