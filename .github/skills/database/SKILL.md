---
description: "Designs Prisma schema, builds optimized queries, prepares migrations, handles transactions"
---

# Database Skill

You are a database specialist for a Prisma + PostgreSQL RBAC module.

## When to Use

- Modifying `prisma/schema.prisma`
- Writing or optimizing Prisma queries
- Creating migrations
- Writing seed data (`prisma/seed.ts`)
- Optimizing query performance (N+1, indexes, transactions)

## Schema Conventions

- IDs: `String @id @default(cuid())` — not auto-increment, not UUID
- Timestamps: `createdAt DateTime @default(now())` on all models
- Mutable models: add `updatedAt DateTime @updatedAt`
- Join tables: composite `@@id` (e.g., `@@id([userId, roleId])`)
- Unique constraints: `@@unique([field1, field2])`
- Cascading deletes: `onDelete: Cascade` on FK relations

## Current Schema (RBAC Core)

```prisma
enum Action { CREATE, READ, UPDATE, DELETE, MANAGE }
enum Resource { USERS, ROLES, REPORTS, ORDERS, SETTINGS, DASHBOARD }

model User { id, name?, email (unique), hashedPassword?, userRoles[] }
model Role { id, name (unique), description?, userRoles[], rolePermissions[] }
model Permission { id, action, resource, @@unique([action, resource]) }
model UserRole { userId, roleId, @@id([userId, roleId]) }
model RolePermission { roleId, permissionId, @@id([roleId, permissionId]) }
```

## Query Patterns

### Prevent N+1
```ts
// ✅ Single query with nested includes
const user = await prisma.user.findUnique({
  where: { id },
  include: {
    userRoles: { include: { role: { include: { rolePermissions: { include: { permission: true } } } } } }
  }
})

// ❌ N+1
const user = await prisma.user.findUnique({ where: { id } })
const roles = await prisma.userRole.findMany({ where: { userId: id } })
```

### Use Select for Minimal Fetching
```ts
const users = await prisma.user.findMany({
  select: { id: true, name: true, email: true, createdAt: true }
  // Never include hashedPassword
})
```

### Transactions
```ts
await prisma.$transaction([
  prisma.userRole.deleteMany({ where: { userId } }),
  prisma.userRole.createMany({ data: newRoles }),
])
```

## Migration Workflow

1. Edit `prisma/schema.prisma`
2. Run `pnpm prisma generate`
3. Run `pnpm prisma migrate dev --name descriptive-name`
4. Update seed data if needed
5. Test with `pnpm prisma db seed`

## Seed Data Pattern

```ts
// Use upsert for idempotent seeding
await prisma.role.upsert({
  where: { name: 'admin' },
  update: {},
  create: { name: 'admin', description: 'Full system access' },
})
```

## Rules

- Never return `hashedPassword` in any query
- Never edit committed migration SQL files
- Migration names: lowercase, hyphen-separated (`add-user-roles`)
- Always use parameterized queries (Prisma handles this)
- Never construct raw SQL from user input
