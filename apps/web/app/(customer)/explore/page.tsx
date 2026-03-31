import Link from "next/link";
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
import { mockRestaurants, mockCategories } from "@/data/mock-data";

const categoryIcons: Record<string, React.ReactNode> = {
  forkKnife: <ForkKnifeIcon />,
  sushi: <SushiIcon />,
  burger: <BurgerIcon />,
  cake: <CakeIcon />,
  dessert: <DessertIcon />,
  leaf: <LeafIcon />,
};

const filterChips = [
  "Under 30 min",
  "Pure Veg",
  "Bestsellers",
  "Budget Meals",
  "New on Orderly",
  "Late Night",
];

const collectionCards = [
  {
    title: "Office Lunch Sprint",
    subtitle: "Fast thalis, bowls, and combo trays for midday ordering.",
    accent: "from-orange-500 via-amber-400 to-yellow-300",
    meta: "42 places open",
  },
  {
    title: "Dinner Hosting",
    subtitle: "Family packs, kebab platters, biryani handi, and mithai add-ons.",
    accent: "from-emerald-700 via-lime-600 to-yellow-500",
    meta: "18 large-order spots",
  },
  {
    title: "After 11 PM",
    subtitle: "Rolls, chaat, kulfi, and comfort food still taking orders.",
    accent: "from-stone-900 via-orange-700 to-rose-500",
    meta: "9 late-night kitchens",
  },
];

const neighbourhoodBoards = [
  { name: "Bandra West", mood: "Cafe lunches + coastal curries", eta: "24 min avg" },
  { name: "Indiranagar", mood: "Dosas, desserts, late bites", eta: "21 min avg" },
  { name: "Connaught Place", mood: "North Indian classics + kebabs", eta: "27 min avg" },
  { name: "Hitech City", mood: "Quick combos for workday dinner", eta: "19 min avg" },
];

export default function ExplorePage() {
  return (
    <div className="min-h-screen bg-cream">
      <Header />

      <main>
        <section className="border-b border-orange-100 bg-[linear-gradient(180deg,rgba(255,248,238,0.96),rgba(255,248,238,0.72))]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand">
                  Explore
                </p>
                <h1 className="mt-4 font-serif text-4xl font-bold leading-tight md:text-5xl">
                  Find what to order by mood, speed, and neighbourhood
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-subtle">
                  This page is built for browsing. Use filters, jump into
                  editorial collections, and compare nearby options without the
                  homepage-style promo flow.
                </p>
              </div>

              <div className="w-full max-w-xl">
                <div className="relative">
                  <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search cuisines, dishes, or areas"
                    className="w-full rounded-2xl border border-orange-200 bg-white py-4 pl-12 pr-4 text-sm shadow-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                  />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {filterChips.map((chip) => (
                    <button
                      key={chip}
                      className="rounded-full border border-orange-200 bg-white px-4 py-2 text-xs font-semibold tracking-wide text-brand transition-colors hover:border-brand"
                    >
                      {chip}
                    </button>
                  ))}
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
                    Start with curated lanes
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
                Live Area Boards
              </p>
              <h2 className="mt-3 font-serif text-3xl font-bold">
                Browse by locality
              </h2>
              <div className="mt-6 space-y-3">
                {neighbourhoodBoards.map((board) => (
                  <div
                    key={board.name}
                    className="rounded-2xl border border-orange-100 bg-white px-4 py-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-semibold text-foreground">
                        {board.name}
                      </h3>
                      <span className="text-xs font-semibold uppercase tracking-[0.22em] text-brand">
                        {board.eta}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-subtle">{board.mood}</p>
                  </div>
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
                <h2 className="mt-3 font-serif text-3xl font-bold">
                  Cravings Map
                </h2>
                <p className="mt-3 max-w-2xl text-subtle">
                  Jump straight into the kind of food you want instead of
                  wasting a full column on filters.
                </p>
              </div>
              <div className="rounded-2xl border border-orange-100 bg-[var(--color-card)] px-5 py-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand">
                  Open now
                </p>
                <p className="mt-1 font-serif text-3xl font-bold">
                  {mockCategories.length} cravings
                </p>
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
                  A denser browse feed for actual selection, with enough
                  variety to make explore feel separate from the homepage.
                </p>
              </div>
              <div className="hidden rounded-2xl border border-orange-100 bg-white px-5 py-4 text-right shadow-sm md:block">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand">
                  Showing
                </p>
                <p className="mt-1 font-serif text-3xl font-bold">6 spots</p>
              </div>
            </div>

            <div className="mt-8 grid gap-8 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {mockRestaurants.map((restaurant) => (
                <RestaurantCard key={restaurant.name} {...restaurant} />
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
