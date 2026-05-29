import { Router } from "express";
import { eq, and, sql } from "drizzle-orm";
import { db, ingredientsTable, stockMovementsTable, purchaseOrdersTable, purchaseOrderItemsTable } from "@workspace/db";
import { requireAuth, type AuthRequest } from "../middlewares/requireAuth";

const router = Router();

function mapIngredient(i: typeof ingredientsTable.$inferSelect) {
  const current = parseFloat(i.currentStock);
  const min = parseFloat(i.minStock);
  return {
    id: i.id,
    name: i.name,
    unit: i.unit,
    currentStock: current,
    minStock: min,
    costPerUnit: i.costPerUnit ? parseFloat(i.costPerUnit) : null,
    imageUrl: i.imageUrl ?? null,
    branchId: i.branchId,
    supplierId: i.supplierId,
    supplierName: i.supplierName,
    isLow: current <= min,
    createdAt: i.createdAt.toISOString(),
  };
}

// INGREDIENTS
router.get("/ingredients", requireAuth, async (req, res): Promise<void> => {
  const branchId = req.query.branchId ? parseInt(req.query.branchId as string, 10) : undefined;
  const items = branchId
    ? await db.select().from(ingredientsTable).where(eq(ingredientsTable.branchId, branchId)).orderBy(ingredientsTable.name)
    : await db.select().from(ingredientsTable).orderBy(ingredientsTable.name);
  res.json(items.map(mapIngredient));
});

router.post("/ingredients", requireAuth, async (req, res): Promise<void> => {
  const { name, unit, currentStock, minStock, costPerUnit, imageUrl, branchId, supplierId } = req.body;
  if (!name || !unit || currentStock == null || minStock == null || !branchId) {
    res.status(400).json({ error: "name, unit, currentStock, minStock, branchId required" });
    return;
  }
  const [item] = await db.insert(ingredientsTable).values({
    name, unit,
    currentStock: currentStock.toString(),
    minStock: minStock.toString(),
    costPerUnit: costPerUnit?.toString(),
    imageUrl: imageUrl || null,
    branchId, supplierId,
  }).returning();
  res.status(201).json(mapIngredient(item));
});

router.patch("/ingredients/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const updates: Partial<typeof ingredientsTable.$inferInsert> = {};
  const { name, unit, currentStock, minStock, costPerUnit, imageUrl, supplierId } = req.body;
  if (name != null) updates.name = name;
  if (unit != null) updates.unit = unit;
  if (currentStock != null) updates.currentStock = currentStock.toString();
  if (minStock != null) updates.minStock = minStock.toString();
  if (costPerUnit !== undefined) updates.costPerUnit = costPerUnit?.toString();
  if (imageUrl !== undefined) updates.imageUrl = imageUrl || null;
  if (supplierId !== undefined) updates.supplierId = supplierId;
  const [item] = await db.update(ingredientsTable).set(updates).where(eq(ingredientsTable.id, id)).returning();
  if (!item) { res.status(404).json({ error: "Ingredient not found" }); return; }
  res.json(mapIngredient(item));
});

router.delete("/ingredients/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  await db.delete(ingredientsTable).where(eq(ingredientsTable.id, id));
  res.sendStatus(204);
});

// STOCK MOVEMENTS
router.get("/stock-movements", requireAuth, async (req, res): Promise<void> => {
  const branchId = req.query.branchId ? parseInt(req.query.branchId as string, 10) : undefined;
  const ingredientId = req.query.ingredientId ? parseInt(req.query.ingredientId as string, 10) : undefined;

  const conditions = [];
  if (branchId) conditions.push(eq(stockMovementsTable.branchId, branchId));
  if (ingredientId) conditions.push(eq(stockMovementsTable.ingredientId, ingredientId));

  const movements = conditions.length
    ? await db.select().from(stockMovementsTable).where(and(...conditions)).orderBy(stockMovementsTable.createdAt)
    : await db.select().from(stockMovementsTable).orderBy(stockMovementsTable.createdAt);

  const result = await Promise.all(movements.map(async (m) => {
    const [ing] = await db.select().from(ingredientsTable).where(eq(ingredientsTable.id, m.ingredientId));
    return {
      id: m.id,
      ingredientId: m.ingredientId,
      ingredientName: ing?.name ?? "",
      type: m.type,
      quantity: parseFloat(m.quantity),
      notes: m.notes,
      branchId: m.branchId,
      staffId: m.staffId,
      createdAt: m.createdAt.toISOString(),
    };
  }));

  res.json(result);
});

