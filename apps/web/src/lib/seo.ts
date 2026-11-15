import type { Metadata } from "next";
import { absoluteUrl, brand, indexingEnabled } from "./site";

export function seoPage(title: string, description: string, path: string, image?: string | null, eligible = true): Metadata {
  const url = absoluteUrl(path);
  return {
    title, description, alternates: { canonical: url },
    robots: { index: indexingEnabled && eligible, follow: indexingEnabled },
    openGraph: { type: "website", title: title + " | " + brand, description, url, siteName: brand, locale: "en_IN", ...(image ? { images: [{ url: image }] } : {}) },
    twitter: { card: image ? "summary_large_image" : "summary", title: title + " | " + brand, description, ...(image ? { images: [image] } : {}) },
  };
}
export function cleanDescription(value: string | null | undefined, fallback: string) {
  const text = value?.replace(/\s+/g," ").trim() || fallback;
  return text.length > 160 ? text.slice(0,157).trimEnd() + "…" : text;
}
export function breadcrumbs(items: { name: string; path: string }[]) {
  return { "@context":"https://schema.org", "@type":"BreadcrumbList", itemListElement:items.map((item,i)=>({ "@type":"ListItem",position:i+1,name:item.name,item:absoluteUrl(item.path) })) };
}
export function jsonLd(value: unknown) { return JSON.stringify(value).replace(/</g,"\\u003c"); }
