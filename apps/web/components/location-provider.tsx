"use client";

import type { UserAddress } from "@orderly/types";
import { createContext, useContext } from "react";
import { useSession } from "@/components/session-provider";

type ActiveLocation = {
  label: string;
  address: string;
  city: string;
};

type LocationContextValue = {
  activeLocation: ActiveLocation | null;
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

  const defaultAddress =
    profile?.addresses.find((address) => address.isDefault) ??
    profile?.addresses[0] ??
    null;

  const activeLocation = defaultAddress ? toActiveLocation(defaultAddress) : null;

  return (
    <LocationContext.Provider
      value={{
        activeLocation,
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
