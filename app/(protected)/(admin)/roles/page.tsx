import { getTranslations } from 'next-intl/server'
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
import { RoleBadge } from '@/components/rbac/RoleBadge'

export default async function RolesPage() {
  await requirePermission('MANAGE', 'ROLES')
  const t = await getTranslations('roles')

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
      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t('title')}</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {t.rich('count', {
            count: roles.length,
            strong: (chunks) => (
              <span className="font-medium text-foreground">{chunks}</span>
            ),
          })}
        </p>
      </div>

      {/* Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[140px]">{t('table.role')}</TableHead>
              <TableHead>{t('table.description')}</TableHead>
              <TableHead className="w-[100px]">{t('table.users')}</TableHead>
              <TableHead>{t('table.permissions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.map((role) => (
              <TableRow key={role.id} className="transition-colors duration-150">
                <TableCell>
                  <RoleBadge role={role.name} />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {role.description ?? <span className="text-muted-foreground/50">—</span>}
                </TableCell>
                <TableCell>
                  <span className="text-sm font-medium tabular-nums">{role._count.userRoles}</span>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {role.rolePermissions.map((rp) => (
                      <Badge
                        key={rp.permissionId}
                        variant="outline"
                        className="font-mono text-[10px] px-1.5 py-0.5"
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
