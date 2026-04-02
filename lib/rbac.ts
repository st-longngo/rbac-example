import type { Action, Resource } from '@prisma/client'
import type { SessionPermission } from '@/lib/definitions'

// ─────────────────────────────────────────────────────────────────────────────
// hasPermission
// Pure function — usable on both client and server.
// MANAGE action implies all other actions on the same resource.
// ─────────────────────────────────────────────────────────────────────────────
export function hasPermission(
  permissions: SessionPermission[],
  action: Action,
  resource: Resource,
): boolean {
  return permissions.some(
    (p) =>
      p.resource === resource && (p.action === action || p.action === 'MANAGE'),
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// hasRole
// Check if user has a specific role.
// ─────────────────────────────────────────────────────────────────────────────
export function hasRole(roles: string[], roleName: string): boolean {
  return roles.includes(roleName)
}

// ─────────────────────────────────────────────────────────────────────────────
// hasAnyRole
// Check if user has at least one of the required roles.
// ─────────────────────────────────────────────────────────────────────────────
export function hasAnyRole(roles: string[], requiredRoles: string[]): boolean {
  return requiredRoles.some((r) => roles.includes(r))
}

// ─────────────────────────────────────────────────────────────────────────────
// getPermissionsForResource
// Return all actions the user has on a specific resource.
// ─────────────────────────────────────────────────────────────────────────────
export function getPermissionsForResource(
  permissions: SessionPermission[],
  resource: Resource,
): Action[] {
  return permissions.filter((p) => p.resource === resource).map((p) => p.action)
}
