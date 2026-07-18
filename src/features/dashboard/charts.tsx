"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCompactCurrency } from "@/lib/utils";

const tooltipStyle = {
  background: "var(--color-card)",
  border: "1px solid var(--color-border)",
  borderRadius: "0.75rem",
  boxShadow: "var(--shadow-float)",
  fontSize: "12px",
  color: "var(--color-foreground)",
};

export function RevenueAreaChart({
  data,
}: {
  data: { label: string; revenue: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 10, right: 8, left: -12, bottom: 0 }}>
        <defs>
          <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c8955c" stopOpacity={0.5} />
            <stop offset="100%" stopColor="#c8955c" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
          tickFormatter={(v) => formatCompactCurrency(Number(v))}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(v) => [formatCompactCurrency(Number(v)), "Revenue"]}
          cursor={{ stroke: "var(--color-caramel)", strokeDasharray: "4 4" }}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="#a9743d"
          strokeWidth={2.5}
          fill="url(#revFill)"
          animationDuration={1200}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function TrafficBarChart({
  data,
}: {
  data: { hour: string; value: number }[];
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
        <XAxis
          dataKey="hour"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
          interval={1}
        />
        <YAxis hide />
        <Tooltip
          contentStyle={tooltipStyle}
          cursor={{ fill: "var(--color-muted)" }}
          formatter={(v) => [`${v} orders`, "Traffic"]}
        />
        <Bar dataKey="value" radius={[6, 6, 0, 0]} animationDuration={1000}>
          {data.map((entry, i) => (
            <Cell
              key={i}
              fill={entry.value >= max * 0.8 ? "#5b3a21" : "#c8955c"}
              opacity={entry.value >= max * 0.8 ? 1 : 0.55}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function CategoryDonut({
  data,
}: {
  data: { name: string; value: number; color: string }[];
}) {
  if (data.length === 0) {
    return (
      <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
        No sales data yet
      </div>
    );
  }
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}%`, "Share"]} />
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={58}
          outerRadius={92}
          paddingAngle={3}
          cornerRadius={6}
          animationDuration={1000}
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} stroke="var(--color-card)" strokeWidth={2} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}
