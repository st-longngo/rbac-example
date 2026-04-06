---
applyTo: "**/prisma/**,**/lib/prisma.ts,**/lib/dal.ts,**/actions/**"
description: "Prisma patterns — schema design, queries, migrations, N+1 prevention"
---

# Database Conventions

## Prisma Schema Rules

- All models use `cuid()` for `@id` — not auto-increment, not UUID
- All models have `createdAt DateTime @default(now())`
- Mutable models also have `updatedAt DateTime @updatedAt`
- Join tables use composite `@@id` (e.g., `@@id([userId, roleId])`)
- Unique constraints use `@@unique` (e.g., `@@unique([action, resource])`)
- Use `onDelete: Cascade` on FK relations that should cascade

## Prisma Client Singleton

```ts
// lib/prisma.ts — global singleton to avoid connection exhaustion in dev
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ ... })
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

## Query Patterns

- Always use `select` or `include` — never fetch all columns implicitly
- Prevent N+1: use `include` with nested relations instead of sequential queries
- Use transactions for multi-step mutations: `prisma.$transaction([...])`

```ts
// ✅ Single query with nested includes
const user = await prisma.user.findUnique({
  where: { id },
  include: {
    userRoles: {
      include: { role: { include: { rolePermissions: { include: { permission: true } } } } }
    }
  }
})

// ❌ N+1 pattern
const user = await prisma.user.findUnique({ where: { id } })
const roles = await prisma.userRole.findMany({ where: { userId: id } }) // extra query
```

## Migrations

- Run `pnpm prisma generate` after editing `schema.prisma`
- Run `pnpm prisma migrate dev --name descriptive-name` for schema changes
- Migration names: lowercase, hyphen-separated, descriptive: `add-user-roles`
- Never edit migration SQL files after they are committed

## Seeding

- Seed file: `prisma/seed.ts`
- Use `upsert` to make seeds idempotent
- Seed default roles, permissions, and admin user
