"use client";

import type { AdminDashboardData } from "@orderly/types";
import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/auth-guard";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { formatRupees } from "@/data/mock-data";
import { getAdminDashboard } from "@/lib/api";

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState<AdminDashboardData | null>(null);

  useEffect(() => {
    let ignore = false;

    const loadDashboard = async () => {
      try {
        const response = await getAdminDashboard();
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
    <AuthGuard allowedRoles={["ADMIN"]}>
      <div className="min-h-screen bg-cream">
        <Header />
        <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <section className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
            {[
              ["Active orders", dashboard?.activeOrders ?? 0],
              ["Active riders", dashboard?.activeRiders ?? 0],
              ["Delivered today", dashboard?.deliveredToday ?? 0],
              ["Cancelled today", dashboard?.cancelledToday ?? 0],
              ["Restaurants", dashboard?.totalRestaurants ?? 0],
              ["Partners", dashboard?.totalDeliveryPartners ?? 0],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-[1.75rem] border border-orange-100 bg-white p-5 shadow-[0_18px_60px_rgba(211,91,31,0.08)]"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand">
                  {label}
                </p>
                <p className="mt-3 font-serif text-4xl font-bold">{value}</p>
              </div>
            ))}
          </section>

          <section className="mt-8 rounded-[2rem] border border-orange-100 bg-white p-6 shadow-[0_18px_60px_rgba(211,91,31,0.08)]">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand">
              Live platform orders
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {(dashboard?.liveOrders ?? []).map((order) => (
                <div key={order.id} className="rounded-[1.5rem] border border-orange-100 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-foreground">{order.restaurantName}</p>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <p className="mt-2 text-sm text-subtle">Customer: {order.customerName}</p>
                  <p className="mt-2 text-sm text-subtle">
                    Rider: {order.deliveryPartner?.name ?? "Dispatching"}
                  </p>
                  <p className="mt-3 text-sm font-semibold text-brand">
                    {order.estimatedArrival ?? formatRupees(order.total)}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </AuthGuard>
  );
}
