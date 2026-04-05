"use client";

import type { OrderSummary, OrdersPage as OrdersPageData } from "@orderly/types";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/auth-guard";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { OrderStatusBadge } from "@/components/order-status-badge";
import {
  ArrowLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  ReceiptIcon,
  TruckIcon,
} from "@/components/icons";
import { formatRupees } from "@/data/mock-data";
import { getOrders } from "@/lib/api";

const PAGE_SIZE = 6;

export default function OrdersPage() {
  const [data, setData] = useState<OrdersPageData | null>(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadOrders = async () => {
      try {
        const response = await getOrders(page, PAGE_SIZE);
        if (!cancelled) {
          setData(response.data);
        }
      } catch {
        if (!cancelled) {
          setData(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadOrders();
    const intervalId = window.setInterval(() => {
      void loadOrders();
    }, 20000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [page]);

  const orders: OrderSummary[] = data?.orders.content ?? [];
  const activeOrders = data?.activeOrders ?? [];

  return (
    <AuthGuard requireCustomerRole>
      <div className="min-h-screen bg-cream">
        <Header />

        <main>
          <section className="border-b border-orange-100 bg-[linear-gradient(180deg,rgba(255,248,238,0.98),rgba(255,248,238,0.8))]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand">
                Orders
              </p>
              <h1 className="mt-4 font-serif text-4xl font-bold leading-tight md:text-5xl">
                Track what is on the way and revisit your usual orders
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-subtle">
                Keep an eye on active deliveries, then scroll through past meals when you want to reorder a favourite.
              </p>
            </div>
          </section>

          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {loading ? (
              <div className="rounded-[2rem] border border-orange-100 bg-white p-10 text-center text-sm text-subtle">
                Loading orders...
              </div>
            ) : activeOrders.length ? (
              <div className="grid gap-6">
                {activeOrders.map((activeOrder) => (
                  <div
                    key={activeOrder.id}
                    className="rounded-[2rem] bg-[radial-gradient(circle_at_top_left,_rgba(255,214,102,0.88),_transparent_26%),linear-gradient(135deg,_#d35b1f_0%,_#e4a11b_42%,_#138850_100%)] p-6 text-white shadow-[0_30px_80px_rgba(31,41,55,0.18)] md:p-8"
                  >
                    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_280px] lg:items-end">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <p className="rounded-full bg-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-white">
                            Active Order
                          </p>
                          <OrderStatusBadge status={activeOrder.status} />
                        </div>
                        <h2 className="mt-5 font-serif text-3xl font-bold md:text-4xl">
                          {activeOrder.restaurantName}
                        </h2>
                        <p className="mt-3 max-w-2xl text-white/85">
                          {activeOrder.itemCount} items, {formatRupees(activeOrder.total)} total.
                          {` ${activeOrder.estimatedArrival ?? ""}`}
                        </p>

                        <div className="mt-6 grid gap-3 sm:grid-cols-4">
                          <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
                            <div className="flex items-center gap-2 text-white/80">
                              <TruckIcon className="h-5 w-5" />
                              <span className="text-xs font-semibold uppercase tracking-[0.24em]">
                                Delivery
                              </span>
                            </div>
                            <p className="mt-3 text-lg font-semibold">
                              {activeOrder.estimatedArrival}
                            </p>
                          </div>
                          <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
                            <div className="flex items-center gap-2 text-white/80">
                              <ReceiptIcon className="h-5 w-5" />
                              <span className="text-xs font-semibold uppercase tracking-[0.24em]">
                                Payment
                              </span>
                            </div>
                            <p className="mt-3 text-lg font-semibold">
                              {activeOrder.paymentMethod}
                            </p>
                          </div>
                          <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
                            <div className="flex items-center gap-2 text-white/80">
                              <ClockIcon className="h-5 w-5" />
                              <span className="text-xs font-semibold uppercase tracking-[0.24em]">
                                Order Time
                              </span>
                            </div>
                            <p className="mt-3 text-lg font-semibold">{activeOrder.timeLabel}</p>
                          </div>
                          <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/80">
                              Rider
                            </p>
                            <p className="mt-3 text-lg font-semibold">
                              {activeOrder.deliveryPartner?.name ?? "Dispatching now"}
                            </p>
                            <p className="mt-1 text-sm text-white/75">
                              {activeOrder.deliveryPartner
                                ? `${activeOrder.deliveryPartner.vehicleType} · ${activeOrder.deliveryPartner.phone}`
                                : "Assignment in progress"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-[1.75rem] border border-white/25 bg-white/12 p-5 backdrop-blur-md">
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
                          Live timeline
                        </p>
                        <div className="mt-5 space-y-4">
                          {activeOrder.timeline.map((entry) => (
                            <div key={`${entry.label}-${entry.timestamp}`} className="flex gap-3">
                              <div className="mt-1 h-3 w-3 rounded-full bg-white" />
                              <div>
                                <p className="font-semibold text-white">{entry.label}</p>
                                <p className="text-sm text-white/75">{entry.time}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        <Link
                          href={`/orders/${activeOrder.id}`}
                          className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold tracking-wide text-brand transition-colors hover:bg-orange-50"
                        >
                          View order details
                          <ChevronRightIcon className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </section>

          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand">
                  History
                </p>
                <h2 className="mt-3 font-serif text-3xl font-bold">Past orders</h2>
              </div>
              <div className="rounded-2xl border border-orange-100 bg-white px-5 py-4 text-right shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand">
                  Page
                </p>
                <p className="mt-1 font-serif text-3xl font-bold">
                  {page + 1}
                  <span className="ml-2 text-lg text-subtle">
                    / {Math.max(data?.orders.totalPages ?? 1, 1)}
                  </span>
                </p>
              </div>
            </div>

            <div className="mt-8 grid gap-5">
              {orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="group rounded-[2rem] border border-orange-100 bg-white p-5 shadow-[0_18px_60px_rgba(211,91,31,0.08)] transition-transform hover:-translate-y-0.5"
                >
                  <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <OrderStatusBadge status={order.status} />
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-subtle">
                          Order #{order.id}
                        </p>
                      </div>
                      <h3 className="mt-4 font-serif text-3xl font-bold leading-tight transition-colors group-hover:text-brand">
                        {order.restaurantName}
                      </h3>
                      <p className="mt-2 text-sm text-subtle">
                        {order.restaurantCuisine} · {order.itemCount} items
                      </p>
                      <div className="mt-4 flex flex-wrap gap-4 text-sm text-subtle">
                        <span>{order.timeLabel}</span>
                        <span>{order.deliveredAt ?? order.paymentMethod}</span>
                        <span>{order.paymentMethod}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 md:block md:text-right">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand">
                          Total
                        </p>
                        <p className="mt-1 font-serif text-3xl font-bold">
                          {formatRupees(order.total)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-sm font-semibold tracking-wide text-brand md:mt-8 md:justify-end">
                        View details
                        <ChevronRightIcon className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-4 rounded-[1.75rem] border border-orange-100 bg-[var(--color-card)] p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand">
                  Order history
                </p>
                <p className="mt-2 text-sm text-subtle">
                  Every completed order stays in one place for quick re-checks and repeat cravings.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.max(current - 1, 0))}
                  disabled={page === 0}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold transition-colors ${
                    page === 0
                      ? "pointer-events-none border border-stone-200 bg-stone-100 text-stone-400"
                      : "border border-orange-200 bg-white text-brand hover:border-brand"
                  }`}
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setPage((current) =>
                      Math.min(current + 1, Math.max((data?.orders.totalPages ?? 1) - 1, 0))
                    )
                  }
                  disabled={page >= Math.max((data?.orders.totalPages ?? 1) - 1, 0)}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold transition-colors ${
                    page >= Math.max((data?.orders.totalPages ?? 1) - 1, 0)
                      ? "pointer-events-none border border-stone-200 bg-stone-100 text-stone-400"
                      : "bg-brand text-white hover:bg-brand/90"
                  }`}
                >
                  Next
                  <ChevronRightIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </AuthGuard>
  );
}
