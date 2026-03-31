"use client";

import Link from "next/link";
import { useState } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import {
  ClockIcon,
  CloseIcon,
  LocationPinIcon,
  MinusIcon,
  PlusIcon,
  ReceiptIcon,
  TagIcon,
  TrashIcon,
} from "@/components/icons";
import { formatRupees, getCartSubtotal, getCartTotal, mockCart } from "@/data/mock-data";

type Coupon = {
  id: string;
  code: string;
  title: string;
  description: string;
  discount: number;
  minOrder: number;
  available: boolean;
};

const coupons: Coupon[] = [
  {
    id: "coupon-cravings150",
    code: "CRAVINGS150",
    title: "Flat 150 off",
    description: "Valid on orders above 499 from select restaurants.",
    discount: 150,
    minOrder: 499,
    available: true,
  },
  {
    id: "coupon-feast120",
    code: "FEAST120",
    title: "Save 120 tonight",
    description: "Works on comfort meals and family combinations above 699.",
    discount: 120,
    minOrder: 699,
    available: true,
  },
  {
    id: "coupon-dessert200",
    code: "DESSERT200",
    title: "Dessert run reward",
    description: "Spend 999 to unlock 200 off on larger evening orders.",
    discount: 200,
    minOrder: 999,
    available: false,
  },
  {
    id: "coupon-latenight90",
    code: "LATENIGHT90",
    title: "Late night 90 off",
    description: "Available after 11 PM on orders above 399.",
    discount: 90,
    minOrder: 399,
    available: false,
  },
];

const subtotal = getCartSubtotal();
const baseDiscount = mockCart.charges.discount;
const baseTotal = getCartTotal();

