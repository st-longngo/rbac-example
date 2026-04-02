<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# RBAC Module — Agent Guide

## Project Overview

This is a **Next.js 16.2.2** application implementing an authentication and authorization system based on **RBAC (Role-Based Access Control)** with ABAC-lite (Role → Permission → Resource).

Full documentation lives in the `docs/` folder. Read the relevant doc before making changes:

| Doc | When to read |
|---|---|
| `docs/01-overview.md` | Architecture, tech stack, auth/authz flow |
| `docs/02-rbac-model.md` | Data model, enums, permission matrix |
| `docs/03-project-structure.md` | File layout, naming conventions |
| `docs/04-database-schema.md` | Prisma schema, seed data |
| `docs/05-auth-setup.md` | Auth.js v5 config, proxy.ts, next.config.ts |
| `docs/06-dal-and-rbac.md` | DAL pattern, verifySession, requirePermission |
| `docs/07-server-actions.md` | loginAction, registerAction, admin actions |
| `docs/08-ui-guide.md` | Pages, components, PermissionGate |
| `docs/09-setup-guide.md` | Setup steps, env vars, troubleshooting |
| `docs/10-conventions.md` | Coding rules, do/don't, PR checklist |
| `docs/11-testing.md` | Unit tests (Vitest), E2E tests (Playwright) |

---

## Critical Breaking Changes in Next.js 16

These changes WILL cause bugs if you follow your training data:

### 1. `middleware.ts` is DEPRECATED → use `proxy.ts`

```ts
// ❌ WRONG — middleware.ts with export middleware()
export function middleware(req) { ... }

// ✅ CORRECT — proxy.ts with export proxy()
export function proxy(req) { ... }
// or: export const proxy: NextProxy = (req) => { ... }
```

The file must be named `proxy.ts` at the project root. The exported function must be named `proxy`.

### 2. New `unauthorized()` and `forbidden()` from `next/navigation`

```ts
import { unauthorized, forbidden } from 'next/navigation'

// Renders app/unauthorized.tsx → HTTP 401
unauthorized()

// Renders app/forbidden.tsx → HTTP 403
forbidden()
```

Requires `experimental: { authInterrupts: true }` in `next.config.ts`.

### 3. New file conventions
- `app/unauthorized.tsx` — rendered on `unauthorized()` call
- `app/forbidden.tsx` — rendered on `forbidden()` call

---

## Architecture Rules (MUST follow)

### Auth check hierarchy

```
proxy.ts          → optimistic check only (reads session cookie, NO DB query)
Server Component  → verifySession() + requirePermission() via DAL
Server Action     → requirePermission() as FIRST line
Route Handler     → verifySession() + manual permission check
```

### The DAL is the ONLY source of truth for auth

All auth/authz checks go through `lib/dal.ts`. Never check cookies or session directly in components.

```ts
// ✅ CORRECT
import { verifySession, requirePermission, checkPermission } from '@/lib/dal'

// ❌ WRONG — never do this in components
import { auth } from '@/lib/auth'
const session = await auth()
if (session?.user?.roles?.includes('admin')) { ... }
```

### Server Actions security pattern

```ts
'use server'
export async function someAction(prevState: FormState, formData: FormData) {
  await requirePermission('ACTION', 'RESOURCE')  // ← ALWAYS first
  const parsed = SomeSchema.safeParse(...)       // ← then validate
  // ... logic
}
```

### Use `unauthorized()` / `forbidden()` — never manual redirect for auth errors

```ts
// ✅ CORRECT
if (!session) unauthorized()
if (!allowed) forbidden()

// ❌ WRONG
if (!session) redirect('/login')
if (!allowed) redirect('/403')
```

---

## Tech Stack Quick Reference

| Concern | Solution |
|---|---|
| Framework | Next.js 16.2.2 (App Router) |
| Auth | Auth.js v5 (`next-auth@beta`) with Credentials provider |
| ORM | Prisma + PostgreSQL |
| Session | Database strategy (stored in DB, supports revocation) |
| Validation | Zod |
| UI | shadcn/ui + Tailwind CSS v4 |
| Password | bcryptjs |
| Route guard | `proxy.ts` (NOT `middleware.ts`) |

## RBAC Model Quick Reference

- **Action enum**: `CREATE | READ | UPDATE | DELETE | MANAGE`
- **Resource enum**: `USERS | ROLES | REPORTS | ORDERS | SETTINGS | DASHBOARD`
- **`MANAGE`** action implies all other actions on the same resource
- **Roles**: `admin` (full), `manager` (reports/orders), `user` (basic), `guest` (read-only)
- User can have **multiple roles**; a role can have **multiple permissions**

## Key File Locations

```
proxy.ts                    — Route guard (replaces middleware.ts)
lib/auth.ts                 — Auth.js config
lib/dal.ts                  — Data Access Layer (server-only)
lib/rbac.ts                 — hasPermission() utility
lib/definitions.ts          — Zod schemas + TypeScript types
lib/prisma.ts               — Prisma client singleton
actions/auth.ts             — loginAction, registerAction, logoutAction
actions/admin.ts            — assignRoleAction, deleteUserAction, ...
prisma/schema.prisma        — Database schema
prisma/seed.ts              — Seed roles, permissions, admin user
app/unauthorized.tsx        — 401 page
app/forbidden.tsx           — 403 page
```
