import { create } from "zustand";
import type { Product } from "@/lib/types";

export interface CartLine {
  key: string;
  product: Product;
  quantity: number;
  size: string;
  unitPrice: number;
}

/** Result of a stock-checked cart mutation. */
export type StockResult =
  | { ok: true; available: number }
  | { ok: false; reason: "out_of_stock" | "max_reached"; available: number };

/** A product that had to be trimmed because live stock dropped below the cart qty. */
export interface StockConflict {
  productId: string;
  name: string;
  requested: number;
  available: number;
}

interface CartState {
  lines: CartLine[];
  discountRate: number;
  /** Total quantity of a given product across all sizes currently in the cart. */
  qtyForProduct: (productId: string) => number;
  addProduct: (
    product: Product,
    size: string,
    priceDelta: number,
    stock: number
  ) => StockResult;
  increment: (key: string, stock: number) => StockResult;
  decrement: (key: string) => void;
  remove: (key: string) => void;
  clear: () => void;
  setDiscount: (rate: number) => void;
  /**
   * Re-check the whole cart against a live stock map (productId → available).
   * Trims any line group that exceeds available stock and reports conflicts.
   */
  reconcileStock: (stockOf: (productId: string) => number) => StockConflict[];
  subtotal: () => number;
  discountAmount: () => number;
  total: () => number;
  count: () => number;
}

export const useCart = create<CartState>((set, get) => ({
  lines: [],
  discountRate: 0,

  qtyForProduct: (productId) =>
    get()
      .lines.filter((l) => l.product.id === productId)
      .reduce((s, l) => s + l.quantity, 0),

  addProduct: (product, size, priceDelta, stock) => {
    if (stock <= 0) return { ok: false, reason: "out_of_stock", available: 0 };

    const inCart = get().qtyForProduct(product.id);
    if (inCart >= stock) return { ok: false, reason: "max_reached", available: stock };

    const unitPrice = product.price + priceDelta;
    const key = `${product.id}-${size || "std"}`;
    set((state) => {
      const existing = state.lines.find((l) => l.key === key);
      if (existing) {
        return {
          lines: state.lines.map((l) =>
            l.key === key ? { ...l, quantity: l.quantity + 1 } : l
          ),
        };
      }
      return {
        lines: [
          ...state.lines,
          { key, product, quantity: 1, size: size || "Regular", unitPrice },
        ],
      };
    });
    return { ok: true, available: stock };
  },

  increment: (key, stock) => {
    const line = get().lines.find((l) => l.key === key);
    if (!line) return { ok: false, reason: "max_reached", available: stock };
    if (stock <= 0) return { ok: false, reason: "out_of_stock", available: 0 };

    const inCart = get().qtyForProduct(line.product.id);
    if (inCart >= stock) return { ok: false, reason: "max_reached", available: stock };

    set((state) => ({
      lines: state.lines.map((l) =>
        l.key === key ? { ...l, quantity: l.quantity + 1 } : l
      ),
    }));
    return { ok: true, available: stock };
  },

  decrement: (key) =>
    set((state) => ({
      lines: state.lines
        .map((l) => (l.key === key ? { ...l, quantity: l.quantity - 1 } : l))
        .filter((l) => l.quantity > 0),
    })),

  remove: (key) =>
    set((state) => ({ lines: state.lines.filter((l) => l.key !== key) })),

  clear: () => set({ lines: [], discountRate: 0 }),

  setDiscount: (rate) => set({ discountRate: rate }),

  reconcileStock: (stockOf) => {
    const conflicts: StockConflict[] = [];
    const state = get();

    // Group cart quantity by product across sizes.
    const byProduct = new Map<string, { name: string; requested: number }>();
    for (const l of state.lines) {
      const entry = byProduct.get(l.product.id) ?? {
        name: l.product.name,
        requested: 0,
      };
      entry.requested += l.quantity;
      byProduct.set(l.product.id, entry);
    }

    const overLimit = new Map<string, number>(); // productId → available
    for (const [productId, { name, requested }] of byProduct) {
      const available = stockOf(productId);
      if (requested > available) {
        conflicts.push({ productId, name, requested, available });
        overLimit.set(productId, available);
      }
    }
    if (conflicts.length === 0) return conflicts;

    // Trim lines for over-limit products down to the available amount,
    // distributing remaining stock across that product's size lines in order.
    const remaining = new Map(overLimit);
    const trimmed: CartLine[] = [];
    for (const l of state.lines) {
      if (!remaining.has(l.product.id)) {
        trimmed.push(l);
        continue;
      }
      const left = remaining.get(l.product.id)!;
      const give = Math.max(0, Math.min(l.quantity, left));
      remaining.set(l.product.id, left - give);
      if (give > 0) trimmed.push({ ...l, quantity: give });
    }
    set({ lines: trimmed });
    return conflicts;
  },

  subtotal: () => get().lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0),

  discountAmount: () => get().subtotal() * get().discountRate,

  total: () => get().subtotal() - get().discountAmount(),

  count: () => get().lines.reduce((s, l) => s + l.quantity, 0),
}));
