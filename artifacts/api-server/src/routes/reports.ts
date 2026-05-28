import { Router } from "express";
import { eq, and, gte, lte, sql, desc } from "drizzle-orm";
import { db, ordersTable, orderItemsTable, menuItemsTable, paymentsTable, branchesTable, ingredientsTable } from "@workspace/db";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

router.get("/reports/sales-summary", requireAuth, async (req, res): Promise<void> => {
  const branchId = req.query.branchId ? parseInt(req.query.branchId as string, 10) : undefined;
  const startDate = req.query.startDate as string;
  const endDate = req.query.endDate as string;

  if (!startDate || !endDate) { res.status(400).json({ error: "startDate, endDate required" }); return; }

  const conditions = [
    eq(ordersTable.status, "completed"),
    gte(ordersTable.createdAt, new Date(startDate)),
    lte(ordersTable.createdAt, new Date(endDate + "T23:59:59")),
  ];
  if (branchId) conditions.push(eq(ordersTable.branchId, branchId));

  const orders = await db.select({
    total: ordersTable.total,
    createdAt: ordersTable.createdAt,
  }).from(ordersTable).where(and(...conditions));

  const totalRevenue = orders.reduce((sum, o) => sum + parseFloat(o.total), 0);
  const totalOrders = orders.length;
  const averageOrderValue = totalOrders ? totalRevenue / totalOrders : 0;

  // Group by date
  const byDate: Record<string, { revenue: number; orders: number }> = {};
  for (const o of orders) {
    const date = o.createdAt.toISOString().slice(0, 10);
    if (!byDate[date]) byDate[date] = { revenue: 0, orders: 0 };
    byDate[date].revenue += parseFloat(o.total);
    byDate[date].orders += 1;
  }

  const periods = Object.entries(byDate).map(([date, v]) => ({ date, revenue: v.revenue, orders: v.orders }));

  res.json({ totalRevenue, totalOrders, averageOrderValue, periods });
});

router.get("/reports/top-items", requireAuth, async (req, res): Promise<void> => {
  const branchId = req.query.branchId ? parseInt(req.query.branchId as string, 10) : undefined;
  const startDate = req.query.startDate as string;
  const endDate = req.query.endDate as string;
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

  if (!startDate || !endDate) { res.status(400).json({ error: "startDate, endDate required" }); return; }

  const conditions = [
    eq(ordersTable.status, "completed"),
    gte(ordersTable.createdAt, new Date(startDate)),
    lte(ordersTable.createdAt, new Date(endDate + "T23:59:59")),
  ];
  if (branchId) conditions.push(eq(ordersTable.branchId, branchId));

  const rows = await db
    .select({
      menuItemId: orderItemsTable.menuItemId,
      menuItemName: menuItemsTable.name,
      imageUrl: menuItemsTable.imageUrl,
      quantitySold: sql<number>`sum(${orderItemsTable.quantity})::int`,
      totalRevenue: sql<number>`sum(${orderItemsTable.totalPrice})::float`,
    })
    .from(orderItemsTable)
    .innerJoin(ordersTable, eq(orderItemsTable.orderId, ordersTable.id))
    .leftJoin(menuItemsTable, eq(orderItemsTable.menuItemId, menuItemsTable.id))
    .where(and(...conditions))
    .groupBy(orderItemsTable.menuItemId, menuItemsTable.name, menuItemsTable.imageUrl)
    .orderBy(desc(sql`sum(${orderItemsTable.quantity})`))
    .limit(limit);

  res.json(rows.map((r) => ({
    menuItemId: r.menuItemId,
    menuItemName: r.menuItemName ?? "",
    imageUrl: r.imageUrl ?? null,
    quantitySold: Number(r.quantitySold),
    totalRevenue: Number(r.totalRevenue),
  })));
});

router.get("/reports/branch-comparison", requireAuth, async (req, res): Promise<void> => {
  const startDate = req.query.startDate as string;
  const endDate = req.query.endDate as string;
  if (!startDate || !endDate) { res.status(400).json({ error: "startDate, endDate required" }); return; }

  const rows = await db
    .select({
      branchId: ordersTable.branchId,
      branchName: branchesTable.name,
      revenue: sql<number>`sum(${ordersTable.total})::float`,
      orders: sql<number>`count(*)::int`,
    })
    .from(ordersTable)
    .leftJoin(branchesTable, eq(ordersTable.branchId, branchesTable.id))
    .where(and(
      eq(ordersTable.status, "completed"),
      gte(ordersTable.createdAt, new Date(startDate)),
      lte(ordersTable.createdAt, new Date(endDate + "T23:59:59")),
    ))
    .groupBy(ordersTable.branchId, branchesTable.name);

  res.json(rows.map((r) => ({
    branchId: r.branchId,
    branchName: r.branchName ?? "",
    revenue: Number(r.revenue),
    orders: Number(r.orders),
    averageOrderValue: Number(r.orders) ? Number(r.revenue) / Number(r.orders) : 0,
  })));
});

