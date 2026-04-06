import { getCurrentUser } from '@/lib/dal'
import { LogoutButton } from '@/components/auth/LogoutButton'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

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
    <header className="flex h-14 items-center justify-between border-b px-6">
      <div />
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-medium">{user?.name ?? 'User'}</p>
          <p className="text-xs text-muted-foreground">{user?.email}</p>
        </div>
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
        <LogoutButton />
      </div>
    </header>
  )
}
