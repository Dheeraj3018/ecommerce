import "server-only";
import { cache } from "react";
import { createClient } from "@supabase/supabase-js";

export type Category = {id:string;name:string;slug:string;active:boolean};
export type PublicProduct = {id:string;name:string;slug:string;description:string|null;image_path:string|null;category_id:string|null;active:boolean};
export type RetailVariant = {id:string;product_id:string;sku:string;attributes:Record<string,string>|null;retail_price_paise:number;in_stock:boolean};

function anonymousClient() {
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if(!url||!key) throw new Error("Missing public catalog configuration");
  return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
}
export function productImage(path:string|null) {
  return path ? anonymousClient().storage.from("product-images").getPublicUrl(path).data.publicUrl : null;
}
export const getPublicCatalog = cache(async () => {
  const db=anonymousClient();
  const categories:Category[]=[];
  const products:PublicProduct[]=[];
  const variants:RetailVariant[]=[];
  // Page through REST results instead of silently accepting the default row limit.
  for(let offset=0;;offset+=500) {
    const {data,error}=await db.from("categories").select("id,name,slug,active").eq("active",true).order("id").range(offset,offset+499);
    if(error) throw new Error("Catalog categories unavailable");
    categories.push(...(data??[])); if(!data||data.length<500)break;
  }
  for(let offset=0;;offset+=500) {
    const {data,error}=await db.from("products").select("id,name,slug,description,image_path,category_id,active").eq("active",true).order("id").range(offset,offset+499);
    if(error) throw new Error("Catalog products unavailable");
    products.push(...(data??[])); if(!data||data.length<500)break;
  }
  for(let offset=0;;offset+=500) {
    const {data,error}=await db.rpc("catalog_variants").select("id,product_id,sku,attributes,retail_price_paise,in_stock").order("id").range(offset,offset+499);
    if(error) throw new Error("Catalog pricing unavailable");
    variants.push(...(data??[])); if(!data||data.length<500)break;
  }
  const categoryIds=new Set(categories.map(c=>c.id));
  const visible=products.filter(p=>!p.category_id||categoryIds.has(p.category_id));
  const grouped=new Map<string,RetailVariant[]>();
  for(const variant of variants) {
    const list=grouped.get(variant.product_id)??[];
    list.push(variant);grouped.set(variant.product_id,list);
  }
  return {categories:categories.sort((a,b)=>a.name.localeCompare(b.name)),products:visible.sort((a,b)=>a.name.localeCompare(b.name)),variants:grouped};
});

export const getPublicProduct = cache(async (slug:string) => {
  const db=anonymousClient();
  const {data,error}=await db.from("products").select("id,name,slug,description,image_path,category_id,active").eq("active",true).eq("slug",slug).maybeSingle();
  if(error) throw new Error("Product unavailable");
  if(!data)return null;
  const product=data as PublicProduct;
  let category:Category|null=null;
  if(product.category_id){
    const result=await db.from("categories").select("id,name,slug,active").eq("id",product.category_id).eq("active",true).maybeSingle();
    if(result.error)throw new Error("Category unavailable");
    if(!result.data)return null;
    category=result.data;
  }
  const {data:variants,error:variantError}=await db.rpc("catalog_variants").select("id,product_id,sku,attributes,retail_price_paise,in_stock").eq("product_id",product.id).order("id");
  if(variantError)throw new Error("Product pricing unavailable");
  return {product,category,variants:(variants??[]) as RetailVariant[],imageUrl:productImage(product.image_path)};
});

export function catalogListings(products:PublicProduct[],variants:Map<string,RetailVariant[]>) {
  return products.map(p=>{
    const choices=variants.get(p.id)??[];
    return {id:p.id,name:p.name,slug:p.slug,description:p.description,categoryId:p.category_id,imageUrl:productImage(p.image_path),
      fromPrice:choices.length?Math.min(...choices.map(v=>v.retail_price_paise)):null,available:choices.some(v=>v.in_stock)};
  });
}
