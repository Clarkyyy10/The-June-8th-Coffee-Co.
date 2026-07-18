"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import { useStore } from "@/lib/store";
import { useHydrated } from "@/lib/hooks";
import { useCurrentUser } from "@/lib/user-context";
import { useCart, type CartLine } from "@/features/pos/cart-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { celebrate } from "@/lib/confetti";
import { cn, formatCurrency } from "@/lib/utils";
import type { Product, Order, PaymentMethod } from "@/lib/types";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  Banknote,
  Smartphone,
  CreditCard,
  Percent,
  Receipt,
  CheckCircle2,
  Printer,
} from "lucide-react";

const paymentMethods: { id: PaymentMethod; label: string; icon: typeof Banknote }[] = [
  { id: "CASH", label: "Cash", icon: Banknote },
  { id: "GCASH", label: "GCash", icon: Smartphone },
  { id: "MAYA", label: "Maya", icon: Smartphone },
  { id: "CREDIT_CARD", label: "Card", icon: CreditCard },
];

const MILESTONE = 500;

interface ReceiptData {
  number: string;
  lines: CartLine[];
  subtotal: number;
  discount: number;
  total: number;
  payment: string;
}

export default function POSPage() {
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const products = useStore((s) => s.products);
  const cupSizes = useStore((s) => s.cupSizes);
  const placeOrder = useStore((s) => s.placeOrder);
  const orderCount = useStore((s) => s.orders.length);

  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("All");
  const [payment, setPayment] = useState<PaymentMethod>("CASH");
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [sizeTarget, setSizeTarget] = useState<Product | null>(null);
  const cart = useCart();

  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category))),
    [products]
  );

  const filtered = useMemo(
    () =>
      products.filter((p) => {
        const q =
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.sku.toLowerCase().includes(query.toLowerCase());
        const c = cat === "All" || p.category === cat;
        return q && c && p.status === "ACTIVE";
      }),
    [products, query, cat]
  );

  const tabs = ["All", ...categories];

  // Always read the current, live stock for a product from the source store.
  const stockOf = (id: string) => products.find((pp) => pp.id === id)?.stock ?? 0;

  const addToCart = (p: Product, size: string, delta: number): boolean => {
    const res = cart.addProduct(p, size, delta, stockOf(p.id));
    if (!res.ok) {
      if (res.reason === "out_of_stock") {
        toast.error(`${p.name} is out of stock`);
      } else {
        toast.error(
          `Only ${res.available} ${res.available === 1 ? "item" : "items"} available in stock`
        );
      }
      return false;
    }
    toast.success(`${p.name}${size ? ` (${size})` : ""} added`, { duration: 1000 });
    return true;
  };

  const handleProductTap = (p: Product) => {
    if (stockOf(p.id) <= 0) {
      toast.error(`${p.name} is out of stock`);
      return;
    }
    if (p.hasSizes && cupSizes.length > 0) {
      setSizeTarget(p);
    } else {
      addToCart(p, "", 0);
    }
  };

  const checkout = () => {
    if (cart.count() === 0) {
      toast.error("Cart is empty");
      return;
    }
    // Re-validate against live stock in case inventory changed since items were added.
    const conflicts = cart.reconcileStock(stockOf);
    if (conflicts.length > 0) {
      const c = conflicts[0];
      toast.error(
        c.available === 0
          ? `${c.name} is now out of stock — removed from cart. Please review your order.`
          : `Only ${c.available} ${c.name} left in stock. Cart updated — please review.`
      );
      return;
    }
    if (cart.count() === 0) {
      toast.error("Cart is empty");
      return;
    }
    const total = cart.total();
    const order: Order = {
      id: `o${Date.now()}`,
      number: `#JN${1000 + orderCount + 1}`,
      status: "COMPLETED",
      type: "DINE_IN",
      customer: "Walk-in",
      cashier: user?.name || "Staff",
      items: cart.lines.map((l) => ({
        productId: l.product.id,
        name: l.product.name,
        emoji: l.product.emoji,
        image: l.product.image,
        quantity: l.quantity,
        unitPrice: l.unitPrice,
        size: l.size,
      })),
      subtotal: cart.subtotal(),
      discount: cart.discountAmount(),
      total,
      paymentMethod: payment,
      createdAt: new Date().toISOString(),
    };
    placeOrder(order);
    setReceipt({
      number: order.number,
      lines: [...cart.lines],
      subtotal: order.subtotal,
      discount: order.discount,
      total,
      payment,
    });
    if (total >= MILESTONE) {
      celebrate();
      toast.success("Milestone order! 🎉", { icon: "☕" });
    } else {
      toast.success("Order placed", { icon: "☕" });
    }
    cart.clear();
  };

  if (!hydrated) {
    return (
      <div className="mx-auto grid h-[calc(100vh-7rem)] max-w-[1500px] grid-cols-1 gap-4 lg:grid-cols-[1fr_380px]">
        <div className="rounded-xl skeleton" />
        <div className="rounded-xl skeleton" />
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto grid h-[calc(100vh-7rem)] max-w-[1500px] grid-cols-1 gap-4 lg:grid-cols-[1fr_380px]">
        {/* Product grid */}
        <div className="flex flex-col overflow-hidden rounded-xl">
          <div className="mb-3 flex flex-col gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search products…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {tabs.map((t) => (
                <button
                  key={t}
                  onClick={() => setCat(t)}
                  className={cn(
                    "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
                    cat === t
                      ? "border-transparent bg-coffee-gradient text-cream shadow-soft"
                      : "border-border bg-card/60 text-muted-foreground hover:bg-muted"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="grid flex-1 auto-rows-min grid-cols-2 gap-3 overflow-y-auto pr-1 no-scrollbar sm:grid-cols-3 xl:grid-cols-4">
            {filtered.map((p, i) => {
              const inCart = cart.qtyForProduct(p.id);
              const out = p.stock <= 0;
              const remaining = Math.max(0, p.stock - inCart);
              const low = !out && p.stock <= p.lowStockAlert;
              const maxed = !out && remaining <= 0;
              const disabled = out || maxed;
              return (
              <motion.button
                key={p.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.02 }}
                whileTap={disabled ? undefined : { scale: 0.95 }}
                onClick={() => handleProductTap(p)}
                disabled={disabled}
                aria-disabled={disabled}
                className={cn(
                  "group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card text-left shadow-soft transition-shadow",
                  disabled ? "cursor-not-allowed opacity-60" : "hover:shadow-float"
                )}
              >
                {/* Stock badge */}
                {out ? (
                  <span className="absolute left-1.5 top-1.5 z-10 rounded-md bg-danger px-1.5 py-0.5 text-[10px] font-semibold text-danger-foreground shadow-soft">
                    Out of Stock
                  </span>
                ) : maxed ? (
                  <span className="absolute left-1.5 top-1.5 z-10 rounded-md bg-warning px-1.5 py-0.5 text-[10px] font-semibold text-warning-foreground shadow-soft">
                    Max in cart
                  </span>
                ) : low ? (
                  <span className="absolute left-1.5 top-1.5 z-10 rounded-md bg-warning px-1.5 py-0.5 text-[10px] font-semibold text-warning-foreground shadow-soft">
                    {remaining} left
                  </span>
                ) : null}

                <div className="flex h-20 items-center justify-center overflow-hidden bg-cream-radial text-4xl transition-transform group-hover:scale-110">
                  {p.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.image} alt={p.name} className={cn("h-full w-full object-cover", out && "grayscale")} />
                  ) : (
                    <span className={cn(out && "grayscale")}>{p.emoji}</span>
                  )}
                </div>
                <div className="p-2.5">
                  <p className="truncate text-sm font-medium">{p.name}</p>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-sm font-semibold text-caramel-dark">
                      {formatCurrency(p.price)}
                    </span>
                    <span
                      className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-md text-caramel-dark transition-colors",
                        disabled
                          ? "bg-muted/60 text-muted-foreground"
                          : "bg-muted group-hover:bg-coffee-gradient group-hover:text-cream"
                      )}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </span>
                  </div>
                  {!out && (
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      {remaining} in stock
                    </p>
                  )}
                </div>
              </motion.button>
              );
            })}
          </div>
        </div>

        {/* Cart panel */}
        <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-card">
          <div className="flex items-center justify-between border-b border-border p-4">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-caramel-dark" />
              <h2 className="font-display font-semibold">Current Order</h2>
              <Badge variant="caramel">{cart.count()}</Badge>
            </div>
            {cart.lines.length > 0 && (
              <button onClick={cart.clear} className="text-xs text-danger hover:underline">
                Clear
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-3 no-scrollbar">
            <AnimatePresence initial={false}>
              {cart.lines.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center py-16 text-center">
                  <span className="text-5xl opacity-30">🛒</span>
                  <p className="mt-3 text-sm text-muted-foreground">
                    No items yet. Tap a product to add.
                  </p>
                </div>
              ) : (
                cart.lines.map((line) => (
                  <motion.div
                    key={line.key}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20, height: 0 }}
                    className="mb-2 flex items-center gap-3 rounded-lg border border-border bg-background/40 p-2.5"
                  >
                    <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-md bg-cream-radial text-xl">
                      {line.product.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={line.product.image} alt="" className="h-full w-full object-cover" />
                      ) : (
                        line.product.emoji
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{line.product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {line.size} · {formatCurrency(line.unitPrice)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => cart.decrement(line.key)}
                        className="flex h-6 w-6 items-center justify-center rounded-md bg-muted hover:bg-latte"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-5 text-center text-sm font-semibold">{line.quantity}</span>
                      <button
                        onClick={() => {
                          const res = cart.increment(line.key, stockOf(line.product.id));
                          if (!res.ok) {
                            toast.error(
                              res.reason === "out_of_stock"
                                ? `${line.product.name} is out of stock`
                                : "You have reached the maximum available quantity"
                            );
                          }
                        }}
                        disabled={cart.qtyForProduct(line.product.id) >= stockOf(line.product.id)}
                        className="flex h-6 w-6 items-center justify-center rounded-md bg-muted hover:bg-latte disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => cart.remove(line.key)}
                        className="ml-1 flex h-6 w-6 items-center justify-center rounded-md text-danger hover:bg-danger/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>

          <div className="border-t border-border p-4">
            <div className="mb-3 flex gap-2">
              {[0, 0.1, 0.15].map((rate) => (
                <button
                  key={rate}
                  onClick={() => cart.setDiscount(rate)}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-1 rounded-lg border py-1.5 text-xs font-medium transition-colors",
                    cart.discountRate === rate
                      ? "border-transparent bg-caramel/20 text-caramel-dark"
                      : "border-border hover:bg-muted"
                  )}
                >
                  <Percent className="h-3 w-3" />
                  {rate === 0 ? "None" : `${rate * 100}%`}
                </button>
              ))}
            </div>

            <div className="space-y-1 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatCurrency(cart.subtotal())}</span>
              </div>
              {cart.discountRate > 0 && (
                <div className="flex justify-between text-success">
                  <span>Discount</span>
                  <span>-{formatCurrency(cart.discountAmount())}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-border pt-2 font-display text-lg font-bold">
                <span>Total</span>
                <span className="text-caramel-dark">{formatCurrency(cart.total())}</span>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-4 gap-2">
              {paymentMethods.map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    onClick={() => setPayment(m.id)}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-lg border py-2 text-[10px] font-medium transition-colors",
                      payment === m.id
                        ? "border-transparent bg-coffee-gradient text-cream"
                        : "border-border hover:bg-muted"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {m.label}
                  </button>
                );
              })}
            </div>

            <Button onClick={checkout} size="lg" className="mt-3 w-full">
              <Receipt className="h-4 w-4" />
              Charge {formatCurrency(cart.total())}
            </Button>
          </div>
        </div>
      </div>

      {/* Cup size selector */}
      <Dialog open={!!sizeTarget} onOpenChange={(o) => !o && setSizeTarget(null)}>
        <DialogContent className="max-w-sm">
          {sizeTarget && (
            <>
              <DialogHeader>
                <DialogTitle>Choose a size</DialogTitle>
                <DialogDescription>{sizeTarget.name}</DialogDescription>
              </DialogHeader>
              {(() => {
                const remaining = Math.max(
                  0,
                  stockOf(sizeTarget.id) - cart.qtyForProduct(sizeTarget.id)
                );
                return (
                  <>
                    <p className="text-xs text-muted-foreground">
                      {remaining} available in stock
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {cupSizes.map((sz) => (
                        <button
                          key={sz.id}
                          disabled={remaining <= 0}
                          onClick={() => {
                            if (addToCart(sizeTarget, sz.name, sz.priceDelta)) {
                              setSizeTarget(null);
                            }
                          }}
                          className="flex items-center justify-between rounded-lg border border-border p-3 text-left transition-colors hover:border-caramel hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <span className="text-sm font-medium">{sz.name}</span>
                          <span className="text-sm font-semibold text-caramel-dark">
                            {formatCurrency(sizeTarget.price + sz.priceDelta)}
                          </span>
                        </button>
                      ))}
                    </div>
                  </>
                );
              })()}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Receipt */}
      <Dialog open={!!receipt} onOpenChange={(o) => !o && setReceipt(null)}>
        <DialogContent>
          {receipt && (
            <>
              <div className="flex flex-col items-center text-center">
                <motion.span
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-success/15 text-success"
                >
                  <CheckCircle2 className="h-8 w-8" />
                </motion.span>
                <DialogHeader className="mt-3 items-center">
                  <DialogTitle>Payment Successful</DialogTitle>
                  <DialogDescription>
                    Order {receipt.number} · {receipt.payment}
                  </DialogDescription>
                </DialogHeader>
              </div>

              <div className="mt-2 rounded-xl border border-dashed border-border bg-background/40 p-4">
                <div className="space-y-2">
                  {receipt.lines.map((l) => (
                    <div key={l.key} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <span>{l.product.emoji}</span>
                        <span className="text-muted-foreground">
                          {l.quantity}× {l.product.name} ({l.size})
                        </span>
                      </span>
                      <span>{formatCurrency(l.unitPrice * l.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 space-y-1 border-t border-border pt-3 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>{formatCurrency(receipt.subtotal)}</span>
                  </div>
                  {receipt.discount > 0 && (
                    <div className="flex justify-between text-success">
                      <span>Discount</span>
                      <span>-{formatCurrency(receipt.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-border pt-2 font-display text-base font-bold">
                    <span>Total</span>
                    <span className="text-caramel-dark">{formatCurrency(receipt.total)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => toast.success("Sending to printer…", { icon: "🧾" })}
                >
                  <Printer className="h-4 w-4" /> Print
                </Button>
                <Button className="flex-1" onClick={() => setReceipt(null)}>
                  New Order
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
