import Link from "next/link";
import { notFound } from "next/navigation";
import { StoreHeader,StoreFooter } from "@/components/store-shell";
import { ProductCollection } from "@/components/product-collection";
import { JsonLd } from "@/components/json-ld";
import { getPublicCatalog,catalogListings } from "@/lib/public-catalog";
import { seoPage,breadcrumbs } from "@/lib/seo";
import { categoryPath } from "@/lib/site";
export const instant=false;
type Props={params:Promise<{slug:string}>};
export async function generateMetadata({params}:Props){
 const {slug}=await params;const catalog=await getPublicCatalog();const category=catalog.categories.find(c=>c.slug===slug);
 if(!category)notFound();
 const count=catalog.products.filter(p=>p.category_id===category.id).length;
 return seoPage(category.name,"Explore "+category.name+" in our FMCG collection. Browse products, sizes and retail prices.",categoryPath(category.slug),null,count>0);
}
export default async function CategoryPage({params}:Props){
 const {slug}=await params;const catalog=await getPublicCatalog();const category=catalog.categories.find(c=>c.slug===slug);if(!category)notFound();
 const products=catalog.products.filter(p=>p.category_id===category.id);
 return <div className="store-site"><StoreHeader/><main>
 <JsonLd value={breadcrumbs([{name:"Home",path:"/"},{name:"Categories",path:"/categories"},{name:category.name,path:categoryPath(category.slug)}])}/>
 <section className="catalog-hero"><div className="catalog-hero-inner"><nav aria-label="Breadcrumb" className="text-sm text-emerald-900"><Link href="/">Home</Link> / <Link href="/categories">Categories</Link> / {category.name}</nav><h1 className="mt-6 text-5xl font-semibold tracking-tight">{category.name}</h1><p className="mt-4 max-w-lg text-zinc-700">Discover {category.name} products, available sizes and prices.</p></div></section>
 <ProductCollection products={catalogListings(products,catalog.variants)} categories={[]} />
 <div className="mx-auto max-w-7xl px-6 pb-12"><Link href="/categories" className="font-semibold text-emerald-800 underline">Browse all categories →</Link></div>
 </main><StoreFooter/></div>;
}
