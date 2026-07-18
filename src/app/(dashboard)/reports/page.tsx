"use client";

import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { useHydrated } from "@/lib/hooks";
import { exportCSV, exportExcel, exportPDF, type Cell } from "@/lib/export";
import { profitMargin, formatDate } from "@/lib/utils";
import {
  BarChart3,
  Boxes,
  Users,
  TrendingUp,
  Wallet,
  Heart,
  FileText,
  FileSpreadsheet,
  FileDown,
} from "lucide-react";

interface ReportDef {
  key: string;
  title: string;
  desc: string;
  icon: typeof BarChart3;
  accent: string;
  headers: string[];
  build: (s: ReturnType<typeof useStore.getState>) => Cell[][];
}

const reports: ReportDef[] = [
  {
    key: "sales",
    title: "Sales Report",
    desc: "Every order with totals and payment method",
    icon: BarChart3,
    accent: "#5b3a21",
    headers: ["Order", "Date", "Customer", "Items", "Payment", "Discount", "Total"],
    build: (s) =>
      s.orders.map((o) => [
        o.number,
        formatDate(o.createdAt, { hour: "2-digit", minute: "2-digit" }),
        o.customer,
        o.items.reduce((n, it) => n + it.quantity, 0),
        o.paymentMethod,
        o.discount,
        o.total,
      ]),
  },
  {
    key: "inventory",
    title: "Inventory Report",
    desc: "Stock levels, valuation, and suppliers",
    icon: Boxes,
    accent: "#d99a2b",
    headers: ["Item", "Unit", "Current", "Min", "Max", "Unit Cost", "Value", "Supplier"],
    build: (s) =>
      s.stocks.map((i) => [
        i.name,
        i.unit,
        i.currentStock,
        i.minStock,
        i.maxStock,
        i.purchaseCost,
        Math.round(i.currentStock * i.purchaseCost),
        i.supplier,
      ]),
  },
  {
    key: "employee",
    title: "Employee Report",
    desc: "Performance, sales, and attendance",
    icon: Users,
    accent: "#4a7ba6",
    headers: ["Name", "Role", "Sales", "Orders", "Attendance %", "Status"],
    build: (s) =>
      s.employees.map((e) => [
        e.name,
        e.role,
        e.sales,
        e.ordersHandled,
        e.attendance,
        e.active ? "Active" : "Inactive",
      ]),
  },
  {
    key: "profit",
    title: "Profit Report",
    desc: "Margins and profit by product",
    icon: TrendingUp,
    accent: "#4f8a5b",
    headers: ["Product", "Price", "Cost", "Margin %", "Sold", "Est. Profit"],
    build: (s) =>
      s.products.map((p) => [
        p.name,
        p.price,
        p.cost,
        profitMargin(p.price, p.cost).toFixed(1),
        p.sold,
        Math.round((p.price - p.cost) * p.sold),
      ]),
  },
  {
    key: "expense",
    title: "Expense Report",
    desc: "Purchase costs and inventory spend",
    icon: Wallet,
    accent: "#c0553b",
    headers: ["Item", "Quantity", "Unit", "Unit Cost", "Total Cost"],
    build: (s) =>
      s.stocks.map((i) => [
        i.name,
        i.currentStock,
        i.unit,
        i.purchaseCost,
        Math.round(i.currentStock * i.purchaseCost),
      ]),
  },
  {
    key: "customer",
    title: "Loyal Customer Report",
    desc: "Loyalty points, visits, and lifetime spend",
    icon: Heart,
    accent: "#a9743d",
    headers: ["Name", "Email", "Points", "Visits", "Lifetime Spend", "VIP"],
    build: (s) =>
      s.customers.map((c) => [
        c.name,
        c.email,
        c.loyaltyPoints,
        c.visitCount,
        c.lifetimeSpend,
        c.vip ? "Yes" : "No",
      ]),
  },
];

export default function ReportsPage() {
  const hydrated = useHydrated();

  const run = async (def: ReportDef, format: "PDF" | "Excel" | "CSV") => {
    const state = useStore.getState();
    const rows = def.build(state);
    if (rows.length === 0) {
      toast.error("No data available for this report");
      return;
    }
    const stamp = new Date().toISOString().slice(0, 10);
    const filename = `june8-${def.key}-${stamp}`;
    const subtitle = `Generated ${new Date().toLocaleString("en-PH")} · ${rows.length} rows`;

    if (format === "CSV") exportCSV(filename, def.headers, rows);
    else if (format === "Excel") exportExcel(filename, def.title, def.headers, rows);
    else await exportPDF(filename, def.title, subtitle, def.headers, rows);

    toast.success(`${def.title} exported (${format})`, { icon: "📄" });
  };

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-6 h-9 w-40 rounded-lg skeleton" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 rounded-xl skeleton" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader title="Reports" description="Generate and download live business reports" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reports.map((r, i) => {
          const Icon = r.icon;
          return (
            <motion.div
              key={r.key}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4 }}
            >
              <Card className="group h-full">
                <CardContent className="flex h-full flex-col p-5">
                  <span
                    className="flex h-11 w-11 items-center justify-center rounded-xl"
                    style={{ background: `${r.accent}22`, color: r.accent }}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-display font-semibold">{r.title}</h3>
                  <p className="mt-1 flex-1 text-sm text-muted-foreground">{r.desc}</p>
                  <div className="mt-4 flex gap-2">
                    <Button variant="subtle" size="sm" className="flex-1" onClick={() => run(r, "PDF")}>
                      <FileText className="h-3.5 w-3.5" /> PDF
                    </Button>
                    <Button variant="subtle" size="sm" className="flex-1" onClick={() => run(r, "Excel")}>
                      <FileSpreadsheet className="h-3.5 w-3.5" /> Excel
                    </Button>
                    <Button variant="subtle" size="sm" className="flex-1" onClick={() => run(r, "CSV")}>
                      <FileDown className="h-3.5 w-3.5" /> CSV
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
