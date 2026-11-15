import type { MetadataRoute } from "next";
import { connection } from "next/server";
import { absoluteUrl,indexingEnabled,productPath,categoryPath } from "@/lib/site";
import { getPublicCatalog } from "@/lib/public-catalog";
export default async function sitemap():Promise<MetadataRoute.Sitemap>{
 await connection();
 if(!indexingEnabled)return [];
 const {categories,products,variants}=await getPublicCatalog();
 return [
  {url:absoluteUrl("/")},{url:absoluteUrl("/products")},{url:absoluteUrl("/categories")},
  ...categories.filter(c=>products.some(p=>p.category_id===c.id)).map(c=>({url:absoluteUrl(categoryPath(c.slug))})),
  ...products.filter(p=>(variants.get(p.id)?.length??0)>0).map(p=>({url:absoluteUrl(productPath(p.slug))})),
 ];
}
