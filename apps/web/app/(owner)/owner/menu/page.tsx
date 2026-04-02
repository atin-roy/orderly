"use client";

import type { MenuCategory, Restaurant } from "@orderly/types";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/auth-guard";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { formatRupees } from "@/data/mock-data";
import {
  createMenuItem,
  deleteMenuItem,
  getMyRestaurants,
  getRestaurantMenu,
  updateMenuItem,
} from "@/lib/api";

const emptyForm = {
  name: "",
  description: "",
  imageUrl: "",
  price: 199,
  category: "Mains",
  isAvailable: true,
  isVeg: false,
  sortOrder: 1,
};

export default function MenuPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [restaurantId, setRestaurantId] = useState<number | null>(null);
  const [menu, setMenu] = useState<MenuCategory[]>([]);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");

  async function refreshMenu(nextRestaurantId: number) {
    const response = await getRestaurantMenu(nextRestaurantId);
    setMenu(response.data);
  }

  useEffect(() => {
    let ignore = false;

    void getMyRestaurants()
      .then((response) => {
        if (!ignore) {
          setRestaurants(response.data);
          const params = new URLSearchParams(window.location.search);
          const initialId = Number(params.get("restaurantId")) || response.data[0]?.id || null;
          setRestaurantId(initialId);
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
    if (!restaurantId) {
      return;
    }
    let ignore = false;
    void getRestaurantMenu(restaurantId)
      .then((response) => {
        if (!ignore) {
          setMenu(response.data);
        }
      })
      .catch(() => {
        if (!ignore) {
          setMenu([]);
        }
      });

    return () => {
      ignore = true;
    };
  }, [restaurantId]);

  async function handleSave() {
    if (!restaurantId) {
      return;
    }

    const payload = {
      ...form,
      imageUrl: form.imageUrl || undefined,
    };

    if (editingItemId) {
      await updateMenuItem(restaurantId, editingItemId, payload);
      setMessage("Menu item updated.");
    } else {
      await createMenuItem(restaurantId, payload);
      setMessage("Menu item created.");
    }

    await refreshMenu(restaurantId);
    setEditingItemId(null);
  }

  async function handleDelete(itemId: number) {
    if (!restaurantId) {
      return;
    }
    await deleteMenuItem(restaurantId, itemId);
    await refreshMenu(restaurantId);
    setEditingItemId(null);
    setMessage("Menu item deleted.");
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-cream">
        <Header />
        <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
            <aside className="rounded-[2rem] border border-orange-100 bg-white p-5 shadow-[0_18px_60px_rgba(211,91,31,0.08)]">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand">
                Menu manager
              </p>
              <h1 className="mt-2 font-serif text-3xl font-bold">Restaurants</h1>
              <div className="mt-5 space-y-3">
                {restaurants.map((restaurant) => (
                  <button
                    key={restaurant.id}
                    type="button"
                    onClick={() => {
                      setRestaurantId(restaurant.id);
                      setEditingItemId(null);
                      setForm(emptyForm);
                    }}
                    className={`w-full rounded-2xl border px-4 py-4 text-left ${
                      restaurantId === restaurant.id
                        ? "border-brand bg-orange-50"
                        : "border-orange-100"
                    }`}
                  >
                    <p className="font-semibold text-foreground">{restaurant.name}</p>
                    <p className="mt-1 text-sm text-subtle">{restaurant.locality}</p>
                  </button>
                ))}
              </div>
              <Link
                href="/owner/dashboard"
                className="mt-5 inline-flex rounded-full border border-orange-200 px-4 py-2 text-sm font-semibold text-brand"
              >
                Back to dashboard
              </Link>
            </aside>

            <section className="space-y-8">
              <div className="rounded-[2rem] border border-orange-100 bg-white p-6 shadow-[0_18px_60px_rgba(211,91,31,0.08)]">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand">
                      Menu editor
                    </p>
                    <h2 className="mt-2 font-serif text-3xl font-bold">
                      {editingItemId ? "Edit menu item" : "Add menu item"}
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingItemId(null);
                      setForm(emptyForm);
                    }}
                    className="rounded-full border border-orange-200 px-4 py-2 text-sm font-semibold text-brand"
                  >
                    New item
                  </button>
                </div>

                {message ? (
                  <div className="mt-5 rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-brand">
                    {message}
                  </div>
                ) : null}

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {[
                    ["Name", "name"],
                    ["Category", "category"],
                    ["Image URL", "imageUrl"],
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

                <div className="mt-4 grid gap-4 md:grid-cols-4">
                  <label className="block text-sm">
                    <span className="mb-2 block font-semibold text-foreground">Price</span>
                    <input
                      type="number"
                      value={form.price}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, price: Number(event.target.value) }))
                      }
                      className="w-full rounded-2xl border border-orange-200 px-4 py-3"
                    />
                  </label>
                  <label className="block text-sm">
                    <span className="mb-2 block font-semibold text-foreground">Sort order</span>
                    <input
                      type="number"
                      value={form.sortOrder}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, sortOrder: Number(event.target.value) }))
                      }
                      className="w-full rounded-2xl border border-orange-200 px-4 py-3"
                    />
                  </label>
                  <label className="flex items-center gap-3 rounded-2xl border border-orange-100 px-4 py-3 text-sm font-semibold text-foreground">
                    <input
                      type="checkbox"
                      checked={form.isVeg}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, isVeg: event.target.checked }))
                      }
                    />
                    Veg
                  </label>
                  <label className="flex items-center gap-3 rounded-2xl border border-orange-100 px-4 py-3 text-sm font-semibold text-foreground">
                    <input
                      type="checkbox"
                      checked={form.isAvailable}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, isAvailable: event.target.checked }))
                      }
                    />
                    Available
                  </label>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={() => void handleSave()}
                    className="rounded-2xl bg-brand px-6 py-4 text-sm font-semibold text-white"
                  >
                    {editingItemId ? "Save changes" : "Create item"}
                  </button>
                  {editingItemId ? (
                    <button
                      type="button"
                      onClick={() => void handleDelete(editingItemId)}
                      className="rounded-2xl border border-red-200 px-6 py-4 text-sm font-semibold text-red-700"
                    >
                      Delete
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="rounded-[2rem] border border-orange-100 bg-white p-6 shadow-[0_18px_60px_rgba(211,91,31,0.08)]">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand">
                  Current menu
                </p>
                <h2 className="mt-2 font-serif text-3xl font-bold">Live API data</h2>

                <div className="mt-6 space-y-6">
                  {menu.map((category) => (
                    <div key={category.category}>
                      <h3 className="font-semibold text-foreground">{category.category}</h3>
                      <div className="mt-3 grid gap-3">
                        {category.items.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              setEditingItemId(item.id);
                              setForm({
                                name: item.name,
                                description: item.description,
                                imageUrl: item.imageUrl ?? "",
                                price: item.price,
                                category: item.category,
                                isAvailable: item.isAvailable,
                                isVeg: item.isVeg,
                                sortOrder: item.sortOrder,
                              });
                            }}
                            className="flex items-center justify-between gap-4 rounded-2xl border border-orange-100 px-4 py-4 text-left"
                          >
                            <div>
                              <p className="font-semibold text-foreground">{item.name}</p>
                              <p className="mt-1 text-sm text-subtle">
                                {formatRupees(item.price)} · {item.isVeg ? "Veg" : "Non-veg"}
                              </p>
                            </div>
                            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
                              Edit
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </main>
        <Footer />
      </div>
    </AuthGuard>
  );
}
