import { Router } from "express";
import { eq, ilike, or } from "drizzle-orm";
import { db, customersTable } from "@workspace/db";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

function mapCustomer(c: typeof customersTable.$inferSelect) {
  return {
    id: c.id,
    name: c.name,
    phone: c.phone,
    email: c.email,
    loyaltyPoints: c.loyaltyPoints,
    totalSpend: parseFloat(c.totalSpend),
    visitCount: c.visitCount,
    membershipTier: c.membershipTier,
    birthdate: c.birthdate,
    notes: c.notes,
    createdAt: c.createdAt.toISOString(),
  };
}

router.get("/customers", requireAuth, async (req, res): Promise<void> => {
  const search = req.query.search as string | undefined;
  const customers = search
    ? await db.select().from(customersTable).where(
        or(ilike(customersTable.name, `%${search}%`), ilike(customersTable.phone, `%${search}%`))
      ).orderBy(customersTable.name)
    : await db.select().from(customersTable).orderBy(customersTable.name);
  res.json(customers.map(mapCustomer));
});

router.get("/customers/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const [c] = await db.select().from(customersTable).where(eq(customersTable.id, id));
  if (!c) { res.status(404).json({ error: "Customer not found" }); return; }
  res.json(mapCustomer(c));
});

router.post("/customers", requireAuth, async (req, res): Promise<void> => {
  const { name, phone, email, birthdate, notes } = req.body;
  if (!name || !phone) { res.status(400).json({ error: "name, phone required" }); return; }
  const [c] = await db.insert(customersTable).values({ name, phone, email, birthdate, notes }).returning();
  res.status(201).json(mapCustomer(c));
});

router.patch("/customers/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const updates: Partial<typeof customersTable.$inferInsert> = {};
  const { name, phone, email, birthdate, notes, loyaltyPoints } = req.body;
  if (name != null) updates.name = name;
  if (phone != null) updates.phone = phone;
  if (email !== undefined) updates.email = email;
  if (birthdate !== undefined) updates.birthdate = birthdate;
  if (notes !== undefined) updates.notes = notes;
  if (loyaltyPoints != null) updates.loyaltyPoints = loyaltyPoints;
  const [c] = await db.update(customersTable).set(updates).where(eq(customersTable.id, id)).returning();
  if (!c) { res.status(404).json({ error: "Customer not found" }); return; }
  res.json(mapCustomer(c));
});

export default router;
