import Link from "next/link";
import { StoreHeader,StoreFooter } from "@/components/store-shell";
import { getPublicCatalog } from "@/lib/public-catalog";
import { seoPage } from "@/lib/seo";
import { categoryPath } from "@/lib/site";
export const instant=false;
export const metadata=seoPage("Shop by category","Explore FMCG, food and household product categories.","/categories");
export default async function CategoriesPage(){
 const {categories,products}=await getPublicCatalog();
 return <div className="store-site"><StoreHeader/><main className="mx-auto max-w-7xl px-6 py-16">
 <p className="text-xs font-bold uppercase tracking-widest text-amber-700">Discover our collection</p><h1 className="mt-3 text-5xl font-medium tracking-tight">Shop by category.</h1>
 <p className="mt-4 text-zinc-600">Browse our published product collections.</p>
 <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{categories.map(c=><Link key={c.id} href={categoryPath(c.slug)} className="rounded-2xl border bg-white p-7 hover:border-emerald-700"><h2 className="text-xl font-semibold">{c.name}</h2><p className="mt-3 text-sm text-zinc-600">{products.filter(p=>p.category_id===c.id).length} products · Explore →</p></Link>)}</div>
 {!categories.length&&<p className="mt-8">Collections are being prepared. <Link href="/products" className="underline">Browse all products.</Link></p>}
 </main><StoreFooter/></div>;
}
