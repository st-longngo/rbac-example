'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { logoutAction } from '@/actions/auth'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LogOut, Settings } from 'lucide-react'

interface AvatarDropdownProps {
  initials: string
  name: string
  email: string
}

/**
 * Client Component that renders a clickable avatar which opens a dropdown
 * menu with Settings and Logout options.
 */
export function AvatarDropdown({ initials, name, email }: AvatarDropdownProps) {
  const t = useTranslations('auth')
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleSettings() {
    router.push('/settings')
  }

  function handleLogout() {
    startTransition(async () => {
      await logoutAction()
    })
  }

  return (
    <div className="flex items-center gap-2.5">
      <div className="hidden sm:flex flex-col">
        <p className="text-xs font-medium leading-none">{name}</p>
        <p className="mt-0.5 text-[11px] text-muted-foreground leading-none">{email}</p>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger
          className="relative h-7 w-7 shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
          aria-label="Open user menu"
        >
          <Avatar className="h-7 w-7">
            <AvatarFallback className="bg-foreground text-background text-[10px] font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" side="bottom" sideOffset={8}>
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={handleSettings} className="cursor-pointer">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={handleLogout}
              disabled={isPending}
              variant="destructive"
              className="cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span>{t('logout')}</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
