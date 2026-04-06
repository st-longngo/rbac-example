---
applyTo: "**/*.ts,**/*.tsx,**/*.js,**/*.jsx"
description: "Code style — imports, naming, formatting conventions for the RBAC module"
---

# Code Style

## Import Order (strict)

```ts
// 1. React / Node built-ins
import { cache } from 'react'

// 2. Next.js
import { cookies } from 'next/headers'
import { redirect, unauthorized, forbidden } from 'next/navigation'

// 3. Third-party
import { z } from 'zod'
import bcrypt from 'bcryptjs'

// 4. Internal — lib/
import { prisma } from '@/lib/prisma'
import { hasPermission } from '@/lib/rbac'

// 5. Internal — components/
import { Button } from '@/components/ui/button'

// 6. Types (always last, with `type` keyword)
import type { Action, Resource } from '@prisma/client'
import type { SessionPayload } from '@/lib/definitions'
```

- Always use `@/` path alias — never relative paths that go up more than one level
- Use `import type` for type-only imports

## Naming Conventions

| Kind | Pattern | Example |
|---|---|---|
| Page file | `page.tsx` | `app/dashboard/page.tsx` |
| Client Component | PascalCase + `'use client'` | `LoginForm.tsx` |
| Server Action file | camelCase + `'use server'` | `actions/auth.ts` |
| Utility file | camelCase | `lib/dal.ts`, `lib/rbac.ts` |
| Route group | `(groupName)` | `(auth)`, `(protected)`, `(admin)` |
| React component | PascalCase | `PermissionGate` |
| Function | camelCase | `verifySession` |
| Constant | UPPER_SNAKE_CASE | `AUTH_SECRET` |
| Boolean variable | `is/has/can/should` prefix | `isLoggedIn`, `canDelete` |

## General Rules

- No `console.log` with user data in production code
- No hardcoded role names — use constants or Prisma enums
- Prefer `const` over `let`; never use `var`
- Use template literals over string concatenation
- Prefer early returns over nested conditionals
- Maximum one blank line between logical sections
- No barrel exports (`index.ts`) — import directly from source files
