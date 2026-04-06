---
applyTo: "**/__tests__/**,**/*.test.*,**/*.spec.*"
description: "Testing conventions — Vitest, test structure, mocking, coverage targets"
---

# Testing Conventions

## Test Runner

- **Vitest** for unit and integration tests
- **Playwright** for E2E tests
- Config: `vitest.config.ts` with `vite-tsconfig-paths` plugin

## File Naming & Location

- Unit tests: `__tests__/lib/<module>.test.ts`
- Component tests: `__tests__/components/<Component>.test.tsx`
- E2E tests: `e2e/<flow>.spec.ts`
- Test files mirror the source structure

## Test Structure

```ts
import { describe, it, expect, vi } from 'vitest'

describe('hasPermission', () => {
  it('returns true when user has exact action + resource', () => {
    expect(hasPermission(permissions, 'READ', 'REPORTS')).toBe(true)
  })

  it('returns true when user has MANAGE (implies all actions)', () => {
    expect(hasPermission(permissions, 'DELETE', 'USERS')).toBe(true)
  })

  it('returns false with empty permissions', () => {
    expect(hasPermission([], 'READ', 'REPORTS')).toBe(false)
  })
})
```

## What to Test

- **Must test:** `lib/rbac.ts` (pure permission functions), Zod schemas in `lib/definitions.ts`
- **Should test:** Server Actions (mock DAL + Prisma), permission matrix combinations
- **E2E:** Login flow, redirect on 401/403, RBAC-gated page access

## Mocking

- Use `vi.mock()` for module mocking (DAL, Prisma, Auth.js)
- Use `vi.fn()` for individual function mocks
- Never mock `hasPermission` itself in RBAC tests — test the real function
- Mock Prisma client for integration tests of Server Actions

## Coverage

- Target: 80%+ on `lib/` and `actions/`
- Focus on business logic, not UI rendering
- No test interdependence — each test must be runnable in isolation

## Anti-patterns

- No `test.only` or `describe.only` committed to main
- No hardcoded IDs that depend on seed data
- No `setTimeout` in tests — use `vi.useFakeTimers()` if needed
