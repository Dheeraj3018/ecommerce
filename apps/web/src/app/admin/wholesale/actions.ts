"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function reviewWholesale(formData: FormData) {
  const db = await createClient();
  const { data: { user }, error: userError } = await db.auth.getUser();
  if (userError || !user) redirect("/login");
  const { data: profile, error: roleError } = await db.from("profiles").select("role").eq("id", user.id).single();
  if (roleError || profile?.role !== "admin") throw new Error("Administrator permission required.");

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("decision") ?? "");
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    redirect("/admin/wholesale?error=invalid");
  }
  if (status !== "approved" && status !== "rejected") redirect("/admin/wholesale?error=invalid");

  const { data: row, error } = await db.from("wholesale_applications")
    .update({ status, reviewed_at: new Date().toISOString() })
    .eq("id", id)
    .eq("status", "pending")
    .select("id")
    .maybeSingle();
  if (error || !row) redirect("/admin/wholesale?error=update");

  revalidatePath("/admin");
  revalidatePath("/admin/wholesale");
  revalidatePath("/wholesale");
  revalidatePath("/products");
  redirect("/admin/wholesale?status=updated");
}
