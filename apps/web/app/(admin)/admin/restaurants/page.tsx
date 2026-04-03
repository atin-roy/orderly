"use client";

import type { AdminRestaurantSummary } from "@orderly/types";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminPagination } from "@/components/admin-pagination";
import {
  deleteRestaurant,
  getAdminRestaurant,
  getAdminRestaurantOverview,
  updateRestaurant,
} from "@/lib/api";

const PAGE_SIZE = 10;

export default function AdminRestaurantsPage() {
  const searchParams = useSearchParams();
  const [restaurants, setRestaurants] = useState<AdminRestaurantSummary[]>([]);
  const [message, setMessage] = useState(searchParams.get("message") ?? "");
  const [messageType, setMessageType] = useState<"success" | "error">("success");
  const [actionId, setActionId] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");

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

  useEffect(() => {
    const nextMessage = searchParams.get("message");
    if (nextMessage) {
      setMessage(nextMessage);
      setMessageType("success");
    }
  }, [searchParams]);

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

          <Link
            href="/admin/restaurants/new"
            className="inline-flex h-12 items-center justify-center rounded-full bg-brand px-6 text-sm font-semibold text-white"
          >
            Create restaurant
          </Link>
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
                  <Link
                    href={`/admin/restaurants/${restaurant.id}/edit`}
                    className="rounded-full border border-orange-200 px-4 py-2 text-sm font-semibold text-brand"
                  >
                    Edit
                  </Link>
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
    </main>
  );
}
