---
mode: "agent"
description: "Generates unit tests covering happy path, edge cases, and error scenarios"
agent: "tester"
---

# Write Tests

You are the Tester agent. Generate comprehensive test suites for the specified file or module.

## Input

The user will provide:
- A file path or module name to test
- Optionally, specific functions or scenarios to focus on

## Procedure

1. **Read the source** — Understand every exported function, its inputs, outputs, and side effects
2. **Identify test categories:**
   - Happy path (valid inputs → expected outputs)
   - Edge cases (empty arrays, null, undefined, boundary values)
   - Validation failures (invalid Zod schema inputs)
   - Error conditions (DB failures, auth failures)
   - RBAC-specific (MANAGE implies all, cross-resource isolation, empty permissions)
3. **Write tests** — Use Vitest `describe`/`it` blocks with Arrange-Act-Assert
4. **Mock dependencies** — Use `vi.mock()` for DAL, Prisma, Auth.js

## Test File Convention

```
Source: lib/rbac.ts       → Test: __tests__/lib/rbac.test.ts
Source: actions/auth.ts   → Test: __tests__/actions/auth.test.ts
Source: lib/definitions.ts → Test: __tests__/lib/definitions.test.ts
```

## Output Format

Complete test file with:
- All imports (vitest, source module, types, mocks)
- `describe` block per function
- Nested `describe` for categories (happy path, edge cases, errors)
- Clear test names describing the scenario
- Arrange-Act-Assert pattern in each test

## Mocking Patterns

```ts
// Mock DAL
vi.mock('@/lib/dal', () => ({
  requirePermission: vi.fn(),
  verifySession: vi.fn().mockResolvedValue({
    userId: 'user-1', roles: ['admin'], permissions: []
  }),
}))

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: { findUnique: vi.fn(), create: vi.fn(), findMany: vi.fn() },
    role: { findUnique: vi.fn() },
    userRole: { create: vi.fn() },
  },
}))
```

## Constraints

- Tests must be deterministic — no randomness, no external dependencies
- No `test.only` or `describe.only`
- No test interdependence — each test must work in isolation
- Always test MANAGE permission edge case for RBAC
- Clear `beforeEach` with `vi.clearAllMocks()`
