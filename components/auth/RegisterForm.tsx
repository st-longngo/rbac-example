'use client'

import { useActionState } from 'react'
import { useTranslations } from 'next-intl'
import { registerAction } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { FormField } from '@/components/auth/FormField'
import Link from 'next/link'

export function RegisterForm() {
  const t = useTranslations('auth.register')
  const [state, action, isPending] = useActionState(registerAction, undefined)

  return (
    <form action={action} className="space-y-4">
      {state?.errors?.general && (
        <Alert variant="destructive">
          <AlertDescription>{state.errors.general[0]}</AlertDescription>
        </Alert>
      )}

      <FormField
        id="name"
        label={t('nameLabel')}
        placeholder={t('namePlaceholder')}
        required
        error={state?.errors?.name?.[0]}
      />

      <FormField
        id="email"
        label={t('emailLabel')}
        type="email"
        placeholder={t('emailPlaceholder')}
        autoComplete="email"
        required
        error={state?.errors?.email?.[0]}
      />

      <FormField
        id="password"
        label={t('passwordLabel')}
        type="password"
        autoComplete="new-password"
        required
        error={state?.errors?.password?.[0]}
      />

      <FormField
        id="confirmPassword"
        label={t('confirmPasswordLabel')}
        type="password"
        autoComplete="new-password"
        required
        error={state?.errors?.confirmPassword?.[0]}
      />

      <Button type="submit" className="w-full" disabled={isPending} size="lg">
        {isPending ? t('submitting') : t('submit')}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        {t('hasAccount')}{' '}
        <Link href="/login" className="text-primary hover:underline font-medium">
          {t('loginLink')}
        </Link>
      </p>
    </form>
  )
}
