"use server";

import { createClient } from "@/lib/supabase/server";

type RequestLine = { variantId: string; quantity: number };
type Variant = { id:string; product_id:string; sku:string; attributes:Record<string,string>|null; retail_price_paise:number; wholesale_price_paise:number|null; wholesale_min_qty:number|null; in_stock:boolean };
type Product = { id:string; name:string; active:boolean; category_id:string|null };

export type QuoteLine = { variantId:string; name:string; label:string; quantity:number; unitPricePaise:number; amountPaise:number; wholesale:boolean; inStock:boolean };
export type CheckoutQuote = {
  ok:boolean; lines:QuoteLine[]; subtotalPaise:number; qualifiesForFreeShipping:boolean;
  shippingMessage:string; issues:string[]; addressValid:boolean;
};

function invalid(message:string):CheckoutQuote {
  return {ok:false,lines:[],subtotalPaise:0,qualifiesForFreeShipping:false,shippingMessage:"",issues:[message],addressValid:false};
}

export async function getCheckoutQuote(items: RequestLine[], addressId: string):Promise<CheckoutQuote> {
  const db = await createClient();
  const { data:{user},error:authError } = await db.auth.getUser();
  if (authError || !user) return invalid("Sign in to review your checkout.");
  if (!Array.isArray(items) || items.length < 1 || items.length > 30) return invalid("Your cart must contain between 1 and 30 different items.");
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuid.test(addressId)) return invalid("Choose a saved delivery address.");
  if (items.some(i => !i || typeof i.variantId !== "string" || !uuid.test(i.variantId) || !Number.isInteger(i.quantity) || i.quantity < 1 || i.quantity > 99)) return invalid("Cart items must have valid quantities.");
  const uniqueIds = [...new Set(items.map(i=>i.variantId))];
  if (uniqueIds.length !== items.length) return invalid("The cart contains duplicate variants.");
  const [{data:address,error:addressError},{data:variants,error:variantsError},{data:products,error:productsError}] = await Promise.all([
    db.from("customer_addresses").select("id").eq("id",addressId).eq("user_id",user.id).maybeSingle(),
    db.rpc("catalog_variants"),
    db.from("products").select("id,name,active,category_id").eq("active",true),
  ]);
  if (addressError || !address) return invalid("The selected address is unavailable.");
  if (variantsError || productsError) return invalid("Pricing is temporarily unavailable. Try again later.");
  const catalog = new Map(((variants ?? []) as Variant[]).map(v=>[v.id,v]));
  const productMap = new Map(((products ?? []) as Product[]).map(p=>[p.id,p]));
  const issues:string[]=[];
  const lines:QuoteLine[]=[];
  let subtotalPaise = 0;
  for(const item of items) {
    const variant = catalog.get(item.variantId);
    const product = variant ? productMap.get(variant.product_id) : undefined;
    if (!variant || !product) {issues.push("A cart item is unavailable. Please remove it from the cart.");continue;}
    if (!Number.isSafeInteger(variant.retail_price_paise) || variant.retail_price_paise < 0) {issues.push("A product has invalid pricing.");continue;}
    const wholesale = variant.wholesale_price_paise !== null
      && variant.wholesale_min_qty !== null
      && item.quantity >= variant.wholesale_min_qty;
    const price = wholesale ? variant.wholesale_price_paise! : variant.retail_price_paise;
    if (!Number.isSafeInteger(price) || price < 0) {issues.push("A product has invalid pricing.");continue;}
    if (!variant.in_stock) issues.push(product.name + " is out of stock.");
    const lineTotal = price * item.quantity;
    if (!Number.isSafeInteger(lineTotal)) {issues.push("Total exceeds the supported amount.");continue;}
    subtotalPaise += lineTotal;
    lines.push({
      variantId:variant.id,name:product.name,label:Object.values(variant.attributes??{}).join(" · ") || variant.sku,
      quantity:item.quantity,unitPricePaise:price,amountPaise:lineTotal,wholesale,inStock:variant.in_stock,
    });
  }
  if (!Number.isSafeInteger(subtotalPaise) || subtotalPaise > 100000000) issues.push("Order amount exceeds the supported preview limit.");
  const qualifiesForFreeShipping = subtotalPaise >= 100000;
  return {
    ok:issues.length === 0 && lines.length === items.length,
    lines,subtotalPaise,qualifiesForFreeShipping,addressValid:true,issues,
    shippingMessage:qualifiesForFreeShipping
      ? "Free-shipping threshold reached (₹1,000). Delivery eligibility will be confirmed at checkout."
      : "Shipping charges are not finalized. Add eligible items worth ₹1,000 for the free-shipping threshold.",
  };
}
