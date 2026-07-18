import { PrismaClient, Role, ProductStatus, Temperature } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding The June 9th Coffee Co. database…");

  // ---- Users / Staff ----
  const passwordHash = await bcrypt.hash("coffee123", 10);
  const staff: { name: string; email: string; role: Role }[] = [
    { name: "Maria Villanueva", email: "maria@june9.co", role: "OWNER" },
    { name: "Maya Santos", email: "maya@june9.co", role: "MANAGER" },
    { name: "Leo Cruz", email: "leo@june9.co", role: "CASHIER" },
    { name: "Ivy Reyes", email: "ivy@june9.co", role: "BARISTA" },
    { name: "Kenji Lee", email: "kenji@june9.co", role: "KITCHEN" },
  ];

  for (const s of staff) {
    await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: { ...s, passwordHash, emailVerified: new Date() },
    });
  }

  // ---- Categories ----
  const categoryData = [
    { name: "Coffee", slug: "coffee", icon: "☕", color: "#5b3a21" },
    { name: "Tea", slug: "tea", icon: "🍵", color: "#4f8a5b" },
    { name: "Milk Tea", slug: "milk-tea", icon: "🧋", color: "#a9743d" },
    { name: "Non-Coffee", slug: "non-coffee", icon: "🥤", color: "#4a7ba6" },
    { name: "Pastries", slug: "pastries", icon: "🥐", color: "#d99a2b" },
    { name: "Desserts", slug: "desserts", icon: "🍰", color: "#c0553b" },
    { name: "Meals", slug: "meals", icon: "🥪", color: "#7a5230" },
    { name: "Seasonal", slug: "seasonal", icon: "🎃", color: "#c8955c" },
  ];

  const categories: Record<string, string> = {};
  for (const c of categoryData) {
    const cat = await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
    categories[c.name] = cat.id;
  }

  // ---- Products ----
  const productData = [
    { name: "Signature Espresso", sku: "COF-001", category: "Coffee", price: 130, cost: 42, temp: "HOT" as Temperature, best: true },
    { name: "Caramel Macchiato", sku: "COF-002", category: "Coffee", price: 175, cost: 58, temp: "BOTH" as Temperature, best: true },
    { name: "Spanish Latte", sku: "COF-003", category: "Coffee", price: 165, cost: 54, temp: "BOTH" as Temperature, best: true },
    { name: "Matcha Latte", sku: "TEA-001", category: "Tea", price: 185, cost: 62, temp: "BOTH" as Temperature, best: false },
    { name: "Wintermelon Milk Tea", sku: "MLK-001", category: "Milk Tea", price: 145, cost: 46, temp: "ICED" as Temperature, best: true },
    { name: "Butter Croissant", sku: "PST-001", category: "Pastries", price: 95, cost: 28, temp: "HOT" as Temperature, best: true },
    { name: "Basque Cheesecake", sku: "DST-001", category: "Desserts", price: 185, cost: 60, temp: "HOT" as Temperature, best: false },
    { name: "Pumpkin Spice Latte", sku: "SEA-001", category: "Seasonal", price: 195, cost: 64, temp: "BOTH" as Temperature, best: false },
  ];

  for (const p of productData) {
    await prisma.product.upsert({
      where: { sku: p.sku },
      update: {},
      create: {
        name: p.name,
        slug: p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        sku: p.sku,
        categoryId: categories[p.category],
        price: p.price,
        cost: p.cost,
        temperature: p.temp,
        bestSeller: p.best,
        status: ProductStatus.ACTIVE,
        stock: 120,
      },
    });
  }

  // ---- Settings ----
  const existing = await prisma.setting.findFirst();
  if (!existing) {
    await prisma.setting.create({
      data: {
        businessName: "The June 9th Coffee Co.",
        address: "9 Katipunan Ave, Quezon City, PH",
        phone: "+63 2 8123 4567",
        email: "hello@june9.coffee",
        taxRate: 12,
        currency: "PHP",
      },
    });
  }

  console.log("✅ Seed complete. Login: maria@june9.co / coffee123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
