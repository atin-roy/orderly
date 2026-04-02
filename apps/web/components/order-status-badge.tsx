import type { OrderStatus } from "@orderly/types";

const statusClasses: Record<OrderStatus, string> = {
  PLACED: "bg-orange-100 text-orange-800 border-orange-200",
  ACCEPTED: "bg-blue-100 text-blue-800 border-blue-200",
  PREPARING: "bg-amber-100 text-amber-800 border-amber-200",
  READY: "bg-violet-100 text-violet-800 border-violet-200",
  PICKED_UP: "bg-emerald-100 text-emerald-800 border-emerald-200",
  DELIVERED: "bg-stone-100 text-stone-700 border-stone-200",
  CANCELLED: "bg-rose-100 text-rose-700 border-rose-200",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] ${statusClasses[status]}`}
    >
      {status.replaceAll("_", " ")}
    </span>
  );
}
