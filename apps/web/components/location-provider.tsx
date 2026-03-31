"use client";

import type { UserAddress } from "@orderly/types";
import {
  createContext,
  useContext,
  useState,
} from "react";
import { useSession } from "@/components/session-provider";

const GUEST_LOCATION_KEY = "orderly_guest_location";

export type GuestLocation = {
  label: string;
  address: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
};

type ActiveLocation = {
  label: string;
  address: string;
  city: string;
};

type LocationContextValue = {
  activeLocation: ActiveLocation | null;
  guestLocation: GuestLocation | null;
  setGuestLocation: (location: GuestLocation) => void;
  clearGuestLocation: () => void;
  defaultAddress: UserAddress | null;
};

const LocationContext = createContext<LocationContextValue | null>(null);

function toActiveLocation(address: UserAddress): ActiveLocation {
  return {
    label: address.label,
    address: address.address,
    city: address.city ?? "",
  };
}

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const { profile } = useSession();
  const [guestLocation, setGuestLocationState] = useState<GuestLocation | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }

    const storedLocation = localStorage.getItem(GUEST_LOCATION_KEY);

    if (!storedLocation) {
      return null;
    }

    try {
      return JSON.parse(storedLocation) as GuestLocation;
    } catch {
      localStorage.removeItem(GUEST_LOCATION_KEY);
      return null;
    }
  });

  function setGuestLocation(location: GuestLocation) {
    setGuestLocationState(location);
    localStorage.setItem(GUEST_LOCATION_KEY, JSON.stringify(location));
  }

  function clearGuestLocation() {
    setGuestLocationState(null);
    localStorage.removeItem(GUEST_LOCATION_KEY);
  }

  const defaultAddress =
    profile?.addresses.find((address) => address.isDefault) ??
    profile?.addresses[0] ??
    null;

  const activeLocation = defaultAddress
    ? toActiveLocation(defaultAddress)
    : guestLocation
      ? {
          label: guestLocation.label,
          address: guestLocation.address,
          city: guestLocation.city,
        }
      : null;

  return (
    <LocationContext.Provider
      value={{
        activeLocation,
        guestLocation,
        setGuestLocation,
        clearGuestLocation,
        defaultAddress,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);

  if (!context) {
    throw new Error("useLocation must be used within LocationProvider");
  }

  return context;
}
