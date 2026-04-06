import { getTranslations } from 'next-intl/server'
import Link from 'next/link'

export default async function Unauthorized() {
  const t = await getTranslations('errors.unauthorized')

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6">
      <div className="text-center space-y-2">
        <h1 className="text-6xl font-bold text-muted-foreground">{t('code')}</h1>
        <h2 className="text-2xl font-semibold">{t('title')}</h2>
        <p className="text-muted-foreground">{t('description')}</p>
      </div>
      <Link
        href="/login"
        className="rounded-md bg-primary px-6 py-2 text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
      >
        {t('loginLink')}
      </Link>
    </main>
  )
}
