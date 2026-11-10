import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CheckoutPreview } from "@/components/checkout-preview";
import { StoreHeader, StoreFooter } from "@/components/store-shell";

export const instant = false;

export default async function CheckoutPage() {
  const db=await createClient();
  const {data:{user},error:authError}=await db.auth.getUser();
  if(authError || !user) redirect("/login");
  const {data:addresses,error}=await db.from("customer_addresses")
    .select("id,label,full_name,city,state,postal_code").eq("user_id",user.id).order("created_at",{ascending:false});
  return <div className="store-site"><StoreHeader/><main className="mx-auto max-w-6xl px-6 py-14">
    <Link href="/cart" className="text-sm font-semibold text-emerald-800">← Back to cart</Link>
    <p className="mt-9 text-xs font-bold uppercase tracking-widest text-amber-700">Your next step</p>
    <h1 className="mt-3 text-5xl font-medium tracking-[-0.06em]">Checkout <span className="font-serif italic text-[#ad8154]">preview.</span></h1>
    <p className="mt-4 max-w-xl text-sm leading-6 text-zinc-600">Select an Indian delivery address and calculate a fresh estimate directly from the store database. Checkout and online payments are not yet active.</p>
    {error ? <p role="alert" className="mt-7 rounded-xl bg-red-50 p-5 text-red-800">Your saved addresses are unavailable.</p> : <CheckoutPreview addresses={addresses??[]}/>}
  </main><StoreFooter/></div>;
}
