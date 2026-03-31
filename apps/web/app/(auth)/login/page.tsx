"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthShell } from "@/components/auth-shell";
import { authLogin } from "@/lib/api";

const inputClassName =
  "w-full rounded-2xl border border-orange-100 bg-white px-4 py-3.5 text-sm text-foreground shadow-sm transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await authLogin(email, password);
      router.push("/");
    } catch {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Log in"
      title="Welcome back to Orderly."
      description="Sign in to check active orders, reorder favourites, and pick up where you left off."
      backHref="/"
      backLabel="Back to home"
      sideContent={
        <>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand">
            Account access
          </p>
          <h2 className="mt-4 font-serif text-3xl font-bold tracking-tight text-foreground">
            Everything you need is a quick sign-in away.
          </h2>
          <div className="mt-8 space-y-4">
            <div className="rounded-2xl bg-white/80 px-4 py-4 shadow-sm">
              <p className="text-sm font-semibold text-foreground">Order faster</p>
              <p className="mt-2 text-sm leading-7 text-subtle">
                Open your cart, track current deliveries, and revisit recent meals without starting over.
              </p>
            </div>
            <div className="rounded-2xl bg-white/80 px-4 py-4 shadow-sm">
              <p className="text-sm font-semibold text-foreground">New to Orderly?</p>
              <p className="mt-2 text-sm leading-7 text-subtle">
                Create an account and choose whether you are ordering, listing a business, or joining as a delivery partner.
              </p>
            </div>
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

        <div>
          <label htmlFor="password" className="mb-2 block text-sm font-semibold text-foreground">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClassName}
            placeholder="Enter your password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center rounded-2xl bg-brand px-6 py-4 text-sm font-semibold text-white transition hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Log In"}
        </button>
      </form>

      <p className="mt-6 text-sm text-subtle">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-semibold text-brand hover:text-brand/80">
          Choose a signup path
        </Link>
      </p>
    </AuthShell>
  );
}
