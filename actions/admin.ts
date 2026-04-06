'use server'

import { requirePermission } from '@/lib/dal'
import { prisma } from '@/lib/prisma'
import { AssignRoleSchema, CreateUserSchema, EditUserSchema } from '@/lib/definitions'
import type { AdminFormState } from '@/lib/definitions'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { Prisma } from '@prisma/client'
import type { Action, Resource } from '@prisma/client'
import bcrypt from 'bcryptjs'

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

  try {
    await prisma.role.create({ data: parsed.data })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return { errors: { name: ['Role này đã tồn tại'] } }
    }
    return { errors: { name: ['Đã xảy ra lỗi. Vui lòng thử lại.'] } }
  }

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

  await prisma.$transaction(async (tx) => {
    const permission = await tx.permission.upsert({
      where: { action_resource: { action, resource } },
      update: {},
      create: { action, resource },
    })

    await tx.rolePermission.upsert({
      where: {
        roleId_permissionId: { roleId, permissionId: permission.id },
      },
      update: {},
      create: { roleId, permissionId: permission.id },
    })
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

// ─────────────────────────────────────────────────────────────────────────────
// createUserAction — requires CREATE USERS
// Creates a new user account with optional role assignments.
// ─────────────────────────────────────────────────────────────────────────────
export async function createUserAction(
  prevState: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  await requirePermission('CREATE', 'USERS')

  const raw = {
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    roleIds: formData.getAll('roleIds') as string[],
  }

  const parsed = CreateUserSchema.safeParse(raw)
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  const { name, email, password, roleIds } = parsed.data

  const hashedPassword = await bcrypt.hash(password, 12)

  try {
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: name || null,
          email,
          hashedPassword,
        },
        select: { id: true },
      })

      if (roleIds.length > 0) {
        await tx.userRole.createMany({
          data: roleIds.map((roleId) => ({ userId: user.id, roleId })),
          skipDuplicates: true,
        })
      }
    })
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return { errors: { email: ['This email is already registered.'] } }
    }
    return { errors: { general: ['Failed to create user. Please try again.'] } }
  }

  revalidatePath('/users')
  return { message: 'User created successfully.' }
}

// ─────────────────────────────────────────────────────────────────────────────
// editUserAction — requires UPDATE USERS
// Updates a user's name, email, and role assignments.
// Enforces the last-admin guard to prevent self-lockout.
// ─────────────────────────────────────────────────────────────────────────────
export async function editUserAction(
  prevState: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  await requirePermission('UPDATE', 'USERS')

  const raw = {
    userId: formData.get('userId'),
    name: formData.get('name'),
    email: formData.get('email'),
    roleIds: formData.getAll('roleIds') as string[],
  }

  const parsed = EditUserSchema.safeParse(raw)
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  const { userId, name, email, roleIds } = parsed.data

  // Last-admin guard: if the user currently has the admin role and it is being
  // removed, ensure at least one other admin remains in the system.
  const currentRoles = await prisma.userRole.findMany({
    where: { userId },
    include: { role: { select: { name: true } } },
  })

  const hadAdminRole = currentRoles.some((ur) => ur.role.name === 'admin')
  const willHaveAdminRole = roleIds.length > 0
    ? await prisma.role
        .findMany({ where: { id: { in: roleIds }, name: 'admin' }, select: { id: true } })
        .then((r) => r.length > 0)
    : false

  if (hadAdminRole && !willHaveAdminRole) {
    // Check if this user is the sole admin
    const adminCount = await prisma.userRole.count({
      where: {
        role: { name: 'admin' },
        userId: { not: userId },
      },
    })
    if (adminCount === 0) {
      return {
        errors: {
          general: ['Cannot remove the admin role from the last administrator.'],
        },
      }
    }
  }

  try {
    await prisma.$transaction(async (tx) => {
      // Update name and email
      await tx.user.update({
        where: { id: userId },
        data: { name: name || null, email },
        select: { id: true },
      })

      // Replace role assignments atomically
      await tx.userRole.deleteMany({ where: { userId } })

      if (roleIds.length > 0) {
        await tx.userRole.createMany({
          data: roleIds.map((roleId) => ({ userId, roleId })),
          skipDuplicates: true,
        })
      }
    })
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return { errors: { email: ['This email is already used by another account.'] } }
    }
    return { errors: { general: ['Failed to update user. Please try again.'] } }
  }

  revalidatePath('/users')
  return { message: 'User updated successfully.' }
}
