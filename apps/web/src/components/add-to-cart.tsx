"use client";

import { useState } from "react";
import { readCart, writeCart, type CartItem } from "@/lib/cart";

export function AddToCart({ item, available }: { item: Omit<CartItem, "quantity">; available: boolean }) {
  const [added, setAdded] = useState(false);
  function add() {
    const cart = readCart();
    const existing = cart.find(entry => entry.variantId === item.variantId);
    if (existing) {
      writeCart(cart.map(entry => entry.variantId === item.variantId ? { ...entry, quantity: Math.min(entry.quantity + 1, 99), unitPricePaise: item.unitPricePaise } : entry));
    } else {
      writeCart([...cart, { ...item, quantity: 1 }]);
    }
    setAdded(true);
  }
  return <button type="button" onClick={add} disabled={!available} className="rounded-xl bg-emerald-800 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-600">{!available ? "Out of stock" : added ? "Added to cart ✓" : "Add to cart"}</button>;
}
