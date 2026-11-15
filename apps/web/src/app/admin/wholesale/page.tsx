import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { reviewWholesale } from "./actions";

export const instant = false;

export default async function AdminWholesalePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; status?: string }>;
}) {
  const db = await createClient();
  const { data: { user }, error: authError } = await db.auth.getUser();
  if (authError || !user) redirect("/login");
  const { data: profile, error: roleError } = await db.from("profiles").select("role").eq("id", user.id).single();
  if (roleError || profile?.role !== "admin") redirect("/account");

  const { data: applications, error } = await db.from("wholesale_applications")
    .select("id,user_id,business_name,gstin,status,created_at,reviewed_at")
    .order("created_at", { ascending: false })
    .limit(200);
  const params = await searchParams;
  const pending = applications?.filter(a => a.status === "pending") ?? [];
  const reviewed = applications?.filter(a => a.status !== "pending") ?? [];

  return <main className="mx-auto max-w-6xl px-6 py-14">
    <Link href="/admin" className="text-sm font-semibold text-emerald-800 hover:underline">← Dashboard</Link>
    <h1 className="mt-5 text-3xl font-bold">Wholesale applications</h1>
    <p className="mt-3 text-slate-600">Review each business carefully. Approval unlocks wholesale price visibility, not checkout.</p>
    {params.status === "updated" && <p role="status" className="mt-5 rounded-lg bg-green-50 p-4 text-green-800">Application updated successfully.</p>}
    {params.error && <p role="alert" className="mt-5 rounded-lg bg-red-50 p-4 text-red-800">Could not update the application. Refresh the page and try again.</p>}
    {error && <p role="alert" className="mt-5 text-red-700">Applications could not be loaded.</p>}
    <h2 className="mt-10 text-xl font-bold">Pending review ({pending.length})</h2>
    <div className="mt-4 space-y-4">{pending.map(a => <article key={a.id} className="rounded-2xl border p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h3 className="text-lg font-semibold">{a.business_name}</h3><p className="mt-1 text-sm text-slate-600">GSTIN: {a.gstin || "Not supplied"}</p><p className="mt-1 text-xs text-slate-500">Applicant ID: {a.user_id} · {new Date(a.created_at).toLocaleDateString("en-IN")}</p></div>
        <div className="flex flex-wrap gap-2">
          <form action={reviewWholesale}><input type="hidden" name="id" value={a.id}/><button name="decision" value="approved" className="rounded-lg bg-emerald-800 px-4 py-2 font-semibold text-white">Approve</button></form>
          <form action={reviewWholesale}><input type="hidden" name="id" value={a.id}/><button name="decision" value="rejected" className="rounded-lg border border-red-300 px-4 py-2 font-semibold text-red-800">Reject</button></form>
        </div>
      </div>
    </article>)}
    {pending.length === 0 && !error && <p className="rounded-xl border p-6 text-slate-500">No applications awaiting review.</p>}</div>
    <h2 className="mt-10 text-xl font-bold">Previous decisions</h2>
    <div className="mt-4 space-y-3">{reviewed.map(a => <article key={a.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4"><span>{a.business_name}</span><span className="text-sm font-semibold capitalize">{a.status}</span></article>)}
    {!reviewed.length && !error && <p className="text-sm text-slate-500">No applications reviewed yet.</p>}</div>
  </main>;
}
