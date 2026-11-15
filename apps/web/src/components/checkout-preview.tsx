"use client";

import Link from "next/link";
import { useMemo, useRef, useState, useSyncExternalStore } from "react";
import { CART_KEY, money, type CartItem } from "@/lib/cart";
import { getCheckoutQuote, createCheckoutOrder, type CheckoutMode, type CheckoutQuote, type OrderResult } from "@/app/checkout/actions";

type Address = { id:string; label:string; full_name:string; city:string; state:string; postal_code:string };
function subscribe(callback:()=>void) {
  window.addEventListener("cart-changed",callback);
  window.addEventListener("storage",callback);
  return () => {window.removeEventListener("cart-changed",callback);window.removeEventListener("storage",callback);};
}

export function CheckoutPreview({addresses}:{addresses:Address[]}) {
  const snapshot = useSyncExternalStore(subscribe,()=>localStorage.getItem(CART_KEY)??"[]",()=> "[]");
  const cart = useMemo<CartItem[]>(()=>{
    try {
      const parsed:unknown = JSON.parse(snapshot);
      if(!Array.isArray(parsed)) return [];
      return parsed.filter((i):i is CartItem => i && typeof i === "object" &&
        typeof (i as CartItem).variantId === "string" && Number.isInteger((i as CartItem).quantity) &&
        (i as CartItem).quantity > 0 && (i as CartItem).quantity <= 99);
    } catch{return [];}
  },[snapshot]);
  const [addressId,setAddressId]=useState(addresses[0]?.id??"");
  const [mode,setMode]=useState<CheckoutMode>("retail");
  const [quote,setQuote]=useState<CheckoutQuote|null>(null);
  const [reviewed,setReviewed]=useState("");
  const [order,setOrder]=useState<Extract<OrderResult,{ok:true}>|null>(null);
  const requestKey=useRef<string|null>(null);
  const lock=useRef(false);
  const current=JSON.stringify({items:cart.map(c=>({variantId:c.variantId,quantity:c.quantity})),addressId,mode});
  const freshQuote=reviewed===current ? quote : null;
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  async function review(){
    if(lock.current)return;
    lock.current=true;setBusy(true);setError("");setQuote(null);setOrder(null);
    requestKey.current=crypto.randomUUID();
    try {
      const data=await getCheckoutQuote(cart.map(c=>({variantId:c.variantId,quantity:c.quantity})),addressId,mode);
      setQuote(data);setReviewed(current);
    } catch {setError("Could not calculate the estimate. Please try again.");}
    finally {lock.current=false;setBusy(false);}
  }
  async function create(){
    if(lock.current||!freshQuote?.canCreate||!freshQuote.quoteToken||!requestKey.current)return;
    lock.current=true;setBusy(true);setError("");
    try {
      const result=await createCheckoutOrder(cart.map(c=>({variantId:c.variantId,quantity:c.quantity})),addressId,mode,requestKey.current,freshQuote.quoteToken);
      if(result.ok)setOrder(result);else setError(result.message);
    }catch{setError("Could not confirm the request. Retry with the same reviewed cart.");}
    finally{lock.current=false;setBusy(false);}
  }
  return <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
    <div className="space-y-6">
      <section className="rounded-2xl border border-[#d3d9cd] bg-white p-6">
        <div className="flex flex-wrap justify-between gap-4"><h2 className="text-xl font-semibold">1. Delivery address</h2><Link href="/account/addresses" className="text-sm font-semibold text-emerald-800 underline">Manage addresses</Link></div>
        {addresses.length ? <div className="mt-5 grid gap-3">{addresses.map(a=><label key={a.id} className="flex cursor-pointer gap-3 rounded-xl border border-zinc-200 p-4 text-sm">
          <input disabled={busy||!!order} type="radio" name="shipping-address" checked={addressId===a.id} onChange={()=>{setAddressId(a.id);setQuote(null);}}/>
          <span><strong>{a.label} — {a.full_name}</strong><span className="mt-1 block text-zinc-600">{a.city}, {a.state} {a.postal_code}</span></span>
        </label>)}</div> : <p className="mt-5 text-sm text-zinc-600">No delivery address saved. <Link href="/account/addresses" className="font-semibold text-emerald-800 underline">Add one to continue.</Link></p>}
      </section>
      <section className="rounded-2xl border border-[#d3d9cd] bg-white p-6"><h2 className="text-xl font-semibold">2. Review your cart</h2>
        <label className="mt-4 grid gap-2 text-sm font-medium">Pricing mode<select disabled={busy||!!order} value={mode} onChange={e=>{setMode(e.target.value as CheckoutMode);setQuote(null);}} className="rounded-lg border p-3"><option value="retail">Retail</option><option value="wholesale">Wholesale (approved accounts only)</option></select></label><p className="mt-2 text-xs text-zinc-600">Wholesale mode requires every item to meet its minimum quantity. Retail-only items must use retail checkout.</p>
        {cart.length ? <div className="mt-4 divide-y divide-zinc-200">{cart.map(i=><div key={i.variantId} className="flex justify-between gap-5 py-4"><div><p className="font-semibold">{i.name}</p><p className="text-sm text-zinc-500">{i.label} · Qty {i.quantity}</p></div><span className="text-sm text-zinc-500">Price verified on review</span></div>)}</div> : <p className="mt-4 text-sm text-zinc-600">Your cart is empty. <Link href="/products" className="underline">Browse products.</Link></p>}
      </section>
    </div>
    <aside className="h-fit rounded-2xl border border-[#d3d9cd] bg-[#e7ece1] p-6">
      <p className="text-xs font-bold uppercase tracking-widest text-emerald-800">Secure pricing preview</p>
      <h2 className="mt-3 text-2xl font-semibold">3. Order estimate</h2>
      <p className="mt-3 text-sm leading-6 text-slate-600">Review to check live product prices, eligibility and availability. Calculate your estimate, then create an unpaid order with a 15-minute stock reservation. No payment or shipment will be initiated.</p>
      <button type="button" disabled={busy || !!order || !cart.length || !addressId} onClick={review} className="mt-5 w-full rounded-full bg-emerald-900 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40">{busy?"Checking prices…":"Calculate order estimate"}</button>
      {error && <p role="alert" className="mt-4 text-sm text-red-800">{error}</p>}
      {freshQuote && <div aria-live="polite" className="mt-6 border-t border-emerald-900/20 pt-5">
        {freshQuote.issues.map((issue,index)=><p key={index} role="alert" className="mb-3 text-sm text-red-800">{issue}</p>)}
        {freshQuote.lines.map(i=><div key={i.variantId} className="mb-3 flex justify-between gap-3 text-sm"><span>{i.name} × {i.quantity}{i.wholesale && <small className="block text-emerald-700">Wholesale price applied</small>}</span><strong>{money(i.amountPaise)}</strong></div>)}
        <div className="mt-4 flex justify-between border-t border-emerald-900/20 pt-4 font-semibold"><span>Verified subtotal</span><span>{money(freshQuote.subtotalPaise)}</span></div>
        <p className="mt-3 text-xs leading-5 text-slate-600">{freshQuote.shippingMessage}</p>
        <p className="mt-3 text-xs text-slate-500">Available stock is checked against live reservations. Prices and inventory are checked again atomically when you create an order.</p>
      </div>}
      {!order && <button type="button" disabled={busy||!freshQuote?.ok||!freshQuote.canCreate} onClick={create} className="mt-6 w-full rounded-full bg-emerald-900 px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40">Create unpaid order</button>}
      {order && <div role="status" className="mt-6 rounded-xl bg-white p-4 text-sm"><strong>Unpaid order ORD-{String(order.orderNumber).padStart(6,"0")} saved.</strong><p className="mt-2">Your reservation expires at {new Date(order.expiresAt).toLocaleString("en-IN",{timeZone:"Asia/Kolkata"})} IST. No money was charged.</p><Link href={`/account/orders/${order.orderId}`} className="mt-3 inline-block font-semibold text-emerald-800 underline">View order →</Link></div>}
      <p className="mt-4 text-center text-xs text-zinc-600">Payment collection is not enabled.</p>
      <p className="mt-3 text-center text-xs text-zinc-600">Online payments only · Cash on delivery unavailable</p>
    </aside>
  </div>;
}
