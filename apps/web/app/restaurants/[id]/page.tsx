"use client";

import type { MenuCategory, Restaurant } from "@orderly/types";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useSession } from "@/components/session-provider";
import { ArrowLeftIcon, ClockIcon, StarIcon } from "@/components/icons";
import { formatRupees } from "@/data/mock-data";
import { addToCart, getRestaurant, getRestaurantMenu, resolveAssetUrl } from "@/lib/api";

export default function RestaurantPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { isAuthenticated } = useSession();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menu, setMenu] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const restaurantId = Number(params.id);

  useEffect(() => {
    let ignore = false;
    Promise.all([getRestaurant(restaurantId), getRestaurantMenu(restaurantId)])
      .then(([restaurantResponse, menuResponse]) => {
        if (!ignore) {
          setRestaurant(restaurantResponse.data);
          setMenu(menuResponse.data);
        }
      })
      .catch(() => {
        if (!ignore) {
          setRestaurant(null);
          setMenu([]);
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [restaurantId]);

  async function handleAddToCart(menuItemId: number) {
    if (!isAuthenticated) {
      router.push(`/login?next=/restaurants/${restaurantId}`);
      return;
    }

    try {
      await addToCart({ menuItemId, quantity: 1 });
      setMessage("Added to cart.");
      window.setTimeout(() => setMessage(""), 2000);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to add item.");
    }
  }

  return (
    <div className="min-h-screen bg-cream">
      <Header />

      <main>
        {loading ? (
          <div className="mx-auto max-w-7xl px-4 py-16 text-sm text-subtle">Loading restaurant...</div>
        ) : !restaurant ? (
          <div className="mx-auto max-w-7xl px-4 py-16 text-sm text-subtle">
            Restaurant not found.
          </div>
        ) : (
          <>
            <section className="border-b border-orange-100 bg-[linear-gradient(180deg,rgba(255,248,238,0.98),rgba(255,248,238,0.82))]">
              <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                <Link
                  href="/explore"
                  className="inline-flex items-center gap-2 text-sm font-semibold tracking-wide text-brand transition-colors hover:text-brand/80"
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                  Back to explore
                </Link>

                <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_460px] lg:items-end">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand">
                      {restaurant.locality}, {restaurant.city}
                    </p>
                    <h1 className="mt-4 font-serif text-4xl font-bold leading-tight md:text-5xl">
                      {restaurant.name}
                    </h1>
                    <p className="mt-4 max-w-3xl text-base leading-7 text-subtle">
                      {restaurant.description}
                    </p>

                    <div className="mt-6 flex flex-wrap gap-4 text-sm text-subtle">
                      <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm">
                        <StarIcon className="h-4 w-4 text-brand" />
                        {restaurant.rating.toFixed(1)}
                      </span>
                      <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm">
                        <ClockIcon className="h-4 w-4 text-brand" />
                        {restaurant.deliveryTimeMinutes} min
                      </span>
                      <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm">
                        {restaurant.deliveryFee === 0
                          ? "Free delivery"
                          : `Delivery ${new Intl.NumberFormat("en-IN", {
                              style: "currency",
                              currency: "INR",
                              maximumFractionDigits: 0,
                            }).format(restaurant.deliveryFee)}`}
                      </span>
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-[2rem] border border-white/60 bg-white shadow-[0_24px_60px_rgba(35,24,21,0.1)]">
                    {restaurant.imageUrl ? (
                      <img
                        src={resolveAssetUrl(restaurant.imageUrl)}
                        alt={restaurant.name}
                        className="h-[300px] w-full object-cover"
                      />
                    ) : (
                      <div className={`h-[300px] w-full ${restaurant.imageColor}`} />
                    )}
                  </div>
                </div>
              </div>
            </section>

            <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand">
                    Menu
                  </p>
                  <h2 className="mt-3 font-serif text-3xl font-bold">
                    Built for a realistic demo order flow
                  </h2>
                </div>
                <Link
                  href="/cart"
                  className="rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white"
                >
                  View cart
                </Link>
              </div>

              {message ? (
                <div className="mt-6 rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-brand">
                  {message}
                </div>
              ) : null}

              <div className="mt-8 space-y-8">
                {menu.map((category) => (
                  <div
                    key={category.category}
                    className="rounded-[2rem] border border-orange-100 bg-white p-6 shadow-[0_18px_60px_rgba(211,91,31,0.08)]"
                  >
                    <h3 className="font-serif text-2xl font-bold">{category.category}</h3>
                    <div className="mt-6 grid gap-4">
                      {category.items.map((item) => (
                        <div
                          key={item.id}
                          className="grid gap-4 rounded-[1.5rem] border border-orange-100 p-4 md:grid-cols-[minmax(0,1fr)_auto]"
                        >
                          <div>
                            <div className="flex items-center gap-3">
                              <p className="font-semibold text-foreground">{item.name}</p>
                              <span
                                className={`rounded-full px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                                  item.isVeg
                                    ? "bg-emerald-50 text-emerald-800"
                                    : "bg-orange-50 text-brand"
                                }`}
                              >
                                {item.isVeg ? "Veg" : "Non-veg"}
                              </span>
                            </div>
                            <p className="mt-2 text-sm leading-6 text-subtle">{item.description}</p>
                            <p className="mt-3 font-semibold text-foreground">{formatRupees(item.price)}</p>
                          </div>

                          <div className="flex items-center">
                            <button
                              type="button"
                              onClick={() => void handleAddToCart(item.id)}
                              className="rounded-2xl bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand/90"
                            >
                              Add to cart
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
