"use client";

import type { OwnerDashboardData, Restaurant } from "@orderly/types";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/auth-guard";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { formatRupees } from "@/data/mock-data";
import { createRestaurant, getMyRestaurants, getOwnerDashboard, updateRestaurant } from "@/lib/api";

const emptyForm = {
  name: "",
  description: "",
  cuisineType: "",
  city: "Kolkata",
  locality: "",
  imageUrl: "",
  deliveryTimeMinutes: 30,
  deliveryFee: 29,
  priceLevel: "₹₹",
  imageColor: "bg-gradient-to-br from-orange-500 via-amber-500 to-red-700",
};

export default function OwnerDashboardPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const [dashboard, setDashboard] = useState<OwnerDashboardData | null>(null);

  async function refreshRestaurants() {
    const response = await getMyRestaurants();
    setRestaurants(response.data);
    if (!selectedId && response.data[0]) {
      setSelectedId(response.data[0].id);
    }
  }

  useEffect(() => {
    let ignore = false;

    void getMyRestaurants()
      .then((response) => {
        if (!ignore) {
          setRestaurants(response.data);
          if (response.data[0]) {
            const selected = response.data[0];
            setSelectedId(selected.id);
            setForm({
              name: selected.name,
              description: selected.description,
              cuisineType: selected.cuisineType,
              city: selected.city,
              locality: selected.locality,
              imageUrl: selected.imageUrl ?? "",
              deliveryTimeMinutes: selected.deliveryTimeMinutes,
              deliveryFee: selected.deliveryFee,
              priceLevel: selected.priceLevel,
              imageColor: selected.imageColor,
            });
          }
        }
      })
      .catch(() => {
        if (!ignore) {
          setRestaurants([]);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    const loadDashboard = async () => {
      try {
        const response = await getOwnerDashboard();
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

  async function handleSubmit() {
    const payload = {
      ...form,
      imageUrl: form.imageUrl || undefined,
    };

    if (selectedId) {
      await updateRestaurant(selectedId, payload);
      setMessage("Restaurant updated.");
    } else {
      await createRestaurant(payload);
      setMessage("Restaurant created.");
    }

    await refreshRestaurants();
  }

  return (
    <AuthGuard allowedRoles={["BUSINESS"]}>
      <div className="min-h-screen bg-cream">
        <Header />
        <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <section className="mb-8 rounded-[2rem] border border-orange-100 bg-white p-6 shadow-[0_18px_60px_rgba(211,91,31,0.08)]">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand">
                  Live operations
                </p>
                <h2 className="mt-2 font-serif text-3xl font-bold">Orders in motion</h2>
              </div>
              <div className="rounded-2xl bg-orange-50 px-5 py-4 text-right">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand">
                  Active orders
                </p>
                <p className="mt-1 font-serif text-3xl font-bold">
                  {dashboard?.activeOrders ?? 0}
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {(dashboard?.liveOrders ?? []).slice(0, 4).map((order) => (
                <div
                  key={order.id}
                  className="rounded-[1.5rem] border border-orange-100 bg-orange-50/60 p-5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-foreground">{order.restaurantName}</p>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
                      {order.status.replaceAll("_", " ")}
                    </p>
                  </div>
                  <p className="mt-2 text-sm text-subtle">
                    Customer: {order.customerName} · {order.customerPhone}
                  </p>
                  <p className="mt-2 text-sm text-subtle">
                    Rider: {order.deliveryPartner?.name ?? "Dispatching"} ·{" "}
                    {order.estimatedArrival ?? order.timeLabel}
                  </p>
                </div>
              ))}
              {!dashboard?.liveOrders.length ? (
                <div className="rounded-[1.5rem] border border-dashed border-orange-200 bg-orange-50/60 p-5 text-sm text-subtle">
                  New demo orders will appear here automatically when the professor checks out.
                </div>
              ) : null}
            </div>
          </section>

          <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[320px_minmax(0,1fr)]">
            <aside className="rounded-[2rem] border border-orange-100 bg-white p-5 shadow-[0_18px_60px_rgba(211,91,31,0.08)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand">
                    Owner dashboard
                  </p>
                  <h1 className="mt-2 font-serif text-3xl font-bold">Restaurants</h1>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedId(null);
                    setForm(emptyForm);
                  }}
                  className="rounded-full border border-orange-200 px-4 py-2 text-sm font-semibold text-brand"
                >
                  New
                </button>
              </div>

              <div className="mt-6 space-y-3">
                {restaurants.map((restaurant) => (
                  <button
                    key={restaurant.id}
                    type="button"
                    onClick={() => {
                      setSelectedId(restaurant.id);
                      setForm({
                        name: restaurant.name,
                        description: restaurant.description,
                        cuisineType: restaurant.cuisineType,
                        city: restaurant.city,
                        locality: restaurant.locality,
                        imageUrl: restaurant.imageUrl ?? "",
                        deliveryTimeMinutes: restaurant.deliveryTimeMinutes,
                        deliveryFee: restaurant.deliveryFee,
                        priceLevel: restaurant.priceLevel,
                        imageColor: restaurant.imageColor,
                      });
                    }}
                    className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
                      selectedId === restaurant.id
                        ? "border-brand bg-orange-50"
                        : "border-orange-100 bg-white"
                    }`}
                  >
                    <p className="font-semibold text-foreground">{restaurant.name}</p>
                    <p className="mt-1 text-sm text-subtle">
                      {restaurant.locality} · {restaurant.cuisineType}
                    </p>
                    <p className="mt-2 text-xs uppercase tracking-[0.18em] text-brand">
                      {restaurant.isActive ? "Live" : "Paused"} · {formatRupees(restaurant.deliveryFee)} delivery
                    </p>
                  </button>
                ))}
              </div>
            </aside>

            <section className="rounded-[2rem] border border-orange-100 bg-white p-6 shadow-[0_18px_60px_rgba(211,91,31,0.08)]">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand">
                    {selectedId ? "Edit restaurant" : "Create restaurant"}
                  </p>
                  <h2 className="mt-2 font-serif text-3xl font-bold">
                    {selectedId ? "Update listing details" : "Add a new listing"}
                  </h2>
                </div>
                {selectedId ? (
                  <Link
                    href={`/owner/menu?restaurantId=${selectedId}`}
                    className="rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white"
                  >
                    Manage menu
                  </Link>
                ) : null}
              </div>

              {message ? (
                <div className="mt-5 rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-brand">
                  {message}
                </div>
              ) : null}

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {[
                  ["Name", "name"],
                  ["Cuisine type", "cuisineType"],
                  ["City", "city"],
                  ["Locality", "locality"],
                  ["Image URL", "imageUrl"],
                  ["Price level", "priceLevel"],
                ].map(([label, key]) => (
                  <label key={key} className="block text-sm">
                    <span className="mb-2 block font-semibold text-foreground">{label}</span>
                    <input
                      value={form[key as keyof typeof form] as string}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, [key]: event.target.value }))
                      }
                      className="w-full rounded-2xl border border-orange-200 px-4 py-3"
                    />
                  </label>
                ))}
              </div>

              <label className="mt-4 block text-sm">
                <span className="mb-2 block font-semibold text-foreground">Description</span>
                <textarea
                  value={form.description}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                  className="min-h-28 w-full rounded-2xl border border-orange-200 px-4 py-3"
                />
              </label>

              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <label className="block text-sm">
                  <span className="mb-2 block font-semibold text-foreground">Delivery time</span>
                  <input
                    type="number"
                    value={form.deliveryTimeMinutes}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        deliveryTimeMinutes: Number(event.target.value),
                      }))
                    }
                    className="w-full rounded-2xl border border-orange-200 px-4 py-3"
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-2 block font-semibold text-foreground">Delivery fee</span>
                  <input
                    type="number"
                    value={form.deliveryFee}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        deliveryFee: Number(event.target.value),
                      }))
                    }
                    className="w-full rounded-2xl border border-orange-200 px-4 py-3"
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-2 block font-semibold text-foreground">Image color</span>
                  <input
                    value={form.imageColor}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, imageColor: event.target.value }))
                    }
                    className="w-full rounded-2xl border border-orange-200 px-4 py-3"
                  />
                </label>
              </div>

              <button
                type="button"
                onClick={() => void handleSubmit()}
                className="mt-6 rounded-2xl bg-brand px-6 py-4 text-sm font-semibold text-white"
              >
                {selectedId ? "Save restaurant" : "Create restaurant"}
              </button>
            </section>
          </div>
        </main>
        <Footer />
      </div>
    </AuthGuard>
  );
}
