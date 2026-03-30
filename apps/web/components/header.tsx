"use client";

import Link from "next/link";
import { useState } from "react";
import { CartIcon, LocationPinIcon, MenuIcon, CloseIcon, ProfileIcon } from "./icons";
import { LocationModal } from "./location-modal";

const navLinks = [
  { href: "/", label: "HOME" },
  { href: "/explore", label: "EXPLORE" },
  { href: "/orders", label: "ORDERS" },
  { href: "/cart", label: "CART" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);

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
              {navLinks.map((link) => (
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
              <button
                onClick={() => setLocationOpen(true)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Select location"
              >
                <LocationPinIcon className="w-5 h-5 text-gray-700" />
              </button>
              <Link
                href="/cart"
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Cart"
              >
                <CartIcon className="w-5 h-5 text-gray-700" />
              </Link>
              <Link
                href="/login"
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Login"
              >
                <ProfileIcon className="w-5 h-5 text-gray-700" />
              </Link>

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
              {navLinks.map((link) => (
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
