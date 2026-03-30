import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { RestaurantCard } from "@/components/restaurant-card";
import { CategoryPill } from "@/components/category-pill";
import {
  SearchIcon,
  SparklesIcon,
  ForkKnifeIcon,
  SushiIcon,
  BurgerIcon,
  CakeIcon,
  DessertIcon,
  LeafIcon,
} from "@/components/icons";
import { maitredPick, mockCategories, mockRestaurants } from "@/data/mock-data";

const categoryIcons: Record<string, React.ReactNode> = {
  forkKnife: <ForkKnifeIcon />,
  sushi: <SushiIcon />,
  burger: <BurgerIcon />,
  cake: <CakeIcon />,
  dessert: <DessertIcon />,
  leaf: <LeafIcon />,
};

const quickFilters = ["Pure Veg", "Under 30 Min", "Family Packs", "Late Night", "Sweet Boxes"];

const neighbourhoods = ["Bandra West", "Indiranagar", "Connaught Place", "Hitech City"];

export default function Home() {
  return (
    <div className="min-h-screen bg-cream">
      <Header />

      <main>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)] lg:items-center">
            <div>
              <p className="text-xs font-semibold tracking-[0.35em] text-brand uppercase">
                Explore Restaurants
              </p>
              <h1 className="mt-4 font-serif text-5xl font-bold leading-[0.95] tracking-tight md:text-6xl">
                Browse city favourites with an{" "}
                <span className="italic text-brand">Indian pulse</span>
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-subtle md:text-lg">
                Discover biryani counters, thali specialists, kebab houses, and
                mithai spots arranged for quick browsing instead of endless
                scrolling.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by dish, restaurant, or neighbourhood"
                    className="w-full rounded-xl border border-orange-200 bg-white/90 py-3.5 pl-12 pr-4 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                  />
                </div>
                <button className="rounded-xl bg-brand px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand/90">
                  Start Exploring
                </button>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {quickFilters.map((filter) => (
                  <button
                    key={filter}
                    className="rounded-full border border-orange-200 bg-white px-4 py-2 text-xs font-semibold tracking-wide text-brand transition-colors hover:border-brand"
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative lg:pl-4">
              <div className="relative overflow-hidden rounded-[2.25rem] bg-[radial-gradient(circle_at_top_left,_rgba(255,214,102,0.95),_transparent_24%),linear-gradient(135deg,_#d35b1f_0%,_#e4a11b_42%,_#138850_100%)] p-8 shadow-[0_30px_80px_rgba(31,41,55,0.18)] md:p-10">
                <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle,_rgba(255,248,220,0.8)_1px,_transparent_1px)] [background-size:24px_24px]" />
                <div className="absolute left-10 top-10 rounded-full bg-white/15 px-5 py-3 text-xs font-semibold tracking-[0.35em] text-white">
                  FESTIVE PICKS
                </div>
                <div className="absolute left-1/2 top-14 h-48 w-48 -translate-x-1/2 rounded-full border border-white/45 bg-white/10 backdrop-blur-sm md:h-56 md:w-56" />
                <div className="absolute inset-x-14 bottom-16 h-28 rounded-[999px] border border-white/30 bg-white/12 backdrop-blur-sm" />

                <div className="relative flex min-h-[480px] flex-col justify-end">
                  <div className="grid gap-4 md:grid-cols-[minmax(0,1.25fr)_190px] md:items-end">
                    <div className="rounded-3xl border border-white/40 bg-[rgba(255,248,238,0.2)] p-5 text-white shadow-[0_15px_40px_rgba(255,255,255,0.08)] backdrop-blur-md">
                      <div className="flex items-center gap-2 text-amber-50">
                        <SparklesIcon className="h-5 w-5" />
                        <span className="text-lg font-semibold text-slate-900">
                          City Spotlight
                        </span>
                      </div>
                      <p className="mt-4 text-lg font-medium leading-8 text-slate-800">
                        {maitredPick.text}
                      </p>
                      <Link
                        href="/explore"
                        className="mt-5 inline-block text-sm font-semibold tracking-wide text-brand transition-colors hover:text-brand/80"
                      >
                        ORDER NOW &rsaquo;
                      </Link>
                    </div>

                    <div className="rounded-[1.75rem] bg-white/18 p-5 text-white backdrop-blur-md">
                      <p className="text-xs uppercase tracking-[0.35em] text-white/80">
                        Today&apos;s Rush
                      </p>
                      <p className="mt-3 font-serif text-5xl font-bold leading-none">
                        22
                        <span className="ml-2 text-2xl">min</span>
                      </p>
                      <div className="mt-5 space-y-2 text-xs font-medium uppercase tracking-[0.22em] text-white/80">
                        {neighbourhoods.slice(0, 2).map((area) => (
                          <div
                            key={area}
                            className="rounded-full border border-white/20 bg-white/10 px-3 py-2 text-center"
                          >
                            {area}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.85fr)]">
            <div>
              <p className="text-xs font-semibold tracking-widest text-brand uppercase">
                Popular Right Now
              </p>
              <h2 className="mt-3 font-serif text-3xl font-bold">
                Order by craving
              </h2>
              <p className="mt-3 max-w-2xl text-subtle">
                Jump into the formats people actually browse by: comfort meals,
                snack runs, sweet cravings, and fast dinner saves.
              </p>

              <div className="mt-8 grid grid-cols-3 gap-x-5 gap-y-7 sm:grid-cols-4 xl:grid-cols-5">
                {mockCategories.map((category) => (
                  <CategoryPill
                    key={category.label}
                    icon={categoryIcons[category.iconKey]}
                    label={category.label}
                  />
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-orange-100 bg-[var(--color-card)] p-7 shadow-[0_20px_60px_rgba(211,91,31,0.08)]">
              <p className="text-xs font-semibold tracking-[0.3em] text-brand uppercase">
                Quick Routes
              </p>
              <h3 className="mt-3 font-serif text-3xl font-bold">
                Explore without the blank space
              </h3>
              <p className="mt-4 text-sm leading-7 text-subtle">
                Start from neighbourhood demand, rush windows, and cuisine moods
                so the page feels like active discovery rather than a sparse
                catalogue.
              </p>

              <div className="mt-6 grid gap-3">
                {[
                  { label: "Peak dinner demand", value: "7:30 PM" },
                  { label: "Fastest local dispatch", value: "18 min" },
                  { label: "Most saved cuisine", value: "Biryani" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-2xl bg-white px-4 py-4 shadow-sm"
                  >
                    <span className="text-sm text-subtle">{item.label}</span>
                    <span className="font-serif text-2xl font-bold text-brand">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {neighbourhoods.map((area) => (
                  <span
                    key={area}
                    className="rounded-full border border-orange-200 bg-white px-4 py-2 text-xs font-semibold tracking-wide text-brand"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold tracking-widest text-brand uppercase">
                Curated Tonight
              </p>
              <h2 className="mt-3 font-serif text-3xl font-bold">
                Top rated near you
              </h2>
            </div>
            <Link
              href="/explore"
              className="text-xs font-semibold tracking-[0.25em] text-brand uppercase transition-colors hover:text-brand/80"
            >
              View full browse page
            </Link>
          </div>

          <div className="mt-8 grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
            {mockRestaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.name} {...restaurant} />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
