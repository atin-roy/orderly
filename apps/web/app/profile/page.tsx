"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AuthGuard } from "@/components/auth-guard";
import { LocationModal } from "@/components/location-modal";
import { useLocation } from "@/components/location-provider";
import { useSession } from "@/components/session-provider";
import { useState } from "react";

export default function ProfilePage() {
  const { profile, logout, role } = useSession();
  const { activeLocation } = useLocation();
  const [locationOpen, setLocationOpen] = useState(false);
  const isCustomer = role === "USER";

  return (
    <AuthGuard>
      <div className="min-h-screen bg-cream">
        <Header />

        <main>
          <section className="border-b border-orange-100 bg-[linear-gradient(180deg,rgba(255,248,238,0.98),rgba(255,248,238,0.8))]">
            <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 md:py-12 lg:px-8">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand">
                Profile
              </p>
              <h1 className="mt-4 font-serif text-4xl font-bold leading-tight md:text-5xl">
                Your Orderly account
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-subtle">
                Check your account details, review your saved addresses, and manage the
                delivery location shown across the app.
              </p>
            </div>
          </section>

          <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:px-8">
            <div className="rounded-[2rem] border border-orange-100 bg-white p-6 shadow-[0_18px_60px_rgba(211,91,31,0.08)]">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand">
                Account
              </p>
              <dl className="mt-6 space-y-5 text-sm">
                <div>
                  <dt className="font-semibold text-subtle">Name</dt>
                  <dd className="mt-1 text-base text-foreground">
                    {profile?.name || "Not provided"}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-subtle">Email</dt>
                  <dd className="mt-1 text-base text-foreground">{profile?.email}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-subtle">Phone</dt>
                  <dd className="mt-1 text-base text-foreground">{profile?.phone}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-subtle">Role</dt>
                  <dd className="mt-1 text-base text-foreground">{profile?.role}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-subtle">Current location</dt>
                  <dd className="mt-1 text-base text-foreground">
                    {activeLocation
                      ? [activeLocation.address, activeLocation.city]
                          .filter(Boolean)
                          .join(", ")
                      : "No location selected yet"}
                  </dd>
                </div>
              </dl>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                {isCustomer ? (
                  <button
                    type="button"
                    onClick={() => setLocationOpen(true)}
                    className="inline-flex items-center justify-center rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand/90"
                  >
                    Manage delivery location
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => logout("/login")}
                  className="inline-flex items-center justify-center rounded-full border border-orange-200 bg-white px-5 py-3 text-sm font-semibold text-brand transition hover:border-brand"
                >
                  Log out
                </button>
              </div>
            </div>

            <div className="rounded-[2rem] border border-orange-100 bg-white p-6 shadow-[0_18px_60px_rgba(211,91,31,0.08)]">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand">
                {isCustomer ? "Saved addresses" : "Account status"}
              </p>

              {isCustomer ? (
                profile?.addresses.length ? (
                  <div className="mt-6 grid gap-4">
                    {profile.addresses.map((address) => (
                      <div
                        key={address.id}
                        className={`rounded-[1.5rem] border p-5 ${
                          address.isDefault
                            ? "border-brand bg-orange-50"
                            : "border-orange-100 bg-white"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-semibold text-foreground">{address.label}</p>
                            <p className="mt-2 text-sm text-subtle">
                              {address.address}
                              {address.buildingInfo ? `, ${address.buildingInfo}` : ""}
                              {address.city ? `, ${address.city}` : ""}
                            </p>
                            <p className="mt-2 text-sm text-subtle">{address.phone}</p>
                          </div>
                          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
                            {address.isDefault ? "Active" : "Saved"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-6 rounded-[1.5rem] border border-dashed border-orange-200 bg-orange-50/60 p-6 text-sm leading-7 text-subtle">
                    No saved address yet. Open the location selector to save your current delivery
                    spot and start using it across the homepage, cart, and checkout flows.
                  </div>
                )
              ) : (
                <div className="mt-6 rounded-[1.5rem] border border-dashed border-orange-200 bg-orange-50/60 p-6 text-sm leading-7 text-subtle">
                  Your dashboard routes remain separate from customer ordering flows. This page is
                  your shared account view for sign-in state and profile access.
                </div>
              )}
            </div>
          </section>
        </main>

        <Footer />
        <LocationModal open={locationOpen} onClose={() => setLocationOpen(false)} />
      </div>
    </AuthGuard>
  );
}
