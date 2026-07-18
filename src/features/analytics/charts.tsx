"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
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

export function RevenueBarChart({
  data,
}: {
  data: { label: string; revenue: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data} margin={{ top: 10, right: 8, left: -8, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--color-border)" strokeDasharray="3 3" />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
          tickFormatter={(v) => formatCompactCurrency(Number(v))}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          cursor={{ fill: "var(--color-muted)" }}
          formatter={(v) => [formatCompactCurrency(Number(v)), "Revenue"]}
        />
        <Bar dataKey="revenue" fill="#a9743d" radius={[6, 6, 0, 0]} animationDuration={1000} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function OrdersLineChart({
  data,
}: {
  data: { label: string; orders: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 10, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--color-border)" strokeDasharray="3 3" />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
        />
        <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v} orders`, "Orders"]} />
        <Line
          type="monotone"
          dataKey="orders"
          stroke="#5b3a21"
          strokeWidth={3}
          dot={{ r: 4, fill: "#c8955c" }}
          activeDot={{ r: 6 }}
          animationDuration={1200}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
