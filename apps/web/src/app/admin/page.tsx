import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const instant = false;

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/account");
  const [{ count: products }, { count: applications }, { count: categories }] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("wholesale_applications").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("categories").select("*", { count: "exact", head: true }),
  ]);
  return <main className="mx-auto max-w-5xl px-6 py-16">
    <h1 className="text-3xl font-bold">Store administration</h1>
    <p className="mt-3 text-zinc-600">Overview for authorized administrators. Management actions are coming next.</p>
    <div className="mt-8 grid gap-4 sm:grid-cols-3">
      {[["Products", products], ["Categories", categories], ["Pending wholesale applications", applications]].map(([label, value]) =>
        <section key={String(label)} className="rounded-xl border p-5"><h2 className="text-sm text-zinc-600">{label}</h2><p className="mt-3 text-3xl font-bold">{value ?? "—"}</p></section>
      )}
    </div>
  </main>;
}
