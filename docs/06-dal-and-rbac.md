# DAL & RBAC Utilities

## Tổng quan

**DAL (Data Access Layer)** là tầng truy cập dữ liệu duy nhất cho mọi auth/authz check trong Server Components, Server Actions, và Route Handlers. Toàn bộ logic được wrap bởi React `cache()` để tránh duplicate DB queries trong cùng một render pass.

---

## 1. Type Definitions

File `lib/definitions.ts`:
```typescript
import { z } from 'zod'
import { Action, Resource } from '@prisma/client'
import { type DefaultSession } from 'next-auth'

// ─── Auth.js Session Extension ──────────────────────────────
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      roles: string[]
      permissions: SessionPermission[]
    } & DefaultSession['user']
  }
}

// ─── Types ──────────────────────────────────────────────────
export type SessionPermission = {
  action: Action
  resource: Resource
}

export type SessionPayload = {
  userId: string
  roles: string[]
  permissions: SessionPermission[]
  expires: Date
}

export type FormState = {
  errors?: {
    email?: string[]
    password?: string[]
    name?: string[]
    general?: string[]
  }
  message?: string
} | undefined

// ─── Zod Schemas ─────────────────────────────────────────────
export const LoginFormSchema = z.object({
  email: z.string().email({ message: 'Email không hợp lệ' }),
  password: z
    .string()
    .min(8, { message: 'Mật khẩu phải có ít nhất 8 ký tự' }),
})

export const RegisterFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Tên phải có ít nhất 2 ký tự' })
    .max(50, { message: 'Tên không được vượt quá 50 ký tự' }),
  email: z.string().email({ message: 'Email không hợp lệ' }),
  password: z
    .string()
    .min(8, { message: 'Mật khẩu phải có ít nhất 8 ký tự' })
    .regex(/[A-Z]/, { message: 'Mật khẩu phải có ít nhất 1 chữ hoa' })
    .regex(/[0-9]/, { message: 'Mật khẩu phải có ít nhất 1 số' }),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword'],
})

export const AssignRoleSchema = z.object({
  userId: z.string().cuid(),
  roleId: z.string().cuid(),
})
```

---

## 2. Data Access Layer

File `lib/dal.ts`:
```typescript
import 'server-only'
import { cache } from 'react'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { unauthorized } from 'next/navigation'
import type { Action, Resource } from '@prisma/client'
import type { SessionPermission } from '@/lib/definitions'

// ─────────────────────────────────────────────────────────────
// verifySession
// Lấy session hiện tại. Throw unauthorized() nếu không có.
// Wrap bằng cache() để memoize trong 1 render pass.
// ─────────────────────────────────────────────────────────────
export const verifySession = cache(async () => {
  const session = await auth()

  if (!session?.user?.id) {
    unauthorized()  // → renders app/unauthorized.tsx (HTTP 401)
  }

  return {
    isAuth: true,
    userId: session.user.id,
    roles: session.user.roles ?? [],
    permissions: session.user.permissions ?? [],
  }
})

// ─────────────────────────────────────────────────────────────
// getCurrentUser
// Lấy thông tin đầy đủ của user hiện tại kèm roles + permissions.
// ─────────────────────────────────────────────────────────────
export const getCurrentUser = cache(async () => {
  const session = await verifySession()

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      createdAt: true,
      userRoles: {
        include: {
          role: {
            include: {
              rolePermissions: {
                include: { permission: true },
              },
            },
          },
        },
      },
    },
  })

  if (!user) unauthorized()

  return user
})

// ─────────────────────────────────────────────────────────────
// checkPermission
// Kiểm tra session hiện tại có quyền action + resource không.
// Dùng trong Server Components để conditional rendering.
// ─────────────────────────────────────────────────────────────
export const checkPermission = cache(
  async (action: Action, resource: Resource): Promise<boolean> => {
    const session = await auth()
    if (!session?.user?.permissions) return false
    return hasPermission(session.user.permissions, action, resource)
  }
)

// ─────────────────────────────────────────────────────────────
// requirePermission
// Throw forbidden() nếu không đủ quyền.
// Dùng trong Server Actions và Route Handlers.
// ─────────────────────────────────────────────────────────────
export async function requirePermission(action: Action, resource: Resource) {
  const { permissions } = await verifySession()
  if (!hasPermission(permissions, action, resource)) {
    const { forbidden } = await import('next/navigation')
    forbidden()  // → renders app/forbidden.tsx (HTTP 403)
  }
}
```

