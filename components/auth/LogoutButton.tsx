'use client'

import { useTranslations } from 'next-intl'
import { logoutAction } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

interface LogoutButtonProps {
  variant?: 'default' | 'ghost' | 'outline'
  showIcon?: boolean
}

export function LogoutButton({
  variant = 'ghost',
  showIcon = true,
}: LogoutButtonProps) {
  const t = useTranslations('auth')

  return (
    <form action={logoutAction}>
      <Button type="submit" variant={variant} size="sm">
        {showIcon && <LogOut className="mr-2 h-4 w-4" />}
        {t('logout')}
      </Button>
    </form>
  )
}
