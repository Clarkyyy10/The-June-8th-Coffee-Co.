import type { Role } from "./types";

/**
 * Role-Based Access Control matrix.
 * Maps each role to the set of permissions it holds.
 */
export const PERMISSIONS = {
  OWNER: ["*"],
  MANAGER: [
    "dashboard.view",
    "pos.use",
    "orders.manage",
    "products.manage",
    "inventory.manage",
    "customers.manage",
    "employees.view",
    "employees.manage",
    "analytics.view",
    "reports.view",
    "settings.view",
  ],
  CASHIER: [
    "dashboard.view",
    "pos.use",
    "orders.manage",
    "customers.view",
  ],
  BARISTA: ["pos.view", "orders.manage", "inventory.view"],
  KITCHEN: ["orders.manage", "inventory.view"],
} as const satisfies Record<Role, readonly string[]>;

export function can(role: Role, permission: string): boolean {
  const perms = PERMISSIONS[role] as readonly string[];
  return perms.includes("*") || perms.includes(permission);
}

/** Routes each role is allowed to access. */
export const ROLE_HOME: Record<Role, string> = {
  OWNER: "/dashboard",
  MANAGER: "/dashboard",
  CASHIER: "/pos",
  BARISTA: "/orders",
  KITCHEN: "/orders",
};
