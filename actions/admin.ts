'use server'

import { requirePermission } from '@/lib/dal'
import { prisma } from '@/lib/prisma'
import { AssignRoleSchema } from '@/lib/definitions'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import type { Action, Resource } from '@prisma/client'

// ─────────────────────────────────────────────────────────────────────────────
// assignRoleAction — requires MANAGE ROLES
// ─────────────────────────────────────────────────────────────────────────────
export async function assignRoleAction(
  prevState: unknown,
  formData: FormData,
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

// ─────────────────────────────────────────────────────────────────────────────
// removeRoleAction — requires MANAGE ROLES
// ─────────────────────────────────────────────────────────────────────────────
export async function removeRoleAction(userId: string, roleId: string) {
  await requirePermission('MANAGE', 'ROLES')

  await prisma.userRole.delete({
    where: { userId_roleId: { userId, roleId } },
  })

  revalidatePath('/users')
}

// ─────────────────────────────────────────────────────────────────────────────
// createRoleAction — requires MANAGE ROLES
// ─────────────────────────────────────────────────────────────────────────────
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
  formData: FormData,
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

// ─────────────────────────────────────────────────────────────────────────────
// assignPermissionToRoleAction — requires MANAGE ROLES
// ─────────────────────────────────────────────────────────────────────────────
export async function assignPermissionToRoleAction(
  roleId: string,
  action: Action,
  resource: Resource,
) {
  await requirePermission('MANAGE', 'ROLES')

  const permission = await prisma.permission.upsert({
    where: { action_resource: { action, resource } },
    update: {},
    create: { action, resource },
  })

  await prisma.rolePermission.upsert({
    where: {
      roleId_permissionId: { roleId, permissionId: permission.id },
    },
    update: {},
    create: { roleId, permissionId: permission.id },
  })

  revalidatePath('/roles')
}

// ─────────────────────────────────────────────────────────────────────────────
// deleteUserAction — requires MANAGE USERS
// ─────────────────────────────────────────────────────────────────────────────
export async function deleteUserAction(userId: string) {
  await requirePermission('MANAGE', 'USERS')

  await prisma.user.delete({ where: { id: userId } })
  revalidatePath('/users')
}
