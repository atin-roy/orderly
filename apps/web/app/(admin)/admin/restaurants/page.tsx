"use client";

import type { AdminRestaurantSummary } from "@orderly/types";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AdminPagination } from "@/components/admin-pagination";
import { ImageUploadField } from "@/components/image-upload-field";
import {
  adminCreateRestaurant,
  getAdminRestaurant,
  getAdminRestaurantOverview,
  updateRestaurant,
} from "@/lib/api";

const PAGE_SIZE = 10;

const emptyOwnerForm = {
  ownerName: "",
  businessName: "",
  email: "",
  password: "",
  phone: "",
  city: "Kolkata",
  serviceArea: "",
  businessType: "Restaurant",
  cuisineFocus: "",
};

const emptyRestaurantForm = {
  name: "",
  description: "",
  cuisineType: "",
  city: "Kolkata",
  locality: "",
  imageUrl: "",
  deliveryTimeMinutes: 30,
  deliveryFee: 29,
  imageColor: "bg-gradient-to-br from-orange-500 via-amber-500 to-red-700",
  isActive: true,
};

export default function AdminRestaurantsPage() {
  const [restaurants, setRestaurants] = useState<AdminRestaurantSummary[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [restaurantForm, setRestaurantForm] = useState(emptyRestaurantForm);
  const [ownerForm, setOwnerForm] = useState(emptyOwnerForm);
  const [message, setMessage] = useState("");
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");

  async function refreshRestaurants(nextPage = page) {
    const response = await getAdminRestaurantOverview({
      page: nextPage,
      size: PAGE_SIZE,
      query: query.trim() || undefined,
      status: status !== "all" ? status : undefined,
    });

    setRestaurants(response.data.content);
    setTotalPages(response.data.totalPages);
    setTotalElements(response.data.totalElements);
  }

  async function loadRestaurant(restaurantId: number) {
    setLoadingDetails(true);
    try {
      const response = await getAdminRestaurant(restaurantId);
      const restaurant = response.data;
      setSelectedId(restaurant.id);
      setRestaurantForm({
        name: restaurant.name,
        description: restaurant.description,
        cuisineType: restaurant.cuisineType,
        city: restaurant.city,
        locality: restaurant.locality,
        imageUrl: restaurant.imageUrl ?? "",
        deliveryTimeMinutes: restaurant.deliveryTimeMinutes,
        deliveryFee: restaurant.deliveryFee,
        imageColor: restaurant.imageColor,
        isActive: restaurant.isActive,
      });
      setOwnerForm(emptyOwnerForm);
    } catch (error) {
      console.error("Failed to load admin restaurant details", error);
      throw error;
    } finally {
      setLoadingDetails(false);
    }
  }

  useEffect(() => {
    let ignore = false;

    void getAdminRestaurantOverview({
      page,
      size: PAGE_SIZE,
      query: query.trim() || undefined,
      status: status !== "all" ? status : undefined,
    })
      .then((response) => {
        if (ignore) {
          return;
        }

        setRestaurants(response.data.content);
        setTotalPages(response.data.totalPages);
        setTotalElements(response.data.totalElements);
      })
      .catch((error) => {
        console.error("Failed to fetch admin restaurants", error);
        if (!ignore) {
          setRestaurants([]);
          setTotalPages(1);
          setTotalElements(0);
        }
      });

    return () => {
      ignore = true;
    };
  }, [page, query, status]);

  async function handleSubmit() {
    if (selectedId) {
      await updateRestaurant(selectedId, {
        ...restaurantForm,
        imageUrl: restaurantForm.imageUrl || undefined,
      });
      setMessage("Restaurant updated.");
      await refreshRestaurants(page);
      return;
    }

    const response = await adminCreateRestaurant({
      ownerName: ownerForm.ownerName,
      businessName: ownerForm.businessName,
      email: ownerForm.email,
      password: ownerForm.password,
      phone: ownerForm.phone,
      city: ownerForm.city,
      serviceArea: ownerForm.serviceArea,
      businessType: ownerForm.businessType,
      cuisineFocus: ownerForm.cuisineFocus,
      name: restaurantForm.name,
      description: restaurantForm.description,
      cuisineType: restaurantForm.cuisineType,
      locality: restaurantForm.locality,
      imageUrl: restaurantForm.imageUrl || undefined,
      deliveryTimeMinutes: restaurantForm.deliveryTimeMinutes,
      deliveryFee: restaurantForm.deliveryFee,
      imageColor: restaurantForm.imageColor,
      restaurantCity: restaurantForm.city,
    });
    setMessage("Owner and restaurant created.");
    await refreshRestaurants(0);
    setPage(0);
    await loadRestaurant(response.data.id);
  }

  return (
    <main className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
      <aside className="rounded-[2rem] border border-orange-200 bg-white/90 p-5 shadow-[0_20px_70px_rgba(211,91,31,0.08)]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-brand">
              Restaurants
            </p>
            <h1 className="mt-2 font-serif text-3xl font-bold">Catalog management</h1>
          </div>
          <button
            type="button"
            onClick={() => {
              setSelectedId(null);
              setOwnerForm(emptyOwnerForm);
              setRestaurantForm(emptyRestaurantForm);
              setMessage("");
            }}
            className="rounded-full border border-orange-200 px-4 py-2 text-sm font-semibold text-brand"
          >
            New
          </button>
        </div>

        <div className="mt-6 grid gap-3">
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(0);
            }}
            placeholder="Search restaurants or owners"
            className="h-12 rounded-[1.1rem] border border-orange-200 bg-white px-4 text-sm"
          />
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(0);
            }}
            className="h-12 rounded-[1.1rem] border border-orange-200 bg-white px-4 text-sm"
          >
            <option value="all">All statuses</option>
            <option value="live">Live</option>
            <option value="paused">Paused</option>
          </select>
        </div>

        <div className="mt-6 space-y-3">
          {restaurants.map((restaurant) => (
            <button
              key={restaurant.id}
              type="button"
              onClick={() => {
                void loadRestaurant(restaurant.id);
                setMessage("");
              }}
              className={`w-full rounded-[1.5rem] border px-4 py-4 text-left transition ${
                selectedId === restaurant.id
                  ? "border-brand bg-orange-50 shadow-[0_16px_36px_rgba(211,91,31,0.10)]"
                  : "border-orange-100 bg-white hover:border-orange-200 hover:bg-orange-50/50"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-foreground">{restaurant.name}</p>
                  <p className="mt-1 text-sm text-subtle">
                    {restaurant.cuisineType} · {restaurant.locality}
                  </p>
                  <p className="mt-1 text-sm text-subtle">Owner: {restaurant.ownerName ?? "N/A"}</p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                    restaurant.isActive
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-stone-200 text-stone-700"
                  }`}
                >
                  {restaurant.isActive ? "Live" : "Paused"}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-4 text-xs font-semibold uppercase tracking-[0.18em] text-brand">
                <span>{restaurant.activeOrders} active orders</span>
                <span>{restaurant.totalOrders} total orders</span>
              </div>
            </button>
          ))}
          {restaurants.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-orange-200 bg-orange-50/70 p-5 text-sm text-subtle">
              No restaurants match the current filters.
            </div>
          ) : null}
        </div>

        <div className="mt-6">
          <AdminPagination
            page={page}
            totalPages={totalPages}
            totalElements={totalElements}
            label="Restaurant pages"
            onPageChange={setPage}
          />
        </div>
      </aside>

      <section className="rounded-[2rem] border border-orange-200 bg-white/90 p-6 shadow-[0_20px_70px_rgba(211,91,31,0.08)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-brand">
              {selectedId ? "Edit restaurant" : "Create restaurant"}
            </p>
            <h2 className="mt-2 font-serif text-3xl font-bold">
              {selectedId ? "Restaurant controls" : "New owner and restaurant"}
            </h2>
          </div>
          {selectedId ? (
            <Link
              href={`/admin/restaurants/${selectedId}/menu`}
              className="rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white"
            >
              Manage menu
            </Link>
          ) : null}
        </div>

        {loadingDetails ? (
          <div className="mt-5 rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-subtle">
            Loading restaurant details...
          </div>
        ) : null}

        {message ? (
          <div className="mt-5 rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-brand">
            {message}
          </div>
        ) : null}

        {!selectedId ? (
          <div className="mt-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand">
              Owner account
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {[
                ["Owner name", "ownerName"],
                ["Business name", "businessName"],
                ["Email", "email"],
                ["Password", "password"],
                ["Phone", "phone"],
                ["City", "city"],
                ["Service area", "serviceArea"],
                ["Business type", "businessType"],
              ].map(([label, key]) => (
                <label key={key} className="block text-sm">
                  <span className="mb-2 block font-semibold text-foreground">{label}</span>
                  <input
                    type={key === "password" ? "password" : "text"}
                    value={ownerForm[key as keyof typeof ownerForm]}
                    onChange={(event) =>
                      setOwnerForm((current) => ({ ...current, [key]: event.target.value }))
                    }
                    className="w-full rounded-2xl border border-orange-200 px-4 py-3"
                  />
                </label>
              ))}
            </div>
            <label className="mt-4 block text-sm">
              <span className="mb-2 block font-semibold text-foreground">Cuisine focus</span>
              <textarea
                value={ownerForm.cuisineFocus}
                onChange={(event) =>
                  setOwnerForm((current) => ({ ...current, cuisineFocus: event.target.value }))
                }
                className="min-h-28 w-full rounded-2xl border border-orange-200 px-4 py-3"
              />
            </label>
          </div>
        ) : null}

        <div className="mt-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand">
            Restaurant details
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {[
              ["Name", "name"],
              ["Cuisine type", "cuisineType"],
              ["City", "city"],
              ["Locality", "locality"],
            ].map(([label, key]) => (
              <label key={key} className="block text-sm">
                <span className="mb-2 block font-semibold text-foreground">{label}</span>
                <input
                  value={restaurantForm[key as keyof typeof restaurantForm] as string}
                  onChange={(event) =>
                    setRestaurantForm((current) => ({ ...current, [key]: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-orange-200 px-4 py-3"
                />
              </label>
            ))}
          </div>

          <label className="mt-4 block text-sm">
            <span className="mb-2 block font-semibold text-foreground">Description</span>
            <textarea
              value={restaurantForm.description}
              onChange={(event) =>
                setRestaurantForm((current) => ({ ...current, description: event.target.value }))
              }
              className="min-h-28 w-full rounded-2xl border border-orange-200 px-4 py-3"
            />
          </label>

          <div className="mt-4">
            <ImageUploadField
              label="Restaurant image"
              value={restaurantForm.imageUrl}
              helperText="Upload JPG, PNG, or WebP. Used on cards and restaurant details."
              onChange={(imageUrl) => setRestaurantForm((current) => ({ ...current, imageUrl }))}
            />
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <label className="block text-sm">
              <span className="mb-2 block font-semibold text-foreground">Delivery time</span>
              <input
                type="number"
                value={restaurantForm.deliveryTimeMinutes}
                onChange={(event) =>
                  setRestaurantForm((current) => ({
                    ...current,
                    deliveryTimeMinutes: Number(event.target.value),
                  }))
                }
                className="w-full rounded-2xl border border-orange-200 px-4 py-3"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-2 block font-semibold text-foreground">Delivery fee</span>
              <input
                type="number"
                value={restaurantForm.deliveryFee}
                onChange={(event) =>
                  setRestaurantForm((current) => ({
                    ...current,
                    deliveryFee: Number(event.target.value),
                  }))
                }
                className="w-full rounded-2xl border border-orange-200 px-4 py-3"
              />
            </label>
            <label className="flex items-center gap-3 rounded-2xl border border-orange-100 px-4 py-3 text-sm font-semibold text-foreground">
              <input
                type="checkbox"
                checked={restaurantForm.isActive}
                onChange={(event) =>
                  setRestaurantForm((current) => ({ ...current, isActive: event.target.checked }))
                }
              />
              Accept orders
            </label>
          </div>

          <button
            type="button"
            onClick={() => void handleSubmit()}
            className="mt-6 rounded-2xl bg-brand px-6 py-4 text-sm font-semibold text-white"
          >
            {selectedId ? "Save restaurant" : "Create restaurant"}
          </button>
        </div>
      </section>
    </main>
  );
}
