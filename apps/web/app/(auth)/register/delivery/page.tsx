"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthShell } from "@/components/auth-shell";
import { ClockIcon, TruckIcon } from "@/components/icons";
import {
  submitDeliverySignup,
  type StagedSignupResult,
  validateIndianPhone,
} from "@/lib/registration";

const inputClassName =
  "w-full rounded-2xl border border-emerald-100 bg-white px-4 py-3.5 text-sm text-foreground shadow-sm transition focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/20";

const selectClassName = `${inputClassName} appearance-none`;

export default function DeliveryRegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [vehicleType, setVehicleType] = useState("Bike");
  const [preferredShift, setPreferredShift] = useState("Lunch");
  const [serviceZones, setServiceZones] = useState("");
  const [deliveryExperience, setDeliveryExperience] = useState("No prior experience");
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
      const response = await submitDeliverySignup({
        fullName,
        email,
        phone,
        city,
        vehicleType,
        preferredShift,
        serviceZones,
        deliveryExperience,
      });
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to stage delivery signup.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Delivery signup"
      title="Join the delivery side with real shift and route detail."
      description="This page is shaped around how delivery work is actually planned: city, vehicle, shift preference, and the zones where you want to stay active."
      sideContent={
        <>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand">
            Partner rhythm
          </p>
          <h2 className="mt-4 font-serif text-3xl font-bold tracking-tight text-foreground">
            Delivery recruitment should sound specific about routes, timing, and earning windows.
          </h2>
          <div className="mt-8 space-y-4">
            {[
              "Vehicle type and shift preference are captured up front for future dispatch logic.",
              "Service zones keep the flow grounded in dense, local delivery coverage.",
              "This staged adapter can swap to a real onboarding API later without changing the UI contract.",
            ].map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 rounded-2xl bg-white/80 px-4 py-4 shadow-sm"
              >
                <TruckIcon className="mt-1 h-4 w-4 text-emerald-700" />
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
              className="inline-flex items-center justify-center rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
            >
              Back to home
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-2xl border border-emerald-200 bg-white px-5 py-3 text-sm font-semibold text-emerald-800 transition hover:border-emerald-500"
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
                  htmlFor="fullName"
                  className="mb-2 block text-sm font-semibold text-foreground"
                >
                  Full name
                </label>
                <input
                  id="fullName"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={inputClassName}
                  placeholder="Rohit Verma"
                />
              </div>

              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-semibold text-foreground">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClassName}
                  placeholder="rohit@example.com"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
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
                  placeholder="Hyderabad"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label
                  htmlFor="vehicleType"
                  className="mb-2 block text-sm font-semibold text-foreground"
                >
                  Vehicle type
                </label>
                <select
                  id="vehicleType"
                  required
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className={selectClassName}
                >
                  <option>Bike</option>
                  <option>Scooter</option>
                  <option>Cycle</option>
                  <option>Walk</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="preferredShift"
                  className="mb-2 block text-sm font-semibold text-foreground"
                >
                  Preferred shift
                </label>
                <select
                  id="preferredShift"
                  required
                  value={preferredShift}
                  onChange={(e) => setPreferredShift(e.target.value)}
                  className={selectClassName}
                >
                  <option>Lunch</option>
                  <option>Dinner</option>
                  <option>Late night</option>
                  <option>Weekends only</option>
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="serviceZones"
                className="mb-2 block text-sm font-semibold text-foreground"
              >
                Preferred service zones
              </label>
              <textarea
                id="serviceZones"
                required
                value={serviceZones}
                onChange={(e) => setServiceZones(e.target.value)}
                className={`${inputClassName} min-h-28 resize-y`}
                placeholder="Banjara Hills, Jubilee Hills, Madhapur"
              />
            </div>

            <div>
              <label
                htmlFor="deliveryExperience"
                className="mb-2 block text-sm font-semibold text-foreground"
              >
                Delivery experience
              </label>
              <select
                id="deliveryExperience"
                required
                value={deliveryExperience}
                onChange={(e) => setDeliveryExperience(e.target.value)}
                className={selectClassName}
              >
                <option>No prior experience</option>
                <option>Less than 1 year</option>
                <option>1 to 3 years</option>
                <option>More than 3 years</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center rounded-2xl bg-emerald-700 px-6 py-4 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Saving delivery details..." : "Submit delivery signup"}
            </button>
          </form>
        </>
      )}
    </AuthShell>
  );
}
