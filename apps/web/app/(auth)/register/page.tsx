import Link from "next/link";
import { ClockIcon, SearchIcon, StoreIcon, TruckIcon } from "@/components/icons";

const roleCards = [
  {
    href: "/register/customer",
    icon: SearchIcon,
    eyebrow: "Customer",
    title: "Create an account and start ordering",
    body: "Fast signup for browsing restaurants, saving favourites, and checking out quicker.",
    accent:
      "border-orange-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(255,244,235,0.9))] text-foreground",
  },
  {
    href: "/register/business",
    icon: StoreIcon,
    eyebrow: "Business",
    title: "List your restaurant or kitchen",
    body: "Share your storefront, service zones, and menu focus so Orderly can onboard you cleanly.",
    accent:
      "border-orange-200 bg-[linear-gradient(180deg,rgba(255,250,240,0.98),rgba(248,223,190,0.94))] text-foreground",
  },
  {
    href: "/register/delivery",
    icon: TruckIcon,
    eyebrow: "Delivery Partner",
    title: "Join active routes and earning windows",
    body: "Tell us your city, preferred shift, and vehicle so we can match you with the right delivery rhythm.",
    accent:
      "border-emerald-200 bg-[linear-gradient(180deg,rgba(16,48,38,0.96),rgba(19,136,80,0.92))] text-white",
  },
];

export default function RegisterChooserPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <section className="overflow-hidden rounded-[2.5rem] border border-white/70 bg-[linear-gradient(145deg,rgba(255,250,240,0.96),rgba(248,241,223,0.92))] p-8 shadow-[0_28px_80px_rgba(35,24,21,0.08)] sm:p-10">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_380px] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-brand">
              Sign up for Orderly
            </p>
            <h1 className="mt-4 max-w-3xl font-serif text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Choose the signup path that matches how you use Orderly.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-subtle">
              Customers should get to food faster, restaurants should see a clear
              partner path, and delivery partners should understand the work before
              they commit. Start with the role that fits.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/register/customer"
                className="inline-flex items-center justify-center rounded-2xl bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand/90"
              >
                Start ordering
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-2xl border border-orange-200 bg-white px-5 py-3 text-sm font-semibold text-brand transition hover:border-brand"
              >
                Already have an account?
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-orange-200 bg-white/80 p-6 shadow-[0_20px_50px_rgba(211,91,31,0.08)] backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand">
              Why split the flows
            </p>
            <div className="mt-6 space-y-4">
              <div className="rounded-2xl bg-orange-50 px-4 py-4">
                <p className="text-sm font-semibold text-foreground">Customers</p>
                <p className="mt-2 text-sm leading-7 text-subtle">
                  Fast account creation with Indian phone formatting and minimal friction.
                </p>
              </div>
              <div className="rounded-2xl bg-orange-50 px-4 py-4">
                <p className="text-sm font-semibold text-foreground">Restaurants</p>
                <p className="mt-2 text-sm leading-7 text-subtle">
                  Intake fields for ownership, service area, and menu positioning.
                </p>
              </div>
              <div className="rounded-2xl bg-emerald-50 px-4 py-4">
                <div className="flex items-center gap-3">
                  <ClockIcon className="h-5 w-5 text-emerald-700" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Delivery partners</p>
                    <p className="mt-1 text-sm leading-7 text-subtle">
                      Vehicle, shift, and zone details help set expectations before the first trip.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-3">
        {roleCards.map((card) => {
          const Icon = card.icon;

          return (
            <Link
              key={card.href}
              href={card.href}
              className={`group rounded-[2rem] border p-6 shadow-[0_20px_60px_rgba(35,24,21,0.06)] transition-transform hover:-translate-y-1 ${card.accent}`}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/85 text-brand shadow-sm">
                <Icon className="h-6 w-6" />
              </div>
              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.28em] text-current/75">
                {card.eyebrow}
              </p>
              <h2 className="mt-3 font-serif text-3xl font-bold tracking-tight">
                {card.title}
              </h2>
              <p className="mt-4 text-sm leading-7 text-current/80">{card.body}</p>
              <p className="mt-8 text-sm font-semibold uppercase tracking-[0.24em] text-current">
                Continue
              </p>
            </Link>
          );
        })}
      </section>
    </div>
  );
}
