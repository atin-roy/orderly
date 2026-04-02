"use client";

import type { Restaurant } from "@orderly/types";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { RestaurantCard } from "@/components/restaurant-card";
import { CategoryPill } from "@/components/category-pill";
import {
  SearchIcon,
  ForkKnifeIcon,
  SushiIcon,
  BurgerIcon,
  CakeIcon,
  DessertIcon,
  LeafIcon,
} from "@/components/icons";
import { mockCategories } from "@/data/mock-data";
import { getRestaurantLocalities, getRestaurants } from "@/lib/api";

const categoryIcons: Record<string, React.ReactNode> = {
  forkKnife: <ForkKnifeIcon />,
  sushi: <SushiIcon />,
  burger: <BurgerIcon />,
  cake: <CakeIcon />,
  dessert: <DessertIcon />,
  leaf: <LeafIcon />,
};

const collectionCards = [
  {
    title: "Park Street Tonight",
    subtitle: "Biryani, rezala, grills, and larger dinner orders moving fastest.",
    accent: "from-orange-500 via-amber-400 to-yellow-300",
    meta: "Central Kolkata rush",
  },
  {
    title: "Salt Lake Workday",
    subtitle: "Quick bowls, tiffins, and office lunch spots around Sector I and V.",
    accent: "from-emerald-700 via-lime-600 to-yellow-500",
    meta: "Office-hour winners",
  },
  {
    title: "South Kolkata Comfort",
    subtitle: "Rolls, sweets, Bengali mains, and casual late-evening cravings.",
    accent: "from-stone-900 via-orange-700 to-rose-500",
    meta: "Ballygunge to Gariahat",
  },
];

