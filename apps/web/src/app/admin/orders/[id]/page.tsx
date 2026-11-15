import Link from "next/link";
import { notFound,redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { money } from "@/lib/cart";
import { formatOrderNumber,orderDate,orderStatus } from "@/lib/orders";

export const instant=false;

type Address = { full_name?:string;phone?:string;line1?:string;line2?:string;city?:string;state?:string;postal_code?:string };

export default async function AdminOrderDetail({params}:{params:Promise<{id:string}>}) {
  const {id}=await params;
  if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) notFound();
  const db=await createClient();
  const {data:{user},error:authError}=await db.auth.getUser();
  if(authError || !user) redirect("/login");
  const {data:profile}=await db.from("profiles").select("role").eq("id",user.id).single();
  if(profile?.role!=="admin") redirect("/account");
  const {data:order,error}=await db.from("orders").select("id,order_number,user_id,created_at,fulfillment_status,payment_status,subtotal_paise,shipping_paise,discount_paise,total_paise,address_snapshot,provider_order_id,paid_at").eq("id",id).maybeSingle();
  if(error||!order) notFound();
  const [{data:items},{data:events}]=await Promise.all([
    db.from("order_items").select("id,product_name,sku,variant_label,quantity,unit_price_paise,line_total_paise,pricing_tier").eq("order_id",id),
    db.from("order_events").select("id,status,note,carrier,tracking_number,created_at").eq("order_id",id).order("created_at",{ascending:false}),
  ]);
  const address=(order.address_snapshot ?? {}) as Address;
  return <main className="mx-auto max-w-5xl px-6 py-14">
    <Link href="/admin/orders" className="text-sm font-semibold text-emerald-800">← All orders</Link>
    <h1 className="mt-5 text-3xl font-semibold">{formatOrderNumber(order.order_number)}</h1>
    <p className="mt-3 text-sm text-zinc-600">Placed {orderDate(order.created_at)} · Customer {order.user_id}</p>
    <div className="mt-8 grid gap-6 md:grid-cols-[1fr_320px]">
      <div className="space-y-6"><section className="rounded-xl border bg-white p-6"><h2 className="text-xl font-semibold">Products</h2><div className="mt-4 divide-y divide-zinc-100">{items?.map(item=><div key={item.id} className="flex justify-between gap-4 py-3"><div><p className="font-medium">{item.product_name}</p><p className="mt-1 text-xs text-zinc-500">{item.sku} · {item.variant_label} · Qty {item.quantity} · {item.pricing_tier}</p></div><strong>{money(item.line_total_paise)}</strong></div>)}</div></section>
      <section className="rounded-xl border bg-white p-6"><h2 className="text-xl font-semibold">Order tracking</h2>{events?.length ? <ol className="mt-4 space-y-4">{events.map(event=><li key={event.id} className="border-l-2 border-emerald-700 pl-4"><p className="font-semibold">{orderStatus(event.status)}</p><p className="text-xs text-zinc-500">{orderDate(event.created_at)}</p>{event.note && <p className="mt-1 text-sm">{event.note}</p>}{event.carrier && <p className="mt-1 text-sm">Carrier: {event.carrier}</p>}{event.tracking_number && <p className="mt-1 text-sm">Tracking: {event.tracking_number}</p>}</li>)}</ol> : <p className="mt-3 text-sm text-zinc-500">No tracking updates.</p>}</section></div>
      <aside className="space-y-6"><section className="rounded-xl border bg-[#e7ece1] p-6"><h2 className="text-xl font-semibold">Order status</h2><p className="mt-4">Fulfillment: <strong>{orderStatus(order.fulfillment_status)}</strong></p><p className="mt-2">Payment: <strong>{orderStatus(order.payment_status)}</strong></p><p className="mt-5 border-t pt-4 text-xl font-semibold">{money(order.total_paise)}</p><p className="mt-2 text-xs text-zinc-600">Read-only until the payment and fulfillment workflow is integrated.</p></section>
      <section className="rounded-xl border bg-white p-6"><h2 className="text-xl font-semibold">Ship to</h2><p className="mt-3 text-sm leading-6">{address.full_name}<br/>{address.line1}<br/>{address.line2 && <>{address.line2}<br/></>}{address.city}, {address.state} {address.postal_code}</p><p className="mt-3 text-sm">Contact: {address.phone}</p></section></aside>
    </div>
  </main>;
}
