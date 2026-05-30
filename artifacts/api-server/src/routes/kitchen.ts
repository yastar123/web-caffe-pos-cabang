import { Router } from "express";
import { eq, and, inArray } from "drizzle-orm";
import { db, ordersTable, orderItemsTable, tablesTable, menuItemsTable } from "@workspace/db";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

router.get("/kitchen/queue", requireAuth, async (req, res): Promise<void> => {
  const branchId = req.query.branchId ? parseInt(req.query.branchId as string, 10) : undefined;
  const station = req.query.station as string | undefined;

  const conditions = [
    inArray(ordersTable.status, ["confirmed", "preparing", "ready"])
  ];
  if (branchId) conditions.push(eq(ordersTable.branchId, branchId));

  const orders = await db.select().from(ordersTable).where(and(...conditions)).orderBy(ordersTable.createdAt);

  const results = await Promise.all(orders.map(async (order) => {
    const itemConditions = [eq(orderItemsTable.orderId, order.id)];
    if (station) itemConditions.push(eq(orderItemsTable.station, station));

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
      .where(and(...itemConditions));

    const [table] = await db.select().from(tablesTable).where(eq(tablesTable.id, order.tableId));

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      tableNumber: table?.number ?? "",
      items: items.map((i) => ({
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
      })),
      createdAt: order.createdAt.toISOString(),
      priority: 0,
    };
  }));

  res.json(results);
});

router.patch("/kitchen/items/:itemId/status", requireAuth, async (req, res): Promise<void> => {
  const itemId = parseInt(Array.isArray(req.params.itemId) ? req.params.itemId[0] : req.params.itemId, 10);
  const { status } = req.body;
  if (!status) { res.status(400).json({ error: "status required" }); return; }
  const [item] = await db.update(orderItemsTable).set({ kitchenStatus: status }).where(eq(orderItemsTable.id, itemId)).returning();
  if (!item) { res.status(404).json({ error: "Item not found" }); return; }
  const menuItem = await db.select().from(menuItemsTable).where(eq(menuItemsTable.id, item.menuItemId));
  res.json({
    id: item.id,
    orderId: item.orderId,
    menuItemId: item.menuItemId,
    menuItemName: menuItem[0]?.name ?? "",
    menuItemImage: menuItem[0]?.imageUrl ?? null,
    quantity: item.quantity,
    unitPrice: parseFloat(item.unitPrice),
    totalPrice: parseFloat(item.totalPrice),
    notes: item.notes,
    kitchenStatus: item.kitchenStatus,
    station: item.station,
    createdAt: item.createdAt.toISOString(),
  });
});

export default router;
