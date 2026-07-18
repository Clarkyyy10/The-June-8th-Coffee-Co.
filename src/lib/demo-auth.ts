import type { Role } from "./types";

/**
 * Demo authentication directory.
 * In production this is replaced by NextAuth + Prisma (see lib/auth.ts).
 * Every demo account uses the password: coffee123
 */
export interface DemoUser {
  name: string;
  email: string;
  role: Role;
}

export const DEMO_PASSWORD = "coffee123";

export const DEMO_USERS: DemoUser[] = [
  { name: "Maria Villanueva", email: "maria@june8.co", role: "OWNER" },
  { name: "Maya Santos", email: "maya@june8.co", role: "MANAGER" },
  { name: "Leo Cruz", email: "leo@june8.co", role: "CASHIER" },
  { name: "Ivy Reyes", email: "ivy@june8.co", role: "BARISTA" },
  { name: "Kenji Lee", email: "kenji@june8.co", role: "KITCHEN" },
];

export const SESSION_COOKIE = "j9_session";

export interface SessionPayload {
  name: string;
  email: string;
  role: Role;
}

/** Encode a session payload for the demo cookie (base64 JSON). */
export function encodeSession(payload: SessionPayload): string {
  return Buffer.from(JSON.stringify(payload)).toString("base64");
}

/** Decode a demo session cookie value. Returns null if invalid. */
export function decodeSession(value: string | undefined): SessionPayload | null {
  if (!value) return null;
  try {
    const json =
      typeof atob === "function"
        ? atob(value)
        : Buffer.from(value, "base64").toString("utf-8");
    const parsed = JSON.parse(json);
    if (parsed?.email && parsed?.role) return parsed as SessionPayload;
    return null;
  } catch {
    return null;
  }
}

export function findDemoUser(email: string): DemoUser | undefined {
  return DEMO_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
}
