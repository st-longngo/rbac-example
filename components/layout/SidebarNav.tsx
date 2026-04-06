import { LayoutDashboard, Users, Shield, FileText, ShoppingCart } from 'lucide-react'
import { checkPermission } from '@/lib/dal'
import { RoleBadge } from '@/components/rbac/RoleBadge'
import { NavLink } from '@/components/layout/NavLink'

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

  const items = visibleItems.filter(Boolean) as typeof navItems

  return (
    <aside className="flex h-screen w-60 flex-col border-r bg-background">
      {/* Logo / Brand */}
      <div className="flex h-14 shrink-0 items-center gap-2.5 border-b px-5">
        <div className="flex h-6 w-6 items-center justify-center rounded bg-foreground">
          <Shield className="h-3.5 w-3.5 text-background" />
        </div>
        <span className="text-sm font-semibold tracking-tight">RBAC Module</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
          Menu
        </p>
        <div className="flex flex-col gap-0.5">
          {items.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              icon={<item.icon className="h-4 w-4 shrink-0" />}
            />
          ))}
        </div>
      </nav>

      {/* Roles footer */}
      <div className="shrink-0 border-t px-5 py-4">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
          Vai trò
        </p>
        <div className="flex flex-wrap gap-1">
          {roles.map((role) => (
            <RoleBadge key={role} role={role} />
          ))}
        </div>
      </div>
    </aside>
  )
}
