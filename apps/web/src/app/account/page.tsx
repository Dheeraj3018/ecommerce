import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";

export const instant = false;

export default async function Account() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/login");
  return <main className="mx-auto w-full max-w-3xl px-6 py-20">
    <h1 className="text-3xl font-bold">Your account</h1>
    <p className="mt-4">Signed in as {user.email}</p>
    <div className="mt-8 rounded-2xl border p-6"><h2 className="text-xl font-semibold">Your orders</h2><p className="mt-2 text-sm text-zinc-600">Track future orders and review their payment and delivery status.</p><Link href="/account/orders" className="mt-4 inline-flex rounded-lg bg-emerald-800 px-5 py-3 font-semibold text-white">View order history →</Link></div>
    <div className="mt-5 rounded-2xl border p-6"><h2 className="text-xl font-semibold">Delivery addresses</h2><p className="mt-2 text-sm text-zinc-600">Save and manage your Indian delivery details for a smoother checkout.</p><Link href="/account/addresses" className="mt-4 inline-flex rounded-lg bg-emerald-800 px-5 py-3 font-semibold text-white">Manage addresses →</Link></div>
    <div className="mt-5 rounded-2xl border p-6"><h2 className="text-xl font-semibold">Wholesale purchasing</h2><p className="mt-2 text-sm text-zinc-600">Apply for business pricing or track your existing application.</p><Link href="/wholesale" className="mt-4 inline-flex rounded-lg bg-emerald-800 px-5 py-3 font-semibold text-white">Wholesale account →</Link></div>
    <form action={signOut} className="mt-8"><button className="rounded-lg border px-5 py-3">Sign out</button></form>
  </main>;
}
