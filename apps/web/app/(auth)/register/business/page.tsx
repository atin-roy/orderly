"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthShell } from "@/components/auth-shell";
import { ClockIcon, StoreIcon } from "@/components/icons";
import {
  submitBusinessSignup,
  type StagedSignupResult,
  validateIndianPhone,
} from "@/lib/registration";

const inputClassName =
  "w-full rounded-2xl border border-orange-100 bg-white px-4 py-3.5 text-sm text-foreground shadow-sm transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";

const selectClassName = `${inputClassName} appearance-none`;

export default function BusinessRegisterPage() {
  const [ownerName, setOwnerName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [serviceArea, setServiceArea] = useState("");
  const [businessType, setBusinessType] = useState("Restaurant");
  const [cuisineFocus, setCuisineFocus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<StagedSignupResult | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const phoneError = validateIndianPhone(phone);
    if (phoneError) {
      setError(phoneError);
      return;
    }

    setLoading(true);

    try {
      const response = await submitBusinessSignup({
        ownerName,
        businessName,
        email,
        phone,
        city,
        serviceArea,
        businessType,
        cuisineFocus,
      });
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to stage business signup.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Business signup"
      title="List your restaurant with the details operators actually care about."
      description="This onboarding page is designed to feel operational from day one: ownership, city coverage, service area, and menu focus are all captured in a backend-ready shape."
      sideContent={
        <>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand">
            Operator view
          </p>
          <h2 className="mt-4 font-serif text-3xl font-bold tracking-tight text-foreground">
            Tell us what you run, where you serve, and why customers should order from you.
          </h2>
          <div className="mt-8 space-y-4">
            {[
              "Service-area detail keeps the future partner API closer to reality.",
              "Business type and cuisine focus help merchandising and onboarding review.",
              "This form stages data now so backend hookup later is an adapter change, not a redesign.",
            ].map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 rounded-2xl bg-white/80 px-4 py-4 shadow-sm"
              >
                <StoreIcon className="mt-1 h-4 w-4 text-brand" />
                <p className="text-sm leading-7 text-subtle">{item}</p>
              </div>
            ))}
          </div>
        </>
      }
    >
      {result ? (
        <div className="rounded-[2rem] border border-emerald-200 bg-emerald-50 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-800">
            {result.status}
          </p>
          <h2 className="mt-3 font-serif text-3xl font-bold text-foreground">{result.title}</h2>
          <p className="mt-4 text-base leading-8 text-subtle">{result.message}</p>
          <div className="mt-6 flex items-start gap-3 rounded-2xl bg-white px-4 py-4">
            <ClockIcon className="mt-1 h-4 w-4 text-emerald-700" />
            <p className="text-sm leading-7 text-subtle">{result.nextStep}</p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-2xl bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand/90"
            >
              Back to home
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-2xl border border-orange-200 bg-white px-5 py-3 text-sm font-semibold text-brand transition hover:border-brand"
            >
              View other signup paths
            </Link>
          </div>
        </div>
      ) : (
        <>
          {error && (
            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label
                  htmlFor="ownerName"
                  className="mb-2 block text-sm font-semibold text-foreground"
                >
                  Owner name
                </label>
                <input
                  id="ownerName"
                  type="text"
                  required
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className={inputClassName}
                  placeholder="Aarav Sharma"
                />
              </div>

              <div>
                <label
                  htmlFor="businessName"
                  className="mb-2 block text-sm font-semibold text-foreground"
                >
                  Business name
                </label>
                <input
                  id="businessName"
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className={inputClassName}
                  placeholder="Delhi Zaika Kitchen"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-semibold text-foreground">
                  Business email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClassName}
                  placeholder="partner@delhizaika.in"
                />
              </div>

              <div>
                <label htmlFor="phone" className="mb-2 block text-sm font-semibold text-foreground">
                  Phone
                </label>
                <input
                  id="phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={inputClassName}
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
              <div>
                <label htmlFor="city" className="mb-2 block text-sm font-semibold text-foreground">
                  City
                </label>
                <input
                  id="city"
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className={inputClassName}
                  placeholder="Bengaluru"
                />
              </div>

              <div>
                <label
                  htmlFor="serviceArea"
                  className="mb-2 block text-sm font-semibold text-foreground"
                >
                  Locality / service area
                </label>
                <input
                  id="serviceArea"
                  type="text"
                  required
                  value={serviceArea}
                  onChange={(e) => setServiceArea(e.target.value)}
                  className={inputClassName}
                  placeholder="Indiranagar, Domlur, HAL"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="businessType"
                className="mb-2 block text-sm font-semibold text-foreground"
              >
                Business type
              </label>
              <select
                id="businessType"
                required
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                className={selectClassName}
              >
                <option>Restaurant</option>
                <option>Cloud Kitchen</option>
                <option>Cafe</option>
                <option>Bakery</option>
                <option>Sweet Shop</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="cuisineFocus"
                className="mb-2 block text-sm font-semibold text-foreground"
              >
                Cuisine / menu focus
              </label>
              <textarea
                id="cuisineFocus"
                required
                value={cuisineFocus}
                onChange={(e) => setCuisineFocus(e.target.value)}
                className={`${inputClassName} min-h-28 resize-y`}
                placeholder="North Indian thalis, kebabs, biryani, and late-night rolls"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center rounded-2xl bg-brand px-6 py-4 text-sm font-semibold text-white transition hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Saving partner details..." : "Submit restaurant application"}
            </button>
          </form>
        </>
      )}
    </AuthShell>
  );
}
