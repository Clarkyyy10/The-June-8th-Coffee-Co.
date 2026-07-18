"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { navigation } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";
import { dashboardStats } from "@/lib/analytics";
import { Bean } from "lucide-react";

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const businessName = useStore((s) => s.settings.businessName);
  const tagline = useStore((s) => s.settings.tagline);
  const orders = useStore((s) => s.orders);
  const products = useStore((s) => s.products);

  const stats = dashboardStats(orders, products);
  const shortName = businessName
    .replace(/^The\s+/i, "")
    .replace(/\s+Coffee\s+Co\.?$/i, "")
    .trim();
  const health = Math.min(
    99,
    60 + Math.round((stats.completed / Math.max(1, orders.length)) * 40)
  );

  return (
    <aside
      className={cn(
        "flex h-full w-[264px] flex-col border-r border-border bg-card/50 backdrop-blur-xl",
        className
      )}
    >
      {/* Brand */}
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-coffee-gradient shadow-glow">
          <Bean className="h-6 w-6 text-cream" />
        </div>
        <div className="leading-tight">
          <p className="font-display text-base font-semibold tracking-tight">
            {shortName || "June 8th"}
          </p>
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            {tagline}
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-2 no-scrollbar">
        {navigation.map((group) => (
          <div key={group.title}>
            <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/70">
              {group.title}
            </p>
            <ul className="space-y-1">
              {group.items.map((item) => {
                const active =
                  pathname === item.href || pathname.startsWith(item.href + "/");
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                        active
                          ? "text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      {active && (
                        <motion.span
                          layoutId="sidebar-active"
                          className="absolute inset-0 -z-10 rounded-lg bg-coffee-gradient shadow-soft"
                          transition={{ type: "spring", stiffness: 400, damping: 32 }}
                        />
                      )}
                      <Icon className="h-[18px] w-[18px]" />
                      <span className="flex-1">{item.label}</span>
                      {item.badge && (
                        <Badge
                          variant={active ? "secondary" : "caramel"}
                          className="h-5 px-1.5 text-[10px]"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer card */}
      <div className="p-3">
        <div className="rounded-xl bg-coffee-gradient p-4 text-cream shadow-soft">
          <p className="font-display text-sm font-semibold">Business Health</p>
          <p className="mt-0.5 text-xs text-cream/70">
            {health >= 85 ? "Excellent" : health >= 70 ? "Healthy" : "Fair"} · {health}/100
          </p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-cream/20">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${health}%` }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="h-full rounded-full bg-caramel"
            />
          </div>
        </div>
      </div>
    </aside>
  );
}
