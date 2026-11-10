import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StoreHeader, StoreFooter } from "@/components/store-shell";
import { money } from "@/lib/cart";
import { formatOrderNumber, orderDate, orderStatus } from "@/lib/orders";

export const instant = false;

export default async function OrderHistory() {
  const db = await createClient();
  const { data: { user }, error: authError } = await db.auth.getUser();
  if (authError || !user) redirect("/login");
  const { data: orders, error } = await db.from("orders")
    .select("id,order_number,created_at,fulfillment_status,payment_status,total_paise,currency")
    .eq("user_id",user.id).order("created_at",{ascending:false}).limit(50);
  return <div className="store-site"><StoreHeader/><main className="mx-auto max-w-5xl px-6 py-14">
    <Link href="/account" className="text-sm font-semibold text-emerald-800 hover:underline">← My account</Link>
    <p className="mt-9 text-xs font-bold uppercase tracking-widest text-amber-700">My purchases</p>
    <h1 className="mt-3 text-5xl font-medium tracking-[-0.06em]">Order <span className="font-serif italic text-[#ad8154]">history.</span></h1>
    <p className="mt-4 text-sm text-zinc-600">View your previous orders, payment status and delivery progress.</p>
    {error && <p role="alert" className="mt-8 rounded-xl bg-red-50 p-5 text-red-800">Unable to load orders right now.</p>}
    <div className="mt-9 grid gap-4">
      {orders?.map(order=><Link key={order.id} href={`/account/orders/${order.id}`} className="block rounded-2xl border border-[#d5dccc] bg-white p-6 transition hover:border-emerald-700 hover:shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4"><div><h2 className="text-xl font-semibold">{formatOrderNumber(order.order_number)}</h2><p className="mt-1 text-sm text-zinc-500">{orderDate(order.created_at)}</p></div><strong className="text-lg text-emerald-900">{money(order.total_paise)}</strong></div>
        <div className="mt-5 flex flex-wrap justify-between gap-3 border-t border-zinc-100 pt-4 text-sm"><span>Order: <strong>{orderStatus(order.fulfillment_status)}</strong> · Payment: <strong>{orderStatus(order.payment_status)}</strong></span><span className="font-semibold text-emerald-800">View details →</span></div>
      </Link>)}
      {!error && orders?.length === 0 && <section className="rounded-2xl border border-[#d5dccc] bg-white px-8 py-16 text-center"><div className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-50 text-emerald-900"><svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M5 3h14v18l-3-2-4 2-4-2-3 2z"/><path d="M9 9h6m-6 4h6"/></svg></div><h2 className="mt-5 text-2xl font-semibold">No orders yet</h2><p className="mx-auto mt-3 max-w-sm text-sm text-zinc-600">Your future orders will appear here once secure checkout and online payment are enabled.</p><Link href="/products" className="mt-6 inline-block rounded-full bg-emerald-900 px-6 py-3 text-sm font-semibold text-white">Browse products</Link></section>}
    </div>
    <p className="mt-8 text-xs text-zinc-500">Online checkout is not yet enabled. This page will display orders after the payment integration is complete.</p>
  </main><StoreFooter/></div>;
}
