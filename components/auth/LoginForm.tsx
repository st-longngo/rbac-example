'use client'

import { useActionState } from 'react'
import { loginAction } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { FormField } from '@/components/auth/FormField'
import Link from 'next/link'

export function LoginForm() {
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
        label="Email"
        type="email"
        placeholder="admin@example.com"
        autoComplete="email"
        required
        error={state?.errors?.email?.[0]}
      />

      <FormField
        id="password"
        label="Mật khẩu"
        type="password"
        autoComplete="current-password"
        required
        error={state?.errors?.password?.[0]}
      />

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Đang đăng nhập...' : 'Đăng nhập'}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Chưa có tài khoản?{' '}
        <Link href="/register" className="text-primary hover:underline font-medium">
          Đăng ký
        </Link>
      </p>
    </form>
  )
}