router.post("/stock-movements", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const { ingredientId, type, quantity, notes, branchId } = req.body;
  if (!ingredientId || !type || quantity == null || !branchId) {
    res.status(400).json({ error: "ingredientId, type, quantity, branchId required" });
    return;
  }
  const [m] = await db.insert(stockMovementsTable).values({
    ingredientId, type, quantity: quantity.toString(), notes, branchId, staffId: req.userId,
  }).returning();

  // Update ingredient stock
  const delta = type === "in" ? quantity : -quantity;
  await db.update(ingredientsTable).set({
    currentStock: sql`${ingredientsTable.currentStock} + ${delta}`,
  }).where(eq(ingredientsTable.id, ingredientId));

  const [ing] = await db.select().from(ingredientsTable).where(eq(ingredientsTable.id, ingredientId));
  res.status(201).json({
    id: m.id,
    ingredientId: m.ingredientId,
    ingredientName: ing?.name ?? "",
    type: m.type,
    quantity: parseFloat(m.quantity),
    notes: m.notes,
    branchId: m.branchId,
    staffId: m.staffId,
    createdAt: m.createdAt.toISOString(),
  });
});

// PURCHASE ORDERS
router.get("/purchase-orders", requireAuth, async (req, res): Promise<void> => {
  const branchId = req.query.branchId ? parseInt(req.query.branchId as string, 10) : undefined;
  const orders = branchId
    ? await db.select().from(purchaseOrdersTable).where(eq(purchaseOrdersTable.branchId, branchId)).orderBy(purchaseOrdersTable.createdAt)
    : await db.select().from(purchaseOrdersTable).orderBy(purchaseOrdersTable.createdAt);

  const results = await Promise.all(orders.map(async (po) => {
    const items = await db.select().from(purchaseOrderItemsTable).where(eq(purchaseOrderItemsTable.purchaseOrderId, po.id));
    return {
      id: po.id,
      supplierName: po.supplierName,
      supplierContact: po.supplierContact,
      status: po.status,
      branchId: po.branchId,
      items: items.map((i) => ({
        ingredientId: i.ingredientId,
        ingredientName: "",
        quantity: parseFloat(i.quantity),
        unit: "",
        unitCost: parseFloat(i.unitCost),
        totalCost: parseFloat(i.totalCost),
      })),
      totalAmount: parseFloat(po.totalAmount),
      notes: po.notes,
      expectedDelivery: po.expectedDelivery,
      createdAt: po.createdAt.toISOString(),
    };
  }));

  res.json(results);
});

router.post("/purchase-orders", requireAuth, async (req, res): Promise<void> => {
  const { supplierName, supplierContact, branchId, items, notes, expectedDelivery } = req.body;
  if (!supplierName || !branchId || !items?.length) {
    res.status(400).json({ error: "supplierName, branchId, items required" });
    return;
  }
  const totalAmount = (items as Array<{ totalCost: number }>).reduce((sum, i) => sum + i.totalCost, 0);
  const [po] = await db.insert(purchaseOrdersTable).values({
    supplierName, supplierContact, branchId, notes, expectedDelivery,
    totalAmount: totalAmount.toFixed(2),
  }).returning();

  for (const item of items as Array<{ ingredientId: number; quantity: number; unitCost: number; totalCost: number }>) {
    await db.insert(purchaseOrderItemsTable).values({
      purchaseOrderId: po.id,
      ingredientId: item.ingredientId,
      quantity: item.quantity.toString(),
      unitCost: item.unitCost.toFixed(2),
      totalCost: item.totalCost.toFixed(2),
    });
  }

  res.status(201).json({ id: po.id, supplierName: po.supplierName, status: po.status, branchId: po.branchId, items: [], totalAmount, notes: po.notes, expectedDelivery: po.expectedDelivery, createdAt: po.createdAt.toISOString() });
});

router.patch("/purchase-orders/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const { status, notes } = req.body;
  const updates: Partial<typeof purchaseOrdersTable.$inferInsert> = {};
  if (status != null) updates.status = status;
  if (notes !== undefined) updates.notes = notes;
  const [po] = await db.update(purchaseOrdersTable).set(updates).where(eq(purchaseOrdersTable.id, id)).returning();
  if (!po) { res.status(404).json({ error: "Purchase order not found" }); return; }
  res.json({ id: po.id, supplierName: po.supplierName, supplierContact: po.supplierContact, status: po.status, branchId: po.branchId, items: [], totalAmount: parseFloat(po.totalAmount), notes: po.notes, expectedDelivery: po.expectedDelivery, createdAt: po.createdAt.toISOString() });
});

export default router;
