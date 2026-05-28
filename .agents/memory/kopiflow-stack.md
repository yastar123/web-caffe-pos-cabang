---
name: KopiFlow POS stack & structure
description: Monorepo layout, ports, base path, workflows, and key tech choices for KopiFlow POS.
---

## Stack
- PNPM workspace monorepo with two packages: `@workspace/api-server` and `@workspace/pos-kafe`
- Backend: Express + Drizzle ORM + PostgreSQL (port 8080)
- Frontend: React 19 + Vite + Tailwind CSS 4 + Radix/shadcn UI + Wouter routing + TanStack Query (port 5000)
- Frontend base path: `/pos-kafe/` (set via `BASE_PATH` env var in Vite config)
- Auto-generated API client: `@workspace/api-client-react` (Orval/OpenAPI)

## Workflows
- "API Server": `PORT=8080 pnpm --filter @workspace/api-server run dev`
- "Frontend": `PORT=5000 BASE_PATH=/pos-kafe/ pnpm --filter @workspace/pos-kafe run dev`

## Theme
- Teal primary (#0d5c63), Warm Amber secondary, warm off-white background
- Inter font loaded via Google Fonts in index.html
- Dark mode: toggled via localStorage key `kopiflow-theme`, applied via `.dark` class on `<html>`

## Key files
- `artifacts/pos-kafe/src/index.css` — CSS variables, animations, utilities
- `artifacts/pos-kafe/src/components/Layout.tsx` — sidebar, mobile nav, POS-specific header
- `artifacts/pos-kafe/src/App.tsx` — routing, lazy loading, ProtectedRoute
- `artifacts/api-server/src/index.ts` — Express entry point

**Why:** The base path `/pos-kafe/` is required in Vite config because the preview proxy serves the frontend under that subpath. Changing it breaks all routes.
