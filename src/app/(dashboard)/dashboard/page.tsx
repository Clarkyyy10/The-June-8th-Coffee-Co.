"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/layout/page-header";
import { KpiCard } from "@/features/dashboard/kpi-card";
import {
  RevenueAreaChart,
  TrafficBarChart,
  CategoryDonut,
} from "@/features/dashboard/charts";
import { ActivityFeed } from "@/features/dashboard/activity-feed";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { useStore } from "@/lib/store";
import { useHydrated } from "@/lib/hooks";
import {
  dashboardStats,
  salesTrend,
  categoryBreakdown,
  hourlyTraffic,
  filterByRange,
} from "@/lib/analytics";
import { formatCompactCurrency, formatCurrency } from "@/lib/utils";
import Link from "next/link";
import {
  Banknote,
  TrendingUp,
  ShoppingBag,
  Clock,
  Users,
  Package,
  Wallet,
  Trophy,
  Pencil,
  Sparkles,
} from "lucide-react";

export default function DashboardPage() {
  const hydrated = useHydrated();
  const orders = useStore((s) => s.orders);
  const products = useStore((s) => s.products);
  const salesGoal = useStore((s) => s.settings.salesGoal);
  const updateSettings = useStore((s) => s.updateSettings);

  const [goalOpen, setGoalOpen] = useState(false);
  const [goalDraft, setGoalDraft] = useState(salesGoal);

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-6 h-9 w-72 rounded-lg skeleton" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-32 rounded-xl skeleton" />
          ))}
        </div>
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="h-80 rounded-xl skeleton lg:col-span-2" />
          <div className="h-80 rounded-xl skeleton" />
        </div>
      </div>
    );
  }

  const stats = dashboardStats(orders, products);
  const trend = salesTrend(orders);
  const catData = categoryBreakdown(orders, products);
  const traffic = hourlyTraffic(orders);
  const yesterdaySales = filterByRange(orders, "Yesterday").reduce(
    (s, o) => s + o.total,
    0
  );
  const salesDelta =
    yesterdaySales > 0
      ? ((stats.todaySales - yesterdaySales) / yesterdaySales) * 100
      : 0;
  const goalProgress = salesGoal
    ? Math.min(100, (stats.todaySales / salesGoal) * 100)
    : 0;

  const topSellers = [...products].sort((a, b) => b.sold - a.sold).slice(0, 5);
  const maxSold = topSellers[0]?.sold || 1;

  const kpis = [
    { label: "Today's Sales", value: stats.todaySales, icon: Banknote, delta: Math.round(salesDelta * 10) / 10, format: (n: number) => formatCompactCurrency(n), accent: "#5b3a21" },
    { label: "Revenue (Week)", value: stats.weekRevenue, icon: TrendingUp, format: (n: number) => formatCompactCurrency(n), accent: "#c8955c" },
    { label: "Orders Today", value: stats.ordersToday, icon: ShoppingBag, accent: "#4f8a5b" },
    { label: "Pending Orders", value: stats.pending, icon: Clock, accent: "#d99a2b" },
    { label: "Customers Today", value: stats.customersToday, icon: Users, accent: "#4a7ba6" },
    { label: "Avg Order Value", value: Math.round(stats.avgOrderValue), icon: Wallet, format: (n: number) => formatCurrency(n), accent: "#a9743d" },
    { label: "Total Products", value: stats.totalProducts, icon: Package, accent: "#7a5230" },
    { label: "Net Profit (Today)", value: Math.round(stats.netProfit), icon: Trophy, format: (n: number) => formatCompactCurrency(n), accent: "#c0553b" },
  ];

  const saveGoal = () => {
    const value = Math.max(0, Number(goalDraft) || 0);
    updateSettings({ salesGoal: value });
    setGoalOpen(false);
    toast.success("Today's sales goal updated");
  };

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        title="Good day, Maria ☕"
        description={`Here's how The June 8th Coffee Co. is performing today.`}
      >
        <Button asChild variant="outline" size="sm">
          <Link href="/reports">Export</Link>
        </Button>
        <Button asChild size="sm">
          <Link href="/pos">
            <Sparkles className="h-4 w-4" />
            New Order
          </Link>
        </Button>
      </PageHeader>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((kpi, i) => (
          <KpiCard key={kpi.label} {...kpi} index={i} />
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card className="h-full">
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle>Sales Trend</CardTitle>
                <CardDescription>Revenue over the last 7 days</CardDescription>
              </div>
              <Badge variant="caramel">
                <TrendingUp className="h-3 w-3" /> {formatCompactCurrency(stats.weekRevenue)}
              </Badge>
            </CardHeader>
            <CardContent>
              <RevenueAreaChart data={trend} />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Sales by Category</CardTitle>
              <CardDescription>Recent sales mix</CardDescription>
            </CardHeader>
            <CardContent>
              <CategoryDonut data={catData} />
              <div className="mt-4 grid grid-cols-2 gap-2">
                {catData.map((c) => (
                  <div key={c.name} className="flex items-center gap-2 text-xs">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: c.color }} />
                    <span className="text-muted-foreground">{c.name}</span>
                    <span className="ml-auto font-medium">{c.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Peak Hours</CardTitle>
              <CardDescription>Orders by hour today</CardDescription>
            </CardHeader>
            <CardContent>
              <TrafficBarChart data={traffic} />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Best Sellers</CardTitle>
              <CardDescription>Top products by units sold</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {topSellers.map((p, i) => (
                <div key={p.id} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-muted text-xs font-bold text-muted-foreground">
                    {i + 1}
                  </span>
                  <span className="text-xl">{p.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{p.name}</p>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(p.sold / maxSold) * 100}%` }}
                        transition={{ delay: 0.4 + i * 0.1, duration: 0.8 }}
                        className="h-full rounded-full bg-caramel-gradient"
                      />
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground">{p.sold}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          <Card className="bg-coffee-gradient text-cream">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-cream/80">Today&apos;s Goal</p>
                <button
                  onClick={() => {
                    setGoalDraft(salesGoal);
                    setGoalOpen(true);
                  }}
                  className="flex items-center gap-1 rounded-md bg-cream/10 px-2 py-1 text-xs text-cream/90 transition-colors hover:bg-cream/20"
                >
                  <Pencil className="h-3 w-3" /> Edit
                </button>
              </div>
              <p className="mt-2 font-display text-3xl font-bold">
                <AnimatedCounter value={Math.round(goalProgress)} suffix="%" />
              </p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-cream/20">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${goalProgress}%` }}
                  transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full rounded-full bg-caramel"
                />
              </div>
              <p className="mt-2 text-xs text-cream/70">
                {formatCurrency(stats.todaySales)} of {formatCurrency(salesGoal)} daily target
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Live Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityFeed />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Edit sales goal */}
      <Dialog open={goalOpen} onOpenChange={setGoalOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit Today&apos;s Sales Goal</DialogTitle>
            <DialogDescription>Set your daily revenue target.</DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Daily goal ({useStore.getState().settings.currency})</label>
            <Input
              type="number"
              value={goalDraft}
              onChange={(e) => setGoalDraft(Number(e.target.value))}
              min={0}
              step={1000}
            />
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setGoalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveGoal}>Save Goal</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
