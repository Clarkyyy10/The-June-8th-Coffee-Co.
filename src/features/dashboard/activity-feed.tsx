"use client";

import { motion } from "framer-motion";
import { useStore } from "@/lib/store";
import { formatCurrency, relativeTime } from "@/lib/utils";
import { CircleDollarSign, PackageX, RotateCcw } from "lucide-react";

const iconMap = {
  sale: { icon: CircleDollarSign, color: "#4f8a5b", bg: "#4f8a5b18" },
  stock: { icon: PackageX, color: "#d99a2b", bg: "#d99a2b18" },
  refund: { icon: RotateCcw, color: "#c0553b", bg: "#c0553b18" },
} as const;

export function ActivityFeed() {
  const orders = useStore((s) => s.orders);
  const stocks = useStore((s) => s.stocks);

  const items: {
    id: string;
    type: keyof typeof iconMap;
    text: string;
    amount?: number;
    time: string;
  }[] = [];

  for (const o of orders.slice(0, 5)) {
    const first = o.items[0];
    items.push({
      id: o.id,
      type: o.status === "REFUNDED" ? "refund" : "sale",
      text: `Order ${o.number} · ${first ? first.name : "items"}${
        o.items.length > 1 ? ` +${o.items.length - 1}` : ""
      }`,
      amount: o.status === "REFUNDED" ? -o.total : o.total,
      time: o.createdAt,
    });
  }

  const low = stocks.filter((s) => s.currentStock <= s.minStock).slice(0, 2);
  for (const s of low) {
    items.push({
      id: `stock-${s.id}`,
      type: "stock",
      text: `${s.name} is below minimum stock`,
      time: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    });
  }

  const feed = items
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 6);

  if (feed.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No recent activity yet.
      </p>
    );
  }

  return (
    <ul className="space-y-1">
      {feed.map((item, i) => {
        const conf = iconMap[item.type];
        const Icon = conf.icon;
        return (
          <motion.li
            key={item.id}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06, duration: 0.35 }}
            className="flex items-start gap-3 rounded-lg p-2.5 transition-colors hover:bg-muted"
          >
            <span
              className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
              style={{ background: conf.bg, color: conf.color }}
            >
              <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm">{item.text}</p>
              <p className="text-xs text-muted-foreground">{relativeTime(item.time)}</p>
            </div>
            {item.amount !== undefined && (
              <span
                className={`text-sm font-semibold ${
                  item.amount < 0 ? "text-danger" : "text-success"
                }`}
              >
                {item.amount < 0 ? "-" : "+"}
                {formatCurrency(Math.abs(item.amount))}
              </span>
            )}
          </motion.li>
        );
      })}
    </ul>
  );
}
