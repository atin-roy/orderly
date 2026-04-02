"use client";

import type { Cart, Coupon } from "@orderly/types";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/auth-guard";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { ArrowLeftIcon, ReceiptIcon, TagIcon } from "@/components/icons";
import { formatRupees } from "@/data/mock-data";
import { clearCart, getCart, getCoupons, removeCartItem, updateCartItem } from "@/lib/api";

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function refreshCart() {
    const [cartResponse, couponResponse] = await Promise.all([getCart(), getCoupons()]);
    setCart(cartResponse.data);
    setCoupons(couponResponse.data);
  }

  useEffect(() => {
    let ignore = false;

    Promise.all([getCart(), getCoupons()])
      .then(([cartResponse, couponResponse]) => {
        if (!ignore) {
          setCart(cartResponse.data);
          setCoupons(couponResponse.data);
        }
      })
      .catch(() => {
        if (!ignore) {
          setCart(null);
          setCoupons([]);
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
  }, []);

  async function handleQuantity(itemId: number, quantity: number) {
    if (quantity <= 0) {
      await handleRemove(itemId);
      return;
    }

    const response = await updateCartItem(itemId, { quantity });
    setCart(response.data);
  }

  async function handleRemove(itemId: number) {
    const response = await removeCartItem(itemId);
    setCart(response.data);
  }

  async function handleClearCart() {
    await clearCart();
    await refreshCart();
    setMessage("Cart cleared.");
  }

  return (
    <AuthGuard requireCustomerRole>
      <div className="min-h-screen bg-cream">
        <Header />

        <main>
          <section className="border-b border-orange-100 bg-[linear-gradient(180deg,rgba(255,248,238,0.98),rgba(255,248,238,0.8))]">
            <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 md:py-12 lg:px-8">
              <Link
                href="/explore"
                className="inline-flex items-center gap-2 text-sm font-semibold tracking-wide text-brand transition-colors hover:text-brand/80"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                Keep browsing
              </Link>

              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.35em] text-brand">
                Cart
              </p>
              <h1 className="mt-4 font-serif text-4xl font-bold leading-tight md:text-5xl">
                Review the live cart before checkout
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-subtle">
                This cart is API-backed, so quantities, totals, and coupons now reflect the seeded backend instead of frontend mock data.
              </p>
            </div>
          </section>

          <section className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
            {loading ? (
              <div className="rounded-[2rem] border border-orange-100 bg-white p-10 text-center text-sm text-subtle">
                Loading cart...
              </div>
            ) : !cart || cart.items.length === 0 ? (
              <div className="rounded-[2rem] border border-orange-100 bg-white p-10 text-center">
                <p className="text-sm text-subtle">Your cart is empty right now.</p>
                <Link
                  href="/explore"
                  className="mt-4 inline-flex rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white"
                >
                  Explore restaurants
                </Link>
              </div>
            ) : (
              <div className="grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_360px]">
                <div className="space-y-6">
                  <div className="rounded-[2rem] border border-orange-100 bg-white p-6 shadow-[0_18px_60px_rgba(211,91,31,0.08)]">
                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand">
                          Restaurant
                        </p>
                        <h2 className="mt-3 font-serif text-3xl font-bold">
                          {cart.restaurantName}
                        </h2>
                        <p className="mt-2 text-sm text-subtle">
                          {cart.restaurantCuisine} · {cart.deliveryTimeMinutes} min
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => void handleClearCart()}
                        className="rounded-full border border-orange-200 px-4 py-2 text-sm font-semibold text-brand"
                      >
                        Clear cart
                      </button>
                    </div>

                    {message ? (
                      <div className="mt-4 rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-brand">
                        {message}
                      </div>
                    ) : null}

                    <div className="mt-6 divide-y divide-orange-100">
                      {cart.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex flex-col gap-4 py-5 md:flex-row md:items-center md:justify-between"
                        >
                          <div>
                            <p className="font-semibold text-foreground">{item.menuItemName}</p>
                            {item.note ? (
                              <p className="mt-1 text-sm text-subtle">{item.note}</p>
                            ) : null}
                            <p className="mt-2 text-sm text-subtle">
                              {formatRupees(item.price)} each
                            </p>
                          </div>

                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => void handleQuantity(item.id, item.quantity - 1)}
                              className="h-10 w-10 rounded-full border border-orange-200 text-lg font-semibold text-brand"
                            >
                              -
                            </button>
                            <span className="min-w-8 text-center font-semibold">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => void handleQuantity(item.id, item.quantity + 1)}
                              className="h-10 w-10 rounded-full border border-orange-200 text-lg font-semibold text-brand"
                            >
                              +
                            </button>
                            <div className="min-w-24 text-right font-semibold text-foreground">
                              {formatRupees(item.lineTotal)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[2rem] border border-orange-100 bg-[var(--color-card)] p-6 shadow-[0_18px_60px_rgba(211,91,31,0.08)]">
                    <div className="flex items-center gap-3">
                      <TagIcon className="h-5 w-5 text-brand" />
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand">
                          Coupons
                        </p>
                        <h2 className="mt-1 font-serif text-2xl font-bold">Available now</h2>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3">
                      {coupons.map((coupon) => (
                        <div
                          key={coupon.id}
                          className="rounded-2xl border border-orange-100 bg-white px-4 py-4"
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <p className="font-semibold text-foreground">{coupon.code}</p>
                              <p className="mt-1 text-sm text-subtle">{coupon.description}</p>
                            </div>
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
                                coupon.available
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-stone-100 text-stone-500"
                              }`}
                            >
                              {coupon.available ? "Ready" : "Locked"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="rounded-[2rem] border border-orange-100 bg-white p-6 shadow-[0_18px_60px_rgba(211,91,31,0.08)]">
                  <div className="flex items-center gap-3">
                    <ReceiptIcon className="h-5 w-5 text-brand" />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand">
                        Charges
                      </p>
                      <h2 className="mt-1 font-serif text-2xl font-bold">Order total</h2>
                    </div>
                  </div>

                  <div className="mt-6 space-y-4 text-sm">
                    <div className="flex items-center justify-between text-subtle">
                      <span>Subtotal</span>
                      <span>{formatRupees(cart.charges.subtotal)}</span>
                    </div>
                    <div className="flex items-center justify-between text-subtle">
                      <span>Delivery fee</span>
                      <span>{formatRupees(cart.charges.deliveryFee)}</span>
                    </div>
                    <div className="flex items-center justify-between text-subtle">
                      <span>Platform fee</span>
                      <span>{formatRupees(cart.charges.platformFee)}</span>
                    </div>
                    <div className="flex items-center justify-between text-subtle">
                      <span>Taxes</span>
                      <span>{formatRupees(cart.charges.taxes)}</span>
                    </div>
                    <div className="flex items-center justify-between text-subtle">
                      <span>Discount</span>
                      <span>-{formatRupees(cart.charges.discount)}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-orange-100 pt-4 font-semibold text-foreground">
                      <span>Total</span>
                      <span>{formatRupees(cart.charges.total)}</span>
                    </div>
                  </div>

                  <Link
                    href="/checkout"
                    className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-brand px-5 py-4 text-sm font-semibold text-white transition hover:bg-brand/90"
                  >
                    Proceed to checkout
                  </Link>
                </div>
              </div>
            )}
          </section>
        </main>

        <Footer />
      </div>
    </AuthGuard>
  );
}
