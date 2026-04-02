# Database Schema

## Prisma Schema

File: `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─────────────────────────────────────────────
// Enums
// ─────────────────────────────────────────────

enum Action {
  CREATE
  READ
  UPDATE
  DELETE
  MANAGE
}

enum Resource {
  USERS
  ROLES
  REPORTS
  ORDERS
  SETTINGS
  DASHBOARD
}

// ─────────────────────────────────────────────
// RBAC Models
// ─────────────────────────────────────────────

model User {
  id             String    @id @default(cuid())
  name           String?
  email          String    @unique
  emailVerified  DateTime?
  hashedPassword String?
  image          String?
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  // Auth.js relations
  accounts Account[]
  sessions Session[]

  // RBAC relations
  userRoles UserRole[]
}

model Role {
  id          String   @id @default(cuid())
  name        String   @unique
  description String?
  createdAt   DateTime @default(now())

  userRoles       UserRole[]
  rolePermissions RolePermission[]
}

model Permission {
  id       String   @id @default(cuid())
  action   Action
  resource Resource

  rolePermissions RolePermission[]

  @@unique([action, resource])
}

model UserRole {
  userId     String
  roleId     String
  assignedAt DateTime @default(now())
  assignedBy String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  role Role @relation(fields: [roleId], references: [id], onDelete: Cascade)

  @@id([userId, roleId])
}

model RolePermission {
  roleId       String
  permissionId String

  role       Role       @relation(fields: [roleId], references: [id], onDelete: Cascade)
  permission Permission @relation(fields: [permissionId], references: [id], onDelete: Cascade)

  @@id([roleId, permissionId])
}

// ─────────────────────────────────────────────
// Auth.js Required Models
// ─────────────────────────────────────────────

model Account {
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@id([provider, providerAccountId])
}

model Session {
  sessionToken String   @unique
  userId       String
  expires      DateTime
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String
  expires    DateTime

  @@id([identifier, token])
}
```

---

## Seed Data

File: `prisma/seed.ts`

```typescript
import { PrismaClient, Action, Resource } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // 1. Tạo tất cả permissions
  const permissionMatrix: { action: Action; resource: Resource }[] = [
    // USERS
    { action: 'MANAGE', resource: 'USERS' },
    { action: 'READ', resource: 'USERS' },
    // ROLES
    { action: 'MANAGE', resource: 'ROLES' },
    // REPORTS
    { action: 'MANAGE', resource: 'REPORTS' },
    { action: 'CREATE', resource: 'REPORTS' },
    { action: 'READ', resource: 'REPORTS' },
    { action: 'UPDATE', resource: 'REPORTS' },
    // ORDERS
    { action: 'MANAGE', resource: 'ORDERS' },
    { action: 'CREATE', resource: 'ORDERS' },
    { action: 'READ', resource: 'ORDERS' },
    { action: 'UPDATE', resource: 'ORDERS' },
    // SETTINGS
    { action: 'MANAGE', resource: 'SETTINGS' },
    // DASHBOARD
    { action: 'READ', resource: 'DASHBOARD' },
  ]

  for (const p of permissionMatrix) {
    await prisma.permission.upsert({
      where: { action_resource: { action: p.action, resource: p.resource } },
      update: {},
      create: p,
    })
  }

  // 2. Tạo roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: { name: 'admin', description: 'Full system access' },
  })
  const managerRole = await prisma.role.upsert({
    where: { name: 'manager' },
    update: {},
    create: { name: 'manager', description: 'Manage reports and orders' },
  })
  const userRole = await prisma.role.upsert({
    where: { name: 'user' },
    update: {},
    create: { name: 'user', description: 'Basic access' },
  })
  const guestRole = await prisma.role.upsert({
    where: { name: 'guest' },
    update: {},
    create: { name: 'guest', description: 'Read-only limited access' },
  })

  // 3. Assign permissions → roles
  const adminPermissions = await prisma.permission.findMany()
  for (const p of adminPermissions) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: adminRole.id, permissionId: p.id } },
      update: {},
      create: { roleId: adminRole.id, permissionId: p.id },
    })
  }

  const managerPermissions = await prisma.permission.findMany({
    where: {
      OR: [
        { resource: 'REPORTS', action: { in: ['CREATE', 'READ', 'UPDATE'] } },
        { resource: 'ORDERS', action: { in: ['CREATE', 'READ', 'UPDATE'] } },
        { resource: 'USERS', action: 'READ' },
        { resource: 'DASHBOARD', action: 'READ' },
      ],
    },
  })
  for (const p of managerPermissions) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: managerRole.id, permissionId: p.id } },
      update: {},
      create: { roleId: managerRole.id, permissionId: p.id },
    })
  }

  // 4. Tạo admin user mặc định
  const hashedPassword = await bcrypt.hash('Admin@123456', 12)
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'System Admin',
      hashedPassword,
    },
  })
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: adminUser.id, roleId: adminRole.id } },
    update: {},
    create: { userId: adminUser.id, roleId: adminRole.id, assignedBy: adminUser.id },
  })

  console.log('✅ Seed completed')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

---

## Migration Commands

```bash
# Tạo migration từ schema
pnpm prisma migrate dev --name init

# Chạy seed
pnpm prisma db seed

# Mở Prisma Studio để xem data
pnpm prisma studio

# Reset DB (xóa data, chạy lại migrations + seed)
pnpm prisma migrate reset
```

---

## `package.json` — Prisma seed config

Thêm vào `package.json`:
```json
{
  "prisma": {
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  }
}
```
