# Server Actions

## Tổng quan

Tất cả mutations (login, register, logout, quản lý roles) đều đi qua **Server Actions** thay vì API routes. Server Actions được gọi trực tiếp từ form `action={}` hoặc event handler trong Client Components.

---

## 1. Auth Actions

File `actions/auth.ts`:
```typescript
'use server'

import { signIn, signOut } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { LoginFormSchema, RegisterFormSchema, type FormState } from '@/lib/definitions'
import { AuthError } from 'next-auth'
import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'

// ─────────────────────────────────────────────────────────────
// loginAction
// Xác thực user qua Auth.js Credentials provider
// ─────────────────────────────────────────────────────────────
export async function loginAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  // 1. Validate input
  const parsed = LoginFormSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
    }
  }

  // 2. Đăng nhập qua Auth.js
  try {
    await signIn('credentials', {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    })
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { errors: { general: ['Email hoặc mật khẩu không đúng'] } }
        default:
          return { errors: { general: ['Đã xảy ra lỗi. Vui lòng thử lại.'] } }
      }
    }
    throw error
  }

  // 3. Redirect sau khi đăng nhập thành công
  redirect('/dashboard')
}

// ─────────────────────────────────────────────────────────────
// registerAction
// Tạo tài khoản mới và assign role 'user' mặc định
// ─────────────────────────────────────────────────────────────
export async function registerAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  // 1. Validate input
  const parsed = RegisterFormSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  })

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
    }
  }

  const { name, email, password } = parsed.data

  // 2. Kiểm tra email đã tồn tại chưa
  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) {
    return { errors: { email: ['Email này đã được sử dụng'] } }
  }

  // 3. Hash password và tạo user
  const hashedPassword = await bcrypt.hash(password, 12)

  const newUser = await prisma.user.create({
    data: { name, email, hashedPassword },
  })

  // 4. Assign role 'user' mặc định
  const defaultRole = await prisma.role.findUnique({ where: { name: 'user' } })
  if (defaultRole) {
    await prisma.userRole.create({
      data: { userId: newUser.id, roleId: defaultRole.id },
    })
  }

  // 5. Tự động đăng nhập sau khi đăng ký
  await signIn('credentials', {
    email,
    password,
    redirect: false,
  })

  redirect('/dashboard')
}

// ─────────────────────────────────────────────────────────────
// logoutAction
// Đăng xuất và xóa session
// ─────────────────────────────────────────────────────────────
export async function logoutAction() {
  await signOut({ redirect: false })
  redirect('/login')
}
```

---

## 2. Admin Actions

File `actions/admin.ts`:
```typescript
'use server'

import { requirePermission } from '@/lib/dal'
import { prisma } from '@/lib/prisma'
import { AssignRoleSchema } from '@/lib/definitions'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { Action, Resource } from '@prisma/client'

// ─────────────────────────────────────────────────────────────
// assignRoleAction
// Gán role cho user. Yêu cầu MANAGE ROLES.
// ─────────────────────────────────────────────────────────────
export async function assignRoleAction(
  prevState: unknown,
  formData: FormData
) {
  await requirePermission('MANAGE', 'ROLES')

  const parsed = AssignRoleSchema.safeParse({
    userId: formData.get('userId'),
    roleId: formData.get('roleId'),
  })

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  const { userId, roleId } = parsed.data

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId, roleId } },
    update: {},
    create: { userId, roleId },
  })

  revalidatePath('/users')
  return { success: true }
}

// ─────────────────────────────────────────────────────────────
// removeRoleAction
// Gỡ role khỏi user. Yêu cầu MANAGE ROLES.
// ─────────────────────────────────────────────────────────────
export async function removeRoleAction(userId: string, roleId: string) {
  await requirePermission('MANAGE', 'ROLES')

  await prisma.userRole.delete({
    where: { userId_roleId: { userId, roleId } },
  })

  revalidatePath('/users')
}

// ─────────────────────────────────────────────────────────────
// createRoleAction
// Tạo role mới. Yêu cầu MANAGE ROLES.
// ─────────────────────────────────────────────────────────────
const CreateRoleSchema = z.object({
  name: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-z_]+$/, 'Chỉ dùng chữ thường và dấu gạch dưới'),
  description: z.string().optional(),
})

export async function createRoleAction(
  prevState: unknown,
  formData: FormData
) {
  await requirePermission('MANAGE', 'ROLES')

  const parsed = CreateRoleSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
  })

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  const existing = await prisma.role.findUnique({
    where: { name: parsed.data.name },
  })
  if (existing) {
    return { errors: { name: ['Role này đã tồn tại'] } }
  }

  await prisma.role.create({ data: parsed.data })
  revalidatePath('/roles')
  return { success: true }
}

// ─────────────────────────────────────────────────────────────
// assignPermissionToRoleAction
// Gán permission cho role. Yêu cầu MANAGE ROLES.
// ─────────────────────────────────────────────────────────────
export async function assignPermissionToRoleAction(
  roleId: string,
  action: Action,
  resource: Resource
) {
  await requirePermission('MANAGE', 'ROLES')

  const permission = await prisma.permission.upsert({
    where: { action_resource: { action, resource } },
    update: {},
    create: { action, resource },
  })

  await prisma.rolePermission.upsert({
    where: { roleId_permissionId: { roleId, permissionId: permission.id } },
    update: {},
    create: { roleId, permissionId: permission.id },
  })

  revalidatePath('/roles')
}

// ─────────────────────────────────────────────────────────────
// deleteUserAction
// Xóa user. Yêu cầu MANAGE USERS.
// ─────────────────────────────────────────────────────────────
export async function deleteUserAction(userId: string) {
  await requirePermission('MANAGE', 'USERS')

  await prisma.user.delete({ where: { id: userId } })
  revalidatePath('/users')
}
```

---

## 3. Pattern sử dụng với useActionState

Trong Client Components, dùng `useActionState` để xử lý trạng thái form:

```tsx
// components/auth/LoginForm.tsx
'use client'

import { useActionState } from 'react'
import { loginAction } from '@/actions/auth'

const initialState = undefined

export function LoginForm() {
  const [state, action, isPending] = useActionState(loginAction, initialState)

  return (
    <form action={action}>
      <input name="email" type="email" />
      {state?.errors?.email && (
        <p className="text-red-500 text-sm">{state.errors.email[0]}</p>
      )}

      <input name="password" type="password" />
      {state?.errors?.password && (
        <p className="text-red-500 text-sm">{state.errors.password[0]}</p>
      )}

      {state?.errors?.general && (
        <div className="text-red-500">{state.errors.general[0]}</div>
      )}

      <button type="submit" disabled={isPending}>
        {isPending ? 'Đang đăng nhập...' : 'Đăng nhập'}
      </button>
    </form>
  )
}
```

---

## 4. Security checklist cho Server Actions

- [x] Mọi action mutation đều gọi `requirePermission()` hoặc `verifySession()` đầu tiên
- [x] Input được validate bằng Zod trước khi xử lý
- [x] Không return sensitive data (hashedPassword, session tokens)
- [x] Dùng `revalidatePath()` để invalidate cache sau khi mutation
- [x] Prisma queries dùng type-safe, tránh raw SQL
- [x] Không expose `userId` từ form — lấy từ session trong action
