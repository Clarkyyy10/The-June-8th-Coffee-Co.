import type {
  Product,
  Order,
  Customer,
  Employee,
  Stock,
  CupSize,
  AppSettings,
  OrderStatus,
  PaymentMethod,
  OrderType,
} from "./types";

export const seedCategories = [
  { name: "Coffee", emoji: "☕", color: "#5b3a21" },
  { name: "Tea", emoji: "🍵", color: "#4f8a5b" },
  { name: "Milk Tea", emoji: "🧋", color: "#a9743d" },
  { name: "Non-Coffee", emoji: "🥤", color: "#4a7ba6" },
  { name: "Pastries", emoji: "🥐", color: "#d99a2b" },
  { name: "Desserts", emoji: "🍰", color: "#c0553b" },
  { name: "Meals", emoji: "🥪", color: "#7a5230" },
  { name: "Seasonal", emoji: "🎃", color: "#c8955c" },
];

export const seedCupSizes: CupSize[] = [
  { id: "sz1", name: "Small", priceDelta: 0 },
  { id: "sz2", name: "Medium", priceDelta: 25 },
  { id: "sz3", name: "Large", priceDelta: 45 },
  { id: "sz4", name: "Extra Large", priceDelta: 70 },
];

export const seedSettings: AppSettings = {
  businessName: "The June 8th Coffee Co.",
  tagline: "Coffee Co.",
  phone: "+63 2 8123 4567",
  email: "hello@june8.coffee",
  address: "8 Katipunan Ave, Quezon City, PH",
  currency: "PHP",
  salesGoal: 60000,
  accentColor: "Caramel",
  notifications: {
    "Low Stock Alerts": true,
    "Large Sales": true,
    Refunds: true,
    "New Customers": false,
    "Daily Summary": true,
    "Weekly Summary": true,
    "Inventory Alerts": true,
    "System Updates": false,
  },
};

export const seedProducts: Product[] = [
  { id: "p1", name: "Signature Espresso", sku: "COF-001", category: "Coffee", description: "Rich double-shot espresso with a velvety crema.", price: 130, cost: 42, image: "", images: [], emoji: "☕", status: "ACTIVE", featured: true, bestSeller: true, recommended: false, seasonal: false, stock: 240, lowStockAlert: 30, prepTime: 3, sold: 1284, temperature: "HOT", hasSizes: true },
  { id: "p2", name: "Caramel Macchiato", sku: "COF-002", category: "Coffee", description: "Espresso, steamed milk, and house caramel drizzle.", price: 175, cost: 58, image: "", images: [], emoji: "🍮", status: "ACTIVE", featured: true, bestSeller: true, recommended: true, seasonal: false, stock: 180, lowStockAlert: 30, prepTime: 5, sold: 1042, temperature: "BOTH", hasSizes: true },
  { id: "p3", name: "Spanish Latte", sku: "COF-003", category: "Coffee", description: "Sweet condensed milk latte, smooth and creamy.", price: 165, cost: 54, image: "", images: [], emoji: "🥛", status: "ACTIVE", featured: false, bestSeller: true, recommended: true, seasonal: false, stock: 165, lowStockAlert: 30, prepTime: 4, sold: 968, temperature: "BOTH", hasSizes: true },
  { id: "p4", name: "Cold Brew", sku: "COF-004", category: "Coffee", description: "18-hour steeped, bold and refreshing.", price: 155, cost: 48, image: "", images: [], emoji: "🧊", status: "ACTIVE", featured: false, bestSeller: false, recommended: true, seasonal: false, stock: 90, lowStockAlert: 25, prepTime: 2, sold: 640, temperature: "ICED", hasSizes: true },
  { id: "p5", name: "Matcha Latte", sku: "TEA-001", category: "Tea", description: "Ceremonial grade matcha with creamy milk.", price: 185, cost: 62, image: "", images: [], emoji: "🍵", status: "ACTIVE", featured: true, bestSeller: false, recommended: true, seasonal: false, stock: 120, lowStockAlert: 20, prepTime: 4, sold: 712, temperature: "BOTH", hasSizes: true },
  { id: "p6", name: "Wintermelon Milk Tea", sku: "MLK-001", category: "Milk Tea", description: "Caramelized wintermelon with chewy pearls.", price: 145, cost: 46, image: "", images: [], emoji: "🧋", status: "ACTIVE", featured: false, bestSeller: true, recommended: false, seasonal: false, stock: 200, lowStockAlert: 30, prepTime: 5, sold: 890, temperature: "ICED", hasSizes: true },
  { id: "p7", name: "Strawberry Refresher", sku: "NCF-001", category: "Non-Coffee", description: "Fresh strawberry cooler with green tea.", price: 160, cost: 52, image: "", images: [], emoji: "🍓", status: "ACTIVE", featured: false, bestSeller: false, recommended: false, seasonal: false, stock: 24, lowStockAlert: 25, prepTime: 3, sold: 420, temperature: "ICED", hasSizes: true },
  { id: "p8", name: "Butter Croissant", sku: "PST-001", category: "Pastries", description: "Flaky, all-butter French croissant.", price: 95, cost: 28, image: "", images: [], emoji: "🥐", status: "ACTIVE", featured: false, bestSeller: true, recommended: false, seasonal: false, stock: 48, lowStockAlert: 15, prepTime: 1, sold: 1120, temperature: "HOT", hasSizes: false },
  { id: "p9", name: "Basque Cheesecake", sku: "DST-001", category: "Desserts", description: "Burnt-top creamy Basque cheesecake slice.", price: 185, cost: 60, image: "", images: [], emoji: "🍰", status: "ACTIVE", featured: true, bestSeller: false, recommended: true, seasonal: false, stock: 18, lowStockAlert: 12, prepTime: 1, sold: 560, temperature: "HOT", hasSizes: false },
  { id: "p10", name: "Truffle Grilled Cheese", sku: "MEL-001", category: "Meals", description: "Three-cheese blend with truffle oil.", price: 220, cost: 78, image: "", images: [], emoji: "🥪", status: "ACTIVE", featured: false, bestSeller: false, recommended: false, seasonal: false, stock: 30, lowStockAlert: 10, prepTime: 8, sold: 310, temperature: "HOT", hasSizes: false },
  { id: "p11", name: "Pumpkin Spice Latte", sku: "SEA-001", category: "Seasonal", description: "Autumn spices, espresso, and steamed milk.", price: 195, cost: 64, image: "", images: [], emoji: "🎃", status: "ACTIVE", featured: true, bestSeller: false, recommended: true, seasonal: true, stock: 75, lowStockAlert: 20, prepTime: 5, sold: 480, temperature: "BOTH", hasSizes: true },
  { id: "p12", name: "Dark Mocha", sku: "COF-005", category: "Coffee", description: "Rich dark chocolate meets bold espresso.", price: 170, cost: 56, image: "", images: [], emoji: "🍫", status: "ACTIVE", featured: false, bestSeller: false, recommended: false, seasonal: false, stock: 8, lowStockAlert: 20, prepTime: 4, sold: 388, temperature: "BOTH", hasSizes: true },
];

