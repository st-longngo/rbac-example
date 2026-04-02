# UI Guide

## Tech Stack UI

- **Tailwind CSS v4** (đã có sẵn trong dự án)
- **shadcn/ui** — component library copy-paste, accessible, không lock-in

---

## 1. Cài đặt shadcn/ui

```bash
pnpm dlx shadcn@latest init
```

Chọn các options:
- Style: `Default`
- Base color: `Slate`
- CSS variables: `Yes`

### Cài các components cần thiết

```bash
pnpm dlx shadcn@latest add button input label card alert badge table dialog
pnpm dlx shadcn@latest add dropdown-menu avatar separator
```

---

## 2. Cấu trúc Pages

### Login Page

File `app/(auth)/login/page.tsx`:
```tsx
import { LoginForm } from '@/components/auth/LoginForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Đăng nhập</CardTitle>
          <CardDescription>
            Nhập email và mật khẩu để truy cập hệ thống
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </main>
  )
}
```

### Register Page

File `app/(auth)/register/page.tsx`:
```tsx
import { RegisterForm } from '@/components/auth/RegisterForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Tạo tài khoản</CardTitle>
          <CardDescription>
            Đã có tài khoản?{' '}
            <Link href="/login" className="text-primary hover:underline">
              Đăng nhập
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm />
        </CardContent>
      </Card>
    </main>
  )
}
```

---

## 3. Login Form Component

File `components/auth/LoginForm.tsx`:
```tsx
'use client'

import { useActionState } from 'react'
import { loginAction } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

export function LoginForm() {
  const [state, action, isPending] = useActionState(loginAction, undefined)

  return (
    <form action={action} className="space-y-4">
      {state?.errors?.general && (
        <Alert variant="destructive">
          <AlertDescription>{state.errors.general[0]}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" placeholder="admin@example.com" required />
        {state?.errors?.email && (
          <p className="text-sm text-destructive">{state.errors.email[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Mật khẩu</Label>
        <Input id="password" name="password" type="password" required />
        {state?.errors?.password && (
          <p className="text-sm text-destructive">{state.errors.password[0]}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Đang đăng nhập...' : 'Đăng nhập'}
      </Button>
    </form>
  )
}
```

---

## 4. Protected Layout

File `app/(protected)/layout.tsx`:
```tsx
import { verifySession } from '@/lib/dal'
import { SidebarNav } from '@/components/layout/SidebarNav'
import { Header } from '@/components/layout/Header'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await verifySession()  // Throw 401 nếu chưa login

  return (
    <div className="flex min-h-screen">
      <SidebarNav userId={session.userId} roles={session.roles} />
      <div className="flex flex-1 flex-col">
        <Header userId={session.userId} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
```

---

## 5. Dashboard Page

File `app/(protected)/dashboard/page.tsx`:
```tsx
import { verifySession, checkPermission } from '@/lib/dal'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export default async function DashboardPage() {
  const session = await verifySession()
  const [canManageUsers, canManageRoles, canReadReports, canReadOrders] =
    await Promise.all([
      checkPermission('MANAGE', 'USERS'),
      checkPermission('MANAGE', 'ROLES'),
      checkPermission('READ', 'REPORTS'),
      checkPermission('READ', 'ORDERS'),
    ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="mt-2 flex gap-2">
          {session.roles.map(role => (
            <Badge key={role} variant="secondary">
              {role}
            </Badge>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {canReadReports && (
          <Link href="/reports">
            <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardHeader>
                <CardTitle>Báo cáo</CardTitle>
              </CardHeader>
              <CardContent>Xem và quản lý báo cáo</CardContent>
            </Card>
          </Link>
        )}

        {canReadOrders && (
          <Link href="/orders">
            <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardHeader>
                <CardTitle>Đơn hàng</CardTitle>
              </CardHeader>
              <CardContent>Quản lý đơn hàng</CardContent>
            </Card>
          </Link>
        )}

        {canManageUsers && (
          <Link href="/users">
            <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardHeader>
                <CardTitle>Người dùng</CardTitle>
              </CardHeader>
              <CardContent>Quản lý tài khoản</CardContent>
            </Card>
          </Link>
        )}

        {canManageRoles && (
          <Link href="/roles">
            <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardHeader>
                <CardTitle>Phân quyền</CardTitle>
              </CardHeader>
              <CardContent>Quản lý roles & permissions</CardContent>
            </Card>
          </Link>
        )}
      </div>
    </div>
  )
}
```

---

## 6. Admin Users Page

File `app/(protected)/(admin)/users/page.tsx`:
```tsx
import { requirePermission } from '@/lib/dal'
import { prisma } from '@/lib/prisma'
import { UserTable } from '@/components/admin/UserTable'

export default async function UsersPage() {
  await requirePermission('READ', 'USERS')  // Throw 403 nếu không đủ quyền

  const users = await prisma.user.findMany({
    include: {
      userRoles: {
        include: { role: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  const roles = await prisma.role.findMany()

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Quản lý người dùng</h1>
      <UserTable users={users} roles={roles} />
    </div>
  )
}
```

---

## 7. PermissionGate Component

File `components/rbac/PermissionGate.tsx`:
```tsx
import { checkPermission } from '@/lib/dal'
import type { Action, Resource } from '@prisma/client'

interface PermissionGateProps {
  action: Action
  resource: Resource
  children: React.ReactNode
  fallback?: React.ReactNode
}

// Server Component — kiểm tra permission rồi render children
export async function PermissionGate({
  action,
  resource,
  children,
  fallback = null,
}: PermissionGateProps) {
  const allowed = await checkPermission(action, resource)
  return allowed ? <>{children}</> : <>{fallback}</>
}
```

**Cách dùng:**
```tsx
<PermissionGate action="DELETE" resource="USERS">
  <DeleteUserButton userId={user.id} />
</PermissionGate>

<PermissionGate
  action="CREATE"
  resource="REPORTS"
  fallback={<p>Bạn không có quyền tạo báo cáo</p>}
>
  <CreateReportButton />
</PermissionGate>
```

---

## 8. RoleBadge Component

File `components/rbac/RoleBadge.tsx`:
```tsx
import { Badge } from '@/components/ui/badge'

const roleColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  admin: 'destructive',
  manager: 'default',
  user: 'secondary',
  guest: 'outline',
}

export function RoleBadge({ role }: { role: string }) {
  return (
    <Badge variant={roleColors[role] ?? 'secondary'}>
      {role}
    </Badge>
  )
}
```

---

## 9. Logout Button

File `components/auth/LogoutButton.tsx`:
```tsx
'use client'

import { logoutAction } from '@/actions/auth'
import { Button } from '@/components/ui/button'

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <Button type="submit" variant="ghost">
        Đăng xuất
      </Button>
    </form>
  )
}
```
