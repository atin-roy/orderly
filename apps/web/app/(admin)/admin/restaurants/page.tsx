"use client";

import type { AdminRestaurantSummary } from "@orderly/types";
import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/auth-guard";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { getAdminRestaurants } from "@/lib/api";

export default function AdminRestaurantsPage() {
  const [restaurants, setRestaurants] = useState<AdminRestaurantSummary[]>([]);

  useEffect(() => {
    let ignore = false;

    const loadRestaurants = async () => {
      try {
        const response = await getAdminRestaurants();
        if (!ignore) {
          setRestaurants(response.data);
        }
      } catch {
        if (!ignore) {
          setRestaurants([]);
        }
      }
    };

    void loadRestaurants();

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <AuthGuard allowedRoles={["ADMIN"]}>
      <div className="min-h-screen bg-cream">
        <Header />
        <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <section className="rounded-[2rem] border border-orange-100 bg-white p-6 shadow-[0_18px_60px_rgba(211,91,31,0.08)]">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand">
              Catalog oversight
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {restaurants.map((restaurant) => (
                <div key={restaurant.id} className="rounded-[1.5rem] border border-orange-100 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-foreground">{restaurant.name}</p>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
                      {restaurant.isActive ? "Live" : "Paused"}
                    </p>
                  </div>
                  <p className="mt-2 text-sm text-subtle">
                    {restaurant.cuisineType} · {restaurant.locality}, {restaurant.city}
                  </p>
                  <p className="mt-2 text-sm text-subtle">Owner: {restaurant.ownerName ?? "N/A"}</p>
                  <p className="mt-3 text-sm font-semibold text-brand">
                    {restaurant.activeOrders} active · {restaurant.totalOrders} total orders
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
