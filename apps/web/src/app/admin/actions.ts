"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const paths = ["/", "/products", "/admin", "/admin/products", "/admin/categories"];
const refresh = () => paths.forEach((path) => revalidatePath(path));

async function requireAdmin() {
  const db = await createClient();
  const { data: { user }, error } = await db.auth.getUser();
  if (error || !user) redirect("/login");
  const { data: profile, error: roleError } = await db.from("profiles").select("role").eq("id", user.id).single();
  if (roleError || profile?.role !== "admin") throw new Error("Administrator permission required.");
  return db;
}

function string(form: FormData, key: string, max = 160) {
  return String(form.get(key) ?? "").trim().slice(0, max);
}
function slug(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
function uuid(form: FormData, key: string) {
  const value = string(form, key, 36);
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) throw new Error("Invalid record ID.");
  return value;
}
function boolean(form: FormData, key: string) {
  return form.get(key) === "on";
}
function number(form: FormData, key: string, minimum = 0) {
  const raw = string(form, key, 24);
  const parsed = Number(raw);
  if (!raw || !Number.isSafeInteger(parsed) || parsed < minimum) throw new Error("Invalid numeric value: " + key);
  return parsed;
}
function paise(form: FormData, key: string, optional = false) {
  const raw = string(form, key, 24);
  if (optional && raw === "") return null;
  if (!/^(0|[1-9]\d{0,8})(\.\d{1,2})?$/.test(raw)) throw new Error("Invalid price.");
  const [rupees, fraction = ""] = raw.split(".");
  return Number(rupees) * 100 + Number(fraction.padEnd(2, "0"));
}
function categoryPayload(form: FormData) {
  const name = string(form, "name");
  const identifier = slug(string(form, "slug") || name);
  if (!name || !identifier) throw new Error("Category name and slug are required.");
  return { name, slug: identifier, active: boolean(form, "active") };
}
function productPayload(form: FormData) {
  const name = string(form, "name");
  const identifier = slug(string(form, "slug") || name);
  if (!name || !identifier) throw new Error("Product name and slug are required.");
  const rawCategory = string(form, "category_id");
  const category_id = rawCategory || null;
  if (category_id && !/^[0-9a-f-]{36}$/i.test(category_id)) throw new Error("Invalid category.");
  return { name, slug: identifier, description: string(form, "description", 3000) || null, category_id, active: boolean(form, "active") };
}

export async function saveCategory(form: FormData) {
  const db = await requireAdmin();
  const id = form.get("id") ? uuid(form, "id") : null;
  const payload = categoryPayload(form);
  const query = id ? db.from("categories").update(payload).eq("id", id) : db.from("categories").insert(payload);
  const { error } = await query;
  if (error) throw new Error("Unable to save category: " + error.message);
  refresh();
  redirect("/admin/categories");
}

export async function deleteCategory(form: FormData) {
  const db = await requireAdmin();
  const { error } = await db.from("categories").delete().eq("id", uuid(form, "id"));
  if (error) throw new Error("Unable to delete category. Remove linked products first.");
  refresh();
}

export async function saveProduct(form: FormData) {
  const db = await requireAdmin();
  const id = form.get("id") ? uuid(form, "id") : null;
  const payload = productPayload(form);
  const query = id ? db.from("products").update(payload).eq("id", id) : db.from("products").insert(payload);
  const { error } = await query;
  if (error) throw new Error("Unable to save product: " + error.message);
  refresh();
  redirect("/admin/products");
}

export async function deleteProduct(form: FormData) {
  const db = await requireAdmin();
  const { error } = await db.from("products").delete().eq("id", uuid(form, "id"));
  if (error) throw new Error("Unable to delete product: " + error.message);
  refresh();
}

export async function saveVariant(form: FormData) {
  const db = await requireAdmin();
  const id = form.get("id") ? uuid(form, "id") : null;
  const product_id = uuid(form, "product_id");
  const sku = string(form, "sku", 100);
  if (!sku) throw new Error("SKU is required.");
  const label = string(form, "label", 120);
  const payload = {
    product_id, sku, attributes: label ? { size: label } : {},
    retail_price_paise: paise(form, "retail_price"),
    wholesale_price_paise: paise(form, "wholesale_price", true),
    wholesale_min_qty: number(form, "wholesale_min_qty", 1),
    stock_qty: number(form, "stock_qty"),
    low_stock_threshold: number(form, "low_stock_threshold"),
    active: boolean(form, "active"),
  };
  const query = id ? db.from("product_variants").update(payload).eq("id", id) : db.from("product_variants").insert(payload);
  const { error } = await query;
  if (error) throw new Error("Unable to save variant: " + error.message);
  refresh();
  redirect("/admin/products/" + product_id);
}

export async function deleteVariant(form: FormData) {
  const db = await requireAdmin();
  const id = uuid(form, "id");
  const { error } = await db.from("product_variants").delete().eq("id", id);
  if (error) throw new Error("Unable to delete variant: " + error.message);
  refresh();
}

export async function attachProductImage(productId: string, path: string) {
  const db = await requireAdmin();
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(productId)) {
    throw new Error("Invalid product identifier.");
  }
  if (!new RegExp("^" + productId + "/[0-9a-f-]{36}[.](jpg|png|webp)$", "i").test(path)) {
    throw new Error("Invalid image path.");
  }
  const { data, error } = await db.from("products").update({ image_path: path }).eq("id", productId).select("id").single();
  if (error || !data) throw new Error("Unable to save product image.");
  refresh();
  revalidatePath("/products/" + productId);
}
