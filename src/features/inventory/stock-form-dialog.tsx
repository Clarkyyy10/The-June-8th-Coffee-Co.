"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useStore, type StockInput } from "@/lib/store";
import type { Stock } from "@/lib/types";

const empty: StockInput = {
  name: "",
  unit: "kg",
  currentStock: 0,
  minStock: 0,
  maxStock: 0,
  purchaseCost: 0,
  supplier: "",
  expirationDate: "",
};

const units = ["kg", "g", "L", "ml", "pcs", "box", "pack"];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}</label>
      {children}
    </div>
  );
}

export function StockFormDialog({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  editing?: Stock | null;
}) {
  const addStock = useStore((s) => s.addStock);
  const updateStock = useStore((s) => s.updateStock);
  const [form, setForm] = useState<StockInput>(empty);

  useEffect(() => {
    if (!open) return;
    setForm(
      editing
        ? {
            name: editing.name,
            unit: editing.unit,
            currentStock: editing.currentStock,
            minStock: editing.minStock,
            maxStock: editing.maxStock,
            purchaseCost: editing.purchaseCost,
            supplier: editing.supplier,
            expirationDate: editing.expirationDate,
          }
        : empty
    );
  }, [open, editing]);

  const set = <K extends keyof StockInput>(key: K, value: StockInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (editing) {
      updateStock(editing.id, form);
      toast.success(`${form.name} updated`);
    } else {
      addStock(form);
      toast.success(`${form.name} added to inventory`);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit Stock" : "Add Stock"}</DialogTitle>
          <DialogDescription>
            {editing
              ? "Update quantities, units, cost, and supplier details."
              : "Add a new inventory item and set its stock levels."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-[1fr_100px] gap-3">
            <Field label="Item Name">
              <Input
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Arabica Coffee Beans"
              />
            </Field>
            <Field label="Unit">
              <select
                value={form.unit}
                onChange={(e) => set("unit", e.target.value)}
                className="flex h-10 w-full rounded-lg border border-input bg-card/60 px-3 text-sm outline-none focus-visible:border-caramel"
              >
                {units.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Field label="Current">
              <Input
                type="number"
                step="0.01"
                value={form.currentStock}
                onChange={(e) => set("currentStock", Number(e.target.value))}
              />
            </Field>
            <Field label="Minimum">
              <Input
                type="number"
                step="0.01"
                value={form.minStock}
                onChange={(e) => set("minStock", Number(e.target.value))}
              />
            </Field>
            <Field label="Maximum">
              <Input
                type="number"
                step="0.01"
                value={form.maxStock}
                onChange={(e) => set("maxStock", Number(e.target.value))}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Unit Cost (₱)">
              <Input
                type="number"
                step="0.01"
                value={form.purchaseCost}
                onChange={(e) => set("purchaseCost", Number(e.target.value))}
              />
            </Field>
            <Field label="Expiration Date">
              <Input
                type="date"
                value={form.expirationDate?.slice(0, 10)}
                onChange={(e) => set("expirationDate", e.target.value)}
              />
            </Field>
          </div>

          <Field label="Supplier">
            <Input
              value={form.supplier}
              onChange={(e) => set("supplier", e.target.value)}
              placeholder="Highland Roasters"
            />
          </Field>

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{editing ? "Save Changes" : "Add Stock"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
