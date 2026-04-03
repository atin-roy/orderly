"use client";

import type { Cart, UserAddress } from "@orderly/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AuthGuard } from "@/components/auth-guard";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { LocationModal } from "@/components/location-modal";
import { useSession } from "@/components/session-provider";
import {
  ArrowLeftIcon,
  ClockIcon,
  LocationPinIcon,
  ReceiptIcon,
  TagIcon,
} from "@/components/icons";
import { formatRupees } from "@/data/mock-data";
import { getCart, placeOrder, validateCoupon } from "@/lib/api";

type PaymentMethod = "upi-id" | "upi-qr" | "card";
type PaymentResult = "idle" | "processing" | "failed";

const paymentMethodCards: Array<{
  id: PaymentMethod;
  title: string;
  subtitle: string;
}> = [
  {
    id: "upi-id",
    title: "UPI ID",
    subtitle: "Pay with a UPI handle like name@bank.",
  },
  {
    id: "upi-qr",
    title: "UPI QR",
    subtitle: "Scan a generated code inside the fake Razorpay sheet.",
  },
  {
    id: "card",
    title: "Card",
    subtitle: "Use a fake card entry that still feels like a gateway step.",
  },
];

function FakeRazorpaySheet({
  amount,
  paymentMethod,
  processing,
  error,
  onCancel,
  onConfirm,
}: {
  amount: number;
  paymentMethod: PaymentMethod;
  processing: boolean;
  error: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={processing ? undefined : onCancel} />
      <div className="relative w-full max-w-md overflow-hidden rounded-[2rem] bg-white shadow-[0_30px_80px_rgba(35,24,21,0.22)]">
        <div className="bg-[linear-gradient(135deg,#072654,#1153a4_42%,#2eb6ff)] px-6 py-6 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
            Razorpay preview
          </p>
          <h2 className="mt-3 font-serif text-3xl font-bold">Secure checkout</h2>
          <p className="mt-2 text-sm text-white/85">
            A guided payment preview with the same confirmation flow you would expect at checkout.
          </p>
        </div>

        <div className="space-y-5 p-6">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
              Amount to pay
            </p>
            <p className="mt-2 font-serif text-4xl font-bold text-slate-900">
              {formatRupees(amount)}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Method: {paymentMethodCards.find((item) => item.id === paymentMethod)?.title}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 px-4 py-4">
            <p className="text-sm font-semibold text-slate-900">What this simulates</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Payment confirmation, order placement, and the handoff into your order timeline.
            </p>
          </div>

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={processing}
              className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={processing}
              className="flex-1 rounded-2xl bg-[#0b72ff] px-4 py-3 text-sm font-semibold text-white"
            >
              {processing ? "Processing..." : "Pay now"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const { profile } = useSession();
  const [cart, setCart] = useState<Cart | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("upi-id");
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [couponMessage, setCouponMessage] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [paymentSheetOpen, setPaymentSheetOpen] = useState(false);
  const [paymentResult, setPaymentResult] = useState<PaymentResult>("idle");
  const [paymentError, setPaymentError] = useState("");
  const [locationOpen, setLocationOpen] = useState(false);

  useEffect(() => {
    void getCart()
      .then((response) => setCart(response.data))
      .catch(() => setCart(null));
  }, []);

  const addresses = useMemo(() => profile?.addresses ?? [], [profile?.addresses]);
  const defaultAddress = useMemo(
    () => addresses.find((address) => address.isDefault) ?? addresses[0] ?? null,
    [addresses]
  );
  const selectedAddress: UserAddress | null =
    addresses.find((address) => address.id === (selectedAddressId ?? defaultAddress?.id)) ??
    defaultAddress;
  const payableTotal = (cart?.charges.total ?? 0) - discountAmount;

  async function handleApplyCoupon() {
    try {
      const response = await validateCoupon(couponCode.trim());
      setAppliedCoupon(response.data.valid ? response.data.code : null);
      setDiscountAmount(response.data.valid ? response.data.discountAmount : 0);
      setCouponMessage(response.data.message);
    } catch (error) {
      setAppliedCoupon(null);
      setDiscountAmount(0);
      setCouponMessage(error instanceof Error ? error.message : "Unable to validate coupon.");
    }
  }

  async function handleConfirmPayment() {
    if (!selectedAddress) {
      setPaymentError("Select or save a delivery address before payment.");
      return;
    }

    setPaymentResult("processing");
    setPaymentError("");

    const timestamp = Date.now();
    const gatewayOrderId = `order_demo_${timestamp}`;
    const gatewayPaymentId = `pay_demo_${timestamp}`;

    try {
      await new Promise((resolve) => window.setTimeout(resolve, 1200));
      await placeOrder({
        addressId: selectedAddress.id,
        paymentMethod: paymentMethod === "upi-id" ? "UPI" : paymentMethod === "upi-qr" ? "UPI QR" : "Card",
        paymentProvider: "RAZORPAY_FAKE",
        paymentStatus: "CAPTURED",
        gatewayOrderId,
        gatewayPaymentId,
        couponCode: appliedCoupon ?? undefined,
      });
      setPaymentSheetOpen(false);
      setPlacingOrder(false);
      router.push("/orders");
    } catch (error) {
      setPaymentResult("failed");
      setPaymentError(error instanceof Error ? error.message : "Payment failed.");
    }
  }

  if (!cart || cart.items.length === 0) {
    return (
      <AuthGuard requireCustomerRole>
        <div className="min-h-screen bg-cream">
          <Header />
          <main className="mx-auto max-w-3xl px-4 py-16 text-center">
            <p className="text-sm text-subtle">Your cart is empty. Add something before checkout.</p>
            <Link
              href="/explore"
              className="mt-4 inline-flex rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white"
            >
              Explore restaurants
            </Link>
          </main>
          <Footer />
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requireCustomerRole>
      <div className="min-h-screen bg-cream">
        <Header />

        <main>
          <section className="border-b border-orange-100 bg-[linear-gradient(180deg,rgba(255,248,238,0.98),rgba(255,248,238,0.8))]">
            <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 md:py-12 lg:px-8">
              <Link
                href="/cart"
                className="inline-flex items-center gap-2 text-sm font-semibold tracking-wide text-brand transition-colors hover:text-brand/80"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                Back to cart
              </Link>

              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.35em] text-brand">
                Checkout
              </p>
              <h1 className="mt-4 font-serif text-4xl font-bold leading-tight md:text-5xl">
                Confirm your address, payment method, and final total
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-subtle">
                Finish your order with a familiar payment flow, then head straight to live order tracking.
              </p>
            </div>
          </section>

          <section className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_360px]">
              <div className="space-y-8">
                <div className="rounded-[2rem] border border-orange-100 bg-white p-6 shadow-[0_18px_60px_rgba(211,91,31,0.08)]">
                  <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand">
                        Addresses
                      </p>
                      <h2 className="mt-3 font-serif text-3xl font-bold">Select delivery address</h2>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-sm text-subtle">Choose where this order should be delivered</p>
                      <button
                        type="button"
                        onClick={() => setLocationOpen(true)}
                        className="inline-flex items-center justify-center rounded-full border border-orange-200 bg-white px-4 py-2 text-sm font-semibold text-brand transition hover:border-brand"
                      >
                        Add address
                      </button>
                    </div>
                  </div>

                  {addresses.length ? (
                    <div className="mt-6 grid gap-4">
                      {addresses.map((address) => (
                        <button
                          key={address.id}
                          type="button"
                          onClick={() => setSelectedAddressId(address.id)}
                          className={`rounded-[1.5rem] border p-4 text-left transition ${
                            (selectedAddressId ?? defaultAddress?.id) === address.id
                              ? "border-brand bg-orange-50"
                              : "border-orange-100"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <p className="font-semibold text-foreground">{address.label}</p>
                              <p className="mt-2 text-sm leading-6 text-subtle">
                                {address.address}
                                {address.buildingInfo ? `, ${address.buildingInfo}` : ""}
                                {address.city ? `, ${address.city}` : ""}
                              </p>
                            </div>
                            <LocationPinIcon className="h-5 w-5 text-brand" />
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-6 rounded-[1.5rem] border border-dashed border-orange-200 bg-orange-50/60 p-6">
                      <p className="text-sm leading-7 text-subtle">
                        You do not have a saved delivery address yet. Add one here to continue with
                        checkout.
                      </p>
                      <button
                        type="button"
                        onClick={() => setLocationOpen(true)}
                        className="mt-4 inline-flex items-center justify-center rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand/90"
                      >
                        Add delivery address
                      </button>
                    </div>
                  )}
                </div>

                <div className="rounded-[2rem] border border-orange-100 bg-white p-6 shadow-[0_18px_60px_rgba(211,91,31,0.08)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand">
                    Payment method
                  </p>
                  <h2 className="mt-3 font-serif text-3xl font-bold">Choose payment method</h2>

                  <div className="mt-6 grid gap-4 md:grid-cols-3">
                    {paymentMethodCards.map((method) => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setPaymentMethod(method.id)}
                        className={`rounded-[1.5rem] border px-4 py-4 text-left transition ${
                          paymentMethod === method.id
                            ? "border-brand bg-orange-50"
                            : "border-orange-100 bg-white"
                        }`}
                      >
                        <p className="font-semibold text-foreground">{method.title}</p>
                        <p className="mt-2 text-sm leading-6 text-subtle">{method.subtitle}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-[2rem] border border-orange-100 bg-[var(--color-card)] p-6 shadow-[0_18px_60px_rgba(211,91,31,0.08)]">
                  <div className="flex items-center gap-3">
                    <TagIcon className="h-5 w-5 text-brand" />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand">
                        Coupon
                      </p>
                      <h2 className="mt-1 font-serif text-2xl font-bold">Apply a discount</h2>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-col gap-3 md:flex-row">
                    <input
                      value={couponCode}
                      onChange={(event) => setCouponCode(event.target.value.toUpperCase())}
                      placeholder="CRAVINGS150"
                      className="flex-1 rounded-2xl border border-orange-200 bg-white px-4 py-3 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                    />
                    <button
                      type="button"
                      onClick={() => void handleApplyCoupon()}
                      className="rounded-2xl bg-brand px-5 py-3 text-sm font-semibold text-white"
                    >
                      Apply
                    </button>
                  </div>

                  {couponMessage ? (
                    <p className="mt-3 text-sm text-subtle">{couponMessage}</p>
                  ) : null}
                </div>
              </div>

              <div className="rounded-[2rem] border border-orange-100 bg-white p-6 shadow-[0_18px_60px_rgba(211,91,31,0.08)]">
                <div className="flex items-center gap-3">
                  <ReceiptIcon className="h-5 w-5 text-brand" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand">
                      Summary
                    </p>
                    <h2 className="mt-1 font-serif text-2xl font-bold">Final payment</h2>
                  </div>
                </div>

                <div className="mt-6 space-y-4 text-sm">
                  <div className="flex items-center justify-between text-subtle">
                    <span>{cart.restaurantName}</span>
                    <span>{cart.deliveryTimeMinutes} min</span>
                  </div>
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
                    <span>-{formatRupees(discountAmount)}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-orange-100 pt-4 font-semibold text-foreground">
                    <span>Total payable</span>
                    <span>{formatRupees(payableTotal)}</span>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-orange-100 bg-orange-50/60 px-4 py-4 text-sm text-subtle">
                  <p className="font-semibold text-foreground">
                    {selectedAddress ? selectedAddress.label : "No address selected"}
                  </p>
                  <p className="mt-2">
                    {selectedAddress
                      ? `${selectedAddress.address}${selectedAddress.buildingInfo ? `, ${selectedAddress.buildingInfo}` : ""}, ${selectedAddress.city ?? ""}`
                      : "Select an address to continue."}
                  </p>
                </div>

                <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <div className="flex items-center gap-3">
                    <ClockIcon className="h-5 w-5 text-[#0b72ff]" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Gateway metadata preview</p>
                      <p className="mt-1 text-xs text-slate-500">
                        Provider: `RAZORPAY_FAKE` · status will be persisted as `CAPTURED`
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setPlacingOrder(true);
                    setPaymentResult("idle");
                    setPaymentError("");
                    setPaymentSheetOpen(true);
                  }}
                  disabled={placingOrder}
                  className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-brand px-5 py-4 text-sm font-semibold text-white transition hover:bg-brand/90"
                >
                  Open fake Razorpay
                </button>
              </div>
            </div>
          </section>
        </main>

        <Footer />

        {paymentSheetOpen ? (
          <FakeRazorpaySheet
            amount={payableTotal}
            paymentMethod={paymentMethod}
            processing={paymentResult === "processing"}
            error={paymentError}
            onCancel={() => {
              setPaymentSheetOpen(false);
              setPlacingOrder(false);
            }}
            onConfirm={() => void handleConfirmPayment()}
          />
        ) : null}

        <LocationModal open={locationOpen} onClose={() => setLocationOpen(false)} />
      </div>
    </AuthGuard>
  );
}
