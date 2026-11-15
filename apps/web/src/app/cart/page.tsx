"use client";

import Link from "next/link";
import { StoreHeader, StoreFooter } from "@/components/store-shell";
import Image from "next/image";
import { useMemo, useSyncExternalStore } from "react";
import { CART_KEY, money, writeCart, type CartItem } from "@/lib/cart";

export default function CartPage() {
  const savedCart = useSyncExternalStore(
    (notify) => {
      window.addEventListener("cart-changed", notify);
      window.addEventListener("storage", notify);
      return () => { window.removeEventListener("cart-changed", notify); window.removeEventListener("storage", notify); };
    },
    () => localStorage.getItem(CART_KEY) ?? "[]",
    () => "[]",
  );
  const items = useMemo<CartItem[]>(() => {
    try {
      const value: unknown = JSON.parse(savedCart);
      if (!Array.isArray(value)) return [];
      return value.filter((item): item is CartItem =>
        item !== null && typeof item === "object" &&
        typeof (item as CartItem).variantId === "string" &&
        typeof (item as CartItem).name === "string" &&
        typeof (item as CartItem).quantity === "number" &&
        Number.isSafeInteger((item as CartItem).unitPricePaise) &&
        (item as CartItem).unitPricePaise >= 0
      ).slice(0, 100);
    } catch { return []; }
  }, [savedCart]);
  function update(id: string, quantity: number) {
    const next = quantity <= 0 ? items.filter(i => i.variantId !== id) : items.map(i => i.variantId === id ? { ...i, quantity: Math.min(99, quantity) } : i);
    writeCart(next);
  }
  const total = items.reduce((sum, item) => sum + item.unitPricePaise * item.quantity, 0);
  return <div className="store-site"><StoreHeader/><main className="mx-auto w-full max-w-5xl px-6 py-16">
    <div className="flex items-center justify-between gap-3"><h1 className="text-4xl font-medium tracking-[-0.05em]">Your <span className="font-serif italic text-[#ac8051]">cart.</span></h1><Link href="/products" className="text-sm font-medium text-emerald-800 hover:underline">Continue shopping →</Link></div>
    <p className="mt-3 text-sm text-slate-600">Your cart is saved in this browser. Prices and stock are not confirmed until checkout is available.</p>
    {items.length === 0 ? <div className="mt-12 rounded-2xl border p-12 text-center"><div className="mx-auto flex size-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-900"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="40" height="40" aria-hidden="true"><path d="M3 4h2l2.2 11a2 2 0 0 0 2 1.7H19a2 2 0 0 0 2-1.6L22 8H6"/><circle cx="10" cy="21" r="1"/><circle cx="19" cy="21" r="1"/></svg></div><h2 className="mt-4 text-xl font-semibold">Your cart is empty</h2><Link href="/products" className="mt-5 inline-block rounded-xl bg-emerald-800 px-6 py-3 font-semibold text-white">Browse products</Link></div> :
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_300px]"><div className="space-y-4">
        {items.map(item=><article key={item.variantId} className="flex gap-4 rounded-xl border p-4">
          <div className="relative flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-emerald-50">{item.imageUrl ? <Image src={item.imageUrl} alt={item.name} width={96} height={96} unoptimized className="h-full w-full object-cover"/> : <span className="text-3xl">📦</span>}</div>
          <div className="min-w-0 flex-1"><Link href={`/products/${item.slug}`} className="font-semibold hover:underline">{item.name}</Link><p className="mt-1 text-sm text-slate-500">{item.label}</p><p className="mt-2 font-medium">{money(item.unitPricePaise)}</p>
            <div className="mt-3 flex flex-wrap items-center gap-3"><label className="text-sm" htmlFor={`quantity-${item.variantId}`}>Quantity</label><input id={`quantity-${item.variantId}`} type="number" min={1} max={99} value={item.quantity} onChange={e=>update(item.variantId, Math.max(1, Number(e.target.value) || 1))} className="w-20 rounded-lg border px-2 py-1"/><button className="text-sm text-red-700 hover:underline" onClick={()=>update(item.variantId,0)}>Remove</button></div>
          </div>
        </article>)}
      </div>
      <aside className="h-fit rounded-2xl border p-6"><h2 className="text-lg font-bold">Order summary</h2><div className="mt-5 flex justify-between"><span>Estimated subtotal</span><strong>{money(total)}</strong></div><p className="mt-2 text-xs text-slate-500">Shipping and taxes will be calculated later. Prices shown are saved snapshots, not guaranteed quotations.</p><Link href="/checkout" className="mt-6 block w-full rounded-xl bg-emerald-900 px-5 py-3 text-center font-semibold text-white hover:bg-emerald-800">Review checkout preview →</Link><p className="mt-3 text-xs text-zinc-500">No payments are collected yet.</p></aside>
      </div>}
  </main><StoreFooter/></div>;
}
