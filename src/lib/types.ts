// Shared domain types for The June 8th Coffee Co.

export type Role = "OWNER" | "MANAGER" | "CASHIER" | "BARISTA" | "KITCHEN";

export type ProductStatus = "ACTIVE" | "DRAFT" | "ARCHIVED" | "OUT_OF_STOCK";

export type OrderStatus =
  | "PENDING"
  | "PREPARING"
  | "READY"
  | "COMPLETED"
  | "CANCELLED"
  | "REFUNDED";

export type OrderType = "DINE_IN" | "TAKEAWAY" | "DELIVERY";

export type PaymentMethod =
  | "CASH"
  | "GCASH"
  | "MAYA"
  | "CREDIT_CARD"
  | "DEBIT_CARD"
  | "SPLIT";

/** A globally-managed cup size that applies to sizeable products. */
export interface CupSize {
  id: string;
  name: string;
  priceDelta: number;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  description: string;
  price: number;
  cost: number;
  image: string; // data URL or remote URL, "" when none
  images: string[];
  emoji: string;
  status: ProductStatus;
  featured: boolean;
  bestSeller: boolean;
  recommended: boolean;
  seasonal: boolean;
  stock: number;
  lowStockAlert: number;
  prepTime: number;
  sold: number;
  temperature: "HOT" | "ICED" | "BOTH";
  hasSizes: boolean;
}

export interface OrderLine {
  productId: string;
  name: string;
  emoji: string;
  image?: string;
  quantity: number;
  unitPrice: number;
  size?: string;
}

export interface Order {
  id: string;
  number: string;
  status: OrderStatus;
  type: OrderType;
  customer: string;
  cashier: string;
  items: OrderLine[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  favoriteDrink: string;
  loyaltyPoints: number;
  lifetimeSpend: number;
  visitCount: number;
  vip: boolean;
  lastVisit: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone: string;
  active: boolean;
  sales: number;
  ordersHandled: number;
  attendance: number;
  avatarColor: string;
}

/** Inventory stock item (formerly "ingredient"). */
export interface Stock {
  id: string;
  name: string;
  unit: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  purchaseCost: number;
  supplier: string;
  expirationDate: string;
}

export interface AppSettings {
  businessName: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  currency: string;
  salesGoal: number;
  accentColor: string;
  notifications: Record<string, boolean>;
}
