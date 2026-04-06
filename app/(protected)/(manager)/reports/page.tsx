import { getTranslations } from 'next-intl/server'
import { requirePermission } from '@/lib/dal'
import { PageHeader } from '@/components/layout/PageHeader'

export default async function ReportsPage() {
  await requirePermission('READ', 'REPORTS')
  const t = await getTranslations('reports')

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('title')}
        description={t('description')}
      />
      <p className="text-muted-foreground">{t('underDevelopment')}</p>
    </div>
  )
}
