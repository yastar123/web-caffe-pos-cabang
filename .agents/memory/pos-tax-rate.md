---
name: POS Tax Rate
description: POS page tax rate was hardcoded 0.1; now reads from branch.taxRate via useGetBranch
---
## Rule
Never hardcode tax rate in pos.tsx. Always derive from `branch?.taxRate ?? 0.1`.

**Why:** The Settings page lets managers configure per-branch tax rates. Hardcoding 0.1 ignores those settings entirely.

**How to apply:** Import `useGetBranch` + `getGetBranchQueryKey`, query branch by `branchId`, use `const TAX_RATE = branch?.taxRate ?? 0.1`. The percentage display in the UI is `Math.round(TAX_RATE * 100)%`.
