import { Router } from "express";
import { eq, and } from "drizzle-orm";
import { db, reservationsTable, tablesTable } from "@workspace/db";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

function mapReservation(r: typeof reservationsTable.$inferSelect & { tableNumber?: string | null }) {
  return {
    id: r.id,
    customerName: r.customerName,
    customerPhone: r.customerPhone,
    customerEmail: r.customerEmail,
    date: r.date,
    time: r.time,
    guestCount: r.guestCount,
    tableId: r.tableId,
    tableNumber: r.tableNumber ?? null,
    status: r.status,
    notes: r.notes,
    depositAmount: r.depositAmount ? parseFloat(r.depositAmount) : null,
    branchId: r.branchId,
    createdAt: r.createdAt.toISOString(),
  };
}

router.get("/reservations", requireAuth, async (req, res): Promise<void> => {
  const branchId = req.query.branchId ? parseInt(req.query.branchId as string, 10) : undefined;
  const date = req.query.date as string | undefined;
  const status = req.query.status as string | undefined;

  const conditions = [];
  if (branchId) conditions.push(eq(reservationsTable.branchId, branchId));
  if (date) conditions.push(eq(reservationsTable.date, date));
  if (status) conditions.push(eq(reservationsTable.status, status));

  const rows = await db
    .select({
      id: reservationsTable.id,
      customerName: reservationsTable.customerName,
      customerPhone: reservationsTable.customerPhone,
      customerEmail: reservationsTable.customerEmail,
      date: reservationsTable.date,
      time: reservationsTable.time,
      guestCount: reservationsTable.guestCount,
      tableId: reservationsTable.tableId,
      tableNumber: tablesTable.number,
      status: reservationsTable.status,
      notes: reservationsTable.notes,
      depositAmount: reservationsTable.depositAmount,
      branchId: reservationsTable.branchId,
      createdAt: reservationsTable.createdAt,
    })
    .from(reservationsTable)
    .leftJoin(tablesTable, eq(reservationsTable.tableId, tablesTable.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(reservationsTable.date, reservationsTable.time);

  res.json(rows.map(mapReservation));
});

router.get("/reservations/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const [r] = await db.select().from(reservationsTable).where(eq(reservationsTable.id, id));
  if (!r) { res.status(404).json({ error: "Reservation not found" }); return; }
  res.json(mapReservation(r));
});

router.post("/reservations", requireAuth, async (req, res): Promise<void> => {
  const { customerName, customerPhone, customerEmail, date, time, guestCount, tableId, notes, depositAmount, branchId } = req.body;
  if (!customerName || !customerPhone || !date || !time || !guestCount || !branchId) {
    res.status(400).json({ error: "Required fields missing" });
    return;
  }
  const [r] = await db.insert(reservationsTable).values({
    customerName, customerPhone, customerEmail, date, time, guestCount, tableId, notes,
    depositAmount: depositAmount?.toString(), branchId,
  }).returning();
  res.status(201).json(mapReservation(r));
});

router.patch("/reservations/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const updates: Partial<typeof reservationsTable.$inferInsert> = {};
  const fields = ["customerName", "customerPhone", "customerEmail", "date", "time", "guestCount", "tableId", "status", "notes"] as const;
  for (const f of fields) {
    if (req.body[f] !== undefined) (updates as Record<string, unknown>)[f] = req.body[f];
  }
  if (req.body.depositAmount !== undefined) updates.depositAmount = req.body.depositAmount?.toString();
  const [r] = await db.update(reservationsTable).set(updates).where(eq(reservationsTable.id, id)).returning();
  if (!r) { res.status(404).json({ error: "Reservation not found" }); return; }
  res.json(mapReservation(r));
});

router.delete("/reservations/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  await db.delete(reservationsTable).where(eq(reservationsTable.id, id));
  res.sendStatus(204);
});

export default router;
