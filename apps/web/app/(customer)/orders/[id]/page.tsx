import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { OrderStatusBadge } from "@/components/order-status-badge";
import {
  ArrowLeftIcon,
  ClockIcon,
  ReceiptIcon,
  TruckIcon,
} from "@/components/icons";
import { formatRupees, getOrderById } from "@/data/mock-data";

function getSubtotal(total: number) {
  return Math.round(total * 0.84);
}

export default async function OrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = getOrderById(id);

  if (!order) {
    notFound();
  }

  const subtotal = getSubtotal(order.total);
  const taxesAndFees = order.total - subtotal;

  return (
    <div className="min-h-screen bg-cream">
      <Header />

      <main>
        <section className="border-b border-orange-100 bg-[linear-gradient(180deg,rgba(255,248,238,0.98),rgba(255,248,238,0.8))]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
            <Link
              href="/orders"
              className="inline-flex items-center gap-2 text-sm font-semibold tracking-wide text-brand transition-colors hover:text-brand/80"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back to orders
            </Link>

            <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_340px] lg:items-end">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <OrderStatusBadge status={order.status} />
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-subtle">
                    {order.id}
                  </p>
                </div>
                <h1 className="mt-4 font-serif text-4xl font-bold leading-tight md:text-5xl">
                  {order.restaurantName}
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-subtle">
                  {order.restaurantCuisine} · {order.itemCount} items ·{" "}
                  {order.timeLabel}
                </p>
              </div>

              <div className="rounded-[1.75rem] border border-orange-100 bg-white p-6 shadow-[0_18px_60px_rgba(211,91,31,0.08)]">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand">
                  Order total
                </p>
                <p className="mt-3 font-serif text-5xl font-bold">
                  {formatRupees(order.total)}
                </p>
                <p className="mt-3 text-sm text-subtle">
                  {order.estimatedArrival ?? order.deliveredAt ?? order.paymentMethod}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.25fr)_360px]">
            <div className="space-y-8">
              <div className="rounded-[2rem] border border-orange-100 bg-white p-6 shadow-[0_18px_60px_rgba(211,91,31,0.08)]">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand">
                  Items
                </p>
                <h2 className="mt-3 font-serif text-3xl font-bold">
                  Order breakdown
                </h2>

                <div className="mt-6 divide-y divide-orange-100">
                  {order.items.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between gap-4 py-4"
                    >
                      <div>
                        <p className="font-semibold text-foreground">
                          {item.name}
                        </p>
                        <p className="mt-1 text-sm text-subtle">
                          Qty {item.quantity}
                        </p>
                      </div>
                      <p className="font-semibold text-foreground">
                        {formatRupees(item.price)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[2rem] border border-orange-100 bg-[var(--color-card)] p-6 shadow-[0_18px_60px_rgba(211,91,31,0.08)]">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand">
                  Timeline
                </p>
                <h2 className="mt-3 font-serif text-3xl font-bold">
                  Fulfilment status
                </h2>

                <div className="mt-6 space-y-5">
                  {order.timeline.map((entry, index) => (
                    <div key={entry.label} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`h-4 w-4 rounded-full ${
                            entry.complete ? "bg-brand" : "border-2 border-brand/40 bg-transparent"
                          }`}
                        />
                        {index < order.timeline.length - 1 ? (
                          <div className="mt-2 h-10 w-px bg-orange-200" />
                        ) : null}
                      </div>
                      <div className="-mt-1 pb-4">
                        <p className="font-semibold text-foreground">
                          {entry.label}
                        </p>
                        <p className="text-sm text-subtle">{entry.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-[2rem] border border-orange-100 bg-white p-6 shadow-[0_18px_60px_rgba(211,91,31,0.08)]">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand">
                  Delivery
                </p>
                <div className="mt-5 space-y-4">
                  <div className="flex gap-3">
                    <TruckIcon className="h-5 w-5 text-brand" />
                    <div>
                      <p className="font-semibold text-foreground">Address</p>
                      <p className="text-sm leading-6 text-subtle">
                        {order.deliveryAddress}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <ClockIcon className="h-5 w-5 text-brand" />
                    <div>
                      <p className="font-semibold text-foreground">Timing</p>
                      <p className="text-sm leading-6 text-subtle">
                        {order.estimatedArrival ?? order.deliveredAt ?? order.timeLabel}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <ReceiptIcon className="h-5 w-5 text-brand" />
                    <div>
                      <p className="font-semibold text-foreground">Payment</p>
                      <p className="text-sm leading-6 text-subtle">
                        {order.paymentMethod}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-orange-100 bg-white p-6 shadow-[0_18px_60px_rgba(211,91,31,0.08)]">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand">
                  Charges
                </p>
                <div className="mt-5 space-y-4 text-sm">
                  <div className="flex items-center justify-between text-subtle">
                    <span>Subtotal</span>
                    <span>{formatRupees(subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between text-subtle">
                    <span>Taxes & fees</span>
                    <span>{formatRupees(taxesAndFees)}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-orange-100 pt-4 font-semibold text-foreground">
                    <span>Total paid</span>
                    <span>{formatRupees(order.total)}</span>
                  </div>
                </div>
              </div>

              <Link
                href="/explore"
                className="block rounded-[2rem] bg-brand px-6 py-5 text-center text-sm font-semibold uppercase tracking-[0.24em] text-white transition-colors hover:bg-brand/90"
              >
                Explore more restaurants
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
