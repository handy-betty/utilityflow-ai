"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { canAccessRoute, type AppRoute } from "@/lib/roles";
import { useUserRole } from "@/lib/useUserRole";

const protectedRoutes: AppRoute[] = [
  "/dashboard",
  "/work-orders",
  "/dispatch",
  "/members",
  "/qa",
  "/bugs",
  "/release-notes",
  "/training",
  "/assistant",
  "/settings",
];

export default function RoleGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { role, loadingRole } = useUserRole();

  const matchedRoute = protectedRoutes.find((route) =>
    pathname.startsWith(route)
  );

  useEffect(() => {
    if (loadingRole || !matchedRoute) return;

    if (!canAccessRoute(role, matchedRoute)) {
      router.replace("/dashboard");
    }
  }, [loadingRole, matchedRoute, role, router]);

  if (loadingRole) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm">
          Loading permissions...
        </div>
      </div>
    );
  }

  if (matchedRoute && !canAccessRoute(role, matchedRoute)) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
        You do not have permission to access this page.
      </div>
    );
  }

  return <>{children}</>;
}