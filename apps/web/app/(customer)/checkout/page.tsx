"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthGuard } from "@/components/auth-guard";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { useSession } from "@/components/session-provider";
import {
  ArrowLeftIcon,
  ClockIcon,
  LocationPinIcon,
  ReceiptIcon,
  TagIcon,
} from "@/components/icons";
import { formatRupees, getCartSubtotal, getCartTotal, mockCart } from "@/data/mock-data";

type Address = {
  id: string;
  label: string;
  recipient: string;
  phone: string;
  line1: string;
  area: string;
  city: string;
  landmark?: string;
  isDefault?: boolean;
};

type PaymentMethod = "upi-id" | "upi-qr" | "cod" | "card";

const fallbackSavedAddresses: Address[] = [
  {
    id: "addr-home",
    label: "Home",
    recipient: "Atin Kumar",
    phone: "+91 98765 43210",
    line1: "Flat 804, Palm Residency",
    area: "Bandra West",
    city: "Mumbai",
    landmark: "Near Hill Road signal",
    isDefault: true,
  },
  {
    id: "addr-work",
    label: "Work",
    recipient: "Atin Kumar",
    phone: "+91 99887 76655",
    line1: "Tower 6, Peninsula Business Park",
    area: "Lower Parel",
    city: "Mumbai",
    landmark: "Lobby B reception",
  },
  {
    id: "addr-friends",
    label: "Friends",
    recipient: "Atin Kumar",
    phone: "+91 98111 22334",
    line1: "18, Lake View Apartments",
    area: "Indiranagar",
    city: "Bengaluru",
    landmark: "Opposite CMH Park",
  },
];

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
    subtitle: "Scan a generated code from any UPI app.",
  },
  {
    id: "cod",
    title: "Cash on delivery",
    subtitle: "Pay the rider when the order arrives.",
  },
  {
    id: "card",
    title: "Card",
    subtitle: "Use debit or credit card details at checkout.",
  },
];

const subtotal = getCartSubtotal();
const total = getCartTotal();
function hashString(value: string) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function isFinderCell(x: number, y: number, size: number) {
  const inTopLeft = x < 7 && y < 7;
  const inTopRight = x >= size - 7 && y < 7;
  const inBottomLeft = x < 7 && y >= size - 7;

  return inTopLeft || inTopRight || inBottomLeft;
}

function finderCellValue(x: number, y: number, size: number) {
  const translatedX = x >= size - 7 ? x - (size - 7) : x;
  const translatedY = y >= size - 7 ? y - (size - 7) : y;
  const outerRing =
    translatedX === 0 ||
    translatedX === 6 ||
    translatedY === 0 ||
    translatedY === 6;
  const innerSquare =
    translatedX >= 2 &&
    translatedX <= 4 &&
    translatedY >= 2 &&
    translatedY <= 4;

  return outerRing || innerSquare;
}

