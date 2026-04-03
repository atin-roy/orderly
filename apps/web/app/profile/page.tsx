"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin-shell";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AuthGuard } from "@/components/auth-guard";
import { LocationModal } from "@/components/location-modal";
import { useLocation } from "@/components/location-provider";
import { useSession } from "@/components/session-provider";
import { deleteUserAddress, setDefaultUserAddress, updateMyProfile } from "@/lib/api";

export default function ProfilePage() {
  const { profile, logout, refreshProfile, role } = useSession();
  const { activeLocation } = useLocation();
  const [locationOpen, setLocationOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [accountError, setAccountError] = useState("");
  const [accountSaving, setAccountSaving] = useState(false);
  const [addressError, setAddressError] = useState("");
  const [addressSavingId, setAddressSavingId] = useState<number | null>(null);
  const [addressDeletingId, setAddressDeletingId] = useState<number | null>(null);
  const isAdmin = role === "ADMIN";
  const isCustomer = role === "USER";

  useEffect(() => {
    setName(profile?.name ?? "");
    setPhone(profile?.phone ?? "");
  }, [profile?.name, profile?.phone]);

  async function handleAccountSave() {
    setAccountError("");
    setAccountSaving(true);

    try {
      await updateMyProfile({
        name: name.trim() || null,
        phone: phone.trim(),
      });
      await refreshProfile();
      setEditingAccount(false);
    } catch (error) {
      setAccountError(error instanceof Error ? error.message : "Unable to update account.");
    } finally {
      setAccountSaving(false);
    }
  }

  function handleAccountCancel() {
    setName(profile?.name ?? "");
    setPhone(profile?.phone ?? "");
    setAccountError("");
    setEditingAccount(false);
  }

  async function handleSetDefaultAddress(addressId: number) {
    setAddressError("");
    setAddressSavingId(addressId);

    try {
      await setDefaultUserAddress(addressId);
      await refreshProfile();
    } catch (error) {
      setAddressError(
        error instanceof Error ? error.message : "Unable to update the default address."
      );
    } finally {
      setAddressSavingId(null);
    }
  }

  async function handleDeleteAddress(addressId: number) {
    setAddressError("");
    setAddressDeletingId(addressId);

    try {
      await deleteUserAddress(addressId);
      await refreshProfile();
    } catch (error) {
      setAddressError(error instanceof Error ? error.message : "Unable to delete the address.");
    } finally {
      setAddressDeletingId(null);
    }
  }

  return (
    <AuthGuard>
      {isAdmin ? (
        <AdminShell>
          <main className="space-y-6">
            <section className="rounded-[2.2rem] border border-orange-200 bg-[radial-gradient(circle_at_top_left,rgba(253,186,116,0.24),transparent_26%),linear-gradient(135deg,#fff7ed_0%,#ffffff_100%)] px-6 py-7 shadow-[0_24px_80px_rgba(211,91,31,0.10)] sm:px-8">
              <p className="text-xs font-semibold uppercase tracking-[0.34em] text-brand">
                Account
              </p>
              <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl">
                  <h1 className="font-serif text-4xl font-bold leading-tight sm:text-5xl">
                    Your admin account
                  </h1>
                  <p className="mt-4 max-w-2xl text-base leading-7 text-subtle">
                    Review your sign-in details and keep account access inside the same admin
                    workspace as catalog and dispatch operations.
                  </p>
                </div>
                <div className="rounded-[1.6rem] border border-orange-200 bg-white/80 px-5 py-4 text-right shadow-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand">
                    Role
                  </p>
                  <p className="mt-2 font-serif text-3xl font-bold">{profile?.role ?? "ADMIN"}</p>
                </div>
              </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_380px]">
              <div className="rounded-[2rem] border border-orange-200 bg-white/90 p-6 shadow-[0_20px_70px_rgba(211,91,31,0.08)]">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-brand">
                      Account details
                    </p>
                    <h2 className="mt-2 font-serif text-3xl font-bold">Profile access</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => logout("/login")}
                    className="inline-flex items-center justify-center rounded-full border border-orange-200 bg-white px-5 py-3 text-sm font-semibold text-brand transition hover:border-brand"
                  >
                    Log out
                  </button>
                </div>

                <dl className="mt-6 grid gap-5 md:grid-cols-2">
                  <div className="rounded-[1.6rem] border border-orange-100 bg-[linear-gradient(135deg,rgba(255,247,237,0.86),#fff)] p-5">
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand">
                      Name
                    </dt>
                    <dd className="mt-3 text-lg font-semibold text-foreground">
                      {profile?.name || "Not provided"}
                    </dd>
                  </div>
                  <div className="rounded-[1.6rem] border border-orange-100 bg-[linear-gradient(135deg,rgba(255,247,237,0.86),#fff)] p-5">
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand">
                      Email
                    </dt>
                    <dd className="mt-3 text-lg font-semibold text-foreground">
                      {profile?.email || "Not provided"}
                    </dd>
                  </div>
                  <div className="rounded-[1.6rem] border border-orange-100 bg-[linear-gradient(135deg,rgba(255,247,237,0.86),#fff)] p-5">
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand">
                      Phone
                    </dt>
                    <dd className="mt-3 text-lg font-semibold text-foreground">
                      {profile?.phone || "Not provided"}
                    </dd>
                  </div>
                  <div className="rounded-[1.6rem] border border-orange-100 bg-[linear-gradient(135deg,rgba(255,247,237,0.86),#fff)] p-5">
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand">
                      Current location
                    </dt>
                    <dd className="mt-3 text-lg font-semibold text-foreground">
                      {activeLocation
                        ? [activeLocation.address, activeLocation.city].filter(Boolean).join(", ")
                        : "No location selected yet"}
                    </dd>
                  </div>
                </dl>
              </div>

              <section className="rounded-[2rem] border border-orange-200 bg-white/90 p-6 shadow-[0_20px_70px_rgba(211,91,31,0.08)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-brand">
                  Workspace status
                </p>
                <h2 className="mt-2 font-serif text-3xl font-bold">Admin surface</h2>
                <div className="mt-6 rounded-[1.6rem] border border-dashed border-orange-200 bg-orange-50/70 p-5 text-sm leading-7 text-subtle">
                  This account remains scoped to admin tools. Catalog management, delivery partner
                  oversight, and profile access now live inside the same sidebar workspace.
                </div>
              </section>
            </section>
          </main>
        </AdminShell>
      ) : (
        <div className="flex min-h-screen flex-col bg-cream">
          <Header />

          <main className="flex-1">
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

            <section className="mx-auto grid w-full max-w-7xl items-center gap-8 px-4 py-10 sm:px-6 lg:min-h-[calc(100vh-24rem)] lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:px-8">
              <div className="flex h-[34rem] flex-col rounded-[2rem] border border-orange-100 bg-white p-6 shadow-[0_18px_60px_rgba(211,91,31,0.08)]">
                <div className="flex items-start justify-between gap-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand">
                    Account
                  </p>
                  {isCustomer ? (
                    editingAccount ? (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleAccountCancel}
                          className="inline-flex items-center justify-center rounded-full border border-orange-200 bg-white px-4 py-2 text-sm font-semibold text-brand transition hover:border-brand"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleAccountSave()}
                          disabled={accountSaving}
                          className="inline-flex items-center justify-center rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {accountSaving ? "Saving..." : "Save changes"}
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setEditingAccount(true)}
                        className="inline-flex items-center justify-center rounded-full border border-orange-200 bg-white px-4 py-2 text-sm font-semibold text-brand transition hover:border-brand"
                      >
                        Edit account
                      </button>
                    )
                  ) : null}
                </div>
                {accountError ? (
                  <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {accountError}
                  </div>
                ) : null}
                <dl className="mt-6 space-y-5 text-sm">
                  <div>
                    <dt className="font-semibold text-subtle">Name</dt>
                    <dd className="mt-1">
                      {editingAccount ? (
                        <input
                          value={name}
                          onChange={(event) => setName(event.target.value)}
                          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base text-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                          placeholder="Your name"
                        />
                      ) : (
                        <span className="text-base text-foreground">
                          {profile?.name || "Not provided"}
                        </span>
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-subtle">Email</dt>
                    <dd className="mt-1 text-base text-foreground">{profile?.email}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-subtle">Phone</dt>
                    <dd className="mt-1">
                      {editingAccount ? (
                        <input
                          value={phone}
                          onChange={(event) => setPhone(event.target.value)}
                          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base text-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                          placeholder="+91 98765 43210"
                        />
                      ) : (
                        <span className="text-base text-foreground">{profile?.phone}</span>
                      )}
                    </dd>
                  </div>
                  {!isCustomer ? (
                    <div>
                      <dt className="font-semibold text-subtle">Role</dt>
                      <dd className="mt-1 text-base text-foreground">{profile?.role}</dd>
                    </div>
                  ) : null}
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

                <div className="mt-auto flex justify-end pt-8">
                  <button
                    type="button"
                    onClick={() => logout("/login")}
                    className="inline-flex items-center justify-center rounded-full border border-orange-200 bg-white px-5 py-3 text-sm font-semibold text-brand transition hover:border-brand"
                  >
                    Log out
                  </button>
                </div>
              </div>

              <div className="flex h-[34rem] min-h-0 flex-col overflow-hidden rounded-[2rem] border border-orange-100 bg-white p-6 shadow-[0_18px_60px_rgba(211,91,31,0.08)]">
                <div className="flex items-start justify-between gap-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand">
                    {isCustomer ? "Saved addresses" : "Account status"}
                  </p>
                  {isCustomer ? (
                    <button
                      type="button"
                      onClick={() => setLocationOpen(true)}
                      className="inline-flex items-center justify-center rounded-full border border-orange-200 bg-white px-4 py-2 text-sm font-semibold text-brand transition hover:border-brand"
                    >
                      Add address
                    </button>
                  ) : null}
                </div>
                {addressError ? (
                  <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {addressError}
                  </div>
                ) : null}

                {isCustomer ? (
                  profile?.addresses.length ? (
                    <div className="mt-6 grid min-h-0 flex-1 gap-4 overflow-y-auto pr-1">
                      {profile.addresses.map((address) => (
                        <div
                          key={address.id}
                          className={`group rounded-[1.5rem] border p-5 ${
                            address.isDefault
                              ? "border-brand bg-orange-50"
                              : "border-orange-100 bg-white"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex min-w-0 flex-1 flex-col">
                              <p className="font-semibold text-foreground">{address.label}</p>
                              <p className="mt-2 text-sm text-subtle">
                                {address.address}
                                {address.buildingInfo ? `, ${address.buildingInfo}` : ""}
                                {address.city ? `, ${address.city}` : ""}
                              </p>
                              <p className="mt-2 text-sm text-subtle">{address.phone}</p>
                              <div className="mt-4">
                                <button
                                  type="button"
                                  onClick={() => void handleDeleteAddress(address.id)}
                                  disabled={
                                    addressDeletingId === address.id ||
                                    addressSavingId === address.id
                                  }
                                  className="inline-flex h-8 items-center justify-center rounded-full border border-red-200 bg-white px-3 text-xs font-semibold text-red-600 opacity-0 transition hover:border-red-400 hover:text-red-700 focus:opacity-100 group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  {addressDeletingId === address.id ? "Deleting..." : "Delete"}
                                </button>
                              </div>
                            </div>
                            <div className="flex flex-shrink-0 flex-col items-end justify-center gap-3 self-center">
                              {address.isDefault ? (
                                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
                                  Default
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => void handleSetDefaultAddress(address.id)}
                                  disabled={
                                    addressSavingId === address.id ||
                                    addressDeletingId === address.id
                                  }
                                  className="inline-flex h-11 w-28 flex-shrink-0 items-center justify-center rounded-full border border-orange-200 bg-white px-4 py-2 text-center text-sm font-semibold leading-tight text-brand transition hover:border-brand disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  {addressSavingId === address.id
                                    ? "Saving..."
                                    : "Set as default"}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-6 rounded-[1.5rem] border border-dashed border-orange-200 bg-orange-50/60 p-6 text-sm leading-7 text-subtle">
                      No saved address yet. Add one here to use it across the homepage, cart, and
                      checkout flows.
                    </div>
                  )
                ) : (
                  <div className="mt-6 rounded-[1.5rem] border border-dashed border-orange-200 bg-orange-50/60 p-6 text-sm leading-7 text-subtle">
                    Your dashboard routes remain separate from customer ordering flows. This page
                    is your shared account view for sign-in state and profile access.
                  </div>
                )}
              </div>
            </section>
          </main>

          <Footer />
          <LocationModal open={locationOpen} onClose={() => setLocationOpen(false)} />
        </div>
      )}
    </AuthGuard>
  );
}
