import type { Order, Product } from "./types";
import { seedCategories } from "./seed";

const COUNTED: Order["status"][] = ["PENDING", "PREPARING", "READY", "COMPLETED"];

function counts(order: Order) {
  return COUNTED.includes(order.status);
}

export function isToday(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export type TimeRange =
  | "Today"
  | "Yesterday"
  | "Week"
  | "Month"
  | "Quarter"
  | "Year"
  | "Lifetime";

export function rangeStart(range: TimeRange): number {
  const now = new Date();
  const d = new Date(now);
  switch (range) {
    case "Today":
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    case "Yesterday":
      d.setDate(d.getDate() - 1);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    case "Week":
      d.setDate(d.getDate() - 7);
      return d.getTime();
    case "Month":
      d.setMonth(d.getMonth() - 1);
      return d.getTime();
    case "Quarter":
      d.setMonth(d.getMonth() - 3);
      return d.getTime();
    case "Year":
      d.setFullYear(d.getFullYear() - 1);
      return d.getTime();
    case "Lifetime":
    default:
      return 0;
  }
}

export function filterByRange(orders: Order[], range: TimeRange): Order[] {
  const start = rangeStart(range);
  const end =
    range === "Yesterday"
      ? new Date(new Date().setHours(0, 0, 0, 0)).getTime()
      : Infinity;
  return orders.filter((o) => {
    const t = new Date(o.createdAt).getTime();
    return t >= start && t < end;
  });
}

export interface DashboardStats {
  todaySales: number;
  ordersToday: number;
  pending: number;
  completed: number;
  customersToday: number;
  avgOrderValue: number;
  totalProducts: number;
  lowStock: number;
  netProfit: number;
  weekRevenue: number;
  bestSeller: Product | null;
}

export function dashboardStats(orders: Order[], products: Product[]): DashboardStats {
  const todays = orders.filter((o) => isToday(o.createdAt) && counts(o));
  const todaySales = todays.reduce((s, o) => s + o.total, 0);
  const ordersToday = todays.length;
  const pending = orders.filter((o) =>
    ["PENDING", "PREPARING", "READY"].includes(o.status)
  ).length;
  const completed = orders.filter((o) => o.status === "COMPLETED").length;

  const customersToday = new Set(
    todays.map((o) => o.customer).filter((c) => c && c !== "Walk-in")
  ).size + todays.filter((o) => o.customer === "Walk-in").length;

  const avgOrderValue = ordersToday ? todaySales / ordersToday : 0;
  const lowStock = products.filter((p) => p.stock <= p.lowStockAlert).length;

  // Profit estimate from today's line items (price - cost).
  const costById = new Map(products.map((p) => [p.id, p.cost]));
  let netProfit = 0;
  for (const o of todays) {
    for (const it of o.items) {
      const cost = costById.get(it.productId) ?? it.unitPrice * 0.35;
      netProfit += (it.unitPrice - cost) * it.quantity;
    }
    netProfit -= o.discount;
  }

  const weekStart = rangeStart("Week");
  const weekRevenue = orders
    .filter((o) => counts(o) && new Date(o.createdAt).getTime() >= weekStart)
    .reduce((s, o) => s + o.total, 0);

  const bestSeller =
    [...products].sort((a, b) => b.sold - a.sold)[0] ?? null;

  return {
    todaySales,
    ordersToday,
    pending,
    completed,
    customersToday,
    avgOrderValue,
    totalProducts: products.length,
    lowStock,
    netProfit,
    weekRevenue,
    bestSeller,
  };
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function salesTrend(orders: Order[]) {
  const days: { label: string; revenue: number; orders: number; date: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    days.push({ label: DAY_LABELS[d.getDay()], revenue: 0, orders: 0, date: d.getTime() });
  }
  for (const o of orders) {
    if (!counts(o)) continue;
    const t = new Date(o.createdAt).setHours(0, 0, 0, 0);
    const bucket = days.find((x) => x.date === t);
    if (bucket) {
      bucket.revenue += o.total;
      bucket.orders += 1;
    }
  }
  return days.map(({ label, revenue, orders }) => ({ label, revenue, orders }));
}

export function categoryBreakdown(orders: Order[], products: Product[]) {
  const catById = new Map(products.map((p) => [p.id, p.category]));
  const totals = new Map<string, number>();
  for (const o of orders) {
    if (!counts(o)) continue;
    for (const it of o.items) {
      const cat = catById.get(it.productId) ?? "Other";
      totals.set(cat, (totals.get(cat) ?? 0) + it.unitPrice * it.quantity);
    }
  }
  const grand = [...totals.values()].reduce((a, b) => a + b, 0) || 1;
  const colorByName = new Map(seedCategories.map((c) => [c.name, c.color]));
  const palette = ["#5b3a21", "#a9743d", "#d99a2b", "#4f8a5b", "#c0553b", "#4a7ba6"];
  return [...totals.entries()]
    .map(([name, value], i) => ({
      name,
      value: Math.round((value / grand) * 100),
      color: colorByName.get(name) ?? palette[i % palette.length],
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);
}

export function hourlyTraffic(orders: Order[]) {
  const hours = Array.from({ length: 14 }, (_, i) => 7 + i); // 7am–8pm
  const map = new Map(hours.map((h) => [h, 0]));
  for (const o of orders) {
    if (!counts(o) || !isToday(o.createdAt)) continue;
    const h = new Date(o.createdAt).getHours();
    if (map.has(h)) map.set(h, (map.get(h) ?? 0) + 1);
  }
  return hours.map((h) => ({
    hour: `${h % 12 === 0 ? 12 : h % 12}${h < 12 ? "a" : "p"}`,
    value: map.get(h) ?? 0,
  }));
}

export interface RangeSummary {
  revenue: number;
  orders: number;
  avgOrder: number;
  profit: number;
}

export function rangeSummary(orders: Order[], products: Product[]): RangeSummary {
  const valid = orders.filter(counts);
  const revenue = valid.reduce((s, o) => s + o.total, 0);
  const count = valid.length;
  const costById = new Map(products.map((p) => [p.id, p.cost]));
  let profit = 0;
  for (const o of valid) {
    for (const it of o.items) {
      const cost = costById.get(it.productId) ?? it.unitPrice * 0.35;
      profit += (it.unitPrice - cost) * it.quantity;
    }
    profit -= o.discount;
  }
  return {
    revenue,
    orders: count,
    avgOrder: count ? revenue / count : 0,
    profit,
  };
}
