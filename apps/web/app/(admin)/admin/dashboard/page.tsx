"use client";

import type { AdminCoupon, AdminDashboardData } from "@orderly/types";
import { useEffect, useState } from "react";
import { AdminPagination } from "@/components/admin-pagination";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { formatRupees } from "@/data/mock-data";
import {
  createCoupon,
  deleteCoupon,
  getAdminCoupons,
  getAdminDashboard,
  updateCoupon,
  updateCouponStatus,
} from "@/lib/api";

const DASHBOARD_PAGE_SIZE = 6;
const COUPON_PAGE_SIZE = 6;
const adminActionButtonClass =
  "rounded-full border px-4 py-2 text-sm font-semibold transition duration-150 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30";
const adminActionButtonBrandClass =
  `${adminActionButtonClass} border-orange-200 bg-white text-brand hover:border-orange-300 hover:bg-orange-50 active:border-orange-400 active:bg-orange-100`;
const adminActionButtonDangerClass =
  `${adminActionButtonClass} border-red-200 bg-white text-red-700 hover:border-red-300 hover:bg-red-50 active:border-red-400 active:bg-red-100`;

const emptyCouponForm = {
  code: "",
  title: "",
  description: "",
  discountAmount: 100,
  minOrderAmount: 399,
  enabled: true,
};

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState<AdminDashboardData | null>(null);
  const [dashboardPage, setDashboardPage] = useState(0);
  const [coupons, setCoupons] = useState<AdminCoupon[]>([]);
  const [couponPage, setCouponPage] = useState(0);
  const [couponTotalPages, setCouponTotalPages] = useState(1);
  const [couponTotalElements, setCouponTotalElements] = useState(0);
  const [couponQuery, setCouponQuery] = useState("");
  const [couponStatus, setCouponStatus] = useState("all");
  const [couponForm, setCouponForm] = useState(emptyCouponForm);
  const [editingCouponId, setEditingCouponId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponSaving, setCouponSaving] = useState(false);
  const [couponLoadError, setCouponLoadError] = useState("");

  useEffect(() => {
    let ignore = false;

    const loadDashboard = async () => {
      try {
        const response = await getAdminDashboard(dashboardPage, DASHBOARD_PAGE_SIZE);
        if (!ignore) {
          setDashboard(response.data);
        }
      } catch {
        if (!ignore) {
          setDashboard(null);
        }
      }
    };

    void loadDashboard();
    const intervalId = window.setInterval(() => {
      void loadDashboard();
    }, 20000);

    return () => {
      ignore = true;
      window.clearInterval(intervalId);
    };
  }, [dashboardPage]);

  useEffect(() => {
    let ignore = false;

    void getAdminCoupons({
      page: couponPage,
      size: COUPON_PAGE_SIZE,
      query: couponQuery.trim() || undefined,
      status: couponStatus !== "all" ? couponStatus : undefined,
    })
      .then((response) => {
        if (ignore) {
          return;
        }
        setCoupons(response.data.content);
        setCouponTotalPages(response.data.totalPages);
        setCouponTotalElements(response.data.totalElements);
        setCouponLoadError("");
      })
      .catch((error) => {
        if (!ignore) {
          setCoupons([]);
          setCouponTotalPages(1);
          setCouponTotalElements(0);
          setCouponLoadError(
            error instanceof Error ? error.message : "Unable to load available coupons."
          );
        }
      });

    return () => {
      ignore = true;
    };
  }, [couponPage, couponQuery, couponStatus]);

  async function refreshCoupons(
    nextPage = couponPage,
    overrides?: { query?: string; status?: string },
  ) {
    const nextQuery = overrides?.query ?? couponQuery;
    const nextStatus = overrides?.status ?? couponStatus;
    const response = await getAdminCoupons({
      page: nextPage,
      size: COUPON_PAGE_SIZE,
      query: nextQuery.trim() || undefined,
      status: nextStatus !== "all" ? nextStatus : undefined,
    });
    setCoupons(response.data.content);
    setCouponTotalPages(response.data.totalPages);
    setCouponTotalElements(response.data.totalElements);
  }

  async function handleSaveCoupon() {
    const code = couponForm.code.trim().toUpperCase();
    const title = couponForm.title.trim();
    const description = couponForm.description.trim();

    if (!code || !title || !description) {
      setCouponError("Code, title, and description are required.");
      return;
    }

    if (!Number.isFinite(couponForm.discountAmount) || couponForm.discountAmount < 1) {
      setCouponError("Discount amount must be at least 1.");
      return;
    }

    if (!Number.isFinite(couponForm.minOrderAmount) || couponForm.minOrderAmount < 0) {
      setCouponError("Minimum order amount cannot be negative.");
      return;
    }

    setCouponSaving(true);
    setCouponError("");
    setMessage("");

    const payload = {
      code,
      title,
      description,
      discountAmount: couponForm.discountAmount,
      minOrderAmount: couponForm.minOrderAmount,
      enabled: couponForm.enabled,
    };

    try {
      if (editingCouponId) {
        await updateCoupon(editingCouponId, payload);
        setMessage("Coupon updated.");
        await refreshCoupons(couponPage);
      } else {
        await createCoupon(payload);
        setMessage("Coupon created.");
        setCouponQuery("");
        setCouponStatus("all");
        setCouponPage(0);
        await refreshCoupons(0, { query: "", status: "all" });
      }

      setEditingCouponId(null);
      setCouponForm(emptyCouponForm);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unable to save coupon.";
      setCouponError(errorMessage);

      if (!editingCouponId && /already exists/i.test(errorMessage)) {
        setCouponQuery(code);
        setCouponStatus("all");
        setCouponPage(0);
        await refreshCoupons(0, { query: code, status: "all" });
      }
    } finally {
      setCouponSaving(false);
    }
  }

  async function handleDeleteCoupon(couponId: number) {
    await deleteCoupon(couponId);
    setMessage("Coupon deleted.");
    if (editingCouponId === couponId) {
      setEditingCouponId(null);
      setCouponForm(emptyCouponForm);
    }
    await refreshCoupons(couponPage);
  }

  async function handleToggleCoupon(coupon: AdminCoupon) {
    await updateCouponStatus(coupon.id, !coupon.enabled);
    setMessage(coupon.enabled ? "Coupon disabled." : "Coupon enabled.");
    await refreshCoupons(couponPage);
  }

  return (
    <main className="space-y-6">
      <section className="rounded-[2.2rem] border border-orange-200 bg-[radial-gradient(circle_at_top_left,rgba(253,186,116,0.24),transparent_26%),linear-gradient(135deg,#fff7ed_0%,#ffffff_100%)] px-6 py-7 shadow-[0_24px_80px_rgba(211,91,31,0.10)] sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.34em] text-brand">Dashboard</p>
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <h1 className="font-serif text-4xl font-bold leading-tight sm:text-5xl">
              Platform operations and promotion control in one place
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-subtle">
              Monitor live dispatch, scan restaurant health, and publish or pause offers without
              leaving the admin workspace.
            </p>
          </div>
          <div className="rounded-[1.6rem] border border-orange-200 bg-white/80 px-5 py-4 text-right shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand">
              Active feed
            </p>
            <p className="mt-2 font-serif text-4xl font-bold">
              {dashboard?.liveOrders.totalElements ?? 0}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        {[
          ["Active orders", dashboard?.activeOrders ?? 0],
          ["Active riders", dashboard?.activeRiders ?? 0],
          ["Delivered today", dashboard?.deliveredToday ?? 0],
          ["Cancelled today", dashboard?.cancelledToday ?? 0],
          ["Restaurants", dashboard?.totalRestaurants ?? 0],
          ["Partners", dashboard?.totalDeliveryPartners ?? 0],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-[1.8rem] border border-orange-200 bg-white/85 p-5 shadow-[0_18px_60px_rgba(211,91,31,0.08)] backdrop-blur"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand">{label}</p>
            <p className="mt-3 font-serif text-4xl font-bold">{value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_420px]">
        <div className="rounded-[2rem] border border-orange-200 bg-white/90 p-6 shadow-[0_20px_70px_rgba(211,91,31,0.08)]">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-brand">
                Live platform orders
              </p>
              <h2 className="mt-2 font-serif text-3xl font-bold">Dispatch watch</h2>
            </div>
            <div className="rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-right">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand">
                Page
              </p>
              <p className="mt-1 text-sm font-semibold text-foreground">
                {(dashboard?.liveOrders.page ?? 0) + 1}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4">
            {(dashboard?.liveOrders.content ?? []).map((order) => (
              <div
                key={order.id}
                className="rounded-[1.6rem] border border-orange-100 bg-[linear-gradient(135deg,rgba(255,247,237,0.86),#fff)] p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-subtle">
                      Order #{order.id}
                    </p>
                    <h3 className="mt-2 font-serif text-2xl font-bold">{order.restaurantName}</h3>
                    <p className="mt-2 text-sm text-subtle">Customer: {order.customerName}</p>
                    <p className="mt-1 text-sm text-subtle">
                      Rider: {order.deliveryPartner?.name ?? "Dispatching"}
                    </p>
                  </div>
                  <OrderStatusBadge status={order.status} />
                </div>
                <div className="mt-4 flex flex-wrap gap-4 text-sm text-subtle">
                  <span>{order.estimatedArrival ?? "No ETA"}</span>
                  <span>{formatRupees(order.total)}</span>
                </div>
              </div>
            ))}
            {dashboard && dashboard.liveOrders.content.length === 0 ? (
              <div className="rounded-[1.6rem] border border-dashed border-orange-200 bg-orange-50/70 p-6 text-sm text-subtle">
                No live orders on this page.
              </div>
            ) : null}
          </div>

          <div className="mt-6">
            <AdminPagination
              page={dashboard?.liveOrders.page ?? 0}
              totalPages={dashboard?.liveOrders.totalPages ?? 1}
              totalElements={dashboard?.liveOrders.totalElements ?? 0}
              label="Operations feed"
              onPageChange={setDashboardPage}
            />
          </div>
        </div>

        <section className="rounded-[2rem] border border-orange-200 bg-white/90 p-6 shadow-[0_20px_70px_rgba(211,91,31,0.08)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-brand">
                Coupon management
              </p>
              <h2 className="mt-2 font-serif text-3xl font-bold">
                {editingCouponId ? "Edit coupon" : "Create coupon"}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditingCouponId(null);
                setCouponForm(emptyCouponForm);
                setMessage("");
                setCouponError("");
              }}
              className="rounded-full border border-orange-200 px-4 py-2 text-sm font-semibold text-brand"
            >
              New coupon
            </button>
          </div>

          {message ? (
            <div className="mt-5 rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-brand">
              {message}
            </div>
          ) : null}
          {couponError ? (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {couponError}
            </div>
          ) : null}

          <form
            className="mt-6 grid gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              void handleSaveCoupon();
            }}
          >
            <label className="text-sm">
              <span className="mb-2 block font-semibold text-foreground">Coupon code</span>
              <input
                value={couponForm.code}
                onChange={(event) =>
                  setCouponForm((current) => ({
                    ...current,
                    code: event.target.value.toUpperCase(),
                  }))
                }
                className="w-full rounded-2xl border border-orange-200 px-4 py-3"
                required
              />
            </label>
            <label className="text-sm">
              <span className="mb-2 block font-semibold text-foreground">Title</span>
              <input
                value={couponForm.title}
                onChange={(event) =>
                  setCouponForm((current) => ({ ...current, title: event.target.value }))
                }
                className="w-full rounded-2xl border border-orange-200 px-4 py-3"
                required
              />
            </label>
            <label className="text-sm">
              <span className="mb-2 block font-semibold text-foreground">Description</span>
              <textarea
                value={couponForm.description}
                onChange={(event) =>
                  setCouponForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                className="min-h-28 w-full rounded-2xl border border-orange-200 px-4 py-3"
                required
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm">
                <span className="mb-2 block font-semibold text-foreground">Discount</span>
                <input
                  type="number"
                  value={couponForm.discountAmount}
                  onChange={(event) =>
                    setCouponForm((current) => ({
                      ...current,
                      discountAmount: Number(event.target.value),
                    }))
                  }
                  className="w-full rounded-2xl border border-orange-200 px-4 py-3"
                  min={1}
                  required
                />
              </label>
              <label className="text-sm">
                <span className="mb-2 block font-semibold text-foreground">Minimum order</span>
                <input
                  type="number"
                  value={couponForm.minOrderAmount}
                  onChange={(event) =>
                    setCouponForm((current) => ({
                      ...current,
                      minOrderAmount: Number(event.target.value),
                    }))
                  }
                  className="w-full rounded-2xl border border-orange-200 px-4 py-3"
                  min={0}
                  required
                />
              </label>
            </div>
            <label className="flex items-center gap-3 rounded-2xl border border-orange-100 px-4 py-3 text-sm font-semibold text-foreground">
              <input
                type="checkbox"
                checked={couponForm.enabled}
                onChange={(event) =>
                  setCouponForm((current) => ({ ...current, enabled: event.target.checked }))
                }
              />
              Enabled for users
            </label>
            <button
              type="submit"
              disabled={couponSaving}
              className="rounded-2xl bg-brand px-5 py-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {couponSaving ? "Saving..." : editingCouponId ? "Save coupon" : "Create coupon"}
            </button>
          </form>
        </section>
      </section>

      <section className="rounded-[2rem] border border-orange-200 bg-white/90 p-6 shadow-[0_20px_70px_rgba(211,91,31,0.08)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-brand">
              Promotions library
            </p>
            <h2 className="mt-2 font-serif text-3xl font-bold">Available coupons</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-[minmax(260px,1fr)_180px]">
            <input
              value={couponQuery}
              onChange={(event) => {
                setCouponQuery(event.target.value);
                setCouponPage(0);
              }}
              placeholder="Search code or title"
              className="h-12 rounded-[1.1rem] border border-orange-200 bg-white px-4 text-sm"
            />
            <select
              value={couponStatus}
              onChange={(event) => {
                setCouponStatus(event.target.value);
                setCouponPage(0);
              }}
              className="h-12 rounded-[1.1rem] border border-orange-200 bg-white px-4 text-sm"
            >
              <option value="all">All statuses</option>
              <option value="enabled">Enabled</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {couponLoadError ? (
            <div className="rounded-[1.6rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 lg:col-span-2">
              {couponLoadError}
            </div>
          ) : null}
          {coupons.map((coupon) => (
            <div
              key={coupon.id}
              tabIndex={0}
              className="group rounded-[1.6rem] border border-orange-100 bg-[linear-gradient(135deg,rgba(255,247,237,0.9),#fff)] p-5 outline-none transition focus-visible:border-orange-300 focus-visible:ring-2 focus-visible:ring-brand/20"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand">
                    {coupon.code}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold text-foreground">{coupon.title}</h3>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
                    coupon.enabled
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-stone-200 text-stone-700"
                  }`}
                >
                  {coupon.enabled ? "Enabled" : "Disabled"}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-subtle">{coupon.description}</p>
              <div className="mt-4 flex flex-wrap gap-4 text-sm font-semibold text-foreground">
                <span>{formatRupees(coupon.discountAmount)} off</span>
                <span>Min {formatRupees(coupon.minOrderAmount)}</span>
              </div>
              <div className="mt-5 flex flex-wrap gap-3 opacity-0 transition duration-150 ease-out pointer-events-none translate-y-2 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 group-focus:pointer-events-auto group-focus:translate-y-0 group-focus:opacity-100 group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100">
                <button
                  type="button"
                  onClick={() => {
                    setEditingCouponId(coupon.id);
                    setCouponForm({
                      code: coupon.code,
                      title: coupon.title,
                      description: coupon.description,
                      discountAmount: coupon.discountAmount,
                      minOrderAmount: coupon.minOrderAmount,
                      enabled: coupon.enabled,
                    });
                    setMessage("");
                  }}
                  className={adminActionButtonBrandClass}
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => void handleToggleCoupon(coupon)}
                  className={adminActionButtonBrandClass}
                >
                  {coupon.enabled ? "Disable" : "Enable"}
                </button>
                <button
                  type="button"
                  onClick={() => void handleDeleteCoupon(coupon.id)}
                  className={adminActionButtonDangerClass}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {coupons.length === 0 ? (
            <div className="rounded-[1.6rem] border border-dashed border-orange-200 bg-orange-50/70 p-6 text-sm text-subtle">
              No coupons match the current filters.
            </div>
          ) : null}
        </div>

        <div className="mt-6">
          <AdminPagination
            page={couponPage}
            totalPages={couponTotalPages}
            totalElements={couponTotalElements}
            label="Coupon pages"
            onPageChange={setCouponPage}
          />
        </div>
      </section>
    </main>
  );
}
