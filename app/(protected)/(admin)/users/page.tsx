import { getTranslations, getLocale } from 'next-intl/server'
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
  const [t, locale] = await Promise.all([
    getTranslations('users'),
    getLocale(),
  ])

  const dateLocale = locale === 'vi' ? 'vi-VN' : 'en-US'

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
        <h1 className="text-2xl font-semibold tracking-tight">{t('title')}</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {t.rich('count', {
            count: users.length,
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
              <TableHead className="w-[200px]">{t('table.name')}</TableHead>
              <TableHead>{t('table.email')}</TableHead>
              <TableHead>{t('table.roles')}</TableHead>
              <TableHead className="w-[120px]">{t('table.createdAt')}</TableHead>
              <PermissionGate action="MANAGE" resource="USERS">
                <TableHead className="w-[100px] text-right">{t('table.id')}</TableHead>
              </PermissionGate>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} className="transition-colors duration-150">
                <TableCell className="font-medium">
                  {user.name ?? (
                    <span className="text-muted-foreground italic text-sm">{t('noName')}</span>
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
                        {t('noRole')}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {user.createdAt.toLocaleDateString(dateLocale)}
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
