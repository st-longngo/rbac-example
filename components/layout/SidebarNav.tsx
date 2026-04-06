import Link from 'next/link'
import { LayoutDashboard, Users, Shield, FileText, ShoppingCart, Settings } from 'lucide-react'
import { checkPermission } from '@/lib/dal'
import { RoleBadge } from '@/components/rbac/RoleBadge'
import { Separator } from '@/components/ui/separator'

interface SidebarNavProps {
  userId: string
  roles: string[]
}

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, action: 'READ' as const, resource: 'DASHBOARD' as const },
  { href: '/reports', label: 'Báo cáo', icon: FileText, action: 'READ' as const, resource: 'REPORTS' as const },
  { href: '/orders', label: 'Đơn hàng', icon: ShoppingCart, action: 'READ' as const, resource: 'ORDERS' as const },
  { href: '/users', label: 'Người dùng', icon: Users, action: 'READ' as const, resource: 'USERS' as const },
  { href: '/roles', label: 'Phân quyền', icon: Shield, action: 'MANAGE' as const, resource: 'ROLES' as const },
]

export async function SidebarNav({ roles }: SidebarNavProps) {
  const visibleItems = await Promise.all(
    navItems.map(async (item) => {
      const allowed = await checkPermission(item.action, item.resource)
      return allowed ? item : null
    }),
  )

  return (
    <aside className="flex h-screen w-56 flex-col border-r bg-muted/30 px-3 py-4">
      <div className="mb-4 px-2">
        <h2 className="text-lg font-bold">RBAC Module</h2>
        <div className="mt-1 flex flex-wrap gap-1">
          {roles.map((role) => (
            <RoleBadge key={role} role={role} />
          ))}
        </div>
      </div>

      <Separator className="mb-3" />

      <nav className="flex flex-col gap-1">
        {visibleItems.map((item) =>
          item ? (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ) : null,
        )}
      </nav>
    </aside>
  )
}
