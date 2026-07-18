"use client";

import { useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/features/products/product-card";
import { ProductFormDialog } from "@/features/products/product-form-dialog";
import { useStore } from "@/lib/store";
import { useHydrated } from "@/lib/hooks";
import { seedCategories } from "@/lib/seed";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Plus, Search, Upload, Download, LayoutGrid } from "lucide-react";

export default function ProductsPage() {
  const hydrated = useHydrated();
  const products = useStore((s) => s.products);
  const remove = useStore((s) => s.deleteProduct);
  const duplicate = useStore((s) => s.duplicateProduct);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState("All");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesQuery =
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.sku.toLowerCase().includes(query.toLowerCase());
      const matchesCat = active === "All" || p.category === active;
      return matchesQuery && matchesCat;
    });
  }, [products, query, active]);

  const tabs = ["All", ...seedCategories.map((c) => c.name)];

  const openAdd = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (p: Product) => {
    setEditing(p);
    setDialogOpen(true);
  };
  const handleDelete = (p: Product) => {
    remove(p.id);
    toast.success(`${p.name} deleted`);
  };
  const handleDuplicate = (p: Product) => {
    duplicate(p.id);
    toast.success(`${p.name} duplicated`);
  };

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-6 h-9 w-40 rounded-lg skeleton" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-64 rounded-xl skeleton" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        title="Products"
        description={`${products.length} items across ${seedCategories.length} categories`}
      >
        <Button variant="outline" size="sm" onClick={() => toast("CSV import coming soon")}>
          <Upload className="h-4 w-4" /> Import
        </Button>
        <Button variant="outline" size="sm" onClick={() => toast.success("Exporting CSV…")}>
          <Download className="h-4 w-4" /> Export
        </Button>
        <Button size="sm" onClick={openAdd}>
          <Plus className="h-4 w-4" /> Add Product
        </Button>
      </PageHeader>

      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products or SKU…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActive(tab)}
              className={cn(
                "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
                active === tab
                  ? "border-transparent bg-coffee-gradient text-cream shadow-soft"
                  : "border-border bg-card/60 text-muted-foreground hover:bg-muted"
              )}
            >
              {tab}
            </button>
          ))}
          <Badge variant="outline" className="ml-1 shrink-0">
            <LayoutGrid className="h-3 w-3" /> {filtered.length}
          </Badge>
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((p, i) => (
              <ProductCard
                key={p.id}
                product={p}
                index={i}
                onEdit={openEdit}
                onDelete={handleDelete}
                onDuplicate={handleDuplicate}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
          <span className="text-5xl opacity-40">🔍</span>
          <p className="mt-4 font-display text-lg font-semibold">No products found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try adjusting your search or filters.
          </p>
        </div>
      )}

      <ProductFormDialog open={dialogOpen} onOpenChange={setDialogOpen} editing={editing} />
    </div>
  );
}
