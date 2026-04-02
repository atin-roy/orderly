"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Restaurant } from "@orderly/types";
import { Header } from "@/components/header";
import { useSession } from "@/components/session-provider";
import { Footer } from "@/components/footer";
import { HomeLocationCard } from "@/components/home-location-card";
import { RestaurantCard } from "@/components/restaurant-card";
import {
  ChevronRightIcon,
  ClockIcon,
  SearchIcon,
  SparklesIcon,
  StarIcon,
  StoreIcon,
} from "@/components/icons";
import { getRestaurants } from "@/lib/api";

const featuredStats = [
  { label: "Average dinner ETA", value: "24 min" },
  { label: "Top-rated kitchens", value: "4.7+" },
  { label: "Localities live", value: "120+" },
];

const cuisineFilters = ["Biryani", "Pure Veg", "Dosa", "Late Night"];

const heroRestaurants = [
  {
    name: "Mughal Dum House",
    meta: "Biryani, kebabs, rolls",
    rating: "4.8",
    eta: "28 min",
    accent: "bg-orange-50",
  },
  {
    name: "Anna Tiffin Room",
    meta: "Dosa, idli, filter coffee",
    rating: "4.7",
    eta: "19 min",
    accent: "bg-emerald-50",
  },
  {
    name: "Punjab Meal Co.",
    meta: "Thalis, gravies, rotis",
    rating: "4.6",
    eta: "26 min",
    accent: "bg-amber-50",
  },
];

const businessBenefits = [
  "Launch your storefront with menus, photos, and service zones.",
  "Show up in the right neighbourhoods when nearby demand is already active.",
  "Give regular customers a cleaner way to find and reorder from you.",
];

const courierBenefits = [
  "Pick lunch, dinner, late-night, or weekend-heavy windows.",
  "Stay around dense order clusters instead of chasing low-signal routes.",
  "Join an intake flow that can map directly to future delivery onboarding APIs.",
];

