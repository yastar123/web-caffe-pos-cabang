---
name: Auth context refreshUser
description: refreshUser must be in AuthContextType; settings page depends on it
---

`settings.tsx` calls `refreshUser?.()` (from `useAuth()`) after updating the user profile so the sidebar name updates live.

`refreshUser` must be declared in `AuthContextType` and implemented in `AuthProvider`. Implementation: invalidate the `["me"]` query key in React Query.

**Why:** Without it, profile name edits succeed in the DB but the UI doesn't reflect them until a hard reload.

**How to apply:** Any time AuthContextType is regenerated or auth.tsx is rewritten, ensure `refreshUser: () => Promise<void>` is in the interface and calls `queryClient.invalidateQueries({ queryKey: ["me"] })`.
