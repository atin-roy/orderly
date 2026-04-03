"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { roleIsCustomer } from "@/components/auth-guard";
import { useSession } from "@/components/session-provider";
import { getCart, getCartUpdatedEventName } from "@/lib/api";
import { CartIcon, LocationPinIcon, MenuIcon, CloseIcon, ProfileIcon } from "./icons";
import { LocationModal } from "./location-modal";

const navLinks = [
  { href: "/", label: "HOME" },
  { href: "/explore", label: "EXPLORE" },
];

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const { isAuthenticated, role } = useSession();
  const showCustomerLinks = isAuthenticated && roleIsCustomer(role);
  useEffect(() => {
    if (!showCustomerLinks) {
      setCartItemCount(0);
      return;
    }

    let ignore = false;

    const refreshCartCount = () => {
      void getCart()
        .then((response) => {
          if (ignore) {
            return;
          }

          const nextCount = response.data.items.reduce((sum, item) => sum + item.quantity, 0);
          setCartItemCount(nextCount);
        })
        .catch(() => {
          if (!ignore) {
            setCartItemCount(0);
          }
        });
    };

    refreshCartCount();

    const handleCartUpdated = () => {
      refreshCartCount();
    };

    window.addEventListener(getCartUpdatedEventName(), handleCartUpdated);

    return () => {
      ignore = true;
      window.removeEventListener(getCartUpdatedEventName(), handleCartUpdated);
    };
  }, [pathname, showCustomerLinks]);

  const links =
    role === "BUSINESS"
      ? [
          { href: "/owner/dashboard", label: "DASHBOARD" },
          { href: "/owner/menu", label: "MENU" },
        ]
      : role === "DELIVERY_PARTNER"
        ? [{ href: "/delivery/deliveries", label: "DELIVERIES" }]
        : role === "ADMIN"
          ? [
              { href: "/admin/dashboard", label: "DASHBOARD" },
              { href: "/admin/restaurants", label: "RESTAURANTS" },
              { href: "/admin/delivery-partners", label: "DELIVERY PARTNERS" },
            ]
          : showCustomerLinks
            ? [...navLinks, { href: "/orders", label: "ORDERS" }, { href: "/cart", label: "CART" }]
            : navLinks;
  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="font-serif italic text-2xl font-bold text-brand">
              Orderly
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium tracking-wide text-gray-600 hover:text-brand transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right Icons */}
            <div className="flex items-center gap-3">
              {showCustomerLinks ? (
                <button
                  onClick={() => setLocationOpen(true)}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Select location"
                >
                  <LocationPinIcon className="w-5 h-5 text-gray-700" />
                </button>
              ) : null}
              {showCustomerLinks ? (
                <Link
                  href="/cart"
                  className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Cart"
                >
                  <CartIcon className="w-5 h-5 text-gray-700" />
                  {cartItemCount > 0 ? (
                    <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-brand px-1.5 py-0.5 text-[10px] font-bold leading-none text-white shadow-sm">
                      {cartItemCount > 99 ? "99+" : cartItemCount}
                    </span>
                  ) : null}
                </Link>
              ) : null}
              {isAuthenticated && role !== "ADMIN" ? (
                <Link
                  href="/profile"
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Profile"
                >
                  <ProfileIcon className="w-5 h-5 text-gray-700" />
                </Link>
              ) : !isAuthenticated ? (
                <Link
                  href="/login"
                  className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand/90"
                >
                  Sign In
                </Link>
              ) : null}

              {/* Mobile menu toggle */}
              <button
                className="md:hidden p-2 rounded-full hover:bg-gray-100 transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <CloseIcon className="w-5 h-5 text-gray-700" />
                ) : (
                  <MenuIcon className="w-5 h-5 text-gray-700" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Nav */}
          {mobileMenuOpen && (
            <nav className="md:hidden pb-4 border-t border-gray-100 pt-3">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block py-2 text-sm font-medium tracking-wide text-gray-600 hover:text-brand transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </header>

      <LocationModal open={locationOpen} onClose={() => setLocationOpen(false)} />
    </>
  );
}