export const seedCustomers: Customer[] = [
  { id: "c1", name: "Ana Lim", email: "ana.lim@email.com", phone: "+63 917 123 4567", favoriteDrink: "Spanish Latte", loyaltyPoints: 1240, lifetimeSpend: 18450, visitCount: 87, vip: true, lastVisit: new Date(Date.now() - 3600e3 * 5).toISOString() },
  { id: "c2", name: "Marco Diaz", email: "marco.d@email.com", phone: "+63 918 234 5678", favoriteDrink: "Cold Brew", loyaltyPoints: 860, lifetimeSpend: 12300, visitCount: 61, vip: true, lastVisit: new Date(Date.now() - 3600e3 * 26).toISOString() },
  { id: "c3", name: "Sofia Tan", email: "sofia.tan@email.com", phone: "+63 919 345 6789", favoriteDrink: "Matcha Latte", loyaltyPoints: 540, lifetimeSpend: 7800, visitCount: 39, vip: false, lastVisit: new Date(Date.now() - 3600e3 * 50).toISOString() },
  { id: "c4", name: "Ben Ong", email: "ben.ong@email.com", phone: "+63 920 456 7890", favoriteDrink: "Caramel Macchiato", loyaltyPoints: 320, lifetimeSpend: 4600, visitCount: 24, vip: false, lastVisit: new Date(Date.now() - 3600e3 * 74).toISOString() },
  { id: "c5", name: "Grace Chua", email: "grace.c@email.com", phone: "+63 921 567 8901", favoriteDrink: "Wintermelon Milk Tea", loyaltyPoints: 1580, lifetimeSpend: 22100, visitCount: 102, vip: true, lastVisit: new Date(Date.now() - 3600e3 * 8).toISOString() },
  { id: "c6", name: "Rafael Reyes", email: "rafa.r@email.com", phone: "+63 922 678 9012", favoriteDrink: "Dark Mocha", loyaltyPoints: 210, lifetimeSpend: 3100, visitCount: 15, vip: false, lastVisit: new Date(Date.now() - 3600e3 * 120).toISOString() },
];

