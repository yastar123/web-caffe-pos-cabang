# KopiFlow POS

A full-stack multi-branch cafe point-of-sale system with 7 modules, 12 pages, and 6 staff roles.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/pos-kafe run dev` — run the frontend (port 18775)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/scripts run seed` — reseed the database with demo data
- Required env: `DATABASE_URL`, `SESSION_SECRET`

## Demo Credentials

| Role      | Email                     | Password    |
|-----------|---------------------------|-------------|
| Owner     | owner@kopiflow.id         | password123 |
| Manager   | manager@kopiflow.id       | password123 |
| Cashier   | cashier@kopiflow.id       | password123 |
| Waiter    | waiter@kopiflow.id        | password123 |
| Chef      | chef@kopiflow.id          | password123 |
| Warehouse | warehouse@kopiflow.id     | password123 |

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + shadcn/ui (Tailwind), Recharts
- API: Express 5 + JWT auth
- DB: PostgreSQL (Supabase) + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (OpenAPI → React Query hooks + Zod schemas)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/db/src/schema/` — source-of-truth DB schema (9 files: branches, users, menu, tables, reservations, orders, payments, stock, customers)
- `lib/api-spec/openapi.yaml` — OpenAPI contract (do not change `info.title`)
- `lib/api-client-react/src/generated/api.ts` — generated React Query hooks
- `lib/api-zod/src/generated/api.ts` — generated Zod schemas (check field names here)
- `artifacts/api-server/src/routes/` — 14 Express route files
- `artifacts/pos-kafe/src/pages/` — 13 React pages
- `artifacts/pos-kafe/src/components/Layout.tsx` — sidebar nav + role-based menu
- `scripts/src/seed.ts` — database seed script

## Architecture decisions

- Contract-first: OpenAPI spec defines the API; Orval generates type-safe hooks and schemas. Always check `lib/api-zod/src/generated/api.ts` for exact field names before writing frontend code.
- JWT auth stored in localStorage; `useAuth()` hook in `artifacts/pos-kafe/src/lib/auth.tsx` wraps all auth state.
- `user.branchId` is `number | null` — always use `?? undefined` when passing to query params that expect `number | undefined`.
- DB lib must be rebuilt with `pnpm run typecheck:libs` after schema changes before the API server typecheck will pass.
- Seed script uses inline table definitions (not `@workspace/db`) due to workspace resolution issues with `tsx`.

## Product

- **POS (Point of Sale):** Split-panel order taking with menu grid, shopping cart, table assignment, and payment processing.
- **Tables:** Visual floor plan with real-time status (available/occupied/reserved/cleaning).
- **Kitchen Display:** Auto-refreshing kitchen queue with item-level status progression (new → processing → ready).
- **Reservations:** Date-filtered reservation management with guest details and table assignment.
- **Menu Management:** Category and item CRUD with image URLs, availability toggle, and prep time.
- **Stock/Inventory:** Ingredient tracking with low-stock alerts, stock movements, and purchase orders.
- **Reports & Analytics:** Revenue charts, top items, payment method breakdown, branch comparison (owner only).
- **Customers:** CRM with loyalty points, membership tier, visit count, and spend tracking.
- **Branches:** Multi-branch setup with status management (owner only).
- **Users/Staff:** Role-based staff management across branches.
- **Settings:** Branch configuration and personal profile management.

## Gotchas

- Do not change `info.title` in `lib/api-spec/openapi.yaml` — it controls generated filenames.
- `bcryptjs` has no catalog entry — `scripts/package.json` pins it directly as `"bcryptjs": "^3.0.0"`.
- The `GetUsersParams` type only has `branchId` and `role` (no `query`/search param). Client-side filtering is used in `users.tsx`.
- `KitchenOrder` uses `orderId` (not `id`) and `items[].kitchenStatus` (no top-level `status` field).
- `Customer` uses `membershipTier` (not `tier`).
- `TopMenuItem` uses `menuItemName` (not `name`); `BranchStat` uses `orders`/`revenue` (not `totalOrders`/`totalRevenue`).

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
