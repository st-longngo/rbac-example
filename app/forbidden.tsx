import { getTranslations } from 'next-intl/server'
import Link from 'next/link'

export default async function Forbidden() {
  const t = await getTranslations('errors.forbidden')

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6">
      <div className="text-center space-y-2">
        <h1 className="text-6xl font-bold text-muted-foreground">{t('code')}</h1>
        <h2 className="text-2xl font-semibold">{t('title')}</h2>
        <p className="text-muted-foreground">{t('description')}</p>
      </div>
      <Link
        href="/dashboard"
        className="rounded-md bg-primary px-6 py-2 text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
      >
        {t('backLink')}
      </Link>
    </main>
  )
}
