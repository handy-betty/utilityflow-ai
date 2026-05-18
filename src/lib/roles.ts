export type UserRole = "admin" | "dispatcher" | "qa" | "trainer" | "readonly";

export type AppRoute =
  | "/dashboard"
  | "/work-orders"
  | "/dispatch"
  | "/members"
  | "/qa"
  | "/bugs"
  | "/release-notes"
  | "/training"
  | "/assistant"
  | "/settings";

export const roleLabels: Record<UserRole, string> = {
  admin: "Admin",
  dispatcher: "Dispatcher",
  qa: "QA Tester",
  trainer: "Trainer",
  readonly: "Read Only",
};

export const rolePermissions: Record<UserRole, AppRoute[]> = {
  admin: [
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
  ],
  dispatcher: ["/dashboard", "/work-orders", "/dispatch", "/members"],
  qa: ["/dashboard", "/qa", "/bugs", "/release-notes"],
  trainer: ["/dashboard", "/training", "/assistant"],
  readonly: [
    "/dashboard",
    "/work-orders",
    "/dispatch",
    "/members",
    "/qa",
    "/bugs",
    "/release-notes",
    "/training",
    "/assistant",
  ],
};

export function canAccessRoute(role: UserRole, route: AppRoute) {
  return rolePermissions[role]?.includes(route) ?? false;
}

export function canWrite(role: UserRole) {
  return role !== "readonly";
}

export function normalizeRole(role: string | null | undefined): UserRole {
  if (
    role === "admin" ||
    role === "dispatcher" ||
    role === "qa" ||
    role === "trainer" ||
    role === "readonly"
  ) {
    return role;
  }

  return "readonly";
}