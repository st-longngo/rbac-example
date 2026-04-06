import { requirePermission } from '@/lib/dal'
import { PageHeader } from '@/components/layout/PageHeader'

export default async function ReportsPage() {
  await requirePermission('READ', 'REPORTS')

  return (
    <div className="space-y-6">
      <PageHeader
        title="Báo cáo"
        description="Xem và quản lý báo cáo hệ thống"
      />
      <p className="text-muted-foreground">
        Chức năng đang được phát triển...
      </p>
    </div>
  )
}
