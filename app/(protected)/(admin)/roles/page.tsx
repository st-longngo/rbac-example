import { requirePermission } from '@/lib/dal'
import { prisma } from '@/lib/prisma'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/layout/PageHeader'
import { RoleBadge } from '@/components/rbac/RoleBadge'

export default async function RolesPage() {
  await requirePermission('MANAGE', 'ROLES') // Throws 403 if insufficient permission

  const roles = await prisma.role.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      rolePermissions: {
        select: {
          permissionId: true,
          permission: {
            select: { action: true, resource: true },
          },
        },
      },
      _count: { select: { userRoles: true } },
    },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý phân quyền"
        description={`${roles.length} roles trong hệ thống`}
      />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Role</TableHead>
              <TableHead>Mô tả</TableHead>
              <TableHead>Số lượng User</TableHead>
              <TableHead>Permissions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.map((role) => (
              <TableRow key={role.id}>
                <TableCell>
                  <RoleBadge role={role.name} />
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {role.description ?? '—'}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{role._count.userRoles} users</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1 max-w-md">
                    {role.rolePermissions.map((rp) => (
                      <Badge
                        key={rp.permissionId}
                        variant="outline"
                        className="text-xs font-mono"
                      >
                        {rp.permission.action}:{rp.permission.resource}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
