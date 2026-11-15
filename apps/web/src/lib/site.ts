// Public configuration only. A preview must never advertise an unconfirmed domain.
export const brand = process.env.NEXT_PUBLIC_STORE_NAME?.trim() || "Your Store";
export const description = "Explore FMCG products, traditional foods and household essentials from Coimbatore, Tamil Nadu. Retail and wholesale shopping across India.";
export const siteOrigin = (() => {
  try {
    const value = new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000");
    return ["https:", "http:"].includes(value.protocol) ? value.origin : "http://localhost:3000";
  } catch { return "http://localhost:3000"; }
})();
export const indexingEnabled = process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true" &&
  siteOrigin.startsWith("https://") && !/localhost|127\.0\.0\.1|\.example(?:$|\/)/i.test(siteOrigin);
export function absoluteUrl(path: string) { return new URL(path, siteOrigin).href; }
export function productPath(slug: string) { return "/products/" + encodeURIComponent(slug); }
export function categoryPath(slug: string) { return "/categories/" + encodeURIComponent(slug); }
