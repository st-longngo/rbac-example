import { requirePermission } from '@/lib/dal'
import { prisma } from '@/lib/prisma'
import { PageHeader } from '@/components/layout/PageHeader'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { RoleBadge } from '@/components/rbac/RoleBadge'
import { PermissionGate } from '@/components/rbac/PermissionGate'
import { Badge } from '@/components/ui/badge'

export default async function UsersPage() {
  await requirePermission('READ', 'USERS') // Throws 403 if insufficient permission

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      userRoles: {
        include: { role: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý người dùng"
        description={`${users.length} người dùng trong hệ thống`}
      />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <PermissionGate action="MANAGE" resource="USERS">
                <TableHead className="text-right">Thao tác</TableHead>
              </PermissionGate>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  {user.name ?? (
                    <span className="text-muted-foreground italic">
                      Chưa đặt tên
                    </span>
                  )}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {user.userRoles.length > 0 ? (
                      user.userRoles.map((ur) => (
                        <RoleBadge key={ur.roleId} role={ur.role.name} />
                      ))
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">
                        Không có role
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {user.createdAt.toLocaleDateString('vi-VN')}
                </TableCell>
                <PermissionGate action="MANAGE" resource="USERS">
                  <TableCell className="text-right">
                    <span className="text-xs text-muted-foreground">
                      {user.id.slice(0, 8)}...
                    </span>
                  </TableCell>
                </PermissionGate>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
