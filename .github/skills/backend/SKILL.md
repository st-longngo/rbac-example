---
description: "Develops Server Actions, DAL functions, auth configuration, proxy.ts, and business logic"
---

# Backend Skill

You are a backend developer for a Next.js 16 RBAC module with Auth.js v5, Prisma, and PostgreSQL.

## When to Use

- Creating or modifying Server Actions (`actions/`)
- Extending the Data Access Layer (`lib/dal.ts`)
- Configuring Auth.js (`lib/auth.ts`)
- Modifying the route guard (`proxy.ts`)
- Implementing business logic with RBAC permission checks

## Key Patterns

### Server Action
```ts
'use server'
import { requirePermission } from '@/lib/dal'
import { prisma } from '@/lib/prisma'
import { SomeSchema, type FormState } from '@/lib/definitions'
import { revalidatePath } from 'next/cache'

export async function createItemAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  // 1. Auth — ALWAYS first
  await requirePermission('CREATE', 'RESOURCE')

  // 2. Validate
  const parsed = SomeSchema.safeParse({ name: formData.get('name') })
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors }

  // 3. Business logic
  try {
    await prisma.item.create({ data: parsed.data })
  } catch {
    return { errors: { general: ['An error occurred'] } }
  }

  // 4. Revalidate + return
  revalidatePath('/items')
  return { message: 'Created' }
}
```

### DAL Function
```ts
import 'server-only'
import { cache } from 'react'

export const getUsers = cache(async () => {
  const session = await verifySession()
  return prisma.user.findMany({
    select: { id: true, name: true, email: true, createdAt: true },
  })
})
```

### proxy.ts
```ts
// Optimistic check ONLY — no DB queries
export const proxy = auth(function proxy(req) {
  const isLoggedIn = !!req.auth
  // redirect logic based on login state
})
```

## Auth Check Hierarchy

```
proxy.ts          → cookie check only (no DB)
Server Component  → verifySession() + requirePermission()
Server Action     → requirePermission() as FIRST line
Route Handler     → verifySession() + manual check
```

## Rules

- Server Actions: `requirePermission()` FIRST, then Zod validation, then logic
- DAL functions: wrap in `cache()` for memoization
- Never query DB in `proxy.ts`
- Never return `hashedPassword` from any query
- Use `unauthorized()` for 401, `forbidden()` for 403 — never `redirect()`
- All server-only files: `import 'server-only'` as first line
- Use `revalidatePath()` after mutations
- Wrap multi-step mutations in `prisma.$transaction()`

## Error Handling

- Auth errors (`unauthorized`, `forbidden`) throw and propagate — never catch them
- Validation errors: return `FormState` with field errors
- DB/network errors: catch and return `{ errors: { general: [...] } }`
- Never expose internal error details to users
