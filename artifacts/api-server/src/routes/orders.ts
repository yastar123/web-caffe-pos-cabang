import { Router } from "express";
import { eq, and } from "drizzle-orm";
import { db, ordersTable, orderItemsTable, menuItemsTable, tablesTable, usersTable } from "@workspace/db";
import { requireAuth, type AuthRequest } from "../middlewares/requireAuth";

const router = Router();

function mapOrderItem(i: typeof orderItemsTable.$inferSelect & { menuItemName?: string | null; menuItemImage?: string | null }) {
  return {
    id: i.id,
    orderId: i.orderId,
    menuItemId: i.menuItemId,
    menuItemName: i.menuItemName ?? "",
    menuItemImage: i.menuItemImage ?? null,
    quantity: i.quantity,
    unitPrice: parseFloat(i.unitPrice),
    totalPrice: parseFloat(i.totalPrice),
    notes: i.notes,
    kitchenStatus: i.kitchenStatus,
    station: i.station,
    createdAt: i.createdAt.toISOString(),
  };
}

async function getOrderWithItems(id: number) {
  const [order] = await db
    .select({
      id: ordersTable.id,
      orderNumber: ordersTable.orderNumber,
      tableId: ordersTable.tableId,
      tableNumber: tablesTable.number,
      customerId: ordersTable.customerId,
      status: ordersTable.status,
      branchId: ordersTable.branchId,
      subtotal: ordersTable.subtotal,
      discountAmount: ordersTable.discountAmount,
      tax: ordersTable.tax,
      total: ordersTable.total,
      notes: ordersTable.notes,
      staffId: ordersTable.staffId,
      staffName: usersTable.name,
      createdAt: ordersTable.createdAt,
      completedAt: ordersTable.completedAt,
    })
    .from(ordersTable)
    .leftJoin(tablesTable, eq(ordersTable.tableId, tablesTable.id))
    .leftJoin(usersTable, eq(ordersTable.staffId, usersTable.id))
    .where(eq(ordersTable.id, id));

  if (!order) return null;

  const items = await db
    .select({
      id: orderItemsTable.id,
      orderId: orderItemsTable.orderId,
      menuItemId: orderItemsTable.menuItemId,
      menuItemName: menuItemsTable.name,
      menuItemImage: menuItemsTable.imageUrl,
      quantity: orderItemsTable.quantity,
      unitPrice: orderItemsTable.unitPrice,
      totalPrice: orderItemsTable.totalPrice,
      notes: orderItemsTable.notes,
      kitchenStatus: orderItemsTable.kitchenStatus,
      station: orderItemsTable.station,
      createdAt: orderItemsTable.createdAt,
    })
    .from(orderItemsTable)
    .leftJoin(menuItemsTable, eq(orderItemsTable.menuItemId, menuItemsTable.id))
    .where(eq(orderItemsTable.orderId, id));

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    tableId: order.tableId,
    tableNumber: order.tableNumber ?? "",
    customerId: order.customerId,
    customerName: null,
    status: order.status,
    branchId: order.branchId,
    items: items.map(mapOrderItem),
    subtotal: parseFloat(order.subtotal),
    discountAmount: parseFloat(order.discountAmount),
    tax: parseFloat(order.tax),
    total: parseFloat(order.total),
    notes: order.notes,
    staffId: order.staffId,
    staffName: order.staffName ?? null,
    createdAt: order.createdAt.toISOString(),
    completedAt: order.completedAt?.toISOString() ?? null,
  };
}

function generateOrderNumber(): string {
  const now = new Date();
  return `ORD-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${Math.floor(Math.random() * 9000) + 1000}`;
}

router.get("/orders", requireAuth, async (req, res): Promise<void> => {
  const branchId = req.query.branchId ? parseInt(req.query.branchId as string, 10) : undefined;
  const status = req.query.status as string | undefined;
  const tableId = req.query.tableId ? parseInt(req.query.tableId as string, 10) : undefined;

  const conditions = [];
  if (branchId) conditions.push(eq(ordersTable.branchId, branchId));
  if (status) conditions.push(eq(ordersTable.status, status));
  if (tableId) conditions.push(eq(ordersTable.tableId, tableId));

  const orders = conditions.length
    ? await db.select().from(ordersTable).where(and(...conditions)).orderBy(ordersTable.createdAt)
    : await db.select().from(ordersTable).orderBy(ordersTable.createdAt);

  const results = await Promise.all(orders.map((o) => getOrderWithItems(o.id)));
  res.json(results.filter(Boolean));
});

router.get("/orders/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const order = await getOrderWithItems(id);
  if (!order) { res.status(404).json({ error: "Order not found" }); return; }
  res.json(order);
});

