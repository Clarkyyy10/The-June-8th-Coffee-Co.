import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

/**
 * Browser Supabase client using the public (anon/publishable) key.
 * Returns null when env vars are not configured so the app can fall back
 * to local persistence gracefully.
 */
export const supabase: SupabaseClient | null =
  url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;

export const isSupabaseConfigured = Boolean(url && key);
