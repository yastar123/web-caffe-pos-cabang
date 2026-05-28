import { Router } from "express";
import { eq, and } from "drizzle-orm";
import { db, tablesTable } from "@workspace/db";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

function mapTable(t: typeof tablesTable.$inferSelect) {
  return {
    id: t.id,
    number: t.number,
    area: t.area,
    capacity: t.capacity,
    status: t.status,
    branchId: t.branchId,
    xPos: t.xPos ? parseFloat(t.xPos) : null,
    yPos: t.yPos ? parseFloat(t.yPos) : null,
    currentOrderId: t.currentOrderId,
    occupiedAt: t.occupiedAt?.toISOString() ?? null,
    createdAt: t.createdAt.toISOString(),
  };
}

router.get("/tables", requireAuth, async (req, res): Promise<void> => {
  const branchId = req.query.branchId ? parseInt(req.query.branchId as string, 10) : undefined;
  const area = req.query.area as string | undefined;
  const status = req.query.status as string | undefined;

  const conditions = [];
  if (branchId) conditions.push(eq(tablesTable.branchId, branchId));
  if (area) conditions.push(eq(tablesTable.area, area));
  if (status) conditions.push(eq(tablesTable.status, status));

  const tables = conditions.length
    ? await db.select().from(tablesTable).where(and(...conditions)).orderBy(tablesTable.number)
    : await db.select().from(tablesTable).orderBy(tablesTable.number);

  res.json(tables.map(mapTable));
});

router.post("/tables", requireAuth, async (req, res): Promise<void> => {
  const { number, area, capacity, branchId, xPos, yPos } = req.body;
  if (!number || !area || !capacity || !branchId) {
    res.status(400).json({ error: "number, area, capacity, branchId required" });
    return;
  }
  const [table] = await db.insert(tablesTable).values({
    number, area, capacity, branchId,
    xPos: xPos?.toString(), yPos: yPos?.toString(),
  }).returning();
  res.status(201).json(mapTable(table));
});

router.patch("/tables/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const { number, area, capacity, xPos, yPos } = req.body;
  const updates: Partial<typeof tablesTable.$inferInsert> = {};
  if (number != null) updates.number = number;
  if (area != null) updates.area = area;
  if (capacity != null) updates.capacity = capacity;
  if (xPos !== undefined) updates.xPos = xPos?.toString();
  if (yPos !== undefined) updates.yPos = yPos?.toString();
  const [table] = await db.update(tablesTable).set(updates).where(eq(tablesTable.id, id)).returning();
  if (!table) { res.status(404).json({ error: "Table not found" }); return; }
  res.json(mapTable(table));
});

router.delete("/tables/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  await db.delete(tablesTable).where(eq(tablesTable.id, id));
  res.sendStatus(204);
});

router.patch("/tables/:id/status", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const { status } = req.body;
  if (!status) { res.status(400).json({ error: "status required" }); return; }
  const updates: Partial<typeof tablesTable.$inferInsert> = { status };
  if (status === "occupied") updates.occupiedAt = new Date();
  else if (status === "available") { updates.occupiedAt = null; updates.currentOrderId = null; }
  const [table] = await db.update(tablesTable).set(updates).where(eq(tablesTable.id, id)).returning();
  if (!table) { res.status(404).json({ error: "Table not found" }); return; }
  res.json(mapTable(table));
});

export default router;
