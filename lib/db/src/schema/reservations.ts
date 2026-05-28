import { pgTable, serial, text, boolean, integer, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { branchesTable } from "./branches";
import { tablesTable } from "./tables";

export const reservationsTable = pgTable("reservations", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  customerEmail: text("customer_email"),
  date: text("date").notNull(),
  time: text("time").notNull(),
  guestCount: integer("guest_count").notNull(),
  tableId: integer("table_id").references(() => tablesTable.id),
  status: text("status").notNull().default("pending"),
  notes: text("notes"),
  depositAmount: numeric("deposit_amount", { precision: 12, scale: 2 }),
  branchId: integer("branch_id").notNull().references(() => branchesTable.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertReservationSchema = createInsertSchema(reservationsTable).omit({ id: true, createdAt: true });
export type InsertReservation = z.infer<typeof insertReservationSchema>;
export type Reservation = typeof reservationsTable.$inferSelect;
