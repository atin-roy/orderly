"use client";

import { LocationProvider } from "@/components/location-provider";
import { SessionProvider } from "@/components/session-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <LocationProvider>{children}</LocationProvider>
    </SessionProvider>
  );
}
