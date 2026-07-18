import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  Product,
  Order,
  Customer,
  Employee,
  Stock,
  CupSize,
  AppSettings,
  OrderStatus,
  Role,
} from "./types";
import { seedSettings } from "./seed";

export interface ProductInput {
  name: string;
  sku: string;
  category: string;
  description: string;
  price: number;
  cost: number;
  stock: number;
  emoji: string;
  image: string;
  images: string[];
  hasSizes: boolean;
}

export interface StockInput {
  name: string;
  unit: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  purchaseCost: number;
  supplier: string;
  expirationDate: string;
}

export interface EmployeeInput {
  name: string;
  email: string;
  role: Role;
  phone: string;
}

interface StoreState {
  hasHydrated: boolean;
  setHydrated: (v: boolean) => void;

  products: Product[];
  orders: Order[];
  customers: Customer[];
  employees: Employee[];
  stocks: Stock[];
  cupSizes: CupSize[];
  settings: AppSettings;

  // Products
  addProduct: (input: ProductInput) => void;
  updateProduct: (id: string, input: ProductInput) => void;
  deleteProduct: (id: string) => void;
  duplicateProduct: (id: string) => void;

  // Orders
  placeOrder: (order: Order) => void;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  deleteOrder: (id: string) => void;

  // Stocks
  addStock: (input: StockInput) => void;
  updateStock: (id: string, input: StockInput) => void;
  deleteStock: (id: string) => void;

