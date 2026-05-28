import { pgTable, serial, text, integer, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const customersTable = pgTable("customers", {
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

export const insertCustomerSchema = createInsertSchema(customersTable).omit({ id: true, createdAt: true });
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Customer = typeof customersTable.$inferSelect;
