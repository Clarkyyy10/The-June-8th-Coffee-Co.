"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useStore } from "@/lib/store";
import { useHydrated } from "@/lib/hooks";
import type { Order, OrderStatus } from "@/lib/types";
import { cn, formatCurrency, formatTime } from "@/lib/utils";
import { Search, Trash2, ChevronDown, Eye } from "lucide-react";

const statusVariant: Record<OrderStatus, string> = {
  PENDING: "warning",
  PREPARING: "info",
  READY: "caramel",
  COMPLETED: "success",
  CANCELLED: "danger",
  REFUNDED: "danger",
};

const ALL_STATUSES: OrderStatus[] = [
  "PENDING",
  "PREPARING",
  "READY",
  "COMPLETED",
  "CANCELLED",
  "REFUNDED",
];

const filters: (OrderStatus | "ALL")[] = [
  "ALL",
  "PENDING",
  "PREPARING",
  "READY",
  "COMPLETED",
];

function label(s: string) {
  return s.charAt(0) + s.slice(1).toLowerCase();
}

export default function OrdersPage() {
  const hydrated = useHydrated();
  const orders = useStore((s) => s.orders);
  const updateOrderStatus = useStore((s) => s.updateOrderStatus);
  const deleteOrder = useStore((s) => s.deleteOrder);

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<OrderStatus | "ALL">("ALL");
  const [view, setView] = useState<Order | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Order | null>(null);

  const filtered = useMemo(
    () =>
      orders.filter((o) => {
        const q =
          o.number.toLowerCase().includes(query.toLowerCase()) ||
          o.customer.toLowerCase().includes(query.toLowerCase());
        const f = filter === "ALL" || o.status === filter;
        return q && f;
      }),
    [orders, query, filter]
  );

  const changeStatus = (o: Order, status: OrderStatus) => {
    updateOrderStatus(o.id, status);
    toast.success(`${o.number} → ${label(status)}`);
  };

  const doDelete = () => {
    if (!confirmDelete) return;
    deleteOrder(confirmDelete.id);
    toast.success(`${confirmDelete.number} deleted`);
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
      <PageHeader title="Orders" description="Track, update, and manage all orders in real time" />

      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search order # or customer…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {filters.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={cn(
                "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
                filter === s
                  ? "border-transparent bg-coffee-gradient text-cream shadow-soft"
                  : "border-border bg-card/60 text-muted-foreground hover:bg-muted"
              )}
            >
              {label(s)}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
          <span className="text-5xl opacity-40">🧾</span>
          <p className="mt-4 font-display text-lg font-semibold">No orders found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Orders you take in the POS will appear here instantly.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Order</th>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Items</th>
                  <th className="px-4 py-3 font-medium">Time</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o, i) => (
                  <motion.tr
                    key={o.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: Math.min(i * 0.02, 0.3) }}
                    className="border-b border-border/60 transition-colors last:border-0 hover:bg-muted/40"
                  >
                    <td className="px-4 py-3 font-mono font-medium">{o.number}</td>
                    <td className="px-4 py-3">{o.customer}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {o.items.reduce((s, it) => s + it.quantity, 0)} items
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{formatTime(o.createdAt)}</td>
                    <td className="px-4 py-3 font-semibold">{formatCurrency(o.total)}</td>
                    <td className="px-4 py-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="inline-flex items-center gap-1 rounded-full">
                            <Badge variant={statusVariant[o.status] as never} className="cursor-pointer">
                              {label(o.status)}
                              <ChevronDown className="h-3 w-3" />
                            </Badge>
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuLabel>Update status</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {ALL_STATUSES.map((st) => (
                            <DropdownMenuItem key={st} onSelect={() => changeStatus(o, st)}>
                              <span
                                className="h-2 w-2 rounded-full"
                                style={{
                                  background:
                                    st === "COMPLETED"
                                      ? "#4f8a5b"
                                      : st === "CANCELLED" || st === "REFUNDED"
                                        ? "#c0553b"
                                        : "#c8955c",
                                }}
                              />
                              {label(st)}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon-sm" onClick={() => setView(o)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-danger hover:bg-danger/10"
                          onClick={() => setConfirmDelete(o)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View order */}
      <Dialog open={!!view} onOpenChange={(o) => !o && setView(null)}>
        <DialogContent>
          {view && (
            <>
              <DialogHeader>
                <DialogTitle>Order {view.number}</DialogTitle>
                <DialogDescription>
                  {view.customer} · {view.cashier} · {formatTime(view.createdAt)}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2 rounded-xl border border-dashed border-border bg-background/40 p-4">
                {view.items.map((it, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {it.quantity}× {it.name}
                      {it.size ? ` (${it.size})` : ""}
                    </span>
                    <span>{formatCurrency(it.unitPrice * it.quantity)}</span>
                  </div>
                ))}
                <div className="flex justify-between border-t border-border pt-2 font-semibold">
                  <span>Total</span>
                  <span className="text-caramel-dark">{formatCurrency(view.total)}</span>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <Badge variant={statusVariant[view.status] as never}>{label(view.status)}</Badge>
                <Badge variant="outline">{view.paymentMethod}</Badge>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm delete */}
      <Dialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete order?</DialogTitle>
            <DialogDescription>
              {confirmDelete?.number} will be permanently removed and sales totals will
              update automatically. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={doDelete}>
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
