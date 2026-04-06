---
applyTo: "**/*"
description: "Project context, tech stack, architecture, and module boundaries for the RBAC module"
---

# Project Context

## Tech Stack

- **Framework:** Next.js 16.2.2 (App Router) — NOT Next.js 15
- **Language:** TypeScript 5, strict mode enabled
- **Auth:** Auth.js v5 (`next-auth@beta`) with Credentials provider, database session strategy
- **ORM:** Prisma with PostgreSQL
- **Validation:** Zod (v4)
- **UI:** shadcn/ui + Tailwind CSS v4
- **Password hashing:** bcryptjs
- **Package manager:** pnpm
- **Runtime:** Node.js 20+

## Architecture — RBAC (Role-Based Access Control)

- Model: User → (many) Role → (many) Permission (action + resource)
- Actions enum: `CREATE | READ | UPDATE | DELETE | MANAGE`
- Resources enum: `USERS | ROLES | REPORTS | ORDERS | SETTINGS | DASHBOARD`
- `MANAGE` implies all other actions on the same resource

## Critical Next.js 16 Changes

- `middleware.ts` is DEPRECATED → use `proxy.ts` with `export function proxy()`
- `unauthorized()` and `forbidden()` from `next/navigation` render `app/unauthorized.tsx` (401) and `app/forbidden.tsx` (403)
- Requires `experimental: { authInterrupts: true }` in `next.config.ts`
- `cookies()`, `headers()`, `params`, `searchParams` are async — always `await` them

## Auth Check Hierarchy

```
proxy.ts          → optimistic only (reads cookie, NO DB query)
Server Component  → verifySession() + requirePermission() via DAL
Server Action     → requirePermission() as FIRST line
Route Handler     → verifySession() + manual permission check
```

## Module Boundaries

| Directory | Purpose | Server-only? |
|---|---|---|
| `lib/dal.ts` | Data Access Layer — single source of truth for auth | Yes |
| `lib/auth.ts` | Auth.js config | Yes |
| `lib/prisma.ts` | Prisma singleton | Yes |
| `lib/rbac.ts` | Pure permission functions | No |
| `lib/definitions.ts` | Zod schemas + types | No |
| `actions/` | Server Actions (`'use server'`) | Yes |
| `proxy.ts` | Route guard (replaces middleware) | Yes |
| `components/ui/` | shadcn/ui primitives | N/A |

## Folder Layout

```
app/(auth)/          — public auth pages (/login, /register)
app/(protected)/     — requires session (layout calls verifySession)
app/(protected)/(admin)/   — admin-only (/users, /roles)
app/(protected)/(manager)/ — manager+ (/reports, /orders)
actions/             — Server Actions
components/auth/     — auth form Client Components
components/rbac/     — PermissionGate, RoleBadge
components/layout/   — Header, SidebarNav
components/ui/       — shadcn/ui primitives
lib/                 — server utilities + shared types
prisma/              — schema + migrations + seed
```
