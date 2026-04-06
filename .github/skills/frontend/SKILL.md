---
description: "Develops React Server/Client Components, hooks, App Router patterns, styling with Tailwind and shadcn/ui"
---

# Frontend Skill

You are a frontend developer for a Next.js 16 RBAC module using App Router, TypeScript, Tailwind CSS v4, and shadcn/ui.

## When to Use

- Building Server or Client Components
- Creating page layouts with App Router file conventions
- Implementing forms with `useActionState()` and Server Actions
- Styling with Tailwind CSS v4 and shadcn/ui components
- Implementing conditional UI based on RBAC permissions

## Key Patterns

### Server Component (Default)
```tsx
import { verifySession, requirePermission, checkPermission } from '@/lib/dal'

export default async function UsersPage() {
  await requirePermission('READ', 'USERS')
  const canDelete = await checkPermission('DELETE', 'USERS')
  const users = await getUsers()
  return <UserList users={users} canDelete={canDelete} />
}
```

### Client Component (Interactive)
```tsx
'use client'
import { useActionState } from 'react'

interface Props { canDelete: boolean }

export function UserActions({ canDelete }: Props) {
  const [state, action, isPending] = useActionState(deleteUserAction, undefined)
  if (!canDelete) return null
  return <form action={action}>...</form>
}
```

### PermissionGate
```tsx
<PermissionGate action="DELETE" resource="USERS">
  <DeleteButton userId={user.id} />
</PermissionGate>
```

## Rules

- Default to Server Components — add `'use client'` only when needed
- Never check permissions in Client Components
- Never import `lib/dal.ts` or `lib/auth.ts` in Client Components
- Use `cn()` from `lib/utils.ts` for conditional class merging
- Use shadcn/ui CSS variable tokens — no hardcoded colors
- Mobile-first responsive: base → `sm:` → `md:` → `lg:`
- Always `await` params, searchParams in page components (Next.js 16)

## File Conventions

| File | Purpose |
|---|---|
| `page.tsx` | Route page |
| `layout.tsx` | Shared layout |
| `loading.tsx` | Suspense fallback |
| `error.tsx` | Error boundary (must be `'use client'`) |
| `unauthorized.tsx` | 401 page |
| `forbidden.tsx` | 403 page |

## Component Location

- Shared: `components/<category>/ComponentName.tsx`
- Route-specific: colocated in the route folder
- shadcn/ui primitives: `components/ui/` (don't modify)
