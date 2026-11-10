import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StoreHeader, StoreFooter } from "@/components/store-shell";
import { saveAddress, deleteAddress } from "./actions";

export const instant = false;

type DeliveryAddress = {
  id: string; label: string; full_name: string; phone: string; line1: string;
  line2: string | null; landmark: string | null; city: string; state: string; postal_code: string;
};

export default async function AddressesPage({ searchParams }: { searchParams: Promise<{error?:string;status?:string}> }) {
  const db = await createClient();
  const { data: { user }, error: authError } = await db.auth.getUser();
  if (authError || !user) redirect("/login");
  const [{ data, error }, params] = await Promise.all([
    db.from("customer_addresses").select("id,label,full_name,phone,line1,line2,landmark,city,state,postal_code").eq("user_id",user.id).order("created_at",{ascending:false}),
    searchParams,
  ]);
  const addresses = (data ?? []) as DeliveryAddress[];
  const fields = (address?: DeliveryAddress) => <div className="grid gap-4 sm:grid-cols-2">
    {address && <input type="hidden" name="id" value={address.id}/>}
    <label className="grid gap-1 text-sm font-medium">Label<input className="rounded-lg border border-zinc-300 bg-white p-3" required maxLength={30} name="label" defaultValue={address?.label ?? "Home"}/></label>
    <label className="grid gap-1 text-sm font-medium">Full name<input className="rounded-lg border border-zinc-300 bg-white p-3" required minLength={2} maxLength={120} name="full_name" defaultValue={address?.full_name}/></label>
    <label className="grid gap-1 text-sm font-medium">Mobile number (10 digits)<input className="rounded-lg border border-zinc-300 bg-white p-3" required inputMode="tel" pattern="[6-9][0-9]{9}" maxLength={10} name="phone" defaultValue={address?.phone}/></label>
    <label className="grid gap-1 text-sm font-medium">PIN code<input className="rounded-lg border border-zinc-300 bg-white p-3" required inputMode="numeric" pattern="[1-9][0-9]{5}" maxLength={6} name="postal_code" defaultValue={address?.postal_code}/></label>
    <label className="grid gap-1 text-sm font-medium sm:col-span-2">House number and street<input className="rounded-lg border border-zinc-300 bg-white p-3" required minLength={5} maxLength={180} name="line1" defaultValue={address?.line1}/></label>
    <label className="grid gap-1 text-sm font-medium sm:col-span-2">Area / apartment (optional)<input className="rounded-lg border border-zinc-300 bg-white p-3" maxLength={180} name="line2" defaultValue={address?.line2 ?? ""}/></label>
    <label className="grid gap-1 text-sm font-medium">Landmark (optional)<input className="rounded-lg border border-zinc-300 bg-white p-3" maxLength={120} name="landmark" defaultValue={address?.landmark ?? ""}/></label>
    <label className="grid gap-1 text-sm font-medium">City<input className="rounded-lg border border-zinc-300 bg-white p-3" required minLength={2} maxLength={100} name="city" defaultValue={address?.city}/></label>
    <label className="grid gap-1 text-sm font-medium sm:col-span-2">State / union territory<input className="rounded-lg border border-zinc-300 bg-white p-3" required minLength={2} maxLength={100} name="state" defaultValue={address?.state}/></label>
  </div>;
  return <div className="store-site"><StoreHeader/><main className="mx-auto max-w-5xl px-6 py-14">
    <Link href="/account" className="text-sm font-semibold text-emerald-800">← Account</Link>
    <div className="mt-8"><p className="text-xs font-semibold uppercase tracking-widest text-amber-700">Delivery details</p><h1 className="mt-3 text-4xl font-semibold tracking-tight">Your addresses.</h1><p className="mt-3 text-sm text-zinc-600">Save your Indian delivery addresses for checkout. Only your signed-in account can access these details.</p></div>
    {params.status && <p role="status" className="mt-6 rounded-lg bg-emerald-50 p-4 text-emerald-900">Address {params.status === "deleted" ? "deleted" : "saved"}.</p>}
    {params.error && <p role="alert" className="mt-6 rounded-lg bg-red-50 p-4 text-red-800">{params.error === "invalid" ? "Please check the address details and try again." : "Unable to save the address. Please try again."}</p>}
    {error && <p role="alert" className="mt-6 text-red-700">Unable to load addresses.</p>}
    <section className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6"><h2 className="text-xl font-semibold">Add delivery address</h2><form action={saveAddress} className="mt-5">{fields()}<button className="mt-5 rounded-full bg-emerald-900 px-7 py-3 text-sm font-semibold text-white">Save address</button></form></section>
    <section className="mt-10"><h2 className="text-xl font-semibold">Saved addresses ({addresses.length})</h2><div className="mt-5 grid gap-5">{addresses.map(a => <details key={a.id} className="rounded-2xl border border-zinc-200 bg-white p-5"><summary className="cursor-pointer text-sm font-semibold">{a.label} — {a.full_name} · {a.city}, {a.state} {a.postal_code}</summary><p className="mt-3 text-sm text-zinc-600">{a.line1}{a.line2 ? ", " + a.line2 : ""}, {a.city}, {a.state} {a.postal_code}<br/>Contact: {a.phone}</p><form action={saveAddress} className="mt-6">{fields(a)}<button className="mt-5 rounded-full bg-emerald-900 px-6 py-3 text-sm font-semibold text-white">Update address</button></form><form action={deleteAddress} className="mt-4"><input type="hidden" name="id" value={a.id}/><button className="text-sm font-semibold text-red-700">Delete address</button></form></details>)}</div>{addresses.length === 0 && !error && <p className="mt-4 text-sm text-zinc-500">No saved addresses yet.</p>}</section>
    <Link href="/checkout" className="mt-8 inline-block text-sm font-semibold text-emerald-800 underline">Continue to checkout preview →</Link>
  </main><StoreFooter/></div>;
}
