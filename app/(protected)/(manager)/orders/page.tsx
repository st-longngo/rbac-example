import { requirePermission } from '@/lib/dal'
import { PageHeader } from '@/components/layout/PageHeader'

export default async function OrdersPage() {
  await requirePermission('READ', 'ORDERS')

  return (
    <div className="space-y-6">
      <PageHeader
        title="Đơn hàng"
        description="Quản lý đơn hàng của hệ thống"
      />
      <p className="text-muted-foreground">
        Chức năng đang được phát triển...
      </p>
    </div>
  )
}
