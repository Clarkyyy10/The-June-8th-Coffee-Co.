"use client";

import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { cn } from "@/lib/utils";

export interface KpiCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  delta?: number;
  format?: (n: number) => string;
  prefix?: string;
  suffix?: string;
  accent?: string;
  index?: number;
}

export function KpiCard({
  label,
  value,
  icon: Icon,
  delta,
  format,
  prefix,
  suffix,
  accent = "#c8955c",
  index = 0,
}: KpiCardProps) {
  const positive = (delta ?? 0) >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
    >
      <Card className="group relative overflow-hidden p-5">
        <div
          className="absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-10 blur-2xl transition-opacity group-hover:opacity-20"
          style={{ background: accent }}
        />
        <div className="flex items-start justify-between">
          <span
            className="flex h-11 w-11 items-center justify-center rounded-xl shadow-soft"
            style={{ background: `${accent}22`, color: accent }}
          >
            <Icon className="h-5 w-5" />
          </span>
          {delta !== undefined && (
            <span
              className={cn(
                "flex items-center gap-0.5 rounded-full px-2 py-1 text-xs font-semibold",
                positive ? "bg-success/12 text-success" : "bg-danger/12 text-danger"
              )}
            >
              {positive ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              {Math.abs(delta)}%
            </span>
          )}
        </div>
        <div className="mt-4">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 font-display text-2xl font-bold tracking-tight">
            <AnimatedCounter
              value={value}
              format={format}
              prefix={prefix}
              suffix={suffix}
            />
          </p>
        </div>
      </Card>
    </motion.div>
  );
}
