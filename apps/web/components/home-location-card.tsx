"use client";

import { useLocation } from "@/components/location-provider";
import { LocationPinIcon } from "@/components/icons";

export function HomeLocationCard() {
  const { activeLocation } = useLocation();
  const locationLine = activeLocation
    ? [activeLocation.address, activeLocation.city].filter(Boolean).join(", ")
    : "Choose your location";

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-orange-50 p-3 text-brand">
          <LocationPinIcon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand">
            Deliver to
          </p>
          <p className="mt-1 font-semibold">{locationLine}</p>
        </div>
      </div>
      <span className="rounded-full bg-emerald-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-800">
        Live
      </span>
    </div>
  );
}
