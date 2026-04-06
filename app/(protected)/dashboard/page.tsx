import { verifySession, checkPermission } from '@/lib/dal'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { FileText, ShoppingCart, Users, Shield, ArrowRight } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

export default async function DashboardPage() {
  await verifySession()

  const [canManageUsers, canManageRoles, canReadReports, canReadOrders] =
    await Promise.all([
      checkPermission('MANAGE', 'USERS'),
      checkPermission('MANAGE', 'ROLES'),
      checkPermission('READ', 'REPORTS'),
      checkPermission('READ', 'ORDERS'),
    ])

  // Fetch real stats gated by permission
  const [userCount, roleCount, permissionCount, assignmentCount] = await Promise.all([
    canManageUsers ? prisma.user.count() : Promise.resolve(null),
    canManageRoles ? prisma.role.count() : Promise.resolve(null),
    canManageRoles ? prisma.permission.count() : Promise.resolve(null),
    canManageUsers ? prisma.userRole.count() : Promise.resolve(null),
  ])

  const stats = [
    { label: 'Người dùng', value: userCount },
    { label: 'Roles', value: roleCount },
    { label: 'Permissions', value: permissionCount },
    { label: 'Phân công', value: assignmentCount },
  ].filter((s): s is { label: string; value: number } => s.value !== null)

  const modules = [
    { show: canReadReports, href: '/reports', icon: FileText, title: 'Báo cáo', description: 'Xem và quản lý báo cáo' },
    { show: canReadOrders, href: '/orders', icon: ShoppingCart, title: 'Đơn hàng', description: 'Quản lý đơn hàng' },
    { show: canManageUsers, href: '/users', icon: Users, title: 'Người dùng', description: 'Quản lý tài khoản & roles' },
    { show: canManageRoles, href: '/roles', icon: Shield, title: 'Phân quyền', description: 'Quản lý roles & permissions' },
  ].filter((c) => c.show)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Chào buổi sáng' : hour < 18 ? 'Chào buổi chiều' : 'Chào buổi tối'

  return (
    <div className="space-y-8">
      {/* Page heading */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          {greeting}
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Bạn có quyền truy cập vào{' '}
          <span className="font-medium text-foreground">{modules.length}</span> tính năng.
        </p>
      </div>

      {/* Stats row */}
      {stats.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg border bg-card px-4 py-3"
            >
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                {stat.label}
              </p>
              <p className="mt-1.5 text-2xl font-semibold tabular-nums">{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      {stats.length > 0 && modules.length > 0 && <Separator />}

      {/* Module access */}
      {modules.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Tài khoản của bạn chưa được cấp quyền truy cập vào tính năng nào.
        </p>
      ) : (
        <div>
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Truy cập nhanh
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {modules.map((m) => (
              <Link key={m.href} href={m.href} className="group cursor-pointer">
                <div className="flex h-full flex-col rounded-lg border bg-card p-4 transition-colors duration-150 hover:border-foreground/20 hover:bg-accent/40">
                  <div className="mb-3 flex items-start justify-between">
                    <div className="rounded-md border p-1.5">
                      <m.icon className="h-4 w-4" />
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity duration-150 group-hover:opacity-100" />
                  </div>
                  <p className="text-sm font-medium">{m.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{m.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