function CouponModal({
  open,
  onClose,
  selectedCouponId,
  appliedCouponId,
  onSelectCoupon,
  onApplyCoupon,
  onRemoveCoupon,
}: {
  open: boolean;
  onClose: () => void;
  selectedCouponId: string | null;
  appliedCouponId: string | null;
  onSelectCoupon: (couponId: string) => void;
  onApplyCoupon: () => void;
  onRemoveCoupon: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
      <button
        type="button"
        className="absolute inset-0 bg-stone-950/45"
        onClick={onClose}
        aria-label="Close coupon picker"
      />

      <div className="relative z-10 w-full max-w-2xl rounded-[2rem] border border-orange-100 bg-white p-6 shadow-[0_30px_80px_rgba(35,24,21,0.24)] sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand">
              Coupons
            </p>
            <h2 className="mt-3 font-serif text-3xl font-bold text-foreground">
              Choose one offer
            </h2>
            <p className="mt-3 text-sm leading-7 text-subtle">
              Only one coupon can be active at a time. Available offers are in
              brand colour, unavailable ones are greyed out, and the applied
              one turns green.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-orange-100 p-2 text-subtle transition hover:border-orange-200 hover:bg-orange-50 hover:text-brand"
            aria-label="Close coupon modal"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-8 space-y-4">
          {coupons.map((coupon) => {
            const isActive = appliedCouponId === coupon.id;
            const isSelected = selectedCouponId === coupon.id;
            const isUnavailable = !coupon.available;

            const containerClassName = isActive
              ? "border-emerald-300 bg-emerald-50 shadow-[0_12px_30px_rgba(16,185,129,0.12)]"
              : isUnavailable
                ? "border-stone-200 bg-stone-100 opacity-70"
                : "border-orange-200 bg-orange-50/60 hover:border-brand hover:bg-orange-50";

            const badgeClassName = isActive
              ? "bg-emerald-600 text-white"
              : isUnavailable
                ? "bg-stone-300 text-stone-700"
                : "bg-brand text-white";

            return (
              <button
                key={coupon.id}
                type="button"
                disabled={isUnavailable}
                onClick={() => onSelectCoupon(coupon.id)}
                className={`w-full rounded-[1.5rem] border p-5 text-left transition ${containerClassName} ${
                  isUnavailable ? "cursor-not-allowed" : "cursor-pointer"
                } ${isSelected && !isActive ? "ring-2 ring-brand/25" : ""}`}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] ${badgeClassName}`}
                      >
                        {coupon.code}
                      </span>
                      <span className="text-xs font-semibold uppercase tracking-[0.22em] text-subtle">
                        {isActive
                          ? "Active"
                          : isUnavailable
                            ? "Unavailable"
                            : "Available"}
                      </span>
                    </div>
                    <h3 className="mt-4 text-xl font-semibold text-foreground">
                      {coupon.title}
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-subtle">
                      {coupon.description}
                    </p>
                  </div>

                  <div className="sm:text-right">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-subtle">
                      Discount
                    </p>
                    <p className="mt-1 font-serif text-3xl font-bold text-foreground">
                      {formatRupees(coupon.discount)}
                    </p>
                    <p className="mt-2 text-sm text-subtle">
                      Min order {formatRupees(coupon.minOrder)}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
          {appliedCouponId ? (
            <button
              type="button"
              onClick={onRemoveCoupon}
              className="rounded-full border border-rose-200 bg-rose-50 px-5 py-3 text-sm font-semibold text-rose-700 transition hover:border-rose-300 hover:bg-rose-100"
            >
              Remove coupon
            </button>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-orange-200 bg-white px-5 py-3 text-sm font-semibold text-brand transition hover:border-brand"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onApplyCoupon}
            disabled={!selectedCouponId}
            className="rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand/90 disabled:cursor-not-allowed disabled:bg-stone-300"
          >
            Apply selected coupon
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CartPage() {
  const defaultCoupon = coupons.find(
    (coupon) => coupon.available && coupon.discount === baseDiscount,
  );
  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [selectedCouponId, setSelectedCouponId] = useState<string | null>(
    defaultCoupon?.id ?? null,
  );
  const [appliedCouponId, setAppliedCouponId] = useState<string | null>(
    defaultCoupon?.id ?? null,
  );

  const appliedCoupon = coupons.find((coupon) => coupon.id === appliedCouponId) ?? null;
  const currentDiscount = appliedCoupon?.discount ?? 0;
  const total = baseTotal - baseDiscount + currentDiscount;

  return (
    <div className="min-h-screen bg-cream">
      <Header />

      <CouponModal
        open={couponModalOpen}
        onClose={() => {
          setSelectedCouponId(appliedCouponId);
          setCouponModalOpen(false);
        }}
        selectedCouponId={selectedCouponId}
        appliedCouponId={appliedCouponId}
        onSelectCoupon={setSelectedCouponId}
        onApplyCoupon={() => {
          setAppliedCouponId(selectedCouponId);
          setCouponModalOpen(false);
        }}
        onRemoveCoupon={() => {
          setAppliedCouponId(null);
          setSelectedCouponId(null);
          setCouponModalOpen(false);
        }}
      />

      <main>
        <section className="border-b border-orange-100 bg-[linear-gradient(180deg,rgba(255,248,238,0.98),rgba(255,248,238,0.8))]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand">
              Cart
            </p>
            <h1 className="mt-4 font-serif text-4xl font-bold leading-tight md:text-5xl">
              Review your basket before checkout
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-subtle">
              Check your items, confirm your address, and lock in the best
              offer before you pay.
            </p>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_360px]">
            <div className="space-y-8">
              <div className="overflow-hidden rounded-[2rem] border border-orange-100 bg-white shadow-[0_18px_60px_rgba(211,91,31,0.08)]">
                <div className="grid gap-0 md:grid-cols-[220px_minmax(0,1fr)]">
                  <div className={`min-h-[220px] ${mockCart.imageColor}`} />
                  <div className="p-6 md:p-7">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand">
                      From
                    </p>
                    <h2 className="mt-3 font-serif text-3xl font-bold">
                      {mockCart.restaurantName}
                    </h2>
                    <p className="mt-2 text-sm text-subtle">
                      {mockCart.restaurantCuisine} · {mockCart.deliveryTime}
                    </p>

                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-orange-100 bg-[var(--color-card)] p-4">
                        <div className="flex items-center gap-2 text-brand">
                          <LocationPinIcon className="h-5 w-5" />
                          <span className="text-xs font-semibold uppercase tracking-[0.22em]">
                            Deliver to
                          </span>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-subtle">
                          {mockCart.deliveryAddress}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-orange-100 bg-[var(--color-card)] p-4">
                        <div className="flex items-center gap-2 text-brand">
                          <TagIcon className="h-5 w-5" />
                          <span className="text-xs font-semibold uppercase tracking-[0.22em]">
                            Offer
                          </span>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-subtle">
                          {appliedCoupon
                            ? `${appliedCoupon.code} applied for ${formatRupees(appliedCoupon.discount)} off`
                            : "No coupon applied"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-orange-100 bg-white p-6 shadow-[0_18px_60px_rgba(211,91,31,0.08)]">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand">
                      Items
                    </p>
                    <h2 className="mt-3 font-serif text-3xl font-bold">
                      Your basket
                    </h2>
                  </div>
                  <p className="text-sm text-subtle">
                    {mockCart.items.length} selections
                  </p>
                </div>

                <div className="mt-6 divide-y divide-orange-100">
                  {mockCart.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col gap-5 py-5 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <h3 className="font-semibold text-lg text-foreground">
                          {item.name}
                        </h3>
                        <p className="mt-2 text-sm text-subtle">
                          {formatRupees(item.price)} each
                        </p>
                        {item.note ? (
                          <p className="mt-2 text-sm leading-6 text-subtle">
                            {item.note}
                          </p>
                        ) : null}
                      </div>

                      <div className="flex flex-wrap items-center gap-4 sm:justify-end">
                        <div className="inline-flex items-center rounded-full border border-orange-200 bg-[var(--color-card)] px-2 py-2">
                          <button
                            type="button"
                            className="rounded-full p-2 text-brand transition-colors hover:bg-orange-100"
                            aria-label={`Decrease ${item.name} quantity`}
                          >
                            <MinusIcon className="h-4 w-4" />
                          </button>
                          <span className="min-w-10 text-center text-sm font-semibold">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            className="rounded-full p-2 text-brand transition-colors hover:bg-orange-100"
                            aria-label={`Increase ${item.name} quantity`}
                          >
                            <PlusIcon className="h-4 w-4" />
                          </button>
                        </div>

                        <p className="min-w-24 text-right font-serif text-2xl font-bold">
                          {formatRupees(item.price * item.quantity)}
                        </p>

                        <button
                          type="button"
                          className="rounded-full border border-orange-200 p-3 text-subtle transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                          aria-label={`Remove ${item.name}`}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[2rem] border border-orange-100 bg-[var(--color-card)] p-6 shadow-[0_18px_60px_rgba(211,91,31,0.08)]">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand">
                      Add more
                    </p>
                    <h2 className="mt-3 font-serif text-3xl font-bold">
                      Popular extras
                    </h2>
                  </div>
                  <Link
                    href="/explore"
                    className="text-xs font-semibold uppercase tracking-[0.25em] text-brand transition-colors hover:text-brand/80"
                  >
                    Browse menu
                  </Link>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  {mockCart.addOns.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-[1.5rem] border border-orange-100 bg-white p-5"
                    >
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand">
                        {item.tag}
                      </p>
                      <h3 className="mt-4 font-semibold text-lg">{item.name}</h3>
                      <p className="mt-2 text-sm text-subtle">
                        Add a quick side or dessert without reopening the whole
                        restaurant page.
                      </p>
                      <div className="mt-5 flex items-center justify-between gap-4">
                        <span className="font-serif text-2xl font-bold">
                          {formatRupees(item.price)}
                        </span>
                        <button
                          type="button"
                          className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand/90"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-[2rem] border border-orange-100 bg-white p-6 shadow-[0_18px_60px_rgba(211,91,31,0.08)] lg:sticky lg:top-24">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand">
                  Bill Summary
                </p>
                <h2 className="mt-3 font-serif text-3xl font-bold">
                  Ready to pay
                </h2>

                <div className="mt-6 rounded-[1.5rem] border border-orange-100 bg-[var(--color-card)] p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand">
                        Coupon
                      </p>
                      <p className="mt-2 text-sm text-subtle">
                        {appliedCoupon
                          ? `${appliedCoupon.code} is active on this order`
                          : "Choose one coupon before checkout."}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <button
                        type="button"
                        onClick={() => setCouponModalOpen(true)}
                        className="inline-flex items-center rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand/90"
                      >
                        {appliedCoupon ? "Change coupon" : "Apply coupon"}
                      </button>
                      {appliedCoupon ? (
                        <button
                          type="button"
                          onClick={() => {
                            setAppliedCouponId(null);
                            setSelectedCouponId(null);
                          }}
                          className="text-sm font-semibold text-rose-700 transition hover:text-rose-800"
                        >
                          Remove coupon
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-4 text-sm">
                  <div className="flex items-center justify-between text-subtle">
                    <span>Item total</span>
                    <span>{formatRupees(subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between text-subtle">
                    <span>Delivery fee</span>
                    <span>{formatRupees(mockCart.charges.deliveryFee)}</span>
                  </div>
                  <div className="flex items-center justify-between text-subtle">
                    <span>Platform fee</span>
                    <span>{formatRupees(mockCart.charges.platformFee)}</span>
                  </div>
                  <div className="flex items-center justify-between text-subtle">
                    <span>Taxes</span>
                    <span>{formatRupees(mockCart.charges.taxes)}</span>
                  </div>
                  <div className="flex items-center justify-between text-emerald-700">
                    <span>Coupon discount</span>
                    <span>-{formatRupees(currentDiscount)}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-orange-100 pt-4 font-semibold text-foreground">
                    <span>To pay</span>
                    <span className="font-serif text-3xl">{formatRupees(total)}</span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  className="mt-6 block w-full rounded-[1.25rem] bg-brand px-6 py-4 text-center text-sm font-semibold uppercase tracking-[0.24em] text-white transition-colors hover:bg-brand/90"
                >
                  Proceed to checkout
                </Link>

                <div className="mt-6 space-y-4 rounded-[1.5rem] border border-orange-100 bg-[var(--color-card)] p-4">
                  <div className="flex gap-3">
                    <ClockIcon className="h-5 w-5 text-brand" />
                    <div>
                      <p className="font-semibold text-foreground">
                        Delivery ETA
                      </p>
                      <p className="text-sm text-subtle">
                        {mockCart.deliveryTime}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <ReceiptIcon className="h-5 w-5 text-brand" />
                    <div>
                      <p className="font-semibold text-foreground">Payment mode</p>
                      <p className="text-sm text-subtle">
                        UPI, cards, wallet, or cash on delivery
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <LocationPinIcon className="h-5 w-5 text-brand" />
                    <div>
                      <p className="font-semibold text-foreground">
                        Delivery address
                      </p>
                      <p className="text-sm text-subtle">
                        {mockCart.deliveryAddress}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
