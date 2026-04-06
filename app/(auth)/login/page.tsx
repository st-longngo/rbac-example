import { getTranslations, getLocale } from 'next-intl/server'
import { LoginForm } from '@/components/auth/LoginForm'
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { Locale } from '@/lib/locale'

export default async function LoginPage() {
  const [t, locale] = await Promise.all([
    getTranslations('auth.login'),
    getLocale() as Promise<Locale>,
  ])

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-muted/50 p-4">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher currentLocale={locale} />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </main>
  )
}
