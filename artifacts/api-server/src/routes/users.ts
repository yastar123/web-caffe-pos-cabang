import { Router } from "express";
import { eq, and } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import { requireAuth } from "../middlewares/requireAuth";
import { hashPassword } from "../lib/auth";

const router = Router();

function mapUser(u: typeof usersTable.$inferSelect) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    branchId: u.branchId,
    isActive: u.isActive,
    avatarUrl: u.avatarUrl,
    createdAt: u.createdAt.toISOString(),
  };
}

router.get("/users", requireAuth, async (req, res): Promise<void> => {
  const branchId = req.query.branchId ? parseInt(req.query.branchId as string, 10) : undefined;
  const role = req.query.role as string | undefined;

  let query = db.select().from(usersTable);
  const conditions = [];
  if (branchId) conditions.push(eq(usersTable.branchId, branchId));
  if (role) conditions.push(eq(usersTable.role, role));

  const users = conditions.length
    ? await db.select().from(usersTable).where(and(...conditions))
    : await db.select().from(usersTable);

  res.json(users.map(mapUser));
});

router.get("/users/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id));
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  res.json(mapUser(user));
});

router.post("/users", requireAuth, async (req, res): Promise<void> => {
  const { name, email, password, role, branchId, avatarUrl } = req.body;
  if (!name || !email || !password || !role) {
    res.status(400).json({ error: "name, email, password, role required" });
    return;
  }
  const passwordHash = await hashPassword(password);
  const [user] = await db.insert(usersTable).values({
    name, email, passwordHash, role, branchId, avatarUrl,
  }).returning();
  res.status(201).json(mapUser(user));
});

router.patch("/users/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const { name, email, role, branchId, isActive, avatarUrl } = req.body;
  const updates: Partial<typeof usersTable.$inferInsert> = {};
  if (name != null) updates.name = name;
  if (email != null) updates.email = email;
  if (role != null) updates.role = role;
  if (branchId !== undefined) updates.branchId = branchId;
  if (isActive != null) updates.isActive = isActive;
  if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl;
  const [user] = await db.update(usersTable).set(updates).where(eq(usersTable.id, id)).returning();
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  res.json(mapUser(user));
});

router.delete("/users/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  await db.delete(usersTable).where(eq(usersTable.id, id));
  res.sendStatus(204);
});

export default router;
