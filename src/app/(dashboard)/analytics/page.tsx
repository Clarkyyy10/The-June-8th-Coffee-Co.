"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/layout/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RevenueBarChart, OrdersLineChart } from "@/features/analytics/charts";
import { CategoryDonut } from "@/features/dashboard/charts";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { useStore } from "@/lib/store";
import { useHydrated } from "@/lib/hooks";
import {
  filterByRange,
  rangeSummary,
  salesTrend,
  categoryBreakdown,
  type TimeRange,
} from "@/lib/analytics";
import { cn, formatCompactCurrency, formatCurrency } from "@/lib/utils";

const ranges: TimeRange[] = ["Today", "Yesterday", "Week", "Month", "Quarter", "Year", "Lifetime"];

export default function AnalyticsPage() {
  const hydrated = useHydrated();
  const orders = useStore((s) => s.orders);
  const products = useStore((s) => s.products);
  const [range, setRange] = useState<TimeRange>("Week");

  const filtered = useMemo(() => filterByRange(orders, range), [orders, range]);
  const summary = useMemo(() => rangeSummary(filtered, products), [filtered, products]);
  const trend = useMemo(() => salesTrend(orders), [orders]);
  const catData = useMemo(() => categoryBreakdown(filtered, products), [filtered, products]);

  const popular = useMemo(() => {
    const map = new Map<string, { name: string; emoji: string; qty: number }>();
    for (const o of filtered) {
      for (const it of o.items) {
        const cur = map.get(it.productId) ?? { name: it.name, emoji: it.emoji, qty: 0 };
        cur.qty += it.quantity;
        map.set(it.productId, cur);
      }
    }
    return [...map.values()].sort((a, b) => b.qty - a.qty).slice(0, 5);
  }, [filtered]);

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-6 h-9 w-48 rounded-lg skeleton" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-xl skeleton" />
          ))}
        </div>
        <div className="mt-6 h-80 rounded-xl skeleton" />
      </div>
    );
  }

  const cards = [
    { label: "Revenue", value: summary.revenue, format: formatCompactCurrency },
    { label: "Orders", value: summary.orders },
    { label: "Avg Order Value", value: Math.round(summary.avgOrder), format: (n: number) => formatCurrency(n) },
    { label: "Est. Profit", value: Math.round(summary.profit), format: formatCompactCurrency },
  ];

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader title="Analytics" description="Live insights into your business performance">
        <div className="flex flex-wrap gap-1 rounded-lg border border-border bg-card/60 p-1">
          {ranges.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={cn(
                "rounded-md px-3 py-1 text-xs font-medium transition-colors",
                range === r
                  ? "bg-coffee-gradient text-cream shadow-soft"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </PageHeader>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="p-5">
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className="mt-1 font-display text-2xl font-bold">
                <AnimatedCounter key={`${range}-${s.label}`} value={s.value} format={s.format} />
              </p>
              <Badge variant="caramel" className="mt-2">
                {range}
              </Badge>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue (Last 7 Days)</CardTitle>
            <CardDescription>Daily revenue trend</CardDescription>
          </CardHeader>
          <CardContent>
            <RevenueBarChart data={trend} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category Mix</CardTitle>
            <CardDescription>{range} sales share</CardDescription>
          </CardHeader>
          <CardContent>
            <CategoryDonut data={catData} />
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Order Volume</CardTitle>
            <CardDescription>Orders per day this week</CardDescription>
          </CardHeader>
          <CardContent>
            <OrdersLineChart data={trend} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Popular Drinks</CardTitle>
            <CardDescription>Top sellers in the selected range</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {popular.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No sales in this range.
              </p>
            ) : (
              popular.map((p, i) => (
                <div key={p.name} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-muted text-xs font-bold text-muted-foreground">
                    {i + 1}
                  </span>
                  <span className="text-xl">{p.emoji}</span>
                  <p className="flex-1 truncate text-sm font-medium">{p.name}</p>
                  <span className="text-xs font-semibold text-muted-foreground">
                    {p.qty} sold
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
