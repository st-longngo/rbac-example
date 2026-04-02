# Coding Conventions

## Nguyên tắc cốt lõi

> "**Security by default**" — Mặc định mọi thứ đều bị block, chỉ mở ra những gì được phép.

---

## 1. Auth & Authorization

### ✅ ĐÚNG — Dùng DAL làm điểm kiểm tra duy nhất
```typescript
// Server Component
const session = await verifySession()      // Throw 401 nếu chưa login
await requirePermission('READ', 'USERS')   // Throw 403 nếu không đủ quyền
```

### ❌ SAI — Kiểm tra trực tiếp cookie
```typescript
// KHÔNG làm thế này
const cookie = cookies().get('session')
const decoded = jwt.decode(cookie.value)
if (!decoded) redirect('/login')
```

### ✅ ĐÚNG — `unauthorized()` cho 401, `forbidden()` cho 403
```typescript
import { unauthorized, forbidden } from 'next/navigation'

if (!session) unauthorized()                    // Unauthenticated → 401
if (session.role !== 'admin') forbidden()       // Unauthorized → 403
```

### ❌ SAI — Tự redirect thay vì dùng `unauthorized()` / `forbidden()`
```typescript
// KHÔNG làm thế này trong Next.js 16
if (!session) redirect('/login')
if (session.role !== 'admin') redirect('/403')
```

---

## 2. Server Components & Server Actions

### ✅ `proxy.ts` chỉ làm optimistic check (không query DB)
```typescript
// proxy.ts — chỉ đọc session cookie, KHÔNG query DB
export const proxy = auth(function proxy(req) {
  const isLoggedIn = !!req.auth
  // redirect dựa trên trạng thái login/logout
})
```

### ✅ Permissions chi tiết check ở Server Component / Server Action
```typescript
// Server Component — check permission cụ thể
await requirePermission('DELETE', 'USERS')
```

### ✅ Server Actions luôn bắt đầu bằng auth check
```typescript
'use server'
export async function deleteUserAction(userId: string) {
  await requirePermission('MANAGE', 'USERS')  // ← LUÔN ở đầu action
  // ... logic
}
```

---

## 3. Client Components & Permissions

### ✅ ĐÚNG — Truyền permission result từ Server Component xuống
```tsx
// Server Component tính toán permissions
const canDelete = await checkPermission('DELETE', 'USERS')

// Truyền xuống Client Component
<UserActions canDelete={canDelete} />
```

### ❌ SAI — Tự check permissions trong Client Component
```tsx
// KHÔNG làm thế này — client không có access trực tiếp tới DB
'use client'
function UserActions({ userId }) {
  const session = useSession()
  if (session?.user?.role === 'admin') { // ← logic này có thể bypass
    return <DeleteButton />
  }
}
```

> **Lý do:** Client-side permission check chỉ là UI convenience, không phải security. Luôn validate ở Server Action.

---

## 4. Naming Conventions

### Files & Folders
| Loại | Pattern | Ví dụ |
|---|---|---|
| Server Component (page) | `page.tsx` | `app/dashboard/page.tsx` |
| Client Component | `PascalCase.tsx` + `'use client'` | `LoginForm.tsx` |
| Server Action file | `camelCase.ts` + `'use server'` ở đầu file | `actions/auth.ts` |
| DAL / utility | `camelCase.ts` | `lib/dal.ts`, `lib/rbac.ts` |
| Prisma schema | `schema.prisma` | `prisma/schema.prisma` |
| Route group | `(groupName)` | `app/(auth)/`, `app/(protected)/` |

### TypeScript
| Loại | Pattern | Ví dụ |
|---|---|---|
| Zod schema | `PascalCase + Schema` | `LoginFormSchema`, `AssignRoleSchema` |
| TypeScript type/interface | `PascalCase` | `SessionPayload`, `FormState` |
| Enum (Prisma) | `PascalCase` | `Action.MANAGE`, `Resource.USERS` |
| Function | `camelCase` | `verifySession()`, `hasPermission()` |
| React Component | `PascalCase` | `PermissionGate`, `RoleBadge` |

---

## 5. Import Order

```typescript
// 1. Node built-ins
import { cache } from 'react'

// 2. Next.js imports
import { cookies } from 'next/headers'
import { redirect, unauthorized } from 'next/navigation'

// 3. Third-party packages
import { z } from 'zod'
import bcrypt from 'bcryptjs'

// 4. Internal — lib/
import { prisma } from '@/lib/prisma'
import { hasPermission } from '@/lib/rbac'

// 5. Internal — components/
import { Button } from '@/components/ui/button'

// 6. Types (last)
import type { Action, Resource } from '@prisma/client'
import type { SessionPayload } from '@/lib/definitions'
```

---

## 6. Server-Only Modules

Các file chỉ được dùng ở server-side phải có `import 'server-only'` ở đầu:

```typescript
import 'server-only'  // ← Dòng đầu tiên
// ...
```

**Các file bắt buộc có `server-only`:**
- `lib/dal.ts`
- `lib/auth.ts`
- `lib/prisma.ts`
- `actions/auth.ts`
- `actions/admin.ts`

**Không cần `server-only`:**
- `lib/definitions.ts` (Zod schemas, types — dùng cả 2 phía)
- `lib/rbac.ts` (`hasPermission` là pure function)
- `components/` (Client và Server Component tùy file)

---

## 7. Error Handling trong Server Actions

```typescript
// ✅ Pattern chuẩn cho Server Action trả về FormState
export async function someAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  // 1. Auth check (throw nếu fail)
  await requirePermission('CREATE', 'REPORTS')

  // 2. Validate input
  const parsed = SomeSchema.safeParse(...)
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  // 3. Business logic
  try {
    await prisma.something.create(...)
  } catch (error) {
    return { errors: { general: ['Đã xảy ra lỗi, vui lòng thử lại'] } }
  }

  // 4. Revalidate cache
  revalidatePath('/some-path')

  // 5. Return success (hoặc redirect)
  return { message: 'Thành công' }
  // hoặc: redirect('/success-page')
}
```

---

## 8. Environment Variables

| Biến | Scope | Mô tả |
|---|---|---|
| `DATABASE_URL` | Server only | Không bao giờ expose ra client |
| `AUTH_SECRET` | Server only | Không bao giờ expose ra client |
| `AUTH_URL` | Server only | Base URL cho Auth.js |
| `NEXT_PUBLIC_*` | Public | Chỉ dùng cho giá trị an toàn public |

> **Quy tắc:** Biến không có prefix `NEXT_PUBLIC_` chỉ available ở server-side. Không bao giờ đặt secrets vào biến `NEXT_PUBLIC_*`.

---

## 9. Checklist trước khi merge PR

- [ ] Mọi protected page/action đều có auth check ở đầu
- [ ] Không hard-code role name (dùng constants hoặc enum)
- [ ] Server Actions validate input bằng Zod
- [ ] Không return sensitive data từ Server Actions
- [ ] `revalidatePath()` được gọi sau mutations
- [ ] Không có `console.log` chứa user data trong production code
- [ ] TypeScript không có `any` type trong auth-related code
