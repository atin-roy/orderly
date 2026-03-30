import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import {
  ClockIcon,
  LocationPinIcon,
  MinusIcon,
  PlusIcon,
  ReceiptIcon,
  TagIcon,
  TrashIcon,
} from "@/components/icons";
import { formatRupees, getCartSubtotal, getCartTotal, mockCart } from "@/data/mock-data";

const subtotal = getCartSubtotal();
const total = getCartTotal();

export default function CartPage() {
  return (
    <div className="min-h-screen bg-cream">
      <Header />

      <main>
        <section className="border-b border-orange-100 bg-[linear-gradient(180deg,rgba(255,248,238,0.98),rgba(255,248,238,0.8))]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand">
              Cart
            </p>
            <h1 className="mt-4 font-serif text-4xl font-bold leading-tight md:text-5xl">
              Review the basket before checkout
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-subtle">
              Keep the basket focused on one restaurant, show the bill clearly,
              and leave enough room for quick add-ons before payment.
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
                          {mockCart.offerLabel}
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
                    <span>Offer discount</span>
                    <span>-{formatRupees(mockCart.charges.discount)}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-orange-100 pt-4 font-semibold text-foreground">
                    <span>To pay</span>
                    <span className="font-serif text-3xl">{formatRupees(total)}</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="mt-6 w-full rounded-[1.25rem] bg-brand px-6 py-4 text-sm font-semibold uppercase tracking-[0.24em] text-white transition-colors hover:bg-brand/90"
                >
                  Proceed to checkout
                </button>

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
