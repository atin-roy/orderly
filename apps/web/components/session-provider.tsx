"use client";

import type { Role, UserProfile } from "@orderly/types";
import { usePathname, useRouter } from "next/navigation";
import {
  useCallback,
  createContext,
  startTransition,
  useContext,
  useEffect,
  useState,
} from "react";
import { getMyProfile } from "@/lib/api";
import {
  clearStoredSession,
  getStoredToken,
  subscribeToAuthChanges,
} from "@/lib/auth-session";

type SessionStatus = "loading" | "authenticated" | "unauthenticated";

type SessionContextValue = {
  profile: UserProfile | null;
  role: Role | null;
  isAuthenticated: boolean;
  status: SessionStatus;
  refreshProfile: () => Promise<void>;
  logout: (redirectTo?: string) => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [status, setStatus] = useState<SessionStatus>("loading");
  const refreshProfile = useCallback(async () => {
    const token = getStoredToken();

    if (!token) {
      setProfile(null);
      setStatus("unauthenticated");
      return;
    }

    setStatus("loading");

    try {
      const nextProfile = await getMyProfile();
      setProfile(nextProfile);
      setStatus("authenticated");
    } catch {
      clearStoredSession();
      setProfile(null);
      setStatus("unauthenticated");
    }
  }, []);

  useEffect(() => {
    const syncProfile = () => {
      queueMicrotask(() => {
        void refreshProfile();
      });
    };

    syncProfile();

    return subscribeToAuthChanges(syncProfile);
  }, [refreshProfile]);

  function logout(redirectTo = "/login") {
    clearStoredSession();
    setProfile(null);
    setStatus("unauthenticated");

    startTransition(() => {
      if (pathname !== redirectTo) {
        router.replace(redirectTo);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <SessionContext.Provider
      value={{
        profile,
        role: profile?.role ?? null,
        isAuthenticated: status === "authenticated",
        status,
        refreshProfile,
        logout,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error("useSession must be used within SessionProvider");
  }

  return context;
}
