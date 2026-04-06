import { getLocale } from 'next-intl/server'
import { getCurrentUser } from '@/lib/dal'
import { AvatarDropdown } from '@/components/layout/AvatarDropdown'
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher'
import { Separator } from '@/components/ui/separator'
import type { Locale } from '@/lib/locale'

/**
 * Renders the top header bar with the current user's name, email,
 * a language switcher, and a logout button.
 * Uses the cached getCurrentUser() DAL function to avoid a redundant DB query.
 */
export async function Header() {
  const [user, locale] = await Promise.all([
    getCurrentUser(),
    getLocale() as Promise<Locale>,
  ])

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
      <div className="flex items-center gap-3">
        <LanguageSwitcher currentLocale={locale} />
        <Separator orientation="vertical" className="h-5" />
        <AvatarDropdown
          initials={initials}
          name={user?.name ?? 'User'}
          email={user?.email ?? ''}
        />
      </div>
    </header>
  )
}
