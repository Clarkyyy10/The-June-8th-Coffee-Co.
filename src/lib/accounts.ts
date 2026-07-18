// Server-only module: only import this from route handlers / server code.
// It uses the Supabase SECRET key and bcrypt, and must never reach the client.
import bcrypt from "bcryptjs";
import { getAdminClient } from "@/lib/supabase/admin";
import type { Role } from "@/lib/types";

export type RequestStatus = "pending" | "approved" | "rejected";

// Everything lives in one table: public.account_requests
//   - top-level column `status`  ('pending' | 'approved' | 'rejected')
//   - JSONB `doc` with the account details + password hash
// Approving = flipping `status` to 'approved' (easy to do from the Supabase
// dashboard on any device, including a phone).

export interface AccountDoc {
  name: string;
  email: string;
  role: Role;
  passwordHash: string;
  createdAt: string;
}

/** Public view of a pending request (never leaks the password hash). */
export interface PendingRequest {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
}

const uid = (p: string) => `${p}${Date.now()}${Math.floor(Math.random() * 1000)}`;
const norm = (email: string) => email.trim().toLowerCase();

class NotConfiguredError extends Error {
  constructor() {
    super("Supabase is not configured");
  }
}

function client() {
  const c = getAdminClient();
  if (!c) throw new NotConfiguredError();
  return c;
}

export const isNotConfigured = (err: unknown) => err instanceof NotConfiguredError;

/** True if a pending or approved request already uses this email. */
export async function emailTaken(email: string): Promise<boolean> {
  const c = client();
  const e = norm(email);
  const { data, error } = await c
    .from("account_requests")
    .select("doc, status");
  if (error) throw new Error(error.message);
  return (data ?? []).some(
    (r) =>
      r.status !== "rejected" &&
      norm((r.doc as AccountDoc).email) === e
  );
}

/** Create a pending account request with a hashed password. */
export async function createRequest(input: {
  name: string;
  email: string;
  role: Role;
  password: string;
}): Promise<void> {
  const c = client();
  const doc: AccountDoc = {
    name: input.name.trim(),
    email: norm(input.email),
    role: input.role,
    passwordHash: bcrypt.hashSync(input.password, 10),
    createdAt: new Date().toISOString(),
  };
  const { error } = await c
    .from("account_requests")
    .insert({ id: uid("req"), status: "pending", doc });
  if (error) throw new Error(error.message);
}

/** List all pending requests (without password hashes). */
export async function listPending(): Promise<PendingRequest[]> {
  const c = client();
  const { data, error } = await c
    .from("account_requests")
    .select("id, doc")
    .eq("status", "pending")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => {
    const d = r.doc as AccountDoc;
    return {
      id: r.id as string,
      name: d.name,
      email: d.email,
      role: d.role,
      createdAt: d.createdAt,
    };
  });
}

/** Approve a request — flips status to 'approved'. */
export async function approveRequest(id: string): Promise<void> {
  const c = client();
  const { error } = await c
    .from("account_requests")
    .update({ status: "approved" })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

/** Reject a request — flips status to 'rejected'. */
export async function rejectRequest(id: string): Promise<void> {
  const c = client();
  const { error } = await c
    .from("account_requests")
    .update({ status: "rejected" })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

/** Verify login credentials against APPROVED accounts. Returns the account or null. */
export async function verifyAccount(
  email: string,
  password: string
): Promise<AccountDoc | null> {
  const c = client();
  const e = norm(email);
  const { data, error } = await c
    .from("account_requests")
    .select("doc")
    .eq("status", "approved");
  if (error) throw new Error(error.message);
  const match = (data ?? [])
    .map((r) => r.doc as AccountDoc)
    .find((d) => norm(d.email) === e);
  if (!match) return null;
  return bcrypt.compareSync(password, match.passwordHash) ? match : null;
}
