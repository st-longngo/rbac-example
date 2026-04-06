'use client'

import { useActionState } from 'react'
import { useTranslations } from 'next-intl'
import { loginAction } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { FormField } from '@/components/auth/FormField'
import Link from 'next/link'

export function LoginForm() {
  const t = useTranslations('auth.login')
  const [state, action, isPending] = useActionState(loginAction, undefined)

  return (
    <form action={action} className="space-y-4">
      {state?.errors?.general && (
        <Alert variant="destructive">
          <AlertDescription>{state.errors.general[0]}</AlertDescription>
        </Alert>
      )}

      <FormField
        id="email"
        label={t('emailLabel')}
        type="email"
        placeholder="admin@example.com"
        autoComplete="email"
        required
        error={state?.errors?.email?.[0]}
      />

      <FormField
        id="password"
        label={t('passwordLabel')}
        type="password"
        placeholder={t('passwordPlaceholder')}
        autoComplete="current-password"
        required
        error={state?.errors?.password?.[0]}
      />

      <Button type="submit" className="w-full" disabled={isPending} size="lg">
        {isPending ? t('submitting') : t('submit')}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        {t('noAccount')}{' '}
        <Link href="/register" className="text-primary hover:underline font-medium">
          {t('registerLink')}
        </Link>
      </p>
    </form>
  )
}
