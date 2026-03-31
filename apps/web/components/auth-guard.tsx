"use client";

import type { Role } from "@orderly/types";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSession } from "@/components/session-provider";

function buildLoginHref(pathname: string) {
  const params = new URLSearchParams({ next: pathname });
  return `/login?${params.toString()}`;
}

export function AuthGuard({
  children,
  requireCustomerRole = false,
}: {
  children: React.ReactNode;
  requireCustomerRole?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, role, status } = useSession();

  useEffect(() => {
    if (status === "loading") {
      return;
    }

    if (!isAuthenticated) {
      router.replace(buildLoginHref(pathname));
      return;
    }

    if (requireCustomerRole && role !== "USER") {
      router.replace("/profile");
    }
  }, [isAuthenticated, pathname, requireCustomerRole, role, router, status]);

  if (status === "loading") {
    return (
      <div className="mx-auto flex min-h-[40vh] max-w-3xl items-center justify-center px-4 text-center text-sm text-subtle">
        Loading your Orderly session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requireCustomerRole && role !== "USER") {
    return null;
  }

  return <>{children}</>;
}

export function roleIsCustomer(role: Role | null) {
  return role === "USER";
}
