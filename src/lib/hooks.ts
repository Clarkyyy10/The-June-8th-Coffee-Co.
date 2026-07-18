"use client";

import { useEffect, useState } from "react";
import { useStore } from "./store";

/** True once the persisted store has rehydrated on the client. */
export function useHydrated() {
  return useStore((s) => s.hasHydrated);
}

/** A live ticking clock. Returns the current Date, updated every second. */
export function useClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}