export default function ExplorePage() {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState(() =>
    typeof window === "undefined" ? "" : new URLSearchParams(window.location.search).get("q") ?? ""
  );
  const [locality, setLocality] = useState(() =>
    typeof window === "undefined"
      ? ""
      : new URLSearchParams(window.location.search).get("locality") ?? ""
  );
  const [sort, setSort] = useState(() =>
    typeof window === "undefined"
      ? "rating"
      : new URLSearchParams(window.location.search).get("sort") ?? "rating"
  );
  const [vegOnly, setVegOnly] = useState(() =>
    typeof window === "undefined"
      ? false
      : new URLSearchParams(window.location.search).get("veg") === "1"
  );
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [localities, setLocalities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void getRestaurantLocalities()
      .then((response) => setLocalities(response.data))
      .catch(() => setLocalities([]));
  }, []);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      const params = new URLSearchParams();
      if (query.trim()) {
        params.set("q", query.trim());
      }
      if (locality) {
        params.set("locality", locality);
      }
      if (sort && sort !== "rating") {
        params.set("sort", sort);
      }
      if (vegOnly) {
        params.set("veg", "1");
      }

      router.replace(params.size ? `${pathname}?${params.toString()}` : pathname);
    }, 250);

    return () => {
      window.clearTimeout(handle);
    };
  }, [locality, pathname, query, router, sort, vegOnly]);

  useEffect(() => {
    let ignore = false;

    void getRestaurants({
      size: 24,
      query: query.trim() || undefined,
      locality: locality || undefined,
      isVeg: vegOnly ? true : undefined,
      sort,
    })
      .then((response) => {
        if (!ignore) {
          setRestaurants(response.data.content);
        }
      })
      .catch(() => {
        if (!ignore) {
          setRestaurants([]);
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [locality, query, sort, vegOnly]);

  const neighbourhoodBoards = useMemo(
    () =>
      localities.slice(0, 6).map((name, index) => ({
        name,
        mood:
          [
            "Biryani, kebabs, and late dinner runs",
            "Office bowls, tiffins, and coffee resets",
            "Rolls, sweets, and casual evening cravings",
            "Comfort Bengali mains and family orders",
            "Fast lunches, chaat, and after-work snacks",
            "Desserts, kebabs, and sharable comfort food",
          ][index % 6],
      })),
    [localities]
  );

  return (
    <div className="min-h-screen bg-cream">
      <Header />

      <main>
        <section className="border-b border-orange-100 bg-[linear-gradient(180deg,rgba(255,248,238,0.96),rgba(255,248,238,0.72))]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand">
                  Explore Kolkata
                </p>
                <h1 className="mt-4 font-serif text-4xl font-bold leading-tight md:text-5xl">
                  Search restaurants, dishes, and local favourites by neighbourhood
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-subtle">
                  Browse a Kolkata-focused feed with live restaurant data, searchable dishes,
                  and locality filters that actually reflect what is seeded in the backend.
                </p>
              </div>

              <div className="w-full max-w-2xl space-y-4">
                <div className="relative">
                  <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search cuisines, dishes, or Kolkata areas"
                    className="w-full rounded-2xl border border-orange-200 bg-white py-4 pl-12 pr-4 text-sm shadow-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                  />
                </div>

                <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_160px_auto]">
                  <select
                    value={locality}
                    onChange={(event) => setLocality(event.target.value)}
                    className="rounded-2xl border border-orange-200 bg-white px-4 py-3 text-sm shadow-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                  >
                    <option value="">All Kolkata localities</option>
                    {localities.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>

                  <select
                    value={sort}
                    onChange={(event) => setSort(event.target.value)}
                    className="rounded-2xl border border-orange-200 bg-white px-4 py-3 text-sm shadow-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                  >
                    <option value="rating">Top rated</option>
                    <option value="delivery-time">Fastest delivery</option>
                    <option value="name">Name</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => setVegOnly((current) => !current)}
                    className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition-colors ${
                      vegOnly
                        ? "border-emerald-500 bg-emerald-50 text-emerald-900"
                        : "border-orange-200 bg-white text-brand"
                    }`}
                  >
                    {vegOnly ? "Veg only on" : "Veg only"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      setLocality("");
                      setSort("rating");
                      setVegOnly(false);
                    }}
                    className="rounded-2xl border border-orange-200 bg-white px-4 py-3 text-sm font-semibold text-brand"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.85fr)]">
            <div className="rounded-[2rem] border border-orange-100 bg-white p-6 shadow-[0_18px_60px_rgba(211,91,31,0.08)]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand">
                    Collections
                  </p>
                  <h2 className="mt-3 font-serif text-3xl font-bold">
                    Start with Kolkata lanes
                  </h2>
                </div>
                <Link
                  href="/"
                  className="text-xs font-semibold uppercase tracking-[0.25em] text-brand transition-colors hover:text-brand/80"
                >
                  Back Home
                </Link>
              </div>

              <div className="mt-7 grid gap-4 md:grid-cols-3">
                {collectionCards.map((card) => (
                  <div
                    key={card.title}
                    className={`overflow-hidden rounded-[1.75rem] bg-gradient-to-br ${card.accent} p-5 text-white shadow-lg`}
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/80">
                      {card.meta}
                    </p>
                    <h3 className="mt-10 font-serif text-2xl font-bold leading-tight">
                      {card.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-white/88">
                      {card.subtitle}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-orange-100 bg-[var(--color-card)] p-6 shadow-[0_18px_60px_rgba(211,91,31,0.08)]">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand">
                Locality boards
              </p>
              <h2 className="mt-3 font-serif text-3xl font-bold">Browse by area</h2>
              <div className="mt-6 space-y-3">
                {neighbourhoodBoards.map((board) => (
                  <button
                    key={board.name}
                    type="button"
                    onClick={() => setLocality(board.name)}
                    className="w-full rounded-2xl border border-orange-100 bg-white px-4 py-4 text-left shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-semibold text-foreground">{board.name}</h3>
                      <span className="text-xs font-semibold uppercase tracking-[0.22em] text-brand">
                        View
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-subtle">{board.mood}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-[96rem] px-4 py-10 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-orange-100 bg-white p-6 shadow-[0_18px_60px_rgba(211,91,31,0.08)]">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand">
                  Categories
                </p>
                <h2 className="mt-3 font-serif text-3xl font-bold">Cravings map</h2>
                <p className="mt-3 max-w-2xl text-subtle">
                  Quick visual shortcuts for the seeded dataset instead of dead landing-page filler.
                </p>
              </div>
              <div className="rounded-2xl border border-orange-100 bg-[var(--color-card)] px-5 py-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand">
                  Live now
                </p>
                <p className="mt-1 font-serif text-3xl font-bold">{restaurants.length} spots</p>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-10">
              {mockCategories.map((category) => (
                <CategoryPill
                  key={category.label}
                  icon={categoryIcons[category.iconKey]}
                  label={category.label}
                />
              ))}
            </div>
          </div>

          <div className="mt-8">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand">
                  Feed
                </p>
                <h2 className="mt-3 font-serif text-3xl font-bold">
                  Restaurants worth comparing
                </h2>
                <p className="mt-3 max-w-2xl text-subtle">
                  Search works across restaurant names, cuisine tags, localities, and seeded dish names.
                </p>
              </div>
              <div className="hidden rounded-2xl border border-orange-100 bg-white px-5 py-4 text-right shadow-sm md:block">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand">
                  Showing
                </p>
                <p className="mt-1 font-serif text-3xl font-bold">{restaurants.length} spots</p>
              </div>
            </div>

            {loading ? (
              <div className="mt-8 rounded-[2rem] border border-orange-100 bg-white p-10 text-center text-sm text-subtle">
                Loading Kolkata restaurants...
              </div>
            ) : restaurants.length === 0 ? (
              <div className="mt-8 rounded-[2rem] border border-orange-100 bg-white p-10 text-center text-sm text-subtle">
                No restaurants matched the current search. Try a different dish, cuisine, or locality.
              </div>
            ) : (
              <div className="mt-8 grid gap-8 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {restaurants.map((restaurant) => (
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
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
