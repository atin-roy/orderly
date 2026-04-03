"use client";

import type { AdminRestaurantSummary } from "@orderly/types";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AdminPagination } from "@/components/admin-pagination";
import { ImageUploadField } from "@/components/image-upload-field";
import {
  adminCreateRestaurant,
  deleteRestaurant,
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

function validateOwnerForm(form: typeof emptyOwnerForm) {
  if (!form.ownerName.trim()) {
    return "Owner name is required.";
  }
  if (!form.businessName.trim()) {
    return "Business name is required.";
  }
  if (!form.email.trim()) {
    return "Email is required.";
  }
  if (!form.password.trim()) {
    return "Password is required.";
  }
  if (form.password.trim().length < 8) {
    return "Password must be at least 8 characters.";
  }
  if (!form.phone.trim()) {
    return "Phone is required.";
  }
  if (!form.city.trim()) {
    return "City is required.";
  }
  if (!form.serviceArea.trim()) {
    return "Service area is required.";
  }
  if (!form.businessType.trim()) {
    return "Business type is required.";
  }
  if (!form.cuisineFocus.trim()) {
    return "Cuisine focus is required.";
  }

  return null;
}

function validateRestaurantForm(form: typeof emptyRestaurantForm) {
  if (!form.name.trim()) {
    return "Name is required.";
  }
  if (!form.cuisineType.trim()) {
    return "Cuisine type is required.";
  }
  if (!form.city.trim()) {
    return "City is required.";
  }
  if (!form.locality.trim()) {
    return "Locality is required.";
  }
  if (!Number.isFinite(form.deliveryTimeMinutes) || form.deliveryTimeMinutes < 1) {
    return "Delivery time must be at least 1 minute.";
  }
  if (!Number.isFinite(form.deliveryFee) || form.deliveryFee < 0) {
    return "Delivery fee cannot be negative.";
  }

  return null;
}

export default function AdminRestaurantsPage() {
  const [restaurants, setRestaurants] = useState<AdminRestaurantSummary[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [restaurantForm, setRestaurantForm] = useState(emptyRestaurantForm);
  const [ownerForm, setOwnerForm] = useState(emptyOwnerForm);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [actionId, setActionId] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const liveRestaurants = restaurants.filter((restaurant) => restaurant.isActive).length;
  const pausedRestaurants = restaurants.filter((restaurant) => !restaurant.isActive).length;

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

  function resetCreateState() {
    setSelectedId(null);
    setOwnerForm(emptyOwnerForm);
    setRestaurantForm(emptyRestaurantForm);
    setMessage("");
    setMessageType("success");
  }

  async function openEditModal(restaurantId: number) {
    setLoadingDetails(true);
    setMessage("");
    setMessageType("success");
    setIsModalOpen(true);

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
      setMessage(error instanceof Error ? error.message : "Unable to load restaurant.");
      setMessageType("error");
      setIsModalOpen(false);
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
          setMessage(error instanceof Error ? error.message : "Unable to load restaurants.");
          setMessageType("error");
        }
      });

    return () => {
      ignore = true;
    };
  }, [page, query, status]);

  async function handleSubmit() {
    if (!selectedId) {
      const ownerValidationError = validateOwnerForm(ownerForm);
      if (ownerValidationError) {
        setMessage(ownerValidationError);
        setMessageType("error");
        return;
      }
    }

    const restaurantValidationError = validateRestaurantForm(restaurantForm);
    if (restaurantValidationError) {
      setMessage(restaurantValidationError);
      setMessageType("error");
      return;
    }

    setIsSubmitting(true);

    try {
      if (selectedId) {
        await updateRestaurant(selectedId, {
          ...restaurantForm,
          imageUrl: restaurantForm.imageUrl || undefined,
        });
        setMessage("Restaurant updated.");
        setMessageType("success");
        await refreshRestaurants(page);
        setIsModalOpen(false);
        return;
      }

      await adminCreateRestaurant({
        ownerName: ownerForm.ownerName.trim(),
        businessName: ownerForm.businessName.trim(),
        email: ownerForm.email.trim(),
        password: ownerForm.password.trim(),
        phone: ownerForm.phone.trim(),
        city: ownerForm.city.trim(),
        serviceArea: ownerForm.serviceArea.trim(),
        businessType: ownerForm.businessType.trim(),
        cuisineFocus: ownerForm.cuisineFocus.trim(),
        name: restaurantForm.name.trim(),
        description: restaurantForm.description.trim(),
        cuisineType: restaurantForm.cuisineType.trim(),
        locality: restaurantForm.locality.trim(),
        imageUrl: restaurantForm.imageUrl || undefined,
        deliveryTimeMinutes: restaurantForm.deliveryTimeMinutes,
        deliveryFee: restaurantForm.deliveryFee,
        imageColor: restaurantForm.imageColor,
        restaurantCity: restaurantForm.city.trim(),
      });
      setMessage("Owner and restaurant created.");
      setMessageType("success");
      resetCreateState();
      setIsModalOpen(false);
      setPage(0);
      await refreshRestaurants(0);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save restaurant.");
      setMessageType("error");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleToggleRestaurant(restaurantId: number) {
    setActionId(restaurantId);
    setMessage("");

    try {
      const response = await getAdminRestaurant(restaurantId);
      const restaurant = response.data;
      await updateRestaurant(restaurantId, {
        name: restaurant.name,
        description: restaurant.description,
        cuisineType: restaurant.cuisineType,
        city: restaurant.city,
        locality: restaurant.locality,
        imageUrl: restaurant.imageUrl ?? undefined,
        deliveryTimeMinutes: restaurant.deliveryTimeMinutes,
        deliveryFee: restaurant.deliveryFee,
        imageColor: restaurant.imageColor,
        isActive: !restaurant.isActive,
      });
      setMessage(restaurant.isActive ? "Restaurant paused." : "Restaurant reactivated.");
      setMessageType("success");
      await refreshRestaurants(page);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update restaurant status.");
      setMessageType("error");
    } finally {
      setActionId(null);
    }
  }

  async function handleDeleteRestaurant(restaurant: AdminRestaurantSummary) {
    if (
      !window.confirm(`Delete ${restaurant.name}? This only works when the restaurant has no order history.`)
    ) {
      return;
    }

    setActionId(restaurant.id);
    setMessage("");

    try {
      await deleteRestaurant(restaurant.id);
      setMessage("Restaurant deleted.");
      setMessageType("success");
      if (restaurants.length === 1 && page > 0) {
        setPage(page - 1);
        await refreshRestaurants(page - 1);
      } else {
        await refreshRestaurants(page);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to delete restaurant.");
      setMessageType("error");
    } finally {
      setActionId(null);
    }
  }

  return (
    <main className="space-y-6">
      <section className="rounded-[2.2rem] border border-orange-200 bg-[radial-gradient(circle_at_top_left,rgba(253,186,116,0.24),transparent_26%),linear-gradient(135deg,#fff7ed_0%,#ffffff_100%)] px-6 py-7 shadow-[0_24px_80px_rgba(211,91,31,0.10)] sm:px-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-brand">
              Restaurants
            </p>
            <h1 className="mt-4 font-serif text-4xl font-bold leading-tight sm:text-5xl">
              Catalog operations and restaurant management
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-subtle">
              Review all restaurants, jump into menu management, pause inactive listings, and add
              new owners only when you need them.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              resetCreateState();
              setIsModalOpen(true);
            }}
            className="inline-flex h-12 items-center justify-center rounded-full bg-brand px-6 text-sm font-semibold text-white"
          >
            Create restaurant
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-[1.6rem] border border-orange-200 bg-white/85 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand">
              Total restaurants
            </p>
            <p className="mt-3 font-serif text-4xl font-bold text-foreground">{totalElements}</p>
          </div>
          <div className="rounded-[1.6rem] border border-orange-200 bg-white/85 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand">Live now</p>
            <p className="mt-3 font-serif text-4xl font-bold text-foreground">{liveRestaurants}</p>
          </div>
          <div className="rounded-[1.6rem] border border-orange-200 bg-white/85 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand">
              Paused on page
            </p>
            <p className="mt-3 font-serif text-4xl font-bold text-foreground">{pausedRestaurants}</p>
          </div>
        </div>
      </section>

      {message ? (
        <div
          className={`rounded-[1.5rem] px-4 py-3 text-sm ${
            messageType === "error"
              ? "border border-red-200 bg-red-50 text-red-700"
              : "border border-orange-200 bg-orange-50 text-brand"
          }`}
        >
          {message}
        </div>
      ) : null}

      <section className="rounded-[2rem] border border-orange-200 bg-white/90 p-6 shadow-[0_20px_70px_rgba(211,91,31,0.08)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-brand">
              Restaurant list
            </p>
            <h2 className="mt-2 font-serif text-3xl font-bold">All restaurants</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-[minmax(260px,1fr)_180px]">
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
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          {restaurants.map((restaurant) => (
            <article
              key={restaurant.id}
              className="rounded-[1.7rem] border border-orange-100 bg-[linear-gradient(135deg,rgba(255,247,237,0.9),#fff)] p-5"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-2xl font-semibold text-foreground">{restaurant.name}</h3>
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
                  <p className="mt-2 text-sm text-subtle">
                    {restaurant.cuisineType} · {restaurant.locality}, {restaurant.city}
                  </p>
                  <p className="mt-1 text-sm text-subtle">
                    Owner: {restaurant.ownerName ?? "No owner name set"}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void openEditModal(restaurant.id)}
                    className="rounded-full border border-orange-200 px-4 py-2 text-sm font-semibold text-brand"
                  >
                    Edit
                  </button>
                  <Link
                    href={`/admin/restaurants/${restaurant.id}/menu`}
                    className="rounded-full border border-orange-200 px-4 py-2 text-sm font-semibold text-brand"
                  >
                    Menu
                  </Link>
                  <button
                    type="button"
                    onClick={() => void handleToggleRestaurant(restaurant.id)}
                    disabled={actionId === restaurant.id}
                    className="rounded-full border border-orange-200 px-4 py-2 text-sm font-semibold text-brand disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {actionId === restaurant.id
                      ? "Saving..."
                      : restaurant.isActive
                        ? "Pause"
                        : "Activate"}
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDeleteRestaurant(restaurant)}
                    disabled={actionId === restaurant.id}
                    className="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-orange-100 bg-white px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-subtle">
                    Active orders
                  </p>
                  <p className="mt-2 font-semibold text-foreground">{restaurant.activeOrders}</p>
                </div>
                <div className="rounded-2xl border border-orange-100 bg-white px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-subtle">
                    Total orders
                  </p>
                  <p className="mt-2 font-semibold text-foreground">{restaurant.totalOrders}</p>
                </div>
              </div>
            </article>
          ))}

          {restaurants.length === 0 ? (
            <div className="rounded-[1.7rem] border border-dashed border-orange-200 bg-orange-50/70 p-6 text-sm text-subtle">
              No restaurants match the current filters. Use the create button to add the first
              restaurant for this view.
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
      </section>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 px-4 py-8 backdrop-blur-sm">
          <div className="max-h-[calc(100vh-4rem)] w-full max-w-4xl overflow-y-auto rounded-[2rem] border border-orange-200 bg-white p-6 shadow-[0_30px_120px_rgba(0,0,0,0.18)]">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-brand">
                  {selectedId ? "Edit restaurant" : "Create restaurant"}
                </p>
                <h2 className="mt-2 font-serif text-3xl font-bold">
                  {selectedId ? "Restaurant controls" : "New owner and restaurant"}
                </h2>
              </div>

              <div className="flex flex-wrap gap-2">
                {selectedId ? (
                  <Link
                    href={`/admin/restaurants/${selectedId}/menu`}
                    className="rounded-full border border-orange-200 px-4 py-2 text-sm font-semibold text-brand"
                  >
                    Manage menu
                  </Link>
                ) : null}
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-full border border-orange-200 px-4 py-2 text-sm font-semibold text-brand"
                >
                  Close
                </button>
              </div>
            </div>

            {loadingDetails ? (
              <div className="mt-5 rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-subtle">
                Loading restaurant details...
              </div>
            ) : null}

            <form
              className="mt-8 space-y-8"
              onSubmit={(event) => {
                event.preventDefault();
                void handleSubmit();
              }}
            >
              {!selectedId ? (
                <div>
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

              <div>
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
                    onChange={(imageUrl) =>
                      setRestaurantForm((current) => ({ ...current, imageUrl }))
                    }
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
                        setRestaurantForm((current) => ({
                          ...current,
                          isActive: event.target.checked,
                        }))
                      }
                    />
                    Accept orders
                  </label>
                </div>
              </div>

              <div className="flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-2xl border border-orange-200 px-6 py-4 text-sm font-semibold text-brand"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || loadingDetails}
                  className="rounded-2xl bg-brand px-6 py-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting
                    ? selectedId
                      ? "Saving..."
                      : "Creating..."
                    : selectedId
                      ? "Save restaurant"
                      : "Create restaurant"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </main>
  );
}
