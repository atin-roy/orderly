"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GiftIcon, ProfileIcon, StoreIcon, TruckIcon } from "@/components/icons";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: GiftIcon },
  { href: "/admin/restaurants", label: "Restaurants", icon: StoreIcon },
  { href: "/admin/delivery-partners", label: "Delivery Partners", icon: TruckIcon },
  { href: "/profile", label: "Account", icon: ProfileIcon },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(255,205,124,0.24),transparent_26%),linear-gradient(180deg,#fffaf3_0%,#f6efe7_100%)] text-stone-900">
      <div className="mx-auto grid min-h-screen max-w-[96rem] gap-6 px-4 py-4 sm:px-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:px-8">
        <aside className="rounded-[2rem] border border-orange-200/80 bg-stone-950 p-5 text-white shadow-[0_24px_80px_rgba(28,25,23,0.22)]">
          <Link href="/admin/dashboard" className="block font-serif text-3xl font-bold italic text-orange-200">
            Orderly
          </Link>
          <p className="mt-3 max-w-xs text-sm leading-6 text-stone-300">
            Admin operations for catalog, dispatch, and promotions.
          </p>

          <nav className="mt-8 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-[1.35rem] px-4 py-3 text-sm font-semibold transition ${
                    active
                      ? "bg-orange-200 text-stone-950 shadow-[0_14px_30px_rgba(251,191,36,0.18)]"
                      : "text-stone-300 hover:bg-white/8 hover:text-white"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-10 rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-orange-200">
              Admin surface
            </p>
            <p className="mt-3 text-sm leading-6 text-stone-300">
              Dashboard, Restaurants, Delivery Partners, and Account stay grouped in the same
              admin workspace.
            </p>
          </div>
        </aside>

        <div className="min-w-0 py-1">{children}</div>
      </div>
    </div>
  );
}
