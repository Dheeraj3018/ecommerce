"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import { CART_KEY, money, type CartItem } from "@/lib/cart";
import { getCheckoutQuote, type CheckoutQuote } from "@/app/checkout/actions";

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
        (i as CartItem).quantity > 0 && (i as CartItem).quantity <= 99).slice(0,30);
    } catch{return [];}
  },[snapshot]);
  const [addressId,setAddressId]=useState(addresses[0]?.id??"");
  const [quote,setQuote]=useState<CheckoutQuote|null>(null);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  async function review(){
    setBusy(true);setError("");setQuote(null);
    try {
      const data=await getCheckoutQuote(cart.map(c=>({variantId:c.variantId,quantity:c.quantity})),addressId);
      setQuote(data);
    } catch {setError("Could not calculate the estimate. Please try again.");}
    finally {setBusy(false);}
  }
  return <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
    <div className="space-y-6">
      <section className="rounded-2xl border border-[#d3d9cd] bg-white p-6">
        <div className="flex flex-wrap justify-between gap-4"><h2 className="text-xl font-semibold">1. Delivery address</h2><Link href="/account/addresses" className="text-sm font-semibold text-emerald-800 underline">Manage addresses</Link></div>
        {addresses.length ? <div className="mt-5 grid gap-3">{addresses.map(a=><label key={a.id} className="flex cursor-pointer gap-3 rounded-xl border border-zinc-200 p-4 text-sm">
          <input type="radio" name="shipping-address" checked={addressId===a.id} onChange={()=>{setAddressId(a.id);setQuote(null);}}/>
          <span><strong>{a.label} — {a.full_name}</strong><span className="mt-1 block text-zinc-600">{a.city}, {a.state} {a.postal_code}</span></span>
        </label>)}</div> : <p className="mt-5 text-sm text-zinc-600">No delivery address saved. <Link href="/account/addresses" className="font-semibold text-emerald-800 underline">Add one to continue.</Link></p>}
      </section>
      <section className="rounded-2xl border border-[#d3d9cd] bg-white p-6"><h2 className="text-xl font-semibold">2. Review your cart</h2>
        {cart.length ? <div className="mt-4 divide-y divide-zinc-200">{cart.map(i=><div key={i.variantId} className="flex justify-between gap-5 py-4"><div><p className="font-semibold">{i.name}</p><p className="text-sm text-zinc-500">{i.label} · Qty {i.quantity}</p></div><span className="text-sm text-zinc-500">Price verified on review</span></div>)}</div> : <p className="mt-4 text-sm text-zinc-600">Your cart is empty. <Link href="/products" className="underline">Browse products.</Link></p>}
      </section>
    </div>
    <aside className="h-fit rounded-2xl border border-[#d3d9cd] bg-[#e7ece1] p-6">
      <p className="text-xs font-bold uppercase tracking-widest text-emerald-800">Secure pricing preview</p>
      <h2 className="mt-3 text-2xl font-semibold">3. Order estimate</h2>
      <p className="mt-3 text-sm leading-6 text-slate-600">Review to check live product prices, eligibility and availability. No order or payment will be created.</p>
      <button type="button" disabled={busy || !cart.length || !addressId} onClick={review} className="mt-5 w-full rounded-full bg-emerald-900 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40">{busy?"Checking prices…":"Calculate order estimate"}</button>
      {error && <p role="alert" className="mt-4 text-sm text-red-800">{error}</p>}
      {quote && <div aria-live="polite" className="mt-6 border-t border-emerald-900/20 pt-5">
        {quote.issues.map((issue,index)=><p key={index} role="alert" className="mb-3 text-sm text-red-800">{issue}</p>)}
        {quote.lines.map(i=><div key={i.variantId} className="mb-3 flex justify-between gap-3 text-sm"><span>{i.name} × {i.quantity}{i.wholesale && <small className="block text-emerald-700">Wholesale price applied</small>}</span><strong>{money(i.amountPaise)}</strong></div>)}
        <div className="mt-4 flex justify-between border-t border-emerald-900/20 pt-4 font-semibold"><span>Verified subtotal</span><span>{money(quote.subtotalPaise)}</span></div>
        <p className="mt-3 text-xs leading-5 text-slate-600">{quote.shippingMessage}</p>
        <p className="mt-3 text-xs text-slate-500">Quantities above available stock cannot yet be verified in this preview; final checkout will recheck inventory.</p>
      </div>}
      <button disabled className="mt-6 w-full cursor-not-allowed rounded-full bg-zinc-300 px-5 py-3 font-semibold text-zinc-600">Payments coming soon</button>
      <p className="mt-3 text-center text-xs text-zinc-600">Online payments only · Cash on delivery unavailable</p>
    </aside>
  </div>;
}
