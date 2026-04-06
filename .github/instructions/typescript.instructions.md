---
applyTo: "**/*.ts,**/*.tsx"
description: "TypeScript conventions for the RBAC module — strict mode, type patterns, generics"
---

# TypeScript Conventions

## Strict Mode

- `strict: true` is enabled in `tsconfig.json` — never weaken it
- Never use `any` — use `unknown` and narrow with type guards
- Never use `@ts-ignore` — use `@ts-expect-error` with an explanation if absolutely necessary

## Type vs Interface

- Use `interface` for object shapes that may be extended (props, API responses)
- Use `type` for unions, intersections, aliases, and mapped types
- Use `type` for Zod inferred types: `type LoginInput = z.infer<typeof LoginFormSchema>`

## Naming

| Kind | Pattern | Example |
|---|---|---|
| Interface/Type | PascalCase | `SessionPayload`, `FormState` |
| Zod schema | PascalCase + Schema | `LoginFormSchema`, `AssignRoleSchema` |
| Prisma enum | PascalCase | `Action.MANAGE`, `Resource.USERS` |
| Generic param | Single uppercase letter or descriptive | `T`, `TData` |
| Function | camelCase | `verifySession()`, `hasPermission()` |
| Constant | UPPER_SNAKE_CASE | `AUTH_SECRET`, `DEFAULT_ROLE` |

## Generics

- Prefer descriptive generic names for complex types: `TData`, `TError`
- Constrain generics when possible: `<T extends Record<string, unknown>>`

## Enums vs Unions

- Use Prisma-generated enums for `Action` and `Resource` — do not duplicate
- For non-Prisma code, prefer union types over TypeScript enums:
  ```ts
  // ✅ union
  type Status = 'active' | 'inactive'
  // ❌ enum
  enum Status { Active, Inactive }
  ```

## Prisma Types

- Import Prisma types from `@prisma/client`
- Import project types from `@/lib/definitions`
- Use `type` keyword for type-only imports: `import type { Action } from '@prisma/client'`

## Assertions

- Prefer type narrowing over assertions: `if (value !== null)` over `value!`
- Never use non-null assertion (`!`) in auth-related code
