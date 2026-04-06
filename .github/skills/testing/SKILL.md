---
description: "Writes unit tests for functions, hooks, utilities, and services with proper mocking"
---

# Testing Skill

You are a test engineer for a Next.js 16 RBAC module using Vitest.

## When to Use

- Writing unit tests for pure functions (`lib/rbac.ts`)
- Writing tests for Zod schemas (`lib/definitions.ts`)
- Writing integration tests for Server Actions (with mocked deps)
- Verifying permission matrix correctness
- Testing edge cases and error conditions

## Test Stack

| Tool | Purpose |
|---|---|
| Vitest | Test runner + assertions |
| `vi.mock()` | Module mocking |
| `vi.fn()` | Function spies |
| `vite-tsconfig-paths` | Path alias resolution in tests |

## File Structure

```
__tests__/
  lib/
    rbac.test.ts
    definitions.test.ts
  actions/
    auth.test.ts
    admin.test.ts
e2e/
  auth.spec.ts
  rbac.spec.ts
```

## Test Patterns

### Pure Function Test (lib/rbac.ts)
```ts
import { describe, it, expect } from 'vitest'
import { hasPermission } from '@/lib/rbac'

describe('hasPermission', () => {
  const perms = [
    { action: 'READ' as const, resource: 'REPORTS' as const },
    { action: 'MANAGE' as const, resource: 'USERS' as const },
  ]

  it('exact match', () => expect(hasPermission(perms, 'READ', 'REPORTS')).toBe(true))
  it('MANAGE implies DELETE', () => expect(hasPermission(perms, 'DELETE', 'USERS')).toBe(true))
  it('cross-resource isolation', () => expect(hasPermission(perms, 'READ', 'ROLES')).toBe(false))
  it('empty permissions', () => expect(hasPermission([], 'READ', 'REPORTS')).toBe(false))
})
```

### Server Action Test (with mocks)
```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/dal', () => ({
  requirePermission: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  prisma: { user: { create: vi.fn(), findUnique: vi.fn() } },
}))

describe('createUserAction', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns validation errors for invalid input', async () => { ... })
  it('calls requirePermission before any logic', async () => { ... })
  it('creates user on valid input', async () => { ... })
})
```

### Zod Schema Test
```ts
describe('LoginFormSchema', () => {
  it('accepts valid email + password', () => {
    const result = LoginFormSchema.safeParse({ email: 'a@b.com', password: '12345678' })
    expect(result.success).toBe(true)
  })
  it('rejects short password', () => {
    const result = LoginFormSchema.safeParse({ email: 'a@b.com', password: '123' })
    expect(result.success).toBe(false)
  })
})
```

## Coverage Targets

- `lib/rbac.ts` — 100%
- `lib/definitions.ts` (Zod schemas) — 90%+
- `actions/` — 80%+

## Rules

- Arrange-Act-Assert pattern in every test
- `beforeEach` with `vi.clearAllMocks()`
- No `test.only` or `describe.only` in committed code
- No test interdependence
- No real database connections in unit tests
- Always test the MANAGE permission edge case
