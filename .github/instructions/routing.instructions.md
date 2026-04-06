---
applyTo: "**/app/**"
description: "App Router conventions — route groups, proxy.ts, auth pages, protected routes"
---

# Routing Conventions

## File Conventions

| File | Purpose |
|---|---|
| `page.tsx` | Route page component |
| `layout.tsx` | Shared layout wrapping child routes |
| `loading.tsx` | Suspense fallback during navigation |
| `error.tsx` | Error boundary (`'use client'`) |
| `not-found.tsx` | 404 page |
| `unauthorized.tsx` | 401 page (triggered by `unauthorized()`) |
| `forbidden.tsx` | 403 page (triggered by `forbidden()`) |

## Route Groups

- `(auth)` — public pages: `/login`, `/register`. No session required.
- `(protected)` — all authenticated pages. Layout calls `verifySession()`.
- `(admin)` — nested inside `(protected)`. Pages check `MANAGE` permission on resource.
- `(manager)` — nested inside `(protected)`. Pages check manager-level permissions.
- Route groups do NOT affect URL paths.

## proxy.ts (NOT middleware.ts)

- File: `proxy.ts` at project root
- Export: `export const proxy = auth(function proxy(req) { ... })`
- Optimistic check ONLY — reads session cookie, never queries DB
- Redirects unauthenticated users away from protected routes
- Redirects authenticated users away from `/login`, `/register`
- Never check permissions in proxy — that happens in DAL

```ts
// ❌ WRONG
export function middleware(req) { ... } // middleware.ts is deprecated

// ✅ CORRECT
export const proxy = auth(function proxy(req) { ... }) // proxy.ts
```

## Auth Flow in Routes

```ts
// In Server Components — use DAL
const session = await verifySession()        // throws unauthorized() if missing
await requirePermission('READ', 'USERS')     // throws forbidden() if denied

// ❌ NEVER do this
if (!session) redirect('/login')             // use unauthorized() instead
if (!allowed) redirect('/403')               // use forbidden() instead
```

## Dynamic Routes

- Use `[param]` syntax: `app/users/[id]/page.tsx`
- `params` is async in Next.js 16 — always `await` it:
  ```tsx
  export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
  }
  ```