export const seedEmployees: Employee[] = [
  { id: "e1", name: "Maria Villanueva", email: "maria@june8.co", role: "OWNER", phone: "+63 917 000 0001", active: true, sales: 0, ordersHandled: 0, attendance: 100, avatarColor: "#5b3a21" },
  { id: "e2", name: "Maya Santos", email: "maya@june8.co", role: "MANAGER", phone: "+63 917 000 0002", active: true, sales: 184200, ordersHandled: 1240, attendance: 98, avatarColor: "#a9743d" },
  { id: "e3", name: "Leo Cruz", email: "leo@june8.co", role: "CASHIER", phone: "+63 917 000 0003", active: true, sales: 142600, ordersHandled: 980, attendance: 95, avatarColor: "#4f8a5b" },
  { id: "e4", name: "Ivy Reyes", email: "ivy@june8.co", role: "BARISTA", phone: "+63 917 000 0004", active: true, sales: 98400, ordersHandled: 760, attendance: 97, avatarColor: "#c8955c" },
  { id: "e5", name: "Kenji Lee", email: "kenji@june8.co", role: "KITCHEN", phone: "+63 917 000 0005", active: true, sales: 61200, ordersHandled: 420, attendance: 92, avatarColor: "#c0553b" },
];

export const seedStocks: Stock[] = [
  { id: "i1", name: "Arabica Coffee Beans", unit: "kg", currentStock: 18, minStock: 10, maxStock: 50, purchaseCost: 780, supplier: "Highland Roasters", expirationDate: "2026-09-01" },
  { id: "i2", name: "Fresh Milk", unit: "L", currentStock: 42, minStock: 30, maxStock: 120, purchaseCost: 92, supplier: "Dairy Fresh Co.", expirationDate: "2026-07-08" },
  { id: "i3", name: "Oat Milk", unit: "L", currentStock: 8, minStock: 15, maxStock: 60, purchaseCost: 145, supplier: "GreenLeaf", expirationDate: "2026-07-20" },
  { id: "i4", name: "Caramel Syrup", unit: "L", currentStock: 6, minStock: 5, maxStock: 24, purchaseCost: 320, supplier: "SweetWorks", expirationDate: "2026-12-01" },
  { id: "i5", name: "Matcha Powder", unit: "kg", currentStock: 2.4, minStock: 3, maxStock: 12, purchaseCost: 1850, supplier: "Kyoto Imports", expirationDate: "2026-10-15" },
  { id: "i6", name: "Paper Cups (16oz)", unit: "pcs", currentStock: 320, minStock: 500, maxStock: 3000, purchaseCost: 3.2, supplier: "EcoPack", expirationDate: "2028-01-01" },
  { id: "i7", name: "Chocolate Sauce", unit: "L", currentStock: 9, minStock: 5, maxStock: 24, purchaseCost: 285, supplier: "SweetWorks", expirationDate: "2026-11-10" },
  { id: "i8", name: "Tapioca Pearls", unit: "kg", currentStock: 14, minStock: 8, maxStock: 40, purchaseCost: 210, supplier: "BobaSupply", expirationDate: "2026-08-22" },
];

// ---- Generate a fresh week of orders (incl. today) so analytics have data ----
const cashiers = ["Maya Santos", "Leo Cruz", "Ivy Reyes", "Maria Villanueva"];
const custNames = ["Walk-in", "Ana Lim", "Marco Diaz", "Sofia Tan", "Grace Chua"];
const methods: PaymentMethod[] = ["CASH", "GCASH", "MAYA", "CREDIT_CARD"];
const types: OrderType[] = ["DINE_IN", "TAKEAWAY", "DELIVERY"];

function seededOrders(): Order[] {
  const orders: Order[] = [];
  let counter = 1000;
  // last 7 days, more orders on recent days
  for (let day = 6; day >= 0; day--) {
    const ordersToday = 8 + Math.round(Math.random() * 6) + (6 - day);
    for (let n = 0; n < ordersToday; n++) {
      counter++;
      const picks = seedProducts
        .slice((n * 2) % 8, ((n * 2) % 8) + 2)
        .filter(Boolean);
      const items = picks.map((p) => ({
        productId: p.id,
        name: p.name,
        emoji: p.emoji,
        image: p.image,
        quantity: (n % 2) + 1,
        unitPrice: p.price,
        size: p.hasSizes ? "Medium" : undefined,
      }));
      const subtotal = items.reduce((s, it) => s + it.unitPrice * it.quantity, 0);
      const discount = n % 5 === 0 ? Math.round(subtotal * 0.1) : 0;
      const total = subtotal - discount;
      const hoursAgo = day * 24 + Math.round(Math.random() * 12);
      const status: OrderStatus =
        day === 0 && n >= ordersToday - 3
          ? (["PENDING", "PREPARING", "READY"] as OrderStatus[])[n % 3]
          : "COMPLETED";
      orders.push({
        id: `o${counter}`,
        number: `#JN${counter}`,
        status,
        type: types[n % 3],
        customer: custNames[n % custNames.length],
        cashier: cashiers[n % cashiers.length],
        items,
        subtotal,
        discount,
        total,
        paymentMethod: methods[n % methods.length],
        createdAt: new Date(Date.now() - hoursAgo * 3600e3).toISOString(),
      });
    }
  }
  return orders.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export const seedOrders: Order[] = seededOrders();
