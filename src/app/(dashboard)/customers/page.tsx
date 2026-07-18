"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import type { Customer } from "@/lib/types";
import { formatCurrency, initials, relativeTime } from "@/lib/utils";
import {
  Plus,
  Search,
  Crown,
  Coffee,
  Sparkles,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  favoriteDrink: "",
  vip: false,
};

export default function CustomersPage() {
  const hydrated = useHydrated();
  const customers = useStore((s) => s.customers);
  const addCustomer = useStore((s) => s.addCustomer);
  const updateCustomer = useStore((s) => s.updateCustomer);
  const deleteCustomer = useStore((s) => s.deleteCustomer);

  const [query, setQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!dialogOpen) return;
    setForm(
      editing
        ? {
            name: editing.name,
            email: editing.email,
            phone: editing.phone,
            favoriteDrink: editing.favoriteDrink,
            vip: editing.vip,
          }
        : emptyForm
    );
  }, [dialogOpen, editing]);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.email.toLowerCase().includes(query.toLowerCase())
  );

  const openAdd = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (c: Customer) => {
    setEditing(c);
    setDialogOpen(true);
  };

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (editing) {
      updateCustomer(editing.id, form);
      toast.success(`${form.name} updated`);
    } else {
      addCustomer({
        ...form,
        loyaltyPoints: 0,
        lifetimeSpend: 0,
        visitCount: 0,
        lastVisit: new Date().toISOString(),
      });
      toast.success(`${form.name} added`);
    }
    setDialogOpen(false);
  };

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-6 h-9 w-56 rounded-lg skeleton" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-56 rounded-xl skeleton" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader title="Loyal Customers" description="Loyalty, history, and VIP profiles">
        <Button size="sm" onClick={openAdd}>
          <Plus className="h-4 w-4" /> Add Customer
        </Button>
      </PageHeader>

      <div className="relative mb-5 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search customers…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.04, 0.3) }}
            whileHover={{ y: -4 }}
          >
            <Card className="overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <span className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-coffee-gradient font-semibold text-cream">
                    {initials(c.name)}
                    {c.vip && (
                      <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-caramel text-espresso-dark shadow">
                        <Crown className="h-3 w-3" />
                      </span>
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1.5 truncate font-medium">
                      {c.name}
                      {c.vip && (
                        <Badge variant="caramel" className="h-4 px-1.5 text-[9px]">
                          VIP
                        </Badge>
                      )}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{c.email || "—"}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => openEdit(c)}>
                        <Pencil /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => updateCustomer(c.id, { vip: !c.vip })}>
                        <Crown /> {c.vip ? "Remove VIP" : "Make VIP"}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onSelect={() => {
                          deleteCustomer(c.id);
                          toast.success(`${c.name} removed`);
                        }}
                        className="text-danger focus:bg-danger/10 [&_svg]:text-danger"
                      >
                        <Trash2 /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="mt-4 flex items-center gap-1.5 rounded-lg bg-muted/60 p-2.5 text-xs">
                  <Coffee className="h-3.5 w-3.5 text-caramel-dark" />
                  <span className="text-muted-foreground">Favorite:</span>
                  <span className="font-medium">{c.favoriteDrink || "—"}</span>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-background/50 p-2">
                    <p className="font-display text-sm font-bold text-caramel-dark">
                      {c.loyaltyPoints}
                    </p>
                    <p className="text-[10px] text-muted-foreground">Points</p>
                  </div>
                  <div className="rounded-lg bg-background/50 p-2">
                    <p className="font-display text-sm font-bold">{c.visitCount}</p>
                    <p className="text-[10px] text-muted-foreground">Visits</p>
                  </div>
                  <div className="rounded-lg bg-background/50 p-2">
                    <p className="font-display text-sm font-bold text-success">
                      {formatCurrency(c.lifetimeSpend).replace(".00", "")}
                    </p>
                    <p className="text-[10px] text-muted-foreground">Lifetime</p>
                  </div>
                </div>

                <p className="mt-3 flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Sparkles className="h-3 w-3" />
                  Last visit {relativeTime(c.lastVisit)}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Customer" : "Add Loyal Customer"}</DialogTitle>
            <DialogDescription>
              {editing ? "Update this customer's profile." : "Create a new loyalty profile."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={save} className="space-y-3">
            <Input
              placeholder="Full name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <Input
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <Input
              placeholder="Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <Input
              placeholder="Favorite drink"
              value={form.favoriteDrink}
              onChange={(e) => setForm({ ...form, favoriteDrink: e.target.value })}
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.vip}
                onChange={(e) => setForm({ ...form, vip: e.target.checked })}
                className="h-4 w-4 accent-[var(--color-caramel)]"
              />
              VIP customer
            </label>
            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{editing ? "Save" : "Add Customer"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
