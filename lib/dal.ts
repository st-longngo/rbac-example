import 'server-only'
import { cache } from 'react'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hasPermission } from '@/lib/rbac'
import { unauthorized, forbidden } from 'next/navigation'
import type { Action, Resource } from '@prisma/client'

// ─────────────────────────────────────────────────────────────────────────────
// getAuthSession (private)
// Single cache()-wrapped call to auth() per render pass.
// Both verifySession and checkPermission consume this to avoid duplicate
// auth() invocations when both are called in the same component tree.
// ─────────────────────────────────────────────────────────────────────────────
const getAuthSession = cache(async () => auth())

// ─────────────────────────────────────────────────────────────────────────────
// verifySession
// Get current session. Throw unauthorized() if missing.
// Wrapped in cache() to memoize per render pass.
// ─────────────────────────────────────────────────────────────────────────────
export const verifySession = cache(async () => {
  const session = await getAuthSession()

  if (!session?.user?.id) {
    unauthorized() // → renders app/unauthorized.tsx (HTTP 401)
  }

  return {
    isAuth: true as const,
    userId: session.user.id,
    roles: session.user.roles ?? [],
    permissions: session.user.permissions ?? [],
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// getCurrentUser
// Fetch full user info with roles + permissions from DB.
// ─────────────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
// checkPermission
// Returns boolean. Use in Server Components for conditional UI rendering.
// ─────────────────────────────────────────────────────────────────────────────
export const checkPermission = cache(
  async (action: Action, resource: Resource): Promise<boolean> => {
    const session = await getAuthSession()
    if (!session?.user?.permissions) return false
    return hasPermission(session.user.permissions, action, resource)
  },
)

// ─────────────────────────────────────────────────────────────────────────────
// requirePermission
// Throw forbidden() if user lacks the required permission.
// Use as FIRST line in Server Actions and Route Handlers.
// ─────────────────────────────────────────────────────────────────────────────
export async function requirePermission(
  action: Action,
  resource: Resource,
): Promise<void> {
  const { permissions } = await verifySession()
  if (!hasPermission(permissions, action, resource)) {
    forbidden() // → renders app/forbidden.tsx (HTTP 403)
  }
}
