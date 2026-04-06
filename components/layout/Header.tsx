import { getCurrentUser } from '@/lib/dal'
import { LogoutButton } from '@/components/auth/LogoutButton'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'

/**
 * Renders the top header bar with the current user's name, email, and logout button.
 * Uses the cached getCurrentUser() DAL function to avoid a redundant DB query.
 */
export async function Header() {
  const user = await getCurrentUser()

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U'

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b bg-background px-6">
      <div />
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-7 w-7">
            <AvatarFallback className="bg-foreground text-background text-[10px] font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="hidden sm:block">
            <p className="text-xs font-medium leading-none">{user?.name ?? 'User'}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground leading-none">{user?.email}</p>
          </div>
        </div>
        <Separator orientation="vertical" className="h-5" />
        <LogoutButton />
      </div>
    </header>
  )
}
