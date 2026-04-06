import { checkPermission } from '@/lib/dal'
import type { Action, Resource } from '@prisma/client'

interface PermissionGateProps {
  action: Action
  resource: Resource
  children: React.ReactNode
  fallback?: React.ReactNode
}

/**
 * Server Component — checks permission server-side then renders children.
 * Usage: <PermissionGate action="DELETE" resource="USERS"><DeleteButton /></PermissionGate>
 */
export async function PermissionGate({
  action,
  resource,
  children,
  fallback = null,
}: PermissionGateProps) {
  const allowed = await checkPermission(action, resource)
  return allowed ? <>{children}</> : <>{fallback}</>
}
