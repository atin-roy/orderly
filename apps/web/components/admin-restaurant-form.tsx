"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ImageUploadField } from "@/components/image-upload-field";
import {
  adminCreateRestaurant,
  getAdminRestaurant,
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

export function AdminRestaurantForm({
  restaurantId,
}: {
  restaurantId?: number;
}) {
  const router = useRouter();
  const isEditing = typeof restaurantId === "number";
  const [restaurantForm, setRestaurantForm] = useState(emptyRestaurantForm);
  const [ownerForm, setOwnerForm] = useState(emptyOwnerForm);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(isEditing);

  useEffect(() => {
    if (!isEditing || restaurantId == null) {
      return;
    }

    let ignore = false;
    setLoadingDetails(true);

    void getAdminRestaurant(restaurantId)
      .then((response) => {
        if (ignore) {
          return;
        }

        const restaurant = response.data;
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
      })
      .catch((error) => {
        if (!ignore) {
          setMessage(error instanceof Error ? error.message : "Unable to load restaurant.");
          setMessageType("error");
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoadingDetails(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [isEditing, restaurantId]);

  async function handleSubmit() {
    if (!isEditing) {
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
    setMessage("");

    try {
      if (isEditing && restaurantId != null) {
        await updateRestaurant(restaurantId, {
          ...restaurantForm,
          imageUrl: restaurantForm.imageUrl || undefined,
        });
        router.push("/admin/restaurants?message=Restaurant%20updated");
        router.refresh();
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
      router.push("/admin/restaurants?message=Restaurant%20created");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save restaurant.");
      setMessageType("error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="space-y-6">
      <section className="rounded-[2.2rem] border border-orange-200 bg-[radial-gradient(circle_at_top_left,rgba(253,186,116,0.24),transparent_26%),linear-gradient(135deg,#fff7ed_0%,#ffffff_100%)] px-6 py-7 shadow-[0_24px_80px_rgba(211,91,31,0.10)] sm:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-brand">
              {isEditing ? "Edit restaurant" : "Create restaurant"}
            </p>
            <h1 className="mt-4 font-serif text-4xl font-bold leading-tight sm:text-5xl">
              {isEditing ? "Restaurant settings and status control" : "New owner and restaurant"}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-subtle">
              {isEditing
                ? "Update restaurant details, image assets, and fulfillment settings from a dedicated page."
                : "Create the owner account and restaurant in one workflow without covering the management list."}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {isEditing && restaurantId != null ? (
              <Link
                href={`/admin/restaurants/${restaurantId}/menu`}
                className="rounded-full border border-orange-200 bg-white px-4 py-2 text-sm font-semibold text-brand"
              >
                Manage menu
              </Link>
            ) : null}
            <Link
              href="/admin/restaurants"
              className="rounded-full border border-orange-200 bg-white px-4 py-2 text-sm font-semibold text-brand"
            >
              Back to restaurants
            </Link>
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

      <section className="rounded-[2rem] border border-orange-200 bg-white/90 p-3 shadow-[0_20px_70px_rgba(211,91,31,0.08)] sm:p-4">
        <div className="max-h-[calc(100vh-11rem)] overflow-y-auto rounded-[1.6rem] border border-orange-100 bg-[linear-gradient(180deg,rgba(255,248,238,0.98),rgba(255,255,255,0.96))] p-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:p-6">
          {loadingDetails ? (
            <div className="rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-subtle">
              Loading restaurant details...
            </div>
          ) : (
            <form
              className="space-y-8"
              onSubmit={(event) => {
                event.preventDefault();
                void handleSubmit();
              }}
            >
              {!isEditing ? (
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
              </div>

              <div className="flex flex-wrap justify-end gap-3">
                <Link
                  href="/admin/restaurants"
                  className="rounded-2xl border border-orange-200 px-6 py-4 text-sm font-semibold text-brand"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting || loadingDetails}
                  className="rounded-2xl bg-brand px-6 py-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting
                    ? isEditing
                      ? "Saving..."
                      : "Creating..."
                    : isEditing
                      ? "Save restaurant"
                      : "Create restaurant"}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
