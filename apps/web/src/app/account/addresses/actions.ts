"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const idPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function field(data: FormData, name: string, max: number) {
  const raw = data.get(name);
  return (typeof raw === "string" ? raw : "").trim().slice(0,max + 1);
}

export async function saveAddress(data: FormData) {
  const db = await createClient();
  const { data: { user }, error } = await db.auth.getUser();
  if (error || !user) redirect("/login");
  const id = field(data, "id", 36);
  if (id && !idPattern.test(id)) redirect("/account/addresses?error=invalid");
  const label = field(data,"label",30) || "Home";
  const full_name = field(data,"full_name",120);
  const phone = field(data,"phone",20).replace(/[\s-]/g,"");
  const line1 = field(data,"line1",180);
  const line2 = field(data,"line2",180) || null;
  const landmark = field(data,"landmark",120) || null;
  const city = field(data,"city",100);
  const state = field(data,"state",100);
  const postal_code = field(data,"postal_code",6);
  if (label.length > 30 || full_name.length < 2 || full_name.length > 120 ||
      !/^[6-9][0-9]{9}$/.test(phone) || line1.length < 5 || line1.length > 180 ||
      (line2 && line2.length > 180) || (landmark && landmark.length > 120) ||
      city.length < 2 || city.length > 100 || state.length < 2 || state.length > 100 ||
      !/^[1-9][0-9]{5}$/.test(postal_code)) redirect("/account/addresses?error=invalid");
  const payload = {user_id:user.id,label,full_name,phone,line1,line2,landmark,city,state,postal_code,country_code:"IN",updated_at:new Date().toISOString()};
  const result = id
    ? await db.from("customer_addresses").update(payload).eq("id",id).eq("user_id",user.id).select("id").maybeSingle()
    : await db.from("customer_addresses").insert(payload).select("id").maybeSingle();
  if (result.error || !result.data) redirect("/account/addresses?error=save");
  revalidatePath("/account/addresses");
  revalidatePath("/checkout");
  redirect("/account/addresses?status=saved");
}

export async function deleteAddress(data: FormData) {
  const db = await createClient();
  const { data: { user }, error } = await db.auth.getUser();
  if (error || !user) redirect("/login");
  const id = field(data, "id",36);
  if (!idPattern.test(id)) redirect("/account/addresses?error=invalid");
  const { data: row, error: deleteError } = await db.from("customer_addresses").delete().eq("id",id).eq("user_id",user.id).select("id").maybeSingle();
  if (deleteError || !row) redirect("/account/addresses?error=save");
  revalidatePath("/account/addresses");
  revalidatePath("/checkout");
  redirect("/account/addresses?status=deleted");
}
