export type CartItem = {
  variantId: string;
  productId: string;
  slug: string;
  name: string;
  label: string;
  unitPricePaise: number;
  quantity: number;
  imageUrl: string | null;
};

export const CART_KEY = "ecommerce-preview-cart-v1";

export function readCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const data: unknown = JSON.parse(localStorage.getItem(CART_KEY) ?? "[]");
    if (!Array.isArray(data)) return [];
    return data.filter((item): item is CartItem => {
      if (typeof item !== "object" || !item) return false;
      const v = item as Partial<CartItem>;
      return typeof v.variantId === "string" && typeof v.productId === "string"
        && typeof v.slug === "string" && typeof v.name === "string"
        && typeof v.label === "string" && typeof v.unitPricePaise === "number"
        && Number.isSafeInteger(v.unitPricePaise) && v.unitPricePaise >= 0
        && typeof v.quantity === "number" && Number.isInteger(v.quantity)
        && v.quantity > 0 && v.quantity <= 99
        && (v.imageUrl === null || typeof v.imageUrl === "string");
    }).slice(0, 100);
  } catch {
    return [];
  }
}

export function writeCart(items: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("cart-changed"));
}

export function money(paise: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(paise / 100);
}
