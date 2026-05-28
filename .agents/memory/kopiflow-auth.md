---
name: KopiFlow auth & roles
description: Authentication approach, roles, and demo credentials for KopiFlow POS.
---

## Auth approach
- Custom JWT-based auth with bcrypt password hashing
- JWT signed with `SESSION_SECRET` env var (already set as Replit secret)
- Token stored in localStorage; sent as `Authorization: Bearer <token>` header
- Do NOT replace with Replit Auth — the existing custom auth is intentional

## Roles (role-based nav & API guards)
- `owner` — full access to all features including branches, users, reports
- `manager` — most features except branch management
- `cashier` — POS, tables, reservations, customers
- `waiter` — POS, tables, kitchen, reservations
- `chef` — kitchen display only
- `warehouse` — stock/inventory only

## Demo accounts (password: `password123`)
- owner@kopiflow.id
- manager@kopiflow.id
- cashier@kopiflow.id
- waiter@kopiflow.id
- chef@kopiflow.id

**Why:** Custom auth predates the migration; role-based guards are deeply integrated into sidebar nav filtering and API middleware.
