"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import { money } from "@/lib/cart";

export type ProductListing = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  categoryId: string | null;
  fromPrice: number | null;
  available: boolean;
};

export type CategoryListing = { id: string; name: string };

export function ProductCollection({ products, categories }: { products: ProductListing[]; categories: CategoryListing[] }) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState("all");
  const filtered = useMemo(() => products.filter(product => {
    const matchesSearch = (product.name + " " + (product.description ?? "")).toLowerCase().includes(query.trim().toLowerCase());
    return matchesSearch && (active === "all" || product.categoryId === active);
  }), [products, query, active]);

  return <div className="catalog-content">
    <div className="catalog-controls">
      <div className="catalog-filters" role="group" aria-label="Filter products by category">
        <button type="button" className={active === "all" ? "catalog-filter active" : "catalog-filter"} onClick={() => setActive("all")}>All collections <span>{products.length}</span></button>
        {categories.map(category => <button key={category.id} type="button" className={active === category.id ? "catalog-filter active" : "catalog-filter"} onClick={() => setActive(category.id)}>{category.name}</button>)}
      </div>
      <label className="catalog-search"><span className="sr-only">Search products</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="10.8" cy="10.8" r="7.2"/><path d="m16.4 16.4 5 5"/></svg><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Find something good..."/></label>
    </div>
    <div className="catalog-results"><span>THE COLLECTION</span><span>{filtered.length.toString().padStart(2, "0")} ITEMS</span></div>
    {filtered.length ? <div className="catalog-grid">
      {filtered.map((product, index) => <Link key={product.id} href={`/products/${product.slug}`} className="catalog-product-card">
        <div className="catalog-product-image">
          <span className="catalog-product-index">{String(index + 1).padStart(2,"0")} / EDIT</span>
          {product.imageUrl ? <Image src={product.imageUrl} alt={product.name} width={640} height={640} unoptimized className="catalog-product-photo"/> : <div className="catalog-product-placeholder" aria-hidden="true"><div className="catalog-placeholder-sun"/><div className="catalog-placeholder-jar"><div className="catalog-placeholder-label">GOOD<br/>THINGS.</div></div></div>}
          <span className="catalog-product-open" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M5 19 19 5M8 5h11v11"/></svg></span>
        </div>
        <div className="catalog-product-meta"><div><h2>{product.name}</h2><p>{product.description || "Thoughtfully selected for the everyday."}</p></div><div className="catalog-product-price">{product.fromPrice !== null ? money(product.fromPrice) : "Options coming soon"}<span>{product.available ? "View options →" : "Explore details →"}</span></div></div>
      </Link>)}
    </div> : <div className="catalog-empty"><h2>No matches this time.</h2><p>Try another search or browse the full collection.</p><button onClick={() => { setQuery(""); setActive("all"); }}>Show all products →</button></div>}
  </div>;
}
