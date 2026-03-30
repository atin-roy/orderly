import type { MockOrderStatus } from "@/data/mock-data";

const statusClasses: Record<MockOrderStatus, string> = {
  Preparing: "bg-amber-100 text-amber-800 border-amber-200",
  "Out for delivery": "bg-emerald-100 text-emerald-800 border-emerald-200",
  Delivered: "bg-stone-100 text-stone-700 border-stone-200",
  Cancelled: "bg-rose-100 text-rose-700 border-rose-200",
};

export function OrderStatusBadge({ status }: { status: MockOrderStatus }) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] ${statusClasses[status]}`}
    >
      {status}
    </span>
  );
}