---

## 3. RBAC Utility

File `lib/rbac.ts`:
```typescript
import type { Action, Resource } from '@prisma/client'
import type { SessionPermission } from '@/lib/definitions'

// ─────────────────────────────────────────────────────────────
// hasPermission
// Pure function - có thể dùng cả client và server side.
// MANAGE action bao gồm tất cả actions khác.
// ─────────────────────────────────────────────────────────────
export function hasPermission(
  permissions: SessionPermission[],
  action: Action,
  resource: Resource
): boolean {
  return permissions.some(
    p =>
      p.resource === resource &&
      (p.action === action || p.action === 'MANAGE')
  )
}

// ─────────────────────────────────────────────────────────────
// hasRole
// Kiểm tra user có role cụ thể không.
// ─────────────────────────────────────────────────────────────
export function hasRole(roles: string[], roleName: string): boolean {
  return roles.includes(roleName)
}

// ─────────────────────────────────────────────────────────────
// hasAnyRole
// Kiểm tra user có ít nhất một trong các roles không.
// ─────────────────────────────────────────────────────────────
export function hasAnyRole(roles: string[], requiredRoles: string[]): boolean {
  return requiredRoles.some(r => roles.includes(r))
}

// ─────────────────────────────────────────────────────────────
// getPermissionsForResource
// Lấy tất cả actions của user trên một resource.
// ─────────────────────────────────────────────────────────────
export function getPermissionsForResource(
  permissions: SessionPermission[],
  resource: Resource
): Action[] {
  return permissions
    .filter(p => p.resource === resource)
    .map(p => p.action)
}
```

---

## 4. Cách sử dụng trong Server Components

```tsx
// app/(protected)/dashboard/page.tsx
import { verifySession, checkPermission } from '@/lib/dal'

export default async function DashboardPage() {
  const session = await verifySession()  // Throw 401 nếu chưa login
  const canManageUsers = await checkPermission('MANAGE', 'USERS')
  const canReadReports = await checkPermission('READ', 'REPORTS')

  return (
    <main>
      <h1>Xin chào, {session.userId}</h1>

      {canManageUsers && (
        <a href="/users">Quản lý người dùng</a>
      )}
      {canReadReports && (
        <a href="/reports">Xem báo cáo</a>
      )}
    </main>
  )
}
```

---

## 5. Cách sử dụng trong Server Actions

```typescript
// actions/admin.ts
'use server'
import { requirePermission } from '@/lib/dal'
import { prisma } from '@/lib/prisma'
import { AssignRoleSchema } from '@/lib/definitions'
import { forbidden } from 'next/navigation'

export async function assignRoleAction(userId: string, roleId: string) {
  // Verify session + permission (throw nếu không đủ quyền)
  await requirePermission('MANAGE', 'ROLES')

  const parsed = AssignRoleSchema.safeParse({ userId, roleId })
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId, roleId } },
    update: {},
    create: { userId, roleId },
  })

  return { success: true }
}
```

---

## 6. Cách sử dụng trong Route Handlers

```typescript
// app/api/users/route.ts
import { NextResponse } from 'next/server'
import { verifySession } from '@/lib/dal'
import { hasPermission } from '@/lib/rbac'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await verifySession()

  if (!hasPermission(session.permissions, 'READ', 'USERS')) {
    return new NextResponse(null, { status: 403 })
  }

  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, createdAt: true },
  })

  return NextResponse.json(users)
}
```

---

## 7. Flow diagram

```
Request
  │
  ▼
proxy.ts ──── session cookie tồn tại? ──── Không → redirect /login
  │ Có
  ▼
Server Component
  │
  ├─ verifySession() ← lib/dal.ts (cache'd)
  │       └─ auth() → Auth.js session từ DB
  │       └─ Không có session → unauthorized() → HTTP 401
  │
  ├─ checkPermission('READ', 'USERS')
  │       └─ hasPermission(permissions, action, resource)
  │       └─ false → forbidden() → HTTP 403
  │
  ▼
Render page (đủ quyền)
```
