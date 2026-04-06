import { verifySession, checkPermission } from '@/lib/dal'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import Link from 'next/link'
import { FileText, ShoppingCart, Users, Shield } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'

export default async function DashboardPage() {
  const session = await verifySession()

  const [canManageUsers, canManageRoles, canReadReports, canReadOrders] =
    await Promise.all([
      checkPermission('MANAGE', 'USERS'),
      checkPermission('MANAGE', 'ROLES'),
      checkPermission('READ', 'REPORTS'),
      checkPermission('READ', 'ORDERS'),
    ])

  const cards = [
    {
      show: canReadReports,
      href: '/reports',
      icon: FileText,
      title: 'Báo cáo',
      description: 'Xem và quản lý báo cáo',
    },
    {
      show: canReadOrders,
      href: '/orders',
      icon: ShoppingCart,
      title: 'Đơn hàng',
      description: 'Quản lý đơn hàng',
    },
    {
      show: canManageUsers,
      href: '/users',
      icon: Users,
      title: 'Người dùng',
      description: 'Quản lý tài khoản & roles',
    },
    {
      show: canManageRoles,
      href: '/roles',
      icon: Shield,
      title: 'Phân quyền',
      description: 'Quản lý roles & permissions',
    },
  ].filter((c) => c.show)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description={
          <>
            Xin chào! Bạn đang có quyền truy cập vào{' '}
            <strong>{cards.length}</strong> tính năng.
          </>
        }
      />

      {cards.length === 0 ? (
        <p className="text-muted-foreground">
          Tài khoản của bạn chưa được cấp quyền truy cập vào tính năng nào.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {cards.map((card) => (
            <Link key={card.href} href={card.href}>
              <Card className="cursor-pointer hover:bg-muted/50 transition-colors h-full">
                <CardHeader className="flex flex-row items-center gap-3 pb-2">
                  <card.icon className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">{card.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {card.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Thông tin phiên làm việc
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-1">
          <p>
            <span className="font-medium">User ID:</span>{' '}
            <code className="text-xs bg-muted px-1 py-0.5 rounded">
              {session.userId}
            </code>
          </p>
          <p>
            <span className="font-medium">Roles:</span>{' '}
            {session.roles.join(', ') || 'Không có role'}
          </p>
          <p>
            <span className="font-medium">Permissions:</span>{' '}
            {session.permissions.length} quyền
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
