import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import bcrypt from "bcryptjs";
import {
  pgTable,
  serial,
  text,
  boolean,
  integer,
  numeric,
  timestamp,
} from "drizzle-orm/pg-core";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL not set");

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

// Inline table defs (mirrors lib/db/src/schema)
const branchesTable = pgTable("branches", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  logoUrl: text("logo_url"),
  taxRate: numeric("tax_rate", { precision: 5, scale: 2 }).notNull().default("10"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("cashier"),
  branchId: integer("branch_id"),
  isActive: boolean("is_active").notNull().default(true),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

const menuCategoriesTable = pgTable("menu_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  branchId: integer("branch_id").notNull(),
  iconUrl: text("icon_url"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

const menuItemsTable = pgTable("menu_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: numeric("price", { precision: 12, scale: 2 }).notNull(),
  imageUrl: text("image_url"),
  categoryId: integer("category_id").notNull(),
  branchId: integer("branch_id").notNull(),
  station: text("station"),
  preparationTime: integer("preparation_time"),
  isAvailable: boolean("is_available").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

const tablesTable = pgTable("tables", {
  id: serial("id").primaryKey(),
  number: text("number").notNull(),
  area: text("area").notNull().default("indoor"),
  capacity: integer("capacity").notNull().default(4),
  status: text("status").notNull().default("available"),
  branchId: integer("branch_id").notNull(),
  xPos: numeric("x_pos", { precision: 8, scale: 2 }),
  yPos: numeric("y_pos", { precision: 8, scale: 2 }),
  currentOrderId: integer("current_order_id"),
  occupiedAt: timestamp("occupied_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

const ingredientsTable = pgTable("ingredients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  unit: text("unit").notNull(),
  currentStock: numeric("current_stock", { precision: 12, scale: 3 }).notNull().default("0"),
  minStock: numeric("min_stock", { precision: 12, scale: 3 }).notNull().default("0"),
  costPerUnit: numeric("cost_per_unit", { precision: 12, scale: 2 }),
  branchId: integer("branch_id").notNull(),
  supplierId: integer("supplier_id"),
  supplierName: text("supplier_name"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

const customersTable = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull().unique(),
  email: text("email"),
  loyaltyPoints: integer("loyalty_points").notNull().default(0),
  totalSpend: numeric("total_spend", { precision: 12, scale: 2 }).notNull().default("0"),
  visitCount: integer("visit_count").notNull().default(0),
  membershipTier: text("membership_tier").default("bronze"),
  birthdate: text("birthdate"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

async function main() {
  console.log("Seeding database...");

  // Check if already seeded
  const existing = await db.select({ id: branchesTable.id }).from(branchesTable).limit(1);
  if (existing.length > 0) {
    console.log("Database already seeded, skipping.");
    return;
  }

  // Branches
  const [branch1, branch2] = await db.insert(branchesTable).values([
    { name: "KopiFlow Sudirman", address: "Jl. Jenderal Sudirman No. 45, Jakarta Pusat", phone: "021-5551001", email: "sudirman@kopiflow.id", taxRate: "10", isActive: true },
    { name: "KopiFlow Kemang", address: "Jl. Kemang Raya No. 12, Jakarta Selatan", phone: "021-5551002", email: "kemang@kopiflow.id", taxRate: "10", isActive: true },
  ]).returning();
  console.log(`Created branches: ${branch1.id}, ${branch2.id}`);

  // Users
  const hash = await bcrypt.hash("password123", 12);
  await db.insert(usersTable).values([
    { name: "Budi Santoso", email: "owner@kopiflow.id", passwordHash: hash, role: "owner", branchId: branch1.id },
    { name: "Sari Dewi", email: "manager@kopiflow.id", passwordHash: hash, role: "manager", branchId: branch1.id },
    { name: "Andi Pratama", email: "cashier@kopiflow.id", passwordHash: hash, role: "cashier", branchId: branch1.id },
    { name: "Rina Kurnia", email: "waiter@kopiflow.id", passwordHash: hash, role: "waiter", branchId: branch1.id },
    { name: "Dodi Permana", email: "chef@kopiflow.id", passwordHash: hash, role: "chef", branchId: branch1.id },
    { name: "Hendra Wijaya", email: "warehouse@kopiflow.id", passwordHash: hash, role: "warehouse", branchId: branch1.id },
    { name: "Tika Rahayu", email: "manager2@kopiflow.id", passwordHash: hash, role: "manager", branchId: branch2.id },
  ]);
  console.log("Created users");

  // Menu Categories — Branch 1
  const [catKopi, catTea, catFood, catDessert, catJuice] = await db.insert(menuCategoriesTable).values([
    { name: "Kopi", branchId: branch1.id, sortOrder: 1 },
    { name: "Teh & Lainnya", branchId: branch1.id, sortOrder: 2 },
    { name: "Makanan", branchId: branch1.id, sortOrder: 3 },
    { name: "Dessert", branchId: branch1.id, sortOrder: 4 },
    { name: "Jus & Minuman", branchId: branch1.id, sortOrder: 5 },
  ]).returning();

  // Menu Categories — Branch 2
  const [b2catKopi, b2catFood] = await db.insert(menuCategoriesTable).values([
    { name: "Kopi", branchId: branch2.id, sortOrder: 1 },
    { name: "Makanan", branchId: branch2.id, sortOrder: 2 },
  ]).returning();
  console.log("Created menu categories");

  // Menu Items — Branch 1
  await db.insert(menuItemsTable).values([
    { name: "Espresso", description: "Double shot of rich espresso", price: "25000", categoryId: catKopi.id, branchId: branch1.id, station: "bar", preparationTime: 3 },
    { name: "Americano", description: "Espresso with hot water", price: "28000", categoryId: catKopi.id, branchId: branch1.id, station: "bar", preparationTime: 4 },
    { name: "Cappuccino", description: "Espresso with steamed milk foam", price: "35000", categoryId: catKopi.id, branchId: branch1.id, station: "bar", preparationTime: 5 },
    { name: "Latte", description: "Espresso with steamed milk", price: "38000", categoryId: catKopi.id, branchId: branch1.id, station: "bar", preparationTime: 5 },
    { name: "V60 Pour Over", description: "Hand-brewed single origin", price: "45000", categoryId: catKopi.id, branchId: branch1.id, station: "bar", preparationTime: 8 },
    { name: "Cold Brew", description: "18-hour cold extracted coffee", price: "40000", categoryId: catKopi.id, branchId: branch1.id, station: "bar", preparationTime: 2 },
    { name: "Flat White", description: "Ristretto with velvety milk", price: "42000", categoryId: catKopi.id, branchId: branch1.id, station: "bar", preparationTime: 5 },
    { name: "Kopi Susu", description: "Indonesian milk coffee", price: "32000", categoryId: catKopi.id, branchId: branch1.id, station: "bar", preparationTime: 4 },
    { name: "Matcha Latte", description: "Ceremonial grade matcha", price: "42000", categoryId: catTea.id, branchId: branch1.id, station: "bar", preparationTime: 5 },
    { name: "Teh Tarik", description: "Malaysian pulled tea", price: "28000", categoryId: catTea.id, branchId: branch1.id, station: "bar", preparationTime: 4 },
    { name: "Chamomile Tea", description: "Calming herbal blend", price: "30000", categoryId: catTea.id, branchId: branch1.id, station: "bar", preparationTime: 3 },
    { name: "Nasi Goreng", description: "Indonesian fried rice with egg", price: "55000", categoryId: catFood.id, branchId: branch1.id, station: "kitchen", preparationTime: 12 },
    { name: "Mie Goreng", description: "Stir-fried noodles with chicken", price: "50000", categoryId: catFood.id, branchId: branch1.id, station: "kitchen", preparationTime: 10 },
    { name: "Croissant", description: "Butter croissant, baked fresh", price: "35000", categoryId: catFood.id, branchId: branch1.id, station: "kitchen", preparationTime: 5 },
    { name: "Avocado Toast", description: "Sourdough with smashed avo", price: "48000", categoryId: catFood.id, branchId: branch1.id, station: "kitchen", preparationTime: 8 },
    { name: "Club Sandwich", description: "Triple-decker chicken club", price: "65000", categoryId: catFood.id, branchId: branch1.id, station: "kitchen", preparationTime: 10 },
    { name: "Cheesecake", description: "New York style cheesecake", price: "45000", categoryId: catDessert.id, branchId: branch1.id, station: "kitchen", preparationTime: 3 },
    { name: "Tiramisu", description: "Classic Italian dessert", price: "48000", categoryId: catDessert.id, branchId: branch1.id, station: "kitchen", preparationTime: 3 },
    { name: "Waffles", description: "Belgian waffles with maple syrup", price: "55000", categoryId: catDessert.id, branchId: branch1.id, station: "kitchen", preparationTime: 10 },
    { name: "Jus Jeruk", description: "Freshly squeezed orange juice", price: "35000", categoryId: catJuice.id, branchId: branch1.id, station: "bar", preparationTime: 5 },
    { name: "Jus Alpukat", description: "Creamy avocado juice", price: "38000", categoryId: catJuice.id, branchId: branch1.id, station: "bar", preparationTime: 5 },
    { name: "Es Kelapa Muda", description: "Young coconut with ice", price: "32000", categoryId: catJuice.id, branchId: branch1.id, station: "bar", preparationTime: 3 },
  ]);

  // Branch 2 items
  await db.insert(menuItemsTable).values([
    { name: "Espresso", description: "Double shot", price: "25000", categoryId: b2catKopi.id, branchId: branch2.id, station: "bar", preparationTime: 3 },
    { name: "Latte", description: "Espresso with milk", price: "38000", categoryId: b2catKopi.id, branchId: branch2.id, station: "bar", preparationTime: 5 },
    { name: "Nasi Goreng", description: "Fried rice", price: "55000", categoryId: b2catFood.id, branchId: branch2.id, station: "kitchen", preparationTime: 12 },
  ]);
  console.log("Created menu items");

  // Tables — Branch 1
  const tableValues = [];
  for (let i = 1; i <= 8; i++) tableValues.push({ number: `A${i}`, area: "indoor", capacity: i <= 4 ? 2 : 4, branchId: branch1.id, status: "available" });
  for (let i = 1; i <= 6; i++) tableValues.push({ number: `B${i}`, area: "outdoor", capacity: 4, branchId: branch1.id, status: "available" });
  for (let i = 1; i <= 3; i++) tableValues.push({ number: `V${i}`, area: "vip", capacity: 8, branchId: branch1.id, status: "available" });
  // Branch 2
  for (let i = 1; i <= 6; i++) tableValues.push({ number: `T${i}`, area: "indoor", capacity: 4, branchId: branch2.id, status: "available" });
  await db.insert(tablesTable).values(tableValues);
  console.log("Created tables");

  // Ingredients
  await db.insert(ingredientsTable).values([
    { name: "Kopi Arabika", unit: "kg", currentStock: "15.5", minStock: "5", costPerUnit: "180000", branchId: branch1.id },
    { name: "Kopi Robusta", unit: "kg", currentStock: "8.2", minStock: "5", costPerUnit: "120000", branchId: branch1.id },
    { name: "Susu Full Cream", unit: "liter", currentStock: "12", minStock: "10", costPerUnit: "18000", branchId: branch1.id },
    { name: "Susu Oat", unit: "liter", currentStock: "3.5", minStock: "4", costPerUnit: "35000", branchId: branch1.id },
    { name: "Gula Pasir", unit: "kg", currentStock: "25", minStock: "10", costPerUnit: "15000", branchId: branch1.id },
    { name: "Tepung Terigu", unit: "kg", currentStock: "18", minStock: "8", costPerUnit: "12000", branchId: branch1.id },
    { name: "Telur Ayam", unit: "pcs", currentStock: "60", minStock: "30", costPerUnit: "2500", branchId: branch1.id },
    { name: "Mentega", unit: "kg", currentStock: "2", minStock: "3", costPerUnit: "55000", branchId: branch1.id },
    { name: "Matcha Powder", unit: "kg", currentStock: "0.8", minStock: "1", costPerUnit: "350000", branchId: branch1.id },
    { name: "Vanilla Syrup", unit: "liter", currentStock: "2.5", minStock: "2", costPerUnit: "85000", branchId: branch1.id },
    { name: "Coklat Bubuk", unit: "kg", currentStock: "3.2", minStock: "2", costPerUnit: "95000", branchId: branch1.id },
    { name: "Cream Cheese", unit: "kg", currentStock: "1.5", minStock: "2", costPerUnit: "125000", branchId: branch1.id },
  ]);
  console.log("Created ingredients");

  // Customers
  await db.insert(customersTable).values([
    { name: "Ahmad Fauzi", phone: "08111234567", email: "ahmad@email.com", loyaltyPoints: 1250, totalSpend: "2500000", visitCount: 18, membershipTier: "silver" },
    { name: "Dewi Lestari", phone: "08119876543", email: "dewi@email.com", loyaltyPoints: 3800, totalSpend: "7600000", visitCount: 45, membershipTier: "gold" },
    { name: "Eko Prasetyo", phone: "08122345678", email: "eko@email.com", loyaltyPoints: 650, totalSpend: "1300000", visitCount: 8, membershipTier: "bronze" },
    { name: "Fitri Handayani", phone: "08133456789", email: "fitri@email.com", loyaltyPoints: 9500, totalSpend: "19000000", visitCount: 120, membershipTier: "platinum" },
    { name: "Gunawan Saputra", phone: "08144567890", email: null, loyaltyPoints: 200, totalSpend: "400000", visitCount: 3, membershipTier: "bronze" },
    { name: "Hani Kusuma", phone: "08155678901", email: "hani@email.com", loyaltyPoints: 2100, totalSpend: "4200000", visitCount: 28, membershipTier: "silver" },
  ]);
  console.log("Created customers");

  console.log("\nSeed complete!");
  console.log("\n=== DEMO LOGIN CREDENTIALS ===");
  console.log("Owner:     owner@kopiflow.id     / password123");
  console.log("Manager:   manager@kopiflow.id   / password123");
  console.log("Cashier:   cashier@kopiflow.id   / password123");
  console.log("Waiter:    waiter@kopiflow.id    / password123");
  console.log("Chef:      chef@kopiflow.id      / password123");
  console.log("Warehouse: warehouse@kopiflow.id / password123");
}

main().catch(console.error).finally(() => pool.end());
