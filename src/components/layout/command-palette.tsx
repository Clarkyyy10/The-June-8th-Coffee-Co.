"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { AnimatePresence, motion } from "framer-motion";
import { navigation } from "@/lib/navigation";
import { useStore } from "@/lib/store";
import { Search, CornerDownLeft } from "lucide-react";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const products = useStore((s) => s.products);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("open-command-palette", handler);
    return () => window.removeEventListener("open-command-palette", handler);
  }, []);

  const go = (href: string) => {
    router.push(href);
    setOpen(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[12vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-espresso-dark/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <motion.div
            initial={{ scale: 0.96, y: -12, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, y: -12, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-card shadow-float"
          >
            <Command loop className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-muted-foreground">
              <div className="flex items-center gap-3 border-b border-border px-4">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Command.Input
                  autoFocus
                  placeholder="Search products, pages, actions…"
                  className="h-14 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
                <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                  ESC
                </kbd>
              </div>
              <Command.List className="max-h-[52vh] overflow-y-auto p-2 no-scrollbar">
                <Command.Empty className="py-8 text-center text-sm text-muted-foreground">
                  No results found.
                </Command.Empty>
                {navigation.map((group) => (
                  <Command.Group key={group.title} heading={group.title}>
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Command.Item
                          key={item.href}
                          value={item.label}
                          onSelect={() => go(item.href)}
                          className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm aria-selected:bg-muted"
                        >
                          <Icon className="h-4 w-4 text-caramel-dark" />
                          <span>{item.label}</span>
                          <CornerDownLeft className="ml-auto h-3 w-3 text-muted-foreground opacity-0 aria-selected:opacity-100" />
                        </Command.Item>
                      );
                    })}
                  </Command.Group>
                ))}
                <Command.Group heading="Products">
                  {products.slice(0, 6).map((p) => (
                    <Command.Item
                      key={p.id}
                      value={p.name}
                      onSelect={() => go("/products")}
                      className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm aria-selected:bg-muted"
                    >
                      <span className="text-lg">{p.emoji}</span>
                      <span>{p.name}</span>
                      <span className="ml-auto text-xs text-muted-foreground">
                        {p.sku}
                      </span>
                    </Command.Item>
                  ))}
                </Command.Group>
              </Command.List>
            </Command>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
