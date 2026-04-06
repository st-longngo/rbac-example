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
import { RoleBadge } from '@/components/rbac/RoleBadge'
import { PermissionGate } from '@/components/rbac/PermissionGate'
import { Badge } from '@/components/ui/badge'

export default async function UsersPage() {
  await requirePermission('READ', 'USERS')

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
      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Người dùng</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{users.length}</span> người dùng trong hệ thống
        </p>
      </div>

      {/* Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[200px]">Tên</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead className="w-[120px]">Ngày tạo</TableHead>
              <PermissionGate action="MANAGE" resource="USERS">
                <TableHead className="w-[100px] text-right">ID</TableHead>
              </PermissionGate>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} className="transition-colors duration-150">
                <TableCell className="font-medium">
                  {user.name ?? (
                    <span className="text-muted-foreground italic text-sm">Chưa đặt tên</span>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{user.email}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {user.userRoles.length > 0 ? (
                      user.userRoles.map((ur) => (
                        <RoleBadge key={ur.roleId} role={ur.role.name} />
                      ))
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground text-xs">
                        Không có role
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {user.createdAt.toLocaleDateString('vi-VN')}
                </TableCell>
                <PermissionGate action="MANAGE" resource="USERS">
                  <TableCell className="text-right">
                    <span className="font-mono text-[11px] text-muted-foreground">
                      {user.id.slice(0, 8)}…
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
