"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { money, readCart, writeCart, type CartItem } from "@/lib/cart";

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  useEffect(() => {
    function reload() { setItems(readCart()); }
    reload();
    window.addEventListener("cart-changed", reload);
    window.addEventListener("storage", reload);
    return () => { window.removeEventListener("cart-changed", reload); window.removeEventListener("storage", reload); };
  }, []);
  function update(id: string, quantity: number) {
    const next = quantity <= 0 ? items.filter(i => i.variantId !== id) : items.map(i => i.variantId === id ? { ...i, quantity: Math.min(99, quantity) } : i);
    setItems(next);
    writeCart(next);
  }
  const total = items.reduce((sum, item) => sum + item.unitPricePaise * item.quantity, 0);
  return <main className="mx-auto w-full max-w-5xl px-6 py-12">
    <div className="flex items-center justify-between gap-3"><h1 className="text-3xl font-bold">Your cart</h1><Link href="/products" className="text-sm font-medium text-emerald-800 hover:underline">Continue shopping →</Link></div>
    <p className="mt-3 text-sm text-slate-600">Your cart is saved in this browser. Prices and stock are not confirmed until checkout is available.</p>
    {items.length === 0 ? <div className="mt-12 rounded-2xl border p-12 text-center"><div className="text-5xl">🛒</div><h2 className="mt-4 text-xl font-semibold">Your cart is empty</h2><Link href="/products" className="mt-5 inline-block rounded-xl bg-emerald-800 px-6 py-3 font-semibold text-white">Browse products</Link></div> :
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_300px]"><div className="space-y-4">
        {items.map(item=><article key={item.variantId} className="flex gap-4 rounded-xl border p-4">
          <div className="relative flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-emerald-50">{item.imageUrl ? <Image src={item.imageUrl} alt={item.name} width={96} height={96} unoptimized className="h-full w-full object-cover"/> : <span className="text-3xl">📦</span>}</div>
          <div className="min-w-0 flex-1"><Link href={`/products/${item.slug}`} className="font-semibold hover:underline">{item.name}</Link><p className="mt-1 text-sm text-slate-500">{item.label}</p><p className="mt-2 font-medium">{money(item.unitPricePaise)}</p>
            <div className="mt-3 flex flex-wrap items-center gap-3"><label className="text-sm" htmlFor={`quantity-${item.variantId}`}>Quantity</label><input id={`quantity-${item.variantId}`} type="number" min={1} max={99} value={item.quantity} onChange={e=>update(item.variantId, Math.max(1, Number(e.target.value) || 1))} className="w-20 rounded-lg border px-2 py-1"/><button className="text-sm text-red-700 hover:underline" onClick={()=>update(item.variantId,0)}>Remove</button></div>
          </div>
        </article>)}
      </div>
      <aside className="h-fit rounded-2xl border p-6"><h2 className="text-lg font-bold">Order summary</h2><div className="mt-5 flex justify-between"><span>Estimated subtotal</span><strong>{money(total)}</strong></div><p className="mt-2 text-xs text-slate-500">Shipping and taxes will be calculated later. Prices shown are saved snapshots, not guaranteed quotations.</p><button disabled className="mt-6 w-full cursor-not-allowed rounded-xl bg-zinc-200 px-5 py-3 font-semibold text-zinc-600">Checkout coming soon</button></aside>
      </div>}
  </main>;
}