router.post("/orders", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const { tableId, branchId, customerId, items, notes, discountAmount } = req.body;
  if (!tableId || !branchId || !items?.length) {
    res.status(400).json({ error: "tableId, branchId, items required" });
    return;
  }

  // Fetch menu items for prices
  const menuIds: number[] = items.map((i: { menuItemId: number }) => i.menuItemId);
  const menuItemRows = await db.select().from(menuItemsTable).where(
    menuIds.length === 1
      ? eq(menuItemsTable.id, menuIds[0])
      : and(...menuIds.map((id: number) => eq(menuItemsTable.id, id)))
  );
  const priceMap: Record<number, number> = {};
  menuItemRows.forEach((m) => { priceMap[m.id] = parseFloat(m.price); });

  const taxRate = 0.10;

  let subtotal = 0;
  const orderItemData: Array<{ menuItemId: number; quantity: number; unitPrice: number; totalPrice: number; notes?: string; station?: string }> = [];

  for (const item of items as Array<{ menuItemId: number; quantity: number; notes?: string }>) {
    const unitPrice = priceMap[item.menuItemId] ?? 0;
    const totalPrice = unitPrice * item.quantity;
    subtotal += totalPrice;
    const menuItem = menuItemRows.find((m) => m.id === item.menuItemId);
    orderItemData.push({ menuItemId: item.menuItemId, quantity: item.quantity, unitPrice, totalPrice, notes: item.notes, station: menuItem?.station ?? undefined });
  }

  const discount = discountAmount ?? 0;
  const taxable = subtotal - discount;
  const tax = taxable * taxRate;
  const total = taxable + tax;

  const [order] = await db.insert(ordersTable).values({
    orderNumber: generateOrderNumber(),
    tableId, branchId, customerId, notes,
    status: "confirmed",
    subtotal: subtotal.toFixed(2),
    discountAmount: discount.toFixed(2),
    tax: tax.toFixed(2),
    total: total.toFixed(2),
    staffId: req.userId,
  }).returning();

  console.log("[ORDER CREATED] OrderNumber:", order.orderNumber, "status:", order.status, "branchId:", order.branchId);

  for (const item of orderItemData) {
    await db.insert(orderItemsTable).values({
      orderId: order.id,
      menuItemId: item.menuItemId,
      quantity: item.quantity,
      unitPrice: item.unitPrice.toFixed(2),
      totalPrice: item.totalPrice.toFixed(2),
      notes: item.notes,
      station: item.station,
    });
  }

  // Mark table as occupied
  await db.update(tablesTable).set({ status: "occupied", currentOrderId: order.id, occupiedAt: new Date() }).where(eq(tablesTable.id, tableId));

  const result = await getOrderWithItems(order.id);
  res.status(201).json(result);
});

router.patch("/orders/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const { status, notes, discountAmount } = req.body;
  const updates: Partial<typeof ordersTable.$inferInsert> = {};
  if (status != null) {
    updates.status = status;
    if (status === "completed" || status === "voided") updates.completedAt = new Date();
  }
  if (notes !== undefined) updates.notes = notes;
  if (discountAmount != null) updates.discountAmount = discountAmount.toFixed(2);
  const [order] = await db.update(ordersTable).set(updates).where(eq(ordersTable.id, id)).returning();
  if (!order) { res.status(404).json({ error: "Order not found" }); return; }
  const result = await getOrderWithItems(id);
  res.json(result);
});

router.post("/orders/:id/items", requireAuth, async (req, res): Promise<void> => {
  const orderId = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const { menuItemId, quantity, notes } = req.body;
  const [menuItem] = await db.select().from(menuItemsTable).where(eq(menuItemsTable.id, menuItemId));
  if (!menuItem) { res.status(404).json({ error: "Menu item not found" }); return; }
  const unitPrice = parseFloat(menuItem.price);
  const totalPrice = unitPrice * quantity;
  const [item] = await db.insert(orderItemsTable).values({
    orderId, menuItemId, quantity,
    unitPrice: unitPrice.toFixed(2),
    totalPrice: totalPrice.toFixed(2),
    notes, station: menuItem.station ?? undefined,
  }).returning();
  res.status(201).json(mapOrderItem({ ...item, menuItemName: menuItem.name, menuItemImage: menuItem.imageUrl }));
});

router.patch("/orders/:id/items/:itemId", requireAuth, async (req, res): Promise<void> => {
  const itemId = parseInt(Array.isArray(req.params.itemId) ? req.params.itemId[0] : req.params.itemId, 10);
  const { quantity, notes } = req.body;
  const [existing] = await db.select().from(orderItemsTable).where(eq(orderItemsTable.id, itemId));
  if (!existing) { res.status(404).json({ error: "Order item not found" }); return; }
  const updates: Partial<typeof orderItemsTable.$inferInsert> = {};
  if (quantity != null) {
    updates.quantity = quantity;
    updates.totalPrice = (parseFloat(existing.unitPrice) * quantity).toFixed(2);
  }
  if (notes !== undefined) updates.notes = notes;
  const [item] = await db.update(orderItemsTable).set(updates).where(eq(orderItemsTable.id, itemId)).returning();
  res.json(mapOrderItem(item));
});

router.delete("/orders/:id/items/:itemId", requireAuth, async (req, res): Promise<void> => {
  const itemId = parseInt(Array.isArray(req.params.itemId) ? req.params.itemId[0] : req.params.itemId, 10);
  await db.delete(orderItemsTable).where(eq(orderItemsTable.id, itemId));
  res.sendStatus(204);
});

router.post("/orders/:id/void", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const [order] = await db.update(ordersTable).set({ status: "voided", completedAt: new Date() }).where(eq(ordersTable.id, id)).returning();
  if (!order) { res.status(404).json({ error: "Order not found" }); return; }
  await db.update(tablesTable).set({ status: "available", currentOrderId: null, occupiedAt: null }).where(eq(tablesTable.id, order.tableId));
  const result = await getOrderWithItems(id);
  res.json(result);
});

export default router;
