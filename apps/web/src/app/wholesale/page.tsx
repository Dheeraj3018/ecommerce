import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { applyForWholesale } from "./actions";

export const instant = false;

export default async function WholesalePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; status?: string }>;
}) {
  const db = await createClient();
  const { data: { user }, error: authError } = await db.auth.getUser();
  if (authError || !user) redirect("/login");
  const { data: applications, error } = await db
    .from("wholesale_applications")
    .select("id,business_name,gstin,status,created_at,reviewed_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  const params = await searchParams;
  const current = applications?.[0];
  const approved = applications?.some((application) => application.status === "approved");
  const pending = applications?.some((application) => application.status === "pending");
  const allowApply = !error && !approved && !pending;

  const errors: Record<string, string> = {
    business: "Please enter a business name between 2 and 160 characters.",
    gstin: "The GSTIN format is invalid. Leave it blank if you do not have one.",
    server: "We couldn't save your application. Please try again later.",
  };

  return <main className="mx-auto max-w-4xl px-6 py-14">
    <Link href="/account" className="text-sm font-semibold text-emerald-800 hover:underline">← Your account</Link>
    <p className="mt-8 text-xs font-bold uppercase tracking-widest text-orange-700">Wholesale purchasing</p>
    <h1 className="mt-2 text-4xl font-bold">Apply for wholesale access</h1>
    <p className="mt-4 text-slate-600">Submit your business details for review. Approved customers can view wholesale prices and minimum quantities for eligible products. Approval does not enable checkout yet.</p>
    {params.error && <p role="alert" className="mt-5 rounded-lg bg-red-50 p-4 text-red-800">{errors[params.error] ?? "Unable to process your request."}</p>}
    {params.status === "submitted" && <p role="status" className="mt-5 rounded-lg bg-emerald-50 p-4 text-emerald-900">Application submitted. An administrator will review it.</p>}
    {params.status === "existing" && <p role="status" className="mt-5 rounded-lg bg-amber-50 p-4 text-amber-900">You already have a pending or approved application.</p>}
    {error && <p role="alert" className="mt-5 text-red-700">Unable to retrieve your applications.</p>}
    {current && <section className="mt-8 rounded-2xl border p-6">
      <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-xl font-bold">Latest application</h2><strong className="rounded-full bg-emerald-50 px-3 py-1 text-sm capitalize text-emerald-900">{current.status}</strong></div>
      <p className="mt-3 text-slate-700">{current.business_name}</p>
      {current.gstin && <p className="mt-1 text-sm text-slate-500">GSTIN: {current.gstin}</p>}
      <p className="mt-3 text-sm text-slate-500">Submitted {new Date(current.created_at).toLocaleDateString("en-IN")}</p>
    </section>}
    {approved && <p className="mt-6 rounded-xl bg-emerald-50 p-5 font-semibold text-emerald-900">Your account has wholesale access. <Link href="/products" className="underline">Explore product prices →</Link></p>}
    {allowApply && <section className="mt-8 rounded-2xl border p-6">
      <h2 className="text-xl font-bold">{current?.status === "rejected" ? "Submit a new application" : "Your business details"}</h2>
      <form action={applyForWholesale} className="mt-5 grid gap-5">
        <label className="grid gap-2 text-sm font-semibold">Business / shop name<input required name="business_name" minLength={2} maxLength={160} className="rounded-lg border p-3 font-normal" placeholder="Your business name"/></label>
        <label className="grid gap-2 text-sm font-semibold">GSTIN (optional)<input name="gstin" maxLength={15} className="rounded-lg border p-3 font-normal uppercase" placeholder="15-character GSTIN"/></label>
        <button className="w-fit rounded-xl bg-emerald-800 px-6 py-3 font-semibold text-white hover:bg-emerald-700">Submit application</button>
      </form>
    </section>}
  </main>;
}
