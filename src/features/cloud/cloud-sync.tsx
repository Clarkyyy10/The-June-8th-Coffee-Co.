"use client";

import { useEffect, useRef } from "react";
import { useStore } from "@/lib/store";
import { useHydrated } from "@/lib/hooks";
import { useCurrentUser } from "@/lib/user-context";

/** Serialize the syncable slice of the store. */
function snapshot() {
  const s = useStore.getState();
  return {
    products: s.products,
    orders: s.orders,
    customers: s.customers,
    employees: s.employees,
    stocks: s.stocks,
    cupSizes: s.cupSizes,
    settings: s.settings,
  };
}

async function pushNow() {
  try {
    await fetch("/api/cloud", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(snapshot()),
    });
  } catch {
    // Offline or transient error — the next change will retry.
  }
}

/**
 * Mirrors the signed-in account's data to Supabase automatically:
 *  - Pulls the account's data on login (Supabase is the source of truth).
 *  - Debounced-pushes any local change back up, tagged by account.
 * Mounted inside the authenticated shell so the user/session is available.
 */
export function CloudSync() {
  const user = useCurrentUser();
  const hydrated = useHydrated();
  const readyRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const email = user?.email ?? null;

  // Pull this account's data once the store is hydrated and the user is known.
  useEffect(() => {
    if (!hydrated || !email) return;
    let cancelled = false;
    readyRef.current = false;

    (async () => {
      try {
        const res = await fetch("/api/cloud");
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        if (data.empty) {
          // Cloud has nothing yet for this account — seed it from local state.
          await pushNow();
        } else {
          useStore.getState().importData({
            products: data.products ?? [],
            orders: data.orders ?? [],
            customers: data.customers ?? [],
            employees: data.employees ?? [],
            stocks: data.stocks ?? [],
            cupSizes: data.cupSizes ?? [],
            ...(data.settings ? { settings: data.settings } : {}),
          });
        }
      } finally {
        if (!cancelled) readyRef.current = true;
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [hydrated, email]);

  // Debounced push whenever the store changes (after the initial pull).
  useEffect(() => {
    if (!email) return;
    const unsub = useStore.subscribe(() => {
      if (!readyRef.current) return;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => void pushNow(), 1500);
    });
    return () => {
      unsub();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [email]);

  return null;
}
