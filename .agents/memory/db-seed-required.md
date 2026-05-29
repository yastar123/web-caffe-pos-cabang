---
name: DB must be seeded on fresh environment
description: DB schema push does not seed data; login fails on a fresh env until seed is run
---

`pnpm --filter @workspace/db run push` applies the schema but does NOT insert any data. On a fresh environment (new Replit instance, reset DB, etc.) all login attempts will fail with a 500 DB query error because the `users` table is empty.

**Fix:** Run `pnpm --filter @workspace/scripts run seed` to populate demo data.

**Why:** The seed script is separate from the schema push. It lives in `scripts/src/seed.ts` and uses inline table definitions (not `@workspace/db`) due to workspace resolution issues with `tsx`.

**How to apply:** After any DB reset or environment clone, always run the seed script before testing login.