  // Customers
  addCustomer: (c: Omit<Customer, "id">) => void;
  updateCustomer: (id: string, patch: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;

  // Employees
  addEmployee: (input: EmployeeInput) => void;
  updateEmployee: (id: string, patch: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;

  // Cup sizes
  addCupSize: (name: string, priceDelta: number) => void;
  updateCupSize: (id: string, patch: Partial<CupSize>) => void;
  deleteCupSize: (id: string) => void;
  reorderCupSizes: (sizes: CupSize[]) => void;

  // Settings
  updateSettings: (patch: Partial<AppSettings>) => void;
  toggleNotification: (key: string) => void;

  // System
  resetData: () => void;
  importData: (data: Partial<StoreState>) => void;
}

const uid = (p: string) => `${p}${Date.now()}${Math.floor(Math.random() * 1000)}`;

function buildProduct(input: ProductInput, id: string): Product {
  return {
    id,
    name: input.name,
    sku: input.sku,
    category: input.category,
    description: input.description,
    price: input.price,
    cost: input.cost,
    image: input.image || "",
    images: input.images || [],
    emoji: input.emoji || "☕",
    status: "ACTIVE",
    featured: false,
    bestSeller: false,
    recommended: false,
    seasonal: false,
    stock: input.stock,
    lowStockAlert: 20,
    prepTime: 4,
    sold: 0,
    temperature: "BOTH",
    hasSizes: input.hasSizes,
  };
}

const EMPLOYEE_COLORS = [
  "#6F4E37",
  "#A47148",
  "#C4A484",
  "#8B5E3C",
  "#4B3621",
  "#B07D52",
  "#7B5233",
];

function buildEmployee(input: EmployeeInput, id: string): Employee {
  return {
    id,
    name: input.name,
    email: input.email,
    role: input.role,
    phone: input.phone,
    active: true,
    sales: 0,
    ordersHandled: 0,
    attendance: 100,
    avatarColor:
      EMPLOYEE_COLORS[Math.floor(Math.random() * EMPLOYEE_COLORS.length)],
  };
}

// A brand-new system starts completely empty — no products, orders, customers,
// employees, stocks, or cup sizes. The admin adds all data themselves.
// Only the business settings keep sensible defaults (editable in Settings).
function freshState() {
  return {
    products: [],
    orders: [],
    customers: [],
    employees: [],
    stocks: [],
    cupSizes: [],
    settings: seedSettings,
  };
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      hasHydrated: false,
      setHydrated: (v) => set({ hasHydrated: v }),

      ...freshState(),

      // ---------------- Products ----------------
      addProduct: (input) =>
        set((s) => ({ products: [buildProduct(input, uid("p")), ...s.products] })),

      updateProduct: (id, input) =>
        set((s) => ({
          products: s.products.map((p) =>
            p.id === id
              ? {
                  ...p,
                  name: input.name,
                  sku: input.sku,
                  category: input.category,
                  description: input.description,
                  price: input.price,
                  cost: input.cost,
                  stock: input.stock,
                  emoji: input.emoji || p.emoji,
                  image: input.image,
                  images: input.images,
                  hasSizes: input.hasSizes,
                }
              : p
          ),
        })),

      deleteProduct: (id) =>
        set((s) => ({ products: s.products.filter((p) => p.id !== id) })),

      duplicateProduct: (id) =>
        set((s) => {
          const orig = s.products.find((p) => p.id === id);
          if (!orig) return s;
          const copy: Product = {
            ...orig,
            id: uid("p"),
            name: `${orig.name} (Copy)`,
            sku: `${orig.sku}-C`,
            sold: 0,
          };
          const idx = s.products.findIndex((p) => p.id === id);
          const next = [...s.products];
          next.splice(idx + 1, 0, copy);
          return { products: next };
        }),

      // ---------------- Orders ----------------
      placeOrder: (order) =>
        set((s) => {
          // Decrement stock + increment sold for each product in the order.
          const products = s.products.map((p) => {
            const qty = order.items
              .filter((it) => it.productId === p.id)
              .reduce((sum, it) => sum + it.quantity, 0);
            if (qty === 0) return p;
            return {
              ...p,
              stock: Math.max(0, p.stock - qty),
              sold: p.sold + qty,
            };
          });

          // Update loyal customer stats when the order is attributed to one.
          const customers = s.customers.map((c) =>
            c.name === order.customer
              ? {
                  ...c,
                  lifetimeSpend: c.lifetimeSpend + order.total,
                  visitCount: c.visitCount + 1,
                  loyaltyPoints: c.loyaltyPoints + Math.round(order.total / 20),
                  lastVisit: order.createdAt,
                }
              : c
          );

          return { orders: [order, ...s.orders], products, customers };
        }),

      updateOrderStatus: (id, status) =>
        set((s) => ({
          orders: s.orders.map((o) => (o.id === id ? { ...o, status } : o)),
        })),

      deleteOrder: (id) =>
        set((s) => ({ orders: s.orders.filter((o) => o.id !== id) })),

      // ---------------- Stocks ----------------
      addStock: (input) =>
        set((s) => ({ stocks: [{ id: uid("i"), ...input }, ...s.stocks] })),

      updateStock: (id, input) =>
        set((s) => ({
          stocks: s.stocks.map((st) => (st.id === id ? { ...st, ...input } : st)),
        })),

      deleteStock: (id) =>
        set((s) => ({ stocks: s.stocks.filter((st) => st.id !== id) })),

      // ---------------- Customers ----------------
      addCustomer: (c) =>
        set((s) => ({ customers: [{ id: uid("c"), ...c }, ...s.customers] })),

      updateCustomer: (id, patch) =>
        set((s) => ({
          customers: s.customers.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        })),

      deleteCustomer: (id) =>
        set((s) => ({ customers: s.customers.filter((c) => c.id !== id) })),

      // ---------------- Employees ----------------
      addEmployee: (input) =>
        set((s) => ({ employees: [buildEmployee(input, uid("e")), ...s.employees] })),

      updateEmployee: (id, patch) =>
        set((s) => ({
          employees: s.employees.map((e) => (e.id === id ? { ...e, ...patch } : e)),
        })),

      deleteEmployee: (id) =>
        set((s) => ({ employees: s.employees.filter((e) => e.id !== id) })),

      // ---------------- Cup sizes ----------------
      addCupSize: (name, priceDelta) =>
        set((s) => ({
          cupSizes: [...s.cupSizes, { id: uid("sz"), name, priceDelta }],
        })),

      updateCupSize: (id, patch) =>
        set((s) => ({
          cupSizes: s.cupSizes.map((z) => (z.id === id ? { ...z, ...patch } : z)),
        })),

      deleteCupSize: (id) =>
        set((s) => ({ cupSizes: s.cupSizes.filter((z) => z.id !== id) })),

      reorderCupSizes: (sizes) => set({ cupSizes: sizes }),

      // ---------------- Settings ----------------
      updateSettings: (patch) =>
        set((s) => ({ settings: { ...s.settings, ...patch } })),

      toggleNotification: (key) =>
        set((s) => ({
          settings: {
            ...s.settings,
            notifications: {
              ...s.settings.notifications,
              [key]: !s.settings.notifications[key],
            },
          },
        })),

      // ---------------- System ----------------
      resetData: () => set({ ...freshState() }),

      importData: (data) => set({ ...(data as StoreState) }),
    }),
    {
      name: "june8-coffee-store-v2",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (s) => ({
        products: s.products,
        orders: s.orders,
        customers: s.customers,
        employees: s.employees,
        stocks: s.stocks,
        cupSizes: s.cupSizes,
        settings: s.settings,
      }),
      onRehydrateStorage: () => (state) => state?.setHydrated(true),
    }
  )
);
