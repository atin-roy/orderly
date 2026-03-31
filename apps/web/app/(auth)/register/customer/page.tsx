"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthShell } from "@/components/auth-shell";
import { EyeIcon, EyeOffIcon, SearchIcon, StarIcon } from "@/components/icons";
import { registerCustomer, validateIndianPhone } from "@/lib/registration";

const inputClassName =
  "w-full rounded-2xl border border-orange-100 bg-white px-4 py-3.5 text-sm text-foreground shadow-sm transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";

export default function CustomerRegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [phone, setPhone] = useState("");
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
      await registerCustomer({ email, password, phone });
      router.push("/explore");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Customer signup"
      title="Create your account and get to the food faster."
      description="Sign up in a minute and get straight to ordering."
      sideContent={
        <>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand">
            Built for ordering
          </p>
          <h2 className="mt-4 font-serif text-3xl font-bold tracking-tight text-foreground">
            Account setup should feel like the first step to dinner, not paperwork.
          </h2>
          <div className="mt-8 space-y-4">
            {[
              "Quick signup so you can start browsing restaurants right away.",
              "Your account keeps orders, addresses, and updates in one place.",
              "A short path from signup to your next meal.",
            ].map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 rounded-2xl bg-white/80 px-4 py-4 shadow-sm"
              >
                <StarIcon className="mt-1 h-4 w-4 text-marigold" />
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
            placeholder="you@example.com"
          />
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
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm font-semibold text-foreground"
            >
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

        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center rounded-2xl bg-brand px-6 py-4 text-sm font-semibold text-white transition hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Creating account..." : "Create customer account"}
        </button>
      </form>

      <div className="mt-6 flex flex-col gap-3 rounded-[1.75rem] border border-orange-100 bg-orange-50/70 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">Already registered?</p>
          <p className="mt-1 text-sm text-subtle">
            Sign in and jump back into saved restaurants and active orders.
          </p>
        </div>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm font-semibold text-brand transition hover:text-brand/80"
        >
          <SearchIcon className="h-4 w-4" />
          Log in
        </Link>
      </div>
    </AuthShell>
  );
}
