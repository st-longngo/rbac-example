---
applyTo: "**/*.ts,**/*.tsx,**/*.js,**/*.jsx"
description: "Error handling patterns — auth errors, Server Action FormState, error boundaries"
---

# Error Handling Conventions

## Auth Errors (Next.js 16)

```ts
import { unauthorized, forbidden } from 'next/navigation'

// Unauthenticated → renders app/unauthorized.tsx → HTTP 401
if (!session) unauthorized()

// Insufficient permissions → renders app/forbidden.tsx → HTTP 403
if (!hasPermission(permissions, action, resource)) forbidden()
```

- Never use `redirect('/login')` for unauthenticated users
- Never use `redirect('/403')` for unauthorized users
- `unauthorized()` and `forbidden()` throw — code after them is unreachable

## Server Action Error Pattern

```ts
export async function someAction(prevState: FormState, formData: FormData): Promise<FormState> {
  // 1. Auth check — throws on failure (never caught)
  await requirePermission('CREATE', 'REPORTS')

  // 2. Validation — return field errors
  const parsed = SomeSchema.safeParse(...)
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  // 3. Business logic — catch DB errors, return general error
  try {
    await prisma.something.create(...)
  } catch (error) {
    return { errors: { general: ['An error occurred. Please try again.'] } }
  }

  // 4. Success
  revalidatePath('/some-path')
  return { message: 'Success' }
}
```

## FormState Type

```ts
type FormState = {
  errors?: { [field: string]: string[] }
  message?: string
} | undefined
```

## Error Boundaries

- `app/error.tsx` — global error boundary (must be `'use client'`)
- Route-level `error.tsx` files for specific sections
- Error boundaries receive `{ error, reset }` props

## Rules

- Auth errors (`unauthorized`, `forbidden`) are NEVER caught — they propagate to Next.js
- Validation errors are returned in `FormState`, not thrown
- Database/network errors are caught and returned as `{ errors: { general: [...] } }`
- Never expose stack traces or internal details in user-facing errors
- Log errors server-side with context, never log user credentials
