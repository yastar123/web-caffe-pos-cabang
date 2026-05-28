---
name: Switch/Checkbox isActive pattern
description: HTML checkboxes/Switch components do not submit a value when unchecked — must use === 'on' check
---
## Rule
When reading a Switch or checkbox value from FormData, always use `fd.get('fieldName') === 'on'`.

**Why:** An unchecked HTML checkbox submits nothing (`fd.get()` returns `null`). Boolean cast of null is false. Using `Boolean(fd.get(...))` would ALSO return false for an empty string — so the only safe pattern is explicit `=== 'on'`.

**How to apply:** Any `<Switch name="isActive" />` in a form → `isActive: fd.get('isActive') === 'on'` in the mutation payload.

Files where this was fixed: `users.tsx` (updateUser), `menu.tsx` (isAvailable already correct).
