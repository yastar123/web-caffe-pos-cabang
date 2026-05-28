---
name: POS Tax Rate
description: POS page tax rate reads from branch.taxRate (stored as percentage, e.g. 10 = 10%) — must divide by 100 before using as a multiplier
---
## Rule
The DB column `tax_rate` stores the value as a percentage integer/decimal (e.g. `10` means 10%).
Always convert to a decimal multiplier when doing calculations in pos.tsx:

```ts
const TAX_RATE = branch?.taxRate != null ? Number(branch.taxRate) / 100 : 0.1;
```

**Why:** The API returns `parseFloat(b.taxRate)` which is a percentage (10), not a decimal (0.1). Using it directly as a multiplier in `subtotal * TAX_RATE` would produce 1000% tax. The display `Math.round(TAX_RATE * 100)%` is correct only after the division.

**How to apply:** Import `useGetBranch` + `getGetBranchQueryKey`, query branch by `branchId`, use the divided value as above. Never hardcode `0.1` directly.
