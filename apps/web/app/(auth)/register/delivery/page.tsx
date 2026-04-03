"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthShell } from "@/components/auth-shell";
import { EyeIcon, EyeOffIcon, TruckIcon } from "@/components/icons";
import {
  submitDeliverySignup,
  validateIndianPhone,
} from "@/lib/registration";

const inputClassName =
  "w-full rounded-2xl border border-emerald-100 bg-white px-4 py-3.5 text-sm text-foreground shadow-sm transition focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/20";

const selectClassName = `${inputClassName} appearance-none`;

export default function DeliveryRegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [vehicleType, setVehicleType] = useState("Bike");
  const [preferredShift, setPreferredShift] = useState("Lunch");
  const [serviceZones, setServiceZones] = useState("");
  const [deliveryExperience, setDeliveryExperience] = useState("No prior experience");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const phoneError = validateIndianPhone(phone);
    if (phoneError) {
      setError(phoneError);
      return;
    }

    setLoading(true);

    try {
      await submitDeliverySignup({
        fullName,
        email,
        password,
        phone,
        city,
        vehicleType,
        preferredShift,
        serviceZones,
        deliveryExperience,
      });
      router.push("/delivery/deliveries");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delivery registration failed.");
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
                <label htmlFor="password" className="mb-2 block text-sm font-semibold text-foreground">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`${inputClassName} pr-12`}
                    placeholder="Minimum 8 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    className="absolute inset-y-0 right-0 flex items-center px-4 text-subtle transition hover:text-foreground"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                  >
                    {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="mb-2 block text-sm font-semibold text-foreground">
                  Confirm password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`${inputClassName} pr-12`}
                    placeholder="Repeat your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((visible) => !visible)}
                    className="absolute inset-y-0 right-0 flex items-center px-4 text-subtle transition hover:text-foreground"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    aria-pressed={showConfirmPassword}
                  >
                    {showConfirmPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  </button>
                </div>
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
              {loading ? "Creating delivery account..." : "Submit delivery signup"}
            </button>
          </form>

      <div className="mt-6 flex flex-col gap-3 rounded-[1.75rem] border border-emerald-100 bg-emerald-50/70 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">Already registered?</p>
          <p className="mt-1 text-sm text-subtle">
            Sign in to view your delivery assignments.
          </p>
        </div>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 transition hover:text-emerald-800"
        >
          Log in
        </Link>
      </div>
    </AuthShell>
  );
}
