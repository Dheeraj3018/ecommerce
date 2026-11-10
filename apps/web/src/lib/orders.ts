export function formatOrderNumber(value: number | string): string {
  return "ORD-" + String(value).padStart(6, "0");
}

export function orderDate(value: string): string {
  return new Intl.DateTimeFormat("en-IN", {day:"2-digit",month:"short",year:"numeric",timeZone:"Asia/Kolkata"}).format(new Date(value));
}

export function orderStatus(value: string): string {
  const statuses: Record<string,string> = {
    pending_payment:"Awaiting payment",processing:"Processing",packed:"Packed",
    shipped:"Shipped",delivered:"Delivered",cancelled:"Cancelled",
    pending:"Pending",paid:"Paid",failed:"Failed",refunded:"Refunded",
    partially_refunded:"Partially refunded",
    created:"Order created",payment_confirmed:"Payment confirmed",
    payment_failed:"Payment failed",refund_initiated:"Refund initiated"
  };
  return statuses[value] ?? value.replaceAll("_"," ");
}
