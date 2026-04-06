'use client'

import { useActionState } from 'react'
import { registerAction } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { FormField } from '@/components/auth/FormField'
import Link from 'next/link'

export function RegisterForm() {
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
        label="Họ tên"
        placeholder="Nguyễn Văn A"
        required
        error={state?.errors?.name?.[0]}
      />

      <FormField
        id="email"
        label="Email"
        type="email"
        placeholder="user@example.com"
        autoComplete="email"
        required
        error={state?.errors?.email?.[0]}
      />

      <FormField
        id="password"
        label="Mật khẩu"
        type="password"
        autoComplete="new-password"
        required
        error={state?.errors?.password?.[0]}
      />

      <FormField
        id="confirmPassword"
        label="Xác nhận mật khẩu"
        type="password"
        autoComplete="new-password"
        required
        error={state?.errors?.confirmPassword?.[0]}
      />

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Đã có tài khoản?{' '}
        <Link href="/login" className="text-primary hover:underline font-medium">
          Đăng nhập
        </Link>
      </p>
    </form>
  )
}
