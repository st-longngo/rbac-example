---
applyTo: "**/components/**"
description: "Component patterns — Server vs Client, composition, PermissionGate, props design"
---

# Component Conventions

## File Structure

```tsx
// 1. Directive ('use client' if needed)
'use client'

// 2. Imports
import { Button } from '@/components/ui/button'

// 3. Props interface
interface UserCardProps {
  name: string
  email: string
  canEdit: boolean
}

// 4. Component
export function UserCard({ name, email, canEdit }: UserCardProps) {
  return ( /* ... */ )
}
```

## Server vs Client Components

- **Default to Server Components** — they can fetch data, access DAL, call `requirePermission()`
- Add `'use client'` only when the component needs: hooks, event handlers, browser APIs, `useActionState`
- Never import `lib/dal.ts` or `lib/auth.ts` in Client Components
- Never check permissions in Client Components — pass boolean props from Server Components

```tsx
// ✅ Server Component computes permission, passes to Client
const canDelete = await checkPermission('DELETE', 'USERS')
<UserActions canDelete={canDelete} />

// ❌ Never check roles/permissions in Client Component
```

## PermissionGate Pattern

```tsx
// Server Component wrapper — hides children if user lacks permission
<PermissionGate action="DELETE" resource="USERS">
  <DeleteButton userId={user.id} />
</PermissionGate>
```

## Composition Rules

- Prefer composition over prop drilling — use `children` prop
- Keep components small — extract when a section has its own responsibility
- Colocate route-specific components inside the route folder
- Shared components go in `components/`
- shadcn/ui primitives live in `components/ui/` — do not modify them manually

## Form Components (Client)

- Use `useActionState()` hook with Server Action
- Display errors from `FormState.errors`
- Show loading state with `isPending`
- Never call `fetch()` — use Server Actions exclusively