router.get("/reports/payment-methods", requireAuth, async (req, res): Promise<void> => {
  const branchId = req.query.branchId ? parseInt(req.query.branchId as string, 10) : undefined;
  const startDate = req.query.startDate as string;
  const endDate = req.query.endDate as string;
  if (!startDate || !endDate) { res.status(400).json({ error: "startDate, endDate required" }); return; }

  const conditions = [
    gte(paymentsTable.createdAt, new Date(startDate)),
    lte(paymentsTable.createdAt, new Date(endDate + "T23:59:59")),
  ];
  if (branchId) conditions.push(eq(paymentsTable.branchId, branchId));

  const rows = await db
    .select({
      method: paymentsTable.method,
      count: sql<number>`count(*)::int`,
      amount: sql<number>`sum(${paymentsTable.amount})::float`,
    })
    .from(paymentsTable)
    .where(and(...conditions))
    .groupBy(paymentsTable.method);

  const total = rows.reduce((sum, r) => sum + Number(r.amount), 0);
  res.json(rows.map((r) => ({
    method: r.method,
    count: Number(r.count),
    amount: Number(r.amount),
    percentage: total ? (Number(r.amount) / total) * 100 : 0,
  })));
});

// DASHBOARD
router.get("/dashboard/overview", requireAuth, async (req, res): Promise<void> => {
  const branchId = req.query.branchId ? parseInt(req.query.branchId as string, 10) : undefined;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const orderConditions = [
    eq(ordersTable.status, "completed"),
    gte(ordersTable.createdAt, today),
    lte(ordersTable.createdAt, tomorrow),
  ];
  if (branchId) orderConditions.push(eq(ordersTable.branchId, branchId));

  const [todaySales] = await db.select({
    revenue: sql<number>`coalesce(sum(${ordersTable.total}), 0)::float`,
    orders: sql<number>`count(*)::int`,
  }).from(ordersTable).where(and(...orderConditions));

  const activeOrderConds = [
    sql`${ordersTable.status} IN ('pending', 'confirmed', 'preparing', 'ready')`,
  ];
  if (branchId) activeOrderConds.push(eq(ordersTable.branchId, branchId));

  const [activeOrders] = await db.select({
    count: sql<number>`count(*)::int`,
  }).from(ordersTable).where(and(...activeOrderConds));

  const lowStock = await db.select().from(ingredientsTable).where(
    branchId
      ? and(eq(ingredientsTable.branchId, branchId), sql`${ingredientsTable.currentStock} <= ${ingredientsTable.minStock}`)
      : sql`${ingredientsTable.currentStock} <= ${ingredientsTable.minStock}`
  );

  const pendingReservations = await db.execute(sql`SELECT count(*) as count FROM reservations WHERE status = 'pending'`);

  res.json({
    todayRevenue: Number(todaySales?.revenue ?? 0),
    todayOrders: Number(todaySales?.orders ?? 0),
    activeOrders: Number(activeOrders?.count ?? 0),
    activeTables: 0,
    totalTables: 0,
    pendingReservations: Number((pendingReservations.rows[0] as { count: string })?.count ?? 0),
    lowStockCount: lowStock.length,
    revenueChange: 0,
    ordersChange: 0,
  });
});

router.get("/dashboard/peak-hours", requireAuth, async (req, res): Promise<void> => {
  const branchId = req.query.branchId ? parseInt(req.query.branchId as string, 10) : undefined;

  const conditions = [eq(ordersTable.status, "completed")];
  if (branchId) conditions.push(eq(ordersTable.branchId, branchId));

  const rows = await db
    .select({
      hour: sql<number>`extract(hour from ${ordersTable.createdAt})::int`,
      orders: sql<number>`count(*)::int`,
      revenue: sql<number>`sum(${ordersTable.total})::float`,
    })
    .from(ordersTable)
    .where(and(...conditions))
    .groupBy(sql`extract(hour from ${ordersTable.createdAt})`);

  res.json(rows.map((r) => ({ hour: Number(r.hour), orders: Number(r.orders), revenue: Number(r.revenue) })));
});

router.get("/dashboard/low-stock", requireAuth, async (req, res): Promise<void> => {
  const branchId = req.query.branchId ? parseInt(req.query.branchId as string, 10) : undefined;

  const rows = branchId
    ? await db.select().from(ingredientsTable).where(
        and(eq(ingredientsTable.branchId, branchId), sql`${ingredientsTable.currentStock} <= ${ingredientsTable.minStock}`)
      )
    : await db.select().from(ingredientsTable).where(sql`${ingredientsTable.currentStock} <= ${ingredientsTable.minStock}`);

  res.json(rows.map((r) => ({
    ingredientId: r.id,
    ingredientName: r.name,
    currentStock: parseFloat(r.currentStock),
    minStock: parseFloat(r.minStock),
    unit: r.unit,
  })));
});

export default router;
