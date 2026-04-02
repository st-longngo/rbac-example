# Auth.js v5 Setup

## Packages cần cài

```bash
pnpm add next-auth@beta @auth/prisma-adapter @prisma/client bcryptjs zod server-only
pnpm add -D prisma @types/bcryptjs ts-node
```

> **Lưu ý:** Auth.js v5 (`next-auth@beta`) là phiên bản tương thích với Next.js App Router. Tên package vẫn là `next-auth` nhưng API đã thay đổi đáng kể so với v4.

---

## 1. Biến môi trường

File `.env.local`:
```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/rbac_db"

# Auth.js — tạo bằng: openssl rand -base64 32
AUTH_SECRET="your-super-secret-key-here"

# Auth.js URL (production)
AUTH_URL="http://localhost:3000"
```

File `.env.example` (commit lên git):
```bash
DATABASE_URL="postgresql://user:password@localhost:5432/rbac_db"
AUTH_SECRET=""
AUTH_URL="http://localhost:3000"
```

---

## 2. Prisma Client Singleton

File `lib/prisma.ts`:
```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

---

## 3. Auth.js Configuration

File `lib/auth.ts`:
```typescript
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { LoginFormSchema } from '@/lib/definitions'

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),

  session: {
    strategy: 'database',  // Lưu session vào DB (hỗ trợ revocation)
    maxAge: 30 * 24 * 60 * 60, // 30 ngày
  },

  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = LoginFormSchema.safeParse(credentials)
        if (!parsed.success) return null

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        })
        if (!user || !user.hashedPassword) return null

        const passwordMatch = await bcrypt.compare(
          parsed.data.password,
          user.hashedPassword
        )
        if (!passwordMatch) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        }
      },
    }),
  ],

  callbacks: {
    async session({ session, user }) {
      // Nhúng thêm data vào session object
      if (session.user && user) {
        session.user.id = user.id

        // Lấy roles + permissions từ DB
        const userWithRoles = await prisma.user.findUnique({
          where: { id: user.id },
          include: {
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

        session.user.roles = userWithRoles?.userRoles.map(ur => ur.role.name) ?? []
        session.user.permissions = userWithRoles?.userRoles.flatMap(ur =>
          ur.role.rolePermissions.map(rp => ({
            action: rp.permission.action,
            resource: rp.permission.resource,
          }))
        ) ?? []
      }
      return session
    },
  },

  pages: {
    signIn: '/login',     // Custom login page
    error: '/login',      // Redirect lỗi về login page
  },
})
```

---

## 4. TypeScript: Mở rộng Session Types

File `lib/definitions.ts` (phần session):
```typescript
import { type DefaultSession } from 'next-auth'
import { Action, Resource } from '@prisma/client'

// Mở rộng Next-Auth Session types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      roles: string[]
      permissions: { action: Action; resource: Resource }[]
    } & DefaultSession['user']
  }
}
```

---

## 5. Route Handler

File `app/api/auth/[...nextauth]/route.ts`:
```typescript
import { handlers } from '@/lib/auth'

export const { GET, POST } = handlers
```

---

## 6. `proxy.ts` — Route Guard

> ⚠️ `middleware.ts` **deprecated** trong Next.js 16. Dùng `proxy.ts` với export function tên `proxy`.

File `proxy.ts` (root):
```typescript
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const protectedRoutes = ['/dashboard', '/users', '/roles', '/reports', '/orders']
const authRoutes = ['/login', '/register']

export const proxy = auth(function proxy(req) {
  const { nextUrl, auth: session } = req as NextRequest & { auth: any }
  const isLoggedIn = !!session

  const isProtected = protectedRoutes.some(r => nextUrl.pathname.startsWith(r))
  const isAuthRoute = authRoutes.some(r => nextUrl.pathname.startsWith(r))

  // Đã login → không cho vào trang auth
  if (isLoggedIn && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', nextUrl))
  }

  // Chưa login → block protected routes
  if (!isLoggedIn && isProtected) {
    return NextResponse.redirect(new URL('/login', nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
}
```

> **Quan trọng:** Proxy chỉ kiểm tra **sự tồn tại** của session (optimistic check), **không** kiểm tra permissions cụ thể. Permission check diễn ra trong Server Components qua DAL.

---

## 7. `next.config.ts` — Bật authInterrupts

```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    authInterrupts: true,  // Bật unauthorized() và forbidden()
  },
}

export default nextConfig
```

---

## 8. `app/unauthorized.tsx`

```tsx
import Link from 'next/link'

export default function Unauthorized() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold">401</h1>
      <p className="text-muted-foreground">
        Bạn cần đăng nhập để truy cập trang này.
      </p>
      <Link
        href="/login"
        className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
      >
        Đăng nhập
      </Link>
    </main>
  )
}
```

---

## 9. `app/forbidden.tsx`

```tsx
import Link from 'next/link'

export default function Forbidden() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold">403</h1>
      <p className="text-muted-foreground">
        Bạn không có quyền truy cập tài nguyên này.
      </p>
      <Link
        href="/dashboard"
        className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
      >
        Về Dashboard
      </Link>
    </main>
  )
}
```