function PaymentQrCode({ value }: { value: string }) {
  const size = 21;
  const cell = 8;
  const seed = hashString(value);
  const cells: React.ReactNode[] = [];

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      let filled = false;

      if (isFinderCell(x, y, size)) {
        filled = finderCellValue(x, y, size);
      } else {
        const noise = hashString(`${seed}:${x}:${y}`);
        filled = ((noise >> ((x + y) % 16)) & 1) === 1;
      }

      if (filled) {
        cells.push(
          <rect
            key={`${x}-${y}`}
            x={x * cell}
            y={y * cell}
            width={cell}
            height={cell}
            rx="1.5"
            fill="currentColor"
          />,
        );
      }
    }
  }

  return (
    <div className="rounded-[1.75rem] border border-orange-100 bg-white p-4 shadow-sm">
      <div className="flex justify-center rounded-[1.5rem] bg-stone-950 p-4 text-white">
        <svg
          viewBox={`0 0 ${size * cell} ${size * cell}`}
          className="h-56 w-56"
          role="img"
          aria-label="Generated UPI QR code"
        >
          <rect width={size * cell} height={size * cell} rx="16" fill="white" />
          <g className="text-stone-950">{cells}</g>
        </svg>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  const { profile } = useSession();
  const profileAddresses: Address[] =
    profile?.role === "USER" && profile.addresses.length
      ? profile.addresses.map((address) => ({
          id: String(address.id),
          label: address.label,
          recipient: profile.name || "Orderly customer",
          phone: address.phone,
          line1: address.address,
          area: address.buildingInfo || address.label,
          city: address.city || "",
          landmark: address.buildingInfo || undefined,
          isDefault: address.isDefault,
        }))
      : fallbackSavedAddresses;
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("upi-id");
  const [upiId, setUpiId] = useState("atin@okaxis");
  const [cardName, setCardName] = useState("Atin Kumar");
  const [cardNumber, setCardNumber] = useState("4242 4242 4242 4242");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvv, setCardCvv] = useState("123");

  const defaultAddressId =
    profileAddresses.find((address) => address.isDefault)?.id ??
    profileAddresses[0]?.id ??
    "";
  const activeAddressId = selectedAddressId ?? defaultAddressId;

  const selectedAddress =
    profileAddresses.find((address) => address.id === activeAddressId) ?? profileAddresses[0];

  const qrPayload = `upi://pay?pa=orderly@okhdfcbank&pn=Orderly&am=${total}&cu=INR&tn=${encodeURIComponent(
    `${mockCart.restaurantName} order for ${selectedAddress.recipient}`,
  )}`;

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
              Choose where the order goes and how you want to pay
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-subtle">
              Confirm the delivery address, pick a payment method, and place
              the order without leaving the flow.
            </p>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_360px]">
            <div className="space-y-8">
              <div className="rounded-[2rem] border border-orange-100 bg-white p-6 shadow-[0_18px_60px_rgba(211,91,31,0.08)]">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand">
                      Addresses
                    </p>
                    <h2 className="mt-3 font-serif text-3xl font-bold">
                      Select delivery address
                    </h2>
                  </div>
                  <p className="text-sm text-subtle">Default address is preselected</p>
                </div>

                <div className="mt-6 grid gap-4">
                  {profileAddresses.map((address) => {
                    const isSelected = address.id === selectedAddressId;

                    return (
                      <button
                        key={address.id}
                        type="button"
                        onClick={() => setSelectedAddressId(address.id)}
                        className={`rounded-[1.5rem] border p-5 text-left transition ${
                          isSelected
                            ? "border-brand bg-orange-50 shadow-[0_12px_30px_rgba(211,91,31,0.12)]"
                            : "border-orange-100 bg-white hover:border-orange-200 hover:bg-[var(--color-card)]"
                        }`}
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-3">
                              <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] ${
                                  isSelected ? "bg-brand text-white" : "bg-[var(--color-card)] text-brand"
                                }`}
                              >
                                {address.label}
                              </span>
                              {address.isDefault ? (
                                <span className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
                                  Default
                                </span>
                              ) : null}
                            </div>
                            <h3 className="mt-4 text-xl font-semibold text-foreground">
                              {address.recipient}
                            </h3>
                            <p className="mt-2 text-sm leading-7 text-subtle">
                              {address.line1}, {address.area}, {address.city}
                            </p>
                            {address.landmark ? (
                              <p className="text-sm text-subtle">
                                Landmark: {address.landmark}
                              </p>
                            ) : null}
                            <p className="mt-2 text-sm text-subtle">{address.phone}</p>
                          </div>

                          <div
                            className={`mt-1 h-5 w-5 rounded-full border-2 ${
                              isSelected ? "border-brand bg-brand" : "border-orange-200 bg-white"
                            }`}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-[2rem] border border-orange-100 bg-white p-6 shadow-[0_18px_60px_rgba(211,91,31,0.08)]">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand">
                  Payment
                </p>
                <h2 className="mt-3 font-serif text-3xl font-bold">
                  Choose payment method
                </h2>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {paymentMethodCards.map((method) => {
                    const isSelected = paymentMethod === method.id;

                    return (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setPaymentMethod(method.id)}
                        className={`rounded-[1.5rem] border p-5 text-left transition ${
                          isSelected
                            ? "border-brand bg-orange-50 shadow-[0_12px_30px_rgba(211,91,31,0.12)]"
                            : "border-orange-100 bg-white hover:border-orange-200 hover:bg-[var(--color-card)]"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-lg font-semibold text-foreground">
                              {method.title}
                            </h3>
                            <p className="mt-2 text-sm leading-7 text-subtle">
                              {method.subtitle}
                            </p>
                          </div>
                          <div
                            className={`mt-1 h-5 w-5 rounded-full border-2 ${
                              isSelected ? "border-brand bg-brand" : "border-orange-200 bg-white"
                            }`}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>

                {paymentMethod === "upi-id" ? (
                  <div className="mt-6 rounded-[1.75rem] border border-orange-100 bg-[var(--color-card)] p-5">
                    <label
                      htmlFor="upi-id"
                      className="block text-xs font-semibold uppercase tracking-[0.22em] text-brand"
                    >
                      UPI ID
                    </label>
                    <input
                      id="upi-id"
                      type="text"
                      value={upiId}
                      onChange={(event) => setUpiId(event.target.value)}
                      className="mt-3 w-full rounded-2xl border border-orange-100 bg-white px-4 py-3.5 text-sm text-foreground shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                      placeholder="name@bank"
                    />
                    <p className="mt-3 text-sm text-subtle">
                      Your UPI app will open with the order amount and merchant
                      details.
                    </p>
                  </div>
                ) : null}

                {paymentMethod === "upi-qr" ? (
                  <div className="mt-6 grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
                    <PaymentQrCode value={qrPayload} />
                    <div className="rounded-[1.75rem] border border-orange-100 bg-[var(--color-card)] p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand">
                        Scan and pay
                      </p>
                      <h3 className="mt-3 text-2xl font-semibold text-foreground">
                        UPI QR ready for this order
                      </h3>
                      <p className="mt-3 text-sm leading-7 text-subtle">
                        Open any UPI app, scan the code, and complete payment
                        for {formatRupees(total)}.
                      </p>
                      <div className="mt-5 rounded-2xl border border-orange-100 bg-white p-4 text-sm text-subtle">
                        <p className="font-semibold text-foreground">Payee</p>
                        <p className="mt-1">Orderly</p>
                        <p className="mt-4 font-semibold text-foreground">UPI handle</p>
                        <p className="mt-1">orderly@okhdfcbank</p>
                      </div>
                    </div>
                  </div>
                ) : null}

                {paymentMethod === "cod" ? (
                  <div className="mt-6 rounded-[1.75rem] border border-orange-100 bg-[var(--color-card)] p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand">
                      Cash on delivery
                    </p>
                    <h3 className="mt-3 text-2xl font-semibold text-foreground">
                      Pay when the rider arrives
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-subtle">
                      Keep exact change ready when possible. Cash on delivery is
                      available for this order value and delivery zone.
                    </p>
                  </div>
                ) : null}

                {paymentMethod === "card" ? (
                  <div className="mt-6 grid gap-4 rounded-[1.75rem] border border-orange-100 bg-[var(--color-card)] p-5 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <label
                        htmlFor="card-name"
                        className="block text-xs font-semibold uppercase tracking-[0.22em] text-brand"
                      >
                        Name on card
                      </label>
                      <input
                        id="card-name"
                        type="text"
                        value={cardName}
                        onChange={(event) => setCardName(event.target.value)}
                        className="mt-3 w-full rounded-2xl border border-orange-100 bg-white px-4 py-3.5 text-sm text-foreground shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label
                        htmlFor="card-number"
                        className="block text-xs font-semibold uppercase tracking-[0.22em] text-brand"
                      >
                        Card number
                      </label>
                      <input
                        id="card-number"
                        type="text"
                        value={cardNumber}
                        onChange={(event) => setCardNumber(event.target.value)}
                        className="mt-3 w-full rounded-2xl border border-orange-100 bg-white px-4 py-3.5 text-sm text-foreground shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="card-expiry"
                        className="block text-xs font-semibold uppercase tracking-[0.22em] text-brand"
                      >
                        Expiry
                      </label>
                      <input
                        id="card-expiry"
                        type="text"
                        value={cardExpiry}
                        onChange={(event) => setCardExpiry(event.target.value)}
                        className="mt-3 w-full rounded-2xl border border-orange-100 bg-white px-4 py-3.5 text-sm text-foreground shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                        placeholder="MM/YY"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="card-cvv"
                        className="block text-xs font-semibold uppercase tracking-[0.22em] text-brand"
                      >
                        CVV
                      </label>
                      <input
                        id="card-cvv"
                        type="password"
                        value={cardCvv}
                        onChange={(event) => setCardCvv(event.target.value)}
                        className="mt-3 w-full rounded-2xl border border-orange-100 bg-white px-4 py-3.5 text-sm text-foreground shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                      />
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-[2rem] border border-orange-100 bg-white p-6 shadow-[0_18px_60px_rgba(211,91,31,0.08)] lg:sticky lg:top-24">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand">
                  Order summary
                </p>
                <h2 className="mt-3 font-serif text-3xl font-bold">
                  Almost there
                </h2>

                <div className="mt-6 rounded-[1.5rem] border border-orange-100 bg-[var(--color-card)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand">
                    Delivering to
                  </p>
                  <p className="mt-3 text-lg font-semibold text-foreground">
                    {selectedAddress.label}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-subtle">
                    {selectedAddress.line1}, {selectedAddress.area}, {selectedAddress.city}
                  </p>
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
                  Place order
                </button>

                <div className="mt-6 space-y-4 rounded-[1.5rem] border border-orange-100 bg-[var(--color-card)] p-4">
                  <div className="flex gap-3">
                    <ClockIcon className="h-5 w-5 text-brand" />
                    <div>
                      <p className="font-semibold text-foreground">Delivery ETA</p>
                      <p className="text-sm text-subtle">{mockCart.deliveryTime}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <ReceiptIcon className="h-5 w-5 text-brand" />
                    <div>
                      <p className="font-semibold text-foreground">Payment</p>
                      <p className="text-sm text-subtle">
                        {paymentMethod === "upi-id"
                          ? `UPI ID: ${upiId}`
                          : paymentMethod === "upi-qr"
                            ? "UPI QR scan"
                            : paymentMethod === "cod"
                              ? "Cash on delivery"
                              : "Card payment"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <LocationPinIcon className="h-5 w-5 text-brand" />
                    <div>
                      <p className="font-semibold text-foreground">Address</p>
                      <p className="text-sm text-subtle">
                        {selectedAddress.line1}, {selectedAddress.area}, {selectedAddress.city}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <TagIcon className="h-5 w-5 text-brand" />
                    <div>
                      <p className="font-semibold text-foreground">Order from</p>
                      <p className="text-sm text-subtle">{mockCart.restaurantName}</p>
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
    </AuthGuard>
  );
}
