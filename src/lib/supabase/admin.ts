import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;

/**
 * Server-only Supabase client using the SECRET (service) key.
 * Bypasses RLS — must never be imported into client components.
 */
export function getAdminClient(): SupabaseClient | null {
  if (!url || !secret) return null;
  return createClient(url, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export const isSupabaseAdminConfigured = Boolean(url && secret);
