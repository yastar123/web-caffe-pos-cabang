import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, branchesTable } from "@workspace/db";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

function mapBranch(b: typeof branchesTable.$inferSelect) {
  return {
    id: b.id,
    name: b.name,
    address: b.address,
    phone: b.phone,
    email: b.email,
    logoUrl: b.logoUrl,
    taxRate: parseFloat(b.taxRate ?? "10"),
    isActive: b.isActive,
    createdAt: b.createdAt.toISOString(),
  };
}

router.get("/branches", requireAuth, async (_req, res): Promise<void> => {
  const branches = await db.select().from(branchesTable).orderBy(branchesTable.name);
  res.json(branches.map(mapBranch));
});

router.get("/branches/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const [branch] = await db.select().from(branchesTable).where(eq(branchesTable.id, id));
  if (!branch) { res.status(404).json({ error: "Branch not found" }); return; }
  res.json(mapBranch(branch));
});

router.post("/branches", requireAuth, async (req, res): Promise<void> => {
  const { name, address, phone, email, logoUrl, taxRate } = req.body;
  if (!name || !address || !phone) {
    res.status(400).json({ error: "name, address, phone required" });
    return;
  }
  const [branch] = await db.insert(branchesTable).values({
    name, address, phone, email, logoUrl,
    taxRate: taxRate?.toString() ?? "10",
  }).returning();
  res.status(201).json(mapBranch(branch));
});

router.patch("/branches/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const { name, address, phone, email, logoUrl, taxRate, isActive } = req.body;
  const updates: Partial<typeof branchesTable.$inferInsert> = {};
  if (name != null) updates.name = name;
  if (address != null) updates.address = address;
  if (phone != null) updates.phone = phone;
  if (email !== undefined) updates.email = email;
  if (logoUrl !== undefined) updates.logoUrl = logoUrl;
  if (taxRate != null) updates.taxRate = taxRate.toString();
  if (isActive != null) updates.isActive = isActive;
  const [branch] = await db.update(branchesTable).set(updates).where(eq(branchesTable.id, id)).returning();
  if (!branch) { res.status(404).json({ error: "Branch not found" }); return; }
  res.json(mapBranch(branch));
});

router.delete("/branches/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  await db.delete(branchesTable).where(eq(branchesTable.id, id));
  res.sendStatus(204);
});

export default router;
