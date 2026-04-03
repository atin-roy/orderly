"use client";

import type { AdminRestaurantSummary } from "@orderly/types";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/auth-guard";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { ImageUploadField } from "@/components/image-upload-field";
import {
  adminCreateRestaurant,
  getAdminRestaurant,
  getAdminRestaurantOverview,
  updateRestaurant,
} from "@/lib/api";

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

  async function refreshRestaurants(nextSelectedId?: number | null) {
    const response = await getAdminRestaurantOverview();
    setRestaurants(response.data);

    const selected = nextSelectedId ?? selectedId ?? response.data[0]?.id ?? null;
    if (selected) {
      await loadRestaurant(selected);
    } else {
      setSelectedId(null);
    }
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
    } finally {
      setLoadingDetails(false);
    }
  }

  useEffect(() => {
    let ignore = false;

    void getAdminRestaurantOverview()
      .then(async (response) => {
        if (ignore) {
          return;
        }

        setRestaurants(response.data);
        if (response.data[0]) {
          await loadRestaurant(response.data[0].id);
        }
      })
      .catch(() => {
        if (!ignore) {
          setRestaurants([]);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  async function handleSubmit() {
    if (selectedId) {
      await updateRestaurant(selectedId, {
        ...restaurantForm,
        imageUrl: restaurantForm.imageUrl || undefined,
      });
      setMessage("Restaurant updated.");
      await refreshRestaurants(selectedId);
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
    await refreshRestaurants(response.data.id);
  }

  return (
    <AuthGuard allowedRoles={["ADMIN"]}>
      <div className="min-h-screen bg-cream">
        <Header />
        <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
            <aside className="rounded-[2rem] border border-orange-100 bg-white p-5 shadow-[0_18px_60px_rgba(211,91,31,0.08)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand">
                    Catalog oversight
                  </p>
                  <h1 className="mt-2 font-serif text-3xl font-bold">Restaurants</h1>
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

              <div className="mt-6 space-y-3">
                {restaurants.map((restaurant) => (
                  <button
                    key={restaurant.id}
                    type="button"
                    onClick={() => {
                      void loadRestaurant(restaurant.id);
                      setMessage("");
                    }}
                    className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
                      selectedId === restaurant.id
                        ? "border-brand bg-orange-50"
                        : "border-orange-100 bg-white"
                    }`}
                  >
                    <p className="font-semibold text-foreground">{restaurant.name}</p>
                    <p className="mt-1 text-sm text-subtle">
                      {restaurant.cuisineType} · {restaurant.locality}
                    </p>
                    <p className="mt-1 text-sm text-subtle">Owner: {restaurant.ownerName ?? "N/A"}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.18em] text-brand">
                      {restaurant.isActive ? "Live" : "Paused"} · {restaurant.totalOrders} orders
                    </p>
                  </button>
                ))}
              </div>
            </aside>

            <section className="rounded-[2rem] border border-orange-100 bg-white p-6 shadow-[0_18px_60px_rgba(211,91,31,0.08)]">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand">
                    {selectedId ? "Edit restaurant" : "Create restaurant"}
                  </p>
                  <h2 className="mt-2 font-serif text-3xl font-bold">
                    {selectedId ? "Admin restaurant controls" : "Create owner and restaurant"}
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
                <div className="mt-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand">
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
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand">
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
                    helperText="Upload JPG, PNG, or WebP. This image is used on cards and restaurant details."
                    onChange={(imageUrl) =>
                      setRestaurantForm((current) => ({ ...current, imageUrl }))
                    }
                  />
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-4">
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
                  <label className="block text-sm">
                    <span className="mb-2 block font-semibold text-foreground">Fallback image color</span>
                    <input
                      value={restaurantForm.imageColor}
                      onChange={(event) =>
                        setRestaurantForm((current) => ({ ...current, imageColor: event.target.value }))
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
                    Active
                  </label>
                </div>
              </div>

              <button
                type="button"
                onClick={() => void handleSubmit()}
                className="mt-6 rounded-2xl bg-brand px-6 py-4 text-sm font-semibold text-white"
              >
                {selectedId ? "Save restaurant" : "Create owner and restaurant"}
              </button>
            </section>
          </div>
        </main>
        <Footer />
      </div>
    </AuthGuard>
  );
}
