"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

type RequestLine = { variantId:string; quantity:number };
export type CheckoutMode = "retail" | "wholesale";
export type QuoteLine = { variantId:string; name:string; label:string; quantity:number; unitPricePaise:number; amountPaise:number; wholesale:boolean; inStock:boolean };
export type CheckoutQuote = { ok:boolean; lines:QuoteLine[]; subtotalPaise:number; qualifiesForFreeShipping:boolean; shippingMessage:string; issues:string[]; addressValid:boolean; quoteToken?:string; canCreate:boolean };
export type OrderResult = {ok:true;orderId:string;orderNumber:number;totalPaise:number;expiresAt:string;replayed:boolean} | {ok:false;message:string};

const messages:Record<string,string> = {
 CHECKOUT_AUTH:"Please sign in again.", CHECKOUT_MODE:"Choose a valid pricing mode.",
 CHECKOUT_CART:"Choose 1–30 distinct products, with 1–99 units per variant.",
 CHECKOUT_DUPLICATE_LINE:"Remove duplicate product variants from the cart.",
 CHECKOUT_ADDRESS:"Choose a saved address belonging to your account.",
 CHECKOUT_WHOLESALE:"Your account must be approved for wholesale purchasing.",
 CHECKOUT_STOCK:"One or more items exceed available stock, including existing reservations. Reduce quantities and try again.",
 CHECKOUT_UNAVAILABLE:"A product or category is no longer available.",
 CHECKOUT_RETAIL_ONLY:"This item is retail-only. Choose retail checkout or remove the item.",
 CHECKOUT_MOQ:"A wholesale item does not meet its minimum quantity. Increase its quantity or choose retail checkout.",
 CHECKOUT_PRICE:"The order amount exceeds the supported limit.",
 CHECKOUT_PRICE_CHANGED:"Prices or order details changed. Calculate a fresh estimate.",
 CHECKOUT_SHIPPING:"Shipping rates below ₹1,000 are not configured yet.",
 CHECKOUT_EXISTING:"You already have a live unpaid order. View your order history or wait until its reservation expires.",
 CHECKOUT_KEY_REUSED:"This checkout request was already used with different details.",
 CHECKOUT_KEY:"Please calculate a new estimate before creating an order."
};
function message(raw:string) {
 return messages[raw] ?? "Checkout is temporarily unavailable. Please try again.";
}
function invalid(reason:string):CheckoutQuote {
 return {ok:false,lines:[],subtotalPaise:0,qualifiesForFreeShipping:false,shippingMessage:"",issues:[reason],addressValid:false,canCreate:false};
}
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function valid(items:RequestLine[],address:string,mode:CheckoutMode) {
 return Array.isArray(items) && items.length>=1 && items.length<=30 && typeof address==="string" && uuid.test(address) && (mode==="retail"||mode==="wholesale") && items.every(i=>i && typeof i.variantId==="string" && uuid.test(i.variantId) && Number.isInteger(i.quantity) && i.quantity>=1 && i.quantity<=99);
}
export async function getCheckoutQuote(items:RequestLine[],addressId:string,mode:CheckoutMode="retail"):Promise<CheckoutQuote> {
 if(!valid(items,addressId,mode)) return invalid("Check your cart quantities and delivery address.");
 const db=await createClient();
 const {data:{user},error:authError}=await db.auth.getUser();
 if(authError||!user) return invalid(messages.CHECKOUT_AUTH);
 const {data,error}=await db.rpc("checkout_quote",{p_items:items,p_address:addressId,p_mode:mode});
 if(error||!data) return invalid(message(error?.message??""));
 return {...data,issues:[],addressValid:true,shippingMessage:data.qualifiesForFreeShipping ? "Free shipping threshold reached. This unpaid reservation is not a confirmed shipment." : "Shipping rates below ₹1,000 are not configured. Order creation is unavailable for this estimate."};
}
export async function createCheckoutOrder(items:RequestLine[],addressId:string,mode:CheckoutMode,key:string,token:string):Promise<OrderResult> {
 if(!valid(items,addressId,mode)||typeof key!=="string"||!uuid.test(key)||typeof token!=="string"||! /^[a-f0-9]{32}$/.test(token)) return {ok:false,message:"Review your cart and calculate a new estimate."};
 const db=await createClient();
 const {data:{user},error:authError}=await db.auth.getUser();
 if(authError||!user) return {ok:false,message:messages.CHECKOUT_AUTH};
 const {data,error}=await db.rpc("checkout_create",{p_items:items,p_address:addressId,p_mode:mode,p_key:key,p_expected:token});
 if(error||!data) return {ok:false,message:message(error?.message??"")};
 revalidatePath("/account/orders");revalidatePath("/admin/orders");
 return {ok:true,...data};
}
