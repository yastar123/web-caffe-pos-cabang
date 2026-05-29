---
name: API shape mismatches
description: Pages that used wrong field names against the generated API types; patterns to watch for
---

Always check `lib/api-zod/src/generated/api.ts` before writing frontend code that accesses API response fields.

**Known mismatches found and fixed:**

- `SalesSummary.dailyRevenue` does not exist → correct field is `periods` (array of `{date, revenue, orders}`)
- `SalesSummary.avgOrderValue` does not exist → correct field is `averageOrderValue`
- `SalesSummary.topItem` does not exist → use `topItems?.[0]?.menuItemName` from the separate `useGetTopMenuItems` query
- `GetCustomersParams.query` does not exist → correct field is `search`
- `CreateBranchBody` requires `address: string` and `phone: string` (not optional/undefined); `isActive` is NOT in CreateBranchBody (only UpdateBranchBody)
- `useGetBranches` and `getGetBranchesQueryKey` take **0** params (no params object); calling with `({}, {query:...})` is a type error
- `CreatePurchaseOrderBody.items[]` requires `ingredientName`, `unit`, `totalCost` in addition to `ingredientId`, `quantity`, `unitCost`

**Why:** The OpenAPI spec is the source of truth. Generated types are in `lib/api-zod/src/generated/api.ts`. Always verify field names there before using `summary?.someField`.

**How to apply:** When writing code that accesses API response fields, grep the zod schema file first. Run `pnpm --filter @workspace/pos-kafe run typecheck` after changes.
