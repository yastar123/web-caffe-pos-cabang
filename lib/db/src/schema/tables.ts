import { pgTable, serial, text, boolean, integer, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { branchesTable } from "./branches";

export const tablesTable = pgTable("tables", {
  id: serial("id").primaryKey(),
  number: text("number").notNull(),
  area: text("area").notNull().default("indoor"),
  capacity: integer("capacity").notNull().default(4),
  status: text("status").notNull().default("available"),
  branchId: integer("branch_id").notNull().references(() => branchesTable.id),
  xPos: numeric("x_pos", { precision: 8, scale: 2 }),
  yPos: numeric("y_pos", { precision: 8, scale: 2 }),
  currentOrderId: integer("current_order_id"),
  occupiedAt: timestamp("occupied_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTableSchema = createInsertSchema(tablesTable).omit({ id: true, createdAt: true });
export type InsertTable = z.infer<typeof insertTableSchema>;
export type Table = typeof tablesTable.$inferSelect;
