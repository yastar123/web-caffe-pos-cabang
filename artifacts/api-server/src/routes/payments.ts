import { Router } from "express";
import { eq, and } from "drizzle-orm";
import {
  db,
  paymentsTable,
  ordersTable,
  tablesTable,
  usersTable,
} from "@workspace/db";
import { requireAuth, type AuthRequest } from "../middlewares/requireAuth";

const router = Router();

function mapPayment(
  p: typeof paymentsTable.$inferSelect & {
    orderNumber?: string | null;
    staffName?: string | null;
  },
) {
  return {
    id: p.id,
    orderId: p.orderId,
    orderNumber: p.orderNumber ?? null,
    amount: parseFloat(p.amount),
    method: p.method,
    status: p.status,
    change: p.change ? parseFloat(p.change) : null,
    referenceNumber: p.referenceNumber,
    branchId: p.branchId,
    staffId: p.staffId,
    staffName: p.staffName ?? null,
    createdAt: p.createdAt.toISOString(),
  };
}

router.get("/payments", requireAuth, async (req, res): Promise<void> => {
  const branchId = req.query.branchId
    ? parseInt(req.query.branchId as string, 10)
    : undefined;
  const conditions = branchId ? [eq(paymentsTable.branchId, branchId)] : [];

  const rows = await db
    .select({
      id: paymentsTable.id,
      orderId: paymentsTable.orderId,
      orderNumber: ordersTable.orderNumber,
      amount: paymentsTable.amount,
      method: paymentsTable.method,
      status: paymentsTable.status,
      change: paymentsTable.change,
      referenceNumber: paymentsTable.referenceNumber,
      branchId: paymentsTable.branchId,
      staffId: paymentsTable.staffId,
      staffName: usersTable.name,
      createdAt: paymentsTable.createdAt,
    })
    .from(paymentsTable)
    .leftJoin(ordersTable, eq(paymentsTable.orderId, ordersTable.id))
    .leftJoin(usersTable, eq(paymentsTable.staffId, usersTable.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(paymentsTable.createdAt);

  res.json(rows.map(mapPayment));
});

router.post(
  "/payments",
  requireAuth,
  async (req: AuthRequest, res): Promise<void> => {
    const { orderId, amount, method, cashReceived, referenceNumber, branchId } =
      req.body;
    if (!orderId || !amount || !method || !branchId) {
      res
        .status(400)
        .json({ error: "orderId, amount, method, branchId required" });
      return;
    }

    const change = cashReceived ? cashReceived - amount : null;

    const [payment] = await db
      .insert(paymentsTable)
      .values({
        orderId,
        amount: amount.toFixed(2),
        method,
        status: "completed",
        change: change != null ? change.toFixed(2) : null,
        referenceNumber,
        branchId,
        staffId: req.userId,
      })
      .returning();

    // Mark order completed
    await db
      .update(ordersTable)
      .set({ status: "completed", completedAt: new Date() })
      .where(eq(ordersTable.id, orderId));

    // Free table
    const [order] = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.id, orderId));
    if (order?.tableId != null) {
      await db
        .update(tablesTable)
        .set({ status: "available", currentOrderId: null, occupiedAt: null })
        .where(eq(tablesTable.id, order.tableId));
    }

    res.status(201).json(mapPayment(payment));
  },
);

router.post(
  "/payments/:id/refund",
  requireAuth,
  async (req, res): Promise<void> => {
    const id = parseInt(
      Array.isArray(req.params.id) ? req.params.id[0] : req.params.id,
      10,
    );
    const [payment] = await db
      .update(paymentsTable)
      .set({ status: "refunded" })
      .where(eq(paymentsTable.id, id))
      .returning();
    if (!payment) {
      res.status(404).json({ error: "Payment not found" });
      return;
    }
    res.json(mapPayment(payment));
  },
);

export default router;
