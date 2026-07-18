"use client";

import { useClock } from "@/lib/hooks";
import { Clock } from "lucide-react";

export function LiveClock({ compact = false }: { compact?: boolean }) {
  const now = useClock();

  if (!now) {
    // Placeholder keeps SSR and first client render identical.
    return (
      <span className="text-xs text-muted-foreground tabular-nums">--:--:--</span>
    );
  }

  const time = now.toLocaleTimeString("en-PH", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  const date = now.toLocaleDateString("en-PH", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  if (compact) {
    return <span className="tabular-nums">{time}</span>;
  }

  return (
    <div className="hidden items-center gap-2 rounded-lg border border-border bg-card/60 px-3 py-1.5 md:flex">
      <Clock className="h-3.5 w-3.5 text-caramel-dark" />
      <span className="text-xs text-muted-foreground">{date}</span>
      <span className="text-xs font-semibold tabular-nums text-foreground">{time}</span>
    </div>
  );
}