export default function Home() {
  const { isAuthenticated } = useSession();
  const [featuredRestaurants, setFeaturedRestaurants] = useState<Restaurant[]>([]);

  useEffect(() => {
    let ignore = false;

    void getRestaurants({ size: 3, sort: "rating" })
      .then((response) => {
        if (!ignore) {
          setFeaturedRestaurants(response.data.content);
        }
      })
      .catch(() => {
        if (!ignore) {
          setFeaturedRestaurants([]);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-cream text-foreground">
      <Header />

      <main className="overflow-hidden">
        <section className="relative">
          <div className="absolute inset-x-0 top-0 -z-10 h-[44rem] bg-[radial-gradient(circle_at_top_left,_rgba(228,161,27,0.24),_transparent_28%),radial-gradient(circle_at_80%_16%,_rgba(19,136,80,0.15),_transparent_22%),linear-gradient(180deg,_rgba(255,250,240,0.96),_rgba(248,241,223,0.76))]" />
          <div className="mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6 lg:px-8 lg:pb-24 lg:pt-16">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1.02fr)_minmax(420px,0.98fr)] lg:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/85 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-brand shadow-sm backdrop-blur">
                  <SparklesIcon className="h-4 w-4" />
                  Local food delivery for Indian neighbourhoods
                </div>

                <h1 className="mt-6 max-w-4xl font-serif text-5xl font-bold leading-[0.92] tracking-tight md:text-6xl lg:text-7xl">
                  Food worth ordering from restaurants you already trust.
                </h1>

                <p className="mt-6 max-w-2xl text-base leading-8 text-subtle md:text-lg">
                  Orderly should feel like a sharp food-ordering marketplace: quick
                  discovery, reliable ETAs, and restaurants that look curated instead
                  of buried in a random listing wall.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/explore"
                    className="inline-flex items-center justify-center rounded-2xl bg-brand px-6 py-4 text-sm font-semibold text-white transition hover:bg-brand/90"
                  >
                    Start ordering
                  </Link>
                  <Link
                    href="/register/business"
                    className="inline-flex items-center justify-center rounded-2xl border border-orange-300 bg-white px-6 py-4 text-sm font-semibold text-brand transition hover:border-brand"
                  >
                    Add your business
                  </Link>
                  <Link
                    href="/register/delivery"
                    className="inline-flex items-center justify-center rounded-2xl border border-emerald-300 bg-emerald-50 px-6 py-4 text-sm font-semibold text-emerald-900 transition hover:border-emerald-500"
                  >
                    Become a delivery partner
                  </Link>
                </div>

                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  {featuredStats.map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-[1.6rem] border border-white/70 bg-white/75 p-5 shadow-[0_18px_40px_rgba(35,24,21,0.06)] backdrop-blur"
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-subtle/80">
                        {stat.label}
                      </p>
                      <p className="mt-3 font-serif text-3xl font-bold text-brand">
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="absolute -right-8 top-10 h-28 w-28 rounded-full bg-brand/15 blur-3xl" />
                <div className="absolute -left-8 bottom-0 h-36 w-36 rounded-full bg-emerald-700/15 blur-3xl" />

                <div className="relative overflow-hidden rounded-[2.5rem] border border-white/60 bg-[linear-gradient(145deg,_rgba(35,24,21,0.96),_rgba(211,91,31,0.92)_48%,_rgba(19,136,80,0.88))] p-6 shadow-[0_30px_80px_rgba(35,24,21,0.18)] md:p-8">
                  <div className="absolute inset-0 opacity-25 [background-image:radial-gradient(circle,_rgba(255,255,255,0.35)_1px,_transparent_1px)] [background-size:22px_22px]" />

                  <div className="relative rounded-[2rem] border border-white/15 bg-white/10 p-5 backdrop-blur">
                    <div className="rounded-[1.75rem] bg-white p-5 text-foreground shadow-[0_16px_40px_rgba(0,0,0,0.14)]">
                      <HomeLocationCard />

                      <div className="mt-5 rounded-2xl border border-orange-100 bg-orange-50/70 px-4 py-4">
                        <div className="flex items-center gap-3 text-subtle">
                          <SearchIcon className="h-5 w-5 text-brand" />
                          <span className="text-sm">Search biryani, dosa, thali, rolls</span>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {cuisineFilters.map((chip) => (
                          <span
                            key={chip}
                            className="rounded-full border border-orange-200 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand"
                          >
                            {chip}
                          </span>
                        ))}
                      </div>

                      <div className="mt-6 space-y-3">
                        {heroRestaurants.map((restaurant) => (
                          <div
                            key={restaurant.name}
                            className={`rounded-[1.5rem] px-4 py-4 shadow-sm ${restaurant.accent}`}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <p className="font-semibold text-foreground">{restaurant.name}</p>
                                <p className="mt-1 text-sm text-subtle">{restaurant.meta}</p>
                              </div>
                              <div className="text-right">
                                <div className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-semibold text-foreground">
                                  <StarIcon className="h-3.5 w-3.5 text-marigold" />
                                  {restaurant.rating}
                                </div>
                                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.22em] text-subtle">
                                  {restaurant.eta}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <div className="rounded-[1.75rem] border border-white/15 bg-white/10 p-5 text-white backdrop-blur">
                        <p className="text-xs uppercase tracking-[0.28em] text-white/70">
                          Customer trust
                        </p>
                        <p className="mt-3 font-serif text-2xl font-bold">Live tracking, cleaner choices</p>
                        <p className="mt-3 text-sm leading-7 text-white/80">
                          Make browsing feel useful and ordering feel fast.
                        </p>
                      </div>

                      <div className="rounded-[1.75rem] border border-white/15 bg-emerald-950/35 p-5 text-white backdrop-blur">
                        <p className="text-xs uppercase tracking-[0.28em] text-white/70">
                          Supply side
                        </p>
                        <p className="mt-3 font-serif text-2xl font-bold">Restaurants and riders stay visible</p>
                        <p className="mt-3 text-sm leading-7 text-white/80">
                          Separate signup paths keep partner acquisition clear.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-orange-100 bg-white/70">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="grid gap-6 lg:grid-cols-3">
              {[
                {
                  title: "For customers",
                  body: "Browse neighbourhood favourites, compare ETAs quickly, and move from craving to checkout without the homepage feeling like a pitch deck.",
                },
                {
                  title: "For restaurants",
                  body: "Claim a sharper storefront, tell us where you serve, and enter through a signup flow made for operators instead of generic account creation.",
                },
                {
                  title: "For delivery partners",
                  body: "Choose your city, preferred shifts, and active zones in a flow that reads like delivery work, not generic job-board copy.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-[2rem] border border-orange-100 bg-[var(--color-card)] p-6 shadow-[0_18px_40px_rgba(35,24,21,0.05)]"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand">
                    {item.title}
                  </p>
                  <p className="mt-4 text-base leading-8 text-subtle">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-brand">
                Featured restaurants
              </p>
              <h2 className="mt-3 font-serif text-4xl font-bold tracking-tight">
                Put the best operators in front of hungry customers.
              </h2>
            </div>
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.24em] text-brand transition hover:text-brand/80"
            >
              Explore all restaurants
              <ChevronRightIcon className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8 grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
            {featuredRestaurants.map((restaurant) => (
              <RestaurantCard
                key={restaurant.id}
                href={`/restaurants/${restaurant.id}`}
                name={restaurant.name}
                cuisine={restaurant.cuisineType}
                locality={restaurant.locality}
                rating={restaurant.rating}
                priceLevel={restaurant.priceLevel}
                deliveryTime={`${restaurant.deliveryTimeMinutes} min`}
                deliveryFee={
                  restaurant.deliveryFee === 0
                    ? "FREE DELIVERY"
                    : `₹${restaurant.deliveryFee} DELIVERY`
                }
                imageColor={restaurant.imageColor}
                imageUrl={restaurant.imageUrl}
              />
            ))}
          </div>
        </section>

        {!isAuthenticated ? (
          <>
            <section
              id="business"
              className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-12 lg:px-8"
            >
              <div className="grid gap-8 rounded-[2.5rem] border border-orange-200 bg-[linear-gradient(135deg,_rgba(255,250,240,0.95),_rgba(248,223,190,0.9))] p-8 shadow-[0_24px_60px_rgba(211,91,31,0.08)] lg:grid-cols-[minmax(0,1fr)_340px] lg:items-center md:p-10">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.32em] text-brand">
                    Add your business
                  </p>
                  <h2 className="mt-4 font-serif text-4xl font-bold tracking-tight">
                    Turn local demand into repeat food orders.
                  </h2>
                  <p className="mt-4 max-w-2xl text-base leading-8 text-subtle">
                    Restaurant owners should see a practical path immediately: share your
                    service area, define what you sell, and get ready for a cleaner partner
                    onboarding API later.
                  </p>

                  <div className="mt-6 grid gap-3">
                    {businessBenefits.map((benefit) => (
                      <div
                        key={benefit}
                        className="flex items-start gap-3 rounded-2xl bg-white/80 px-4 py-4 shadow-sm"
                      >
                        <StoreIcon className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
                        <span className="text-sm leading-7 text-subtle">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[2rem] bg-[#231815] p-6 text-white shadow-[0_18px_40px_rgba(35,24,21,0.16)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
                    Partner snapshot
                  </p>
                  <div className="mt-6 space-y-5">
                    <div>
                      <p className="font-serif text-4xl font-bold">Operational v1</p>
                      <p className="mt-2 text-sm text-white/75">
                        Owner details, city coverage, service area, and cuisine focus.
                      </p>
                    </div>
                    <div className="flex items-center gap-3 rounded-2xl bg-white/8 px-4 py-4">
                      <ClockIcon className="h-5 w-5 text-marigold" />
                      <div>
                        <p className="text-sm font-semibold">Frontend staged, backend ready later</p>
                        <p className="text-xs text-white/65">
                          The page flow is ready before the partner API exists.
                        </p>
                      </div>
                    </div>
                    <Link
                      href="/register/business"
                      className="inline-flex w-full items-center justify-center rounded-2xl bg-brand px-5 py-4 text-sm font-semibold text-white transition hover:bg-brand/90"
                    >
                      Apply to list your restaurant
                    </Link>
                  </div>
                </div>
              </div>
            </section>

            <section
              id="delivery"
              className="mx-auto max-w-7xl px-4 py-8 pb-20 sm:px-6 md:py-12 md:pb-24 lg:px-8"
            >
              <div className="grid gap-8 rounded-[2.5rem] border border-emerald-200 bg-[linear-gradient(140deg,_rgba(16,48,38,0.96),_rgba(19,136,80,0.92))] p-8 shadow-[0_30px_70px_rgba(19,136,80,0.18)] lg:grid-cols-[320px_minmax(0,1fr)] lg:items-center md:p-10">
                <div className="rounded-[2rem] border border-white/15 bg-white/10 p-6 text-white backdrop-blur">
                  <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/60">
                    Delivery partner path
                  </p>
                  <p className="mt-4 font-serif text-4xl font-bold">Flexible shifts. Dense routes.</p>
                  <p className="mt-4 text-sm leading-7 text-white/75">
                    Delivery signup now captures city, shift preference, vehicle type, and
                    preferred zones so the future API can plug in without a UI rewrite.
                  </p>
                  <Link
                    href="/register/delivery"
                    className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-white px-5 py-4 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-50"
                  >
                    Start as a delivery partner
                  </Link>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.32em] text-emerald-100">
                    Become a delivery partner
                  </p>
                  <h2 className="mt-4 font-serif text-4xl font-bold tracking-tight text-white">
                    Stay close to high-intent orders instead of wasting miles.
                  </h2>
                  <p className="mt-4 max-w-2xl text-base leading-8 text-emerald-50/85">
                    The delivery section should sound like real work: where demand spikes,
                    when shifts are busiest, and why local route density matters.
                  </p>

                  <div className="mt-6 grid gap-3 md:grid-cols-3">
                    {courierBenefits.map((benefit) => (
                      <div
                        key={benefit}
                        className="rounded-[1.75rem] border border-white/10 bg-white/10 p-5 text-sm leading-7 text-white/85 backdrop-blur"
                      >
                        {benefit}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </>
        ) : null}
      </main>

      <Footer />
    </div>
  );
}
