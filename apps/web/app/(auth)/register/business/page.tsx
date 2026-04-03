"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthShell } from "@/components/auth-shell";
import { EyeIcon, EyeOffIcon, StoreIcon } from "@/components/icons";
import {
  submitBusinessSignup,
  validateIndianPhone,
} from "@/lib/registration";

const inputClassName =
  "w-full rounded-2xl border border-orange-100 bg-white px-4 py-3.5 text-sm text-foreground shadow-sm transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";

const selectClassName = `${inputClassName} appearance-none`;

export default function BusinessRegisterPage() {
  const router = useRouter();
  const [ownerName, setOwnerName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [serviceArea, setServiceArea] = useState("");
  const [businessType, setBusinessType] = useState("Restaurant");
  const [cuisineFocus, setCuisineFocus] = useState("");
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
      await submitBusinessSignup({
        ownerName,
        businessName,
        email,
        password,
        phone,
        city,
        serviceArea,
        businessType,
        cuisineFocus,
      });
      router.push("/owner/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Business registration failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Business signup"
      title="List your restaurant with the details operators actually care about."
      description="Share the ownership, city coverage, service area, and menu focus that help your restaurant look ready to order from."
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
              "Service-area detail makes it easier to show your restaurant in the right neighbourhoods.",
              "Business type and cuisine focus help customers understand what you do best.",
              "The form captures the essentials operators expect to set up before launch.",
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
              {loading ? "Creating business account..." : "Submit restaurant application"}
            </button>
          </form>

      <div className="mt-6 flex flex-col gap-3 rounded-[1.75rem] border border-orange-100 bg-orange-50/70 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">Already registered?</p>
          <p className="mt-1 text-sm text-subtle">
            Sign in to manage your restaurant listings.
          </p>
        </div>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm font-semibold text-brand transition hover:text-brand/80"
        >
          Log in
        </Link>
      </div>
    </AuthShell>
  );
}
