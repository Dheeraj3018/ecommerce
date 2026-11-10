"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function applyForWholesale(formData: FormData) {
  const db = await createClient();
  const { data: { user }, error: authError } = await db.auth.getUser();
  if (authError || !user) redirect("/login");

  const businessName = String(formData.get("business_name") ?? "").trim();
  const gstin = String(formData.get("gstin") ?? "").trim().toUpperCase();

  if (businessName.length < 2 || businessName.length > 160) redirect("/wholesale?error=business");
  if (gstin && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(gstin)) {
    redirect("/wholesale?error=gstin");
  }

  const { data: existing, error: lookupError } = await db
    .from("wholesale_applications")
    .select("status")
    .eq("user_id", user.id)
    .in("status", ["pending", "approved"])
    .limit(1);
  if (lookupError) redirect("/wholesale?error=server");
  if (existing?.length) redirect("/wholesale?status=existing");

  const { error } = await db.from("wholesale_applications").insert({
    user_id: user.id,
    business_name: businessName,
    gstin: gstin || null,
    status: "pending",
  });
  if (error) redirect("/wholesale?error=server");

  revalidatePath("/wholesale");
  revalidatePath("/admin/wholesale");
  revalidatePath("/admin");
  redirect("/wholesale?status=submitted");
}
