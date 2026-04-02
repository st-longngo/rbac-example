'use server'

import { signIn, signOut } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  LoginFormSchema,
  RegisterFormSchema,
  type FormState,
} from '@/lib/definitions'
import { AuthError } from 'next-auth'
import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'

// ─────────────────────────────────────────────────────────────────────────────
// loginAction
// Authenticate user via Auth.js Credentials provider.
// ─────────────────────────────────────────────────────────────────────────────
export async function loginAction(
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = LoginFormSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

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

  redirect('/dashboard')
}

// ─────────────────────────────────────────────────────────────────────────────
// registerAction
// Create a new account and assign default 'user' role.
// ─────────────────────────────────────────────────────────────────────────────
export async function registerAction(
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = RegisterFormSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  })

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  const { name, email, password } = parsed.data

  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) {
    return { errors: { email: ['Email này đã được sử dụng'] } }
  }

  const hashedPassword = await bcrypt.hash(password, 12)
  const newUser = await prisma.user.create({
    data: { name, email, hashedPassword },
  })

  // Assign default 'user' role
  const defaultRole = await prisma.role.findUnique({ where: { name: 'user' } })
  if (defaultRole) {
    await prisma.userRole.create({
      data: { userId: newUser.id, roleId: defaultRole.id },
    })
  }

  // Auto sign-in after registration
  try {
    await signIn('credentials', {
      email,
      password,
      redirect: false,
    })
  } catch {
    redirect('/login')
  }

  redirect('/dashboard')
}

// ─────────────────────────────────────────────────────────────────────────────
// logoutAction
// Sign out and clear session.
// ─────────────────────────────────────────────────────────────────────────────
export async function logoutAction() {
  await signOut({ redirect: false })
  redirect('/login')
}
