import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StoreHeader, StoreFooter } from "@/components/store-shell";
import { money } from "@/lib/cart";
import { formatOrderNumber, orderDate, orderStatus } from "@/lib/orders";

export const instant = false;

type AddressSnapshot = {
  label?: string; full_name?: string; phone?: string; line1?: string; line2?: string | null;
  city?: string; state?: string; postal_code?: string;
};

export default async function OrderDetail({params}:{params:Promise<{id:string}>}) {
  const {id}=await params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) notFound();
  const db=await createClient();
  const {data:{user},error:authError}=await db.auth.getUser();
  if (authError || !user) redirect("/login");
  const {data:order,error}=await db.from("orders")
    .select("id,order_number,created_at,fulfillment_status,payment_status,subtotal_paise,shipping_paise,discount_paise,total_paise,address_snapshot,paid_at")
    .eq("id",id).eq("user_id",user.id).maybeSingle();
  if (error || !order) notFound();
  const [{data:items},{data:events}]=await Promise.all([
    db.from("order_items").select("id,product_name,sku,variant_label,quantity,unit_price_paise,line_total_paise,pricing_tier").eq("order_id",id),
    db.from("order_events").select("id,status,note,carrier,tracking_number,created_at").eq("order_id",id).order("created_at",{ascending:false}),
  ]);
  const address=(order.address_snapshot ?? {}) as AddressSnapshot;
  return <div className="store-site"><StoreHeader/><main className="mx-auto max-w-5xl px-6 py-14">
    <Link href="/account/orders" className="text-sm font-semibold text-emerald-800">← All orders</Link>
    <p className="mt-9 text-xs font-bold uppercase tracking-widest text-amber-700">Your purchase</p>
    <h1 className="mt-3 text-4xl font-medium tracking-[-0.05em]">{formatOrderNumber(order.order_number)}</h1>
    <p className="mt-3 text-sm text-zinc-600">Placed {orderDate(order.created_at)} · {orderStatus(order.fulfillment_status)} · Payment {orderStatus(order.payment_status)}</p>
    <div className="mt-8 grid gap-7 lg:grid-cols-[minmax(0,1fr)_310px]">
      <div className="space-y-6">
        <section className="rounded-2xl border border-zinc-200 bg-white p-6"><h2 className="text-xl font-semibold">Order items</h2><div className="mt-4 divide-y divide-zinc-100">{items?.map(item=><div key={item.id} className="flex justify-between gap-4 py-4 text-sm"><div><p className="font-semibold">{item.product_name}</p><p className="mt-1 text-zinc-500">{item.variant_label} · SKU {item.sku} · Qty {item.quantity}</p>{item.pricing_tier==="wholesale" && <span className="mt-1 block text-emerald-800">Wholesale</span>}</div><strong>{money(item.line_total_paise)}</strong></div>)}</div></section>
        <section className="rounded-2xl border border-zinc-200 bg-white p-6"><h2 className="text-xl font-semibold">Tracking timeline</h2>{events?.length ? <ol className="mt-5 space-y-5">{events.map(event=><li key={event.id} className="border-l-2 border-emerald-700 pl-4"><p className="font-semibold">{orderStatus(event.status)}</p><p className="mt-1 text-xs text-zinc-500">{orderDate(event.created_at)}</p>{event.note && <p className="mt-2 text-sm text-zinc-700">{event.note}</p>}{event.carrier && <p className="mt-2 text-sm">Carrier: {event.carrier}</p>}{event.tracking_number && <p className="mt-1 text-sm">Tracking: {event.tracking_number}</p>}</li>)}</ol> : <p className="mt-4 text-sm text-zinc-500">No tracking updates yet.</p>}</section>
      </div>
      <aside className="space-y-6">
        <section className="rounded-2xl border border-zinc-200 bg-[#e8ede3] p-6"><h2 className="text-xl font-semibold">Payment summary</h2><div className="mt-5 space-y-3 text-sm"><div className="flex justify-between"><span>Subtotal</span><span>{money(order.subtotal_paise)}</span></div><div className="flex justify-between"><span>Shipping</span><span>{money(order.shipping_paise)}</span></div><div className="flex justify-between"><span>Discount</span><span>−{money(order.discount_paise)}</span></div><div className="flex justify-between border-t border-emerald-900/20 pt-4 text-lg font-semibold"><span>Total</span><span>{money(order.total_paise)}</span></div></div></section>
        <section className="rounded-2xl border border-zinc-200 bg-white p-6"><h2 className="text-xl font-semibold">Delivery address</h2><p className="mt-4 text-sm leading-6 text-zinc-700">{address.full_name}<br/>{address.line1}<br/>{address.line2 && <>{address.line2}<br/></>}{address.city}, {address.state} {address.postal_code}</p></section>
      </aside>
    </div>
  </main><StoreFooter/></div>;
}
