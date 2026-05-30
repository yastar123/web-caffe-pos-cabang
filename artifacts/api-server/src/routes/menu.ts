import { Router } from "express";
import { eq, and } from "drizzle-orm";
import { db, menuCategoriesTable, menuItemsTable } from "@workspace/db";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

function mapCategory(c: typeof menuCategoriesTable.$inferSelect) {
  return {
    id: c.id,
    name: c.name,
    branchId: c.branchId,
    iconUrl: c.iconUrl,
    sortOrder: c.sortOrder,
    isActive: c.isActive,
    createdAt: c.createdAt.toISOString(),
  };
}

function mapItem(i: typeof menuItemsTable.$inferSelect & { categoryName?: string | null }) {
  return {
    id: i.id,
    name: i.name,
    description: i.description,
    price: parseFloat(i.price),
    imageUrl: i.imageUrl,
    categoryId: i.categoryId,
    categoryName: i.categoryName ?? null,
    branchId: i.branchId,
    station: i.station,
    preparationTime: i.preparationTime,
    isAvailable: i.isAvailable,
    createdAt: i.createdAt.toISOString(),
  };
}

// CATEGORIES
router.get("/menu-categories", requireAuth, async (req, res): Promise<void> => {
  const branchId = req.query.branchId ? parseInt(req.query.branchId as string, 10) : undefined;
  const cats = branchId
    ? await db.select().from(menuCategoriesTable).where(eq(menuCategoriesTable.branchId, branchId)).orderBy(menuCategoriesTable.sortOrder)
    : await db.select().from(menuCategoriesTable).orderBy(menuCategoriesTable.sortOrder);
  res.json(cats.map(mapCategory));
});

router.post("/menu-categories", requireAuth, async (req, res): Promise<void> => {
  const { name, branchId, iconUrl, sortOrder } = req.body;
  if (!name || !branchId) { res.status(400).json({ error: "name, branchId required" }); return; }
  const [cat] = await db.insert(menuCategoriesTable).values({ name, branchId, iconUrl, sortOrder: sortOrder ?? 0 }).returning();
  res.status(201).json(mapCategory(cat));
});

router.patch("/menu-categories/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const { name, iconUrl, sortOrder, isActive } = req.body;
  const updates: Partial<typeof menuCategoriesTable.$inferInsert> = {};
  if (name != null) updates.name = name;
  if (iconUrl !== undefined) updates.iconUrl = iconUrl;
  if (sortOrder != null) updates.sortOrder = sortOrder;
  if (isActive != null) updates.isActive = isActive;
  const [cat] = await db.update(menuCategoriesTable).set(updates).where(eq(menuCategoriesTable.id, id)).returning();
  if (!cat) { res.status(404).json({ error: "Category not found" }); return; }
  res.json(mapCategory(cat));
});

router.delete("/menu-categories/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  try {
    await db.delete(menuCategoriesTable).where(eq(menuCategoriesTable.id, id));
    res.sendStatus(204);
  } catch (err: any) {
    if (err.code === '23503') {
      res.status(400).json({ error: "Tidak dapat menghapus kategori ini karena masih digunakan oleh produk menu." });
      return;
    }
    throw err;
  }
});

// ITEMS
router.get("/menu-items", requireAuth, async (req, res): Promise<void> => {
  const branchId = req.query.branchId ? parseInt(req.query.branchId as string, 10) : undefined;
  const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string, 10) : undefined;
  const available = req.query.available !== undefined ? req.query.available === "true" : undefined;

  const conditions = [];
  if (branchId) conditions.push(eq(menuItemsTable.branchId, branchId));
  if (categoryId) conditions.push(eq(menuItemsTable.categoryId, categoryId));
  if (available !== undefined) conditions.push(eq(menuItemsTable.isAvailable, available));

  const items = await db
    .select({
      id: menuItemsTable.id,
      name: menuItemsTable.name,
      description: menuItemsTable.description,
      price: menuItemsTable.price,
      imageUrl: menuItemsTable.imageUrl,
      categoryId: menuItemsTable.categoryId,
      categoryName: menuCategoriesTable.name,
      branchId: menuItemsTable.branchId,
      station: menuItemsTable.station,
      preparationTime: menuItemsTable.preparationTime,
      isAvailable: menuItemsTable.isAvailable,
      createdAt: menuItemsTable.createdAt,
    })
    .from(menuItemsTable)
    .leftJoin(menuCategoriesTable, eq(menuItemsTable.categoryId, menuCategoriesTable.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(menuItemsTable.name);

  res.json(items.map(mapItem));
});

router.get("/menu-items/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const [item] = await db.select().from(menuItemsTable).where(eq(menuItemsTable.id, id));
  if (!item) { res.status(404).json({ error: "Menu item not found" }); return; }
  res.json(mapItem(item));
});

router.post("/menu-items", requireAuth, async (req, res): Promise<void> => {
  const { name, description, price, imageUrl, categoryId, branchId, station, preparationTime } = req.body;
  if (!name || price == null || !categoryId || !branchId) {
    res.status(400).json({ error: "name, price, categoryId, branchId required" });
    return;
  }
  const [item] = await db.insert(menuItemsTable).values({
    name, description, price: price.toString(), imageUrl, categoryId, branchId, station, preparationTime,
  }).returning();
  res.status(201).json(mapItem(item));
});

router.patch("/menu-items/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const updates: Partial<typeof menuItemsTable.$inferInsert> = {};
  const { name, description, price, imageUrl, categoryId, station, preparationTime, isAvailable } = req.body;
  if (name != null) updates.name = name;
  if (description !== undefined) updates.description = description;
  if (price != null) updates.price = price.toString();
  if (imageUrl !== undefined) updates.imageUrl = imageUrl;
  if (categoryId != null) updates.categoryId = categoryId;
  if (station !== undefined) updates.station = station;
  if (preparationTime !== undefined) updates.preparationTime = preparationTime;
  if (isAvailable != null) updates.isAvailable = isAvailable;
  const [item] = await db.update(menuItemsTable).set(updates).where(eq(menuItemsTable.id, id)).returning();
  if (!item) { res.status(404).json({ error: "Menu item not found" }); return; }
  res.json(mapItem(item));
});

router.delete("/menu-items/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  try {
    await db.delete(menuItemsTable).where(eq(menuItemsTable.id, id));
    res.sendStatus(204);
  } catch (err: any) {
    if (err.code === '23503') {
      res.status(400).json({ error: "Tidak dapat menghapus menu ini karena sudah ada di dalam riwayat pesanan (Order)." });
      return;
    }
    throw err;
  }
});

export default router;
