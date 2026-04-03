"use client";

import type { DeliveryDashboard } from "@orderly/types";
import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/auth-guard";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { formatRupees } from "@/data/mock-data";
import { getDeliveryDashboard } from "@/lib/api";

export default function DeliveriesPage() {
  const [dashboard, setDashboard] = useState<DeliveryDashboard | null>(null);

  useEffect(() => {
    let ignore = false;

    const loadDashboard = async () => {
      try {
        const response = await getDeliveryDashboard();
        if (!ignore) {
          setDashboard(response.data);
        }
      } catch {
        if (!ignore) {
          setDashboard(null);
        }
      }
    };

    void loadDashboard();
    const intervalId = window.setInterval(() => {
      void loadDashboard();
    }, 20000);

    return () => {
      ignore = true;
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <AuthGuard allowedRoles={["DELIVERY_PARTNER"]}>
      <div className="min-h-screen bg-cream">
        <Header />
        <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <section className="rounded-[2rem] border border-orange-100 bg-white p-6 shadow-[0_18px_60px_rgba(211,91,31,0.08)]">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand">
                  Delivery dashboard
                </p>
                <h1 className="mt-2 font-serif text-4xl font-bold">
                  {dashboard?.partner?.name ?? "Assigned rider"}
                </h1>
                <p className="mt-3 text-sm text-subtle">
                  {dashboard?.partner
                    ? `${dashboard.partner.vehicleType} · ${dashboard.partner.preferredShift} · ${dashboard.partner.serviceZones}`
                    : "Your live pickup assignments will appear here."}
                </p>
              </div>
              <div className="rounded-2xl bg-orange-50 px-5 py-4 text-right">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand">
                  Active deliveries
                </p>
                <p className="mt-1 font-serif text-3xl font-bold">
                  {dashboard?.activeOrders.length ?? 0}
                </p>
              </div>
            </div>
          </section>

          <section className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_360px]">
            <div className="rounded-[2rem] border border-orange-100 bg-white p-6 shadow-[0_18px_60px_rgba(211,91,31,0.08)]">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand">
                Live jobs
              </p>
              <div className="mt-6 grid gap-4">
                {(dashboard?.activeOrders ?? []).map((order) => (
                  <div key={order.id} className="rounded-[1.5rem] border border-orange-100 p-5">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-foreground">{order.restaurantName}</p>
                      <OrderStatusBadge status={order.status} />
                    </div>
                    <p className="mt-2 text-sm text-subtle">
                      {order.customerName} · {order.customerPhone}
                    </p>
                    <p className="mt-2 text-sm text-subtle">
                      {order.deliveryAddress}, {order.deliveryCity}
                    </p>
                    <p className="mt-3 text-sm font-semibold text-brand">
                      {order.estimatedArrival ?? order.timeLabel}
                    </p>
                  </div>
                ))}
                {!dashboard?.activeOrders.length ? (
                  <div className="rounded-[1.5rem] border border-dashed border-orange-200 bg-orange-50/60 p-5 text-sm text-subtle">
                    No active jobs at the moment. Fresh demo orders will be assigned automatically.
                  </div>
                ) : null}
              </div>
            </div>

            <div className="rounded-[2rem] border border-orange-100 bg-white p-6 shadow-[0_18px_60px_rgba(211,91,31,0.08)]">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand">
                Recent drops
              </p>
              <div className="mt-5 space-y-4">
                {(dashboard?.recentOrders ?? []).slice(0, 6).map((order) => (
                  <div key={order.id} className="rounded-2xl bg-orange-50/60 px-4 py-4">
                    <p className="font-semibold text-foreground">{order.restaurantName}</p>
                    <p className="mt-1 text-sm text-subtle">
                      {order.customerName} · {formatRupees(order.total)}
                    </p>
                    <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand">
                      {order.status.replaceAll("_", " ")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </AuthGuard>
  );
}
