"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { StockFormDialog } from "@/features/inventory/stock-form-dialog";
import { useStore } from "@/lib/store";
import { useHydrated } from "@/lib/hooks";
import type { Stock } from "@/lib/types";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import {
  Plus,
  AlertTriangle,
  PackageCheck,
  Boxes,
  Coins,
  Pencil,
  Trash2,
} from "lucide-react";

export default function InventoryPage() {
  const hydrated = useHydrated();
  const stocks = useStore((s) => s.stocks);
  const deleteStock = useStore((s) => s.deleteStock);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Stock | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Stock | null>(null);

  const lowStock = stocks.filter((i) => i.currentStock <= i.minStock);
  const totalValue = stocks.reduce((s, i) => s + i.currentStock * i.purchaseCost, 0);

  const stats = [
    { label: "Total Items", value: stocks.length, icon: Boxes, accent: "#5b3a21" },
    { label: "Low Stock", value: lowStock.length, icon: AlertTriangle, accent: "#d99a2b" },
    { label: "Healthy", value: stocks.length - lowStock.length, icon: PackageCheck, accent: "#4f8a5b" },
    { label: "Stock Value", value: totalValue, icon: Coins, accent: "#a9743d", currency: true },
  ];

  const openAdd = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (s: Stock) => {
    setEditing(s);
    setDialogOpen(true);
  };
  const doDelete = () => {
    if (!confirmDelete) return;
    deleteStock(confirmDelete.id);
    toast.success(`${confirmDelete.name} removed`);
    setConfirmDelete(null);
  };

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-6 h-9 w-48 rounded-lg skeleton" />
        <div className="h-96 rounded-xl skeleton" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader title="Inventory" description="Track stocks, quantities, and restock alerts">
        <Button size="sm" onClick={openAdd}>
          <Plus className="h-4 w-4" /> Add Stocks
        </Button>
      </PageHeader>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-lg"
                    style={{ background: `${s.accent}22`, color: s.accent }}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                    <p className="font-display text-lg font-bold">
                      {s.currency ? formatCurrency(s.value) : s.value}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {lowStock.length > 0 && (
        <Card className="mb-6 border-warning/40 bg-warning/5">
          <CardContent className="flex flex-wrap items-center gap-3 p-4">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <p className="text-sm">
              <span className="font-semibold">{lowStock.length} item(s)</span> below minimum:{" "}
              <span className="text-muted-foreground">
                {lowStock.map((i) => i.name).join(", ")}
              </span>
            </p>
            <Button
              variant="outline"
              size="sm"
              className="ml-auto"
              onClick={() => toast.success("Restock order drafted for low items")}
            >
              Reorder All
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 font-medium">Item</th>
                <th className="px-4 py-3 font-medium">Stock Level</th>
                <th className="px-4 py-3 font-medium">Supplier</th>
                <th className="px-4 py-3 font-medium">Unit Cost</th>
                <th className="px-4 py-3 font-medium">Expires</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {stocks.map((ing, i) => {
                const pct = ing.maxStock
                  ? Math.min(100, (ing.currentStock / ing.maxStock) * 100)
                  : 0;
                const low = ing.currentStock <= ing.minStock;
                return (
                  <motion.tr
                    key={ing.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: Math.min(i * 0.03, 0.3) }}
                    className="border-b border-border/60 last:border-0 hover:bg-muted/40"
                  >
                    <td className="px-4 py-3 font-medium">{ing.name}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                          <div
                            className={cn(
                              "h-full rounded-full",
                              low ? "bg-danger" : pct < 50 ? "bg-warning" : "bg-success"
                            )}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {ing.currentStock} {ing.unit}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{ing.supplier || "—"}</td>
                    <td className="px-4 py-3">{formatCurrency(ing.purchaseCost)}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {ing.expirationDate ? formatDate(ing.expirationDate) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={low ? "danger" : "success"}>
                        {low ? "Low Stock" : "In Stock"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon-sm" onClick={() => openEdit(ing)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-danger hover:bg-danger/10"
                          onClick={() => setConfirmDelete(ing)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <StockFormDialog open={dialogOpen} onOpenChange={setDialogOpen} editing={editing} />

      <Dialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Remove stock item?</DialogTitle>
            <DialogDescription>
              {confirmDelete?.name} will be removed from inventory. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={doDelete}>
              <Trash2 className="h-4 w-4" /> Remove
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
