import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { money } from "@/lib/cart";
import { formatOrderNumber,orderDate,orderStatus } from "@/lib/orders";

export const instant=false;

export default async function AdminOrders({searchParams}:{searchParams:Promise<{status?:string}>}) {
  const db=await createClient();
  const {data:{user},error:authError}=await db.auth.getUser();
  if(authError || !user) redirect("/login");
  const {data:profile}=await db.from("profiles").select("role").eq("id",user.id).single();
  if(profile?.role!=="admin") redirect("/account");
  const params=await searchParams;
  const filter=["pending_payment","processing","packed","shipped","delivered","cancelled"].includes(params.status??"") ? params.status : "";
  let query=db.from("orders").select("id,order_number,user_id,created_at,fulfillment_status,payment_status,total_paise").order("created_at",{ascending:false}).limit(100);
  if(filter) query=query.eq("fulfillment_status",filter);
  const {data:orders,error}=await query;
  return <main className="mx-auto max-w-6xl px-6 py-14">
    <Link href="/admin" className="text-sm font-semibold text-emerald-800">← Admin dashboard</Link>
    <h1 className="mt-5 text-3xl font-bold">Order management</h1>
    <p className="mt-3 text-sm text-zinc-600">Read-only order dashboard. Verified payment services will create orders and control payment status in a later milestone.</p>
    <nav className="mt-7 flex flex-wrap gap-2" aria-label="Order filters">{[{value:"",label:"All orders"},...["pending_payment","processing","packed","shipped","delivered","cancelled"].map(s=>({value:s,label:orderStatus(s)}))].map(option=><Link key={option.value} href={option.value ? `/admin/orders?status=${option.value}` : "/admin/orders"} className={`rounded-full px-4 py-2 text-sm ${filter===option.value?"bg-emerald-900 text-white":"border border-zinc-300 text-emerald-900"}`}>{option.label}</Link>)}</nav>
    {error && <p role="alert" className="mt-8 text-red-700">Unable to retrieve orders.</p>}
    <div className="mt-7 grid gap-3">{orders?.map(order=><Link key={order.id} href={`/admin/orders/${order.id}`} className="rounded-xl border border-zinc-200 bg-white p-5 transition hover:border-emerald-700"><div className="flex flex-wrap items-center justify-between gap-4"><div><h2 className="font-semibold">{formatOrderNumber(order.order_number)}</h2><p className="mt-1 text-xs text-zinc-500">{orderDate(order.created_at)} · Customer ID: {order.user_id}</p></div><div className="text-right"><p className="font-bold">{money(order.total_paise)}</p><p className="mt-1 text-xs text-zinc-600">{orderStatus(order.fulfillment_status)} · {orderStatus(order.payment_status)}</p></div></div></Link>)}</div>
    {!error && orders?.length===0 && <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-12 text-center"><h2 className="text-xl font-semibold">No orders to display</h2><p className="mt-3 text-sm text-zinc-600">Orders will appear after secure payment checkout is enabled.</p></div>}
  </main>;
}
