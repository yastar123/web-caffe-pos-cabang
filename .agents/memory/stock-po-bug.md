---
name: Stock Purchase Order API contract
description: PurchaseOrderInput requires non-empty items[] array; totalAmount is server-computed
---
## Rule
`PurchaseOrderInput` requires: `supplierName`, `branchId`, `items[]` (non-empty — server returns 400 if empty). It does NOT have a `totalAmount` field (server computes it from items). Each item needs: `ingredientId`, `ingredientName`, `quantity`, `unit`, `unitCost`, `totalCost`.

**Why:** The original form had no items UI and submitted `items: []`, which hit the server-side guard `!items?.length` and returned 400 — so PO creation always silently failed.

**How to apply:** The PO dialog now has a full line-item editor (ingredient select + qty + unit cost → adds row). Submit button is disabled until ≥1 item is added. `poItems` state tracks the array; `poTotal` is derived from it.
