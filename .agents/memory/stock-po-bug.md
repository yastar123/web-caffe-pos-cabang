---
name: Stock Purchase Order API contract
description: PurchaseOrderInput requires items[] array; totalAmount is not in the spec
---
## Rule
When creating a Purchase Order, the `PurchaseOrderInput` schema requires: `supplierName`, `branchId`, `items[]`. It does NOT have a `totalAmount` field (server computes it from items).

**Why:** The original form had a `totalAmount` UI field that was never saved (not in API spec) and was missing the required `items` array — meaning PO creation always failed validation.

**How to apply:** Submit with `items: []` for a draft PO header. Full item-level PO creation would need a dynamic multi-row form. The `totalAmount` shown in the PO list comes from the server response, not the creation payload.
