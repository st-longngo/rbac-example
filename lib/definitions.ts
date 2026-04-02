import { z } from 'zod'
import type { DefaultSession } from 'next-auth'
import type { Action, Resource } from '@prisma/client'

// ─── Auth.js Session Extension ──────────────────────────────────────────────
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      roles: string[]
      permissions: SessionPermission[]
    } & DefaultSession['user']
  }
}

// ─── Types ──────────────────────────────────────────────────────────────────
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

export type FormState =
  | {
      errors?: {
        name?: string[]
        email?: string[]
        password?: string[]
        confirmPassword?: string[]
        general?: string[]
      }
      message?: string
    }
  | undefined

// ─── Zod Schemas ─────────────────────────────────────────────────────────────
export const LoginFormSchema = z.object({
  email: z.string().email({ message: 'Email không hợp lệ' }),
  password: z.string().min(8, { message: 'Mật khẩu phải có ít nhất 8 ký tự' }),
})

export const RegisterFormSchema = z
  .object({
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
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  })

export const AssignRoleSchema = z.object({
  userId: z.string().cuid(),
  roleId: z.string().cuid(),
})
