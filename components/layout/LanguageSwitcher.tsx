'use client'

import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { setLocaleAction } from '@/actions/locale'
import { SUPPORTED_LOCALES } from '@/lib/locale'
import type { Locale } from '@/lib/locale'
import { Globe, ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

interface LanguageSwitcherProps {
  /** The currently active locale, passed down from a Server Component. */
  currentLocale: Locale
}

/**
 * Language switcher dropdown.
 * Submits a form to `setLocaleAction` which sets the locale cookie
 * and redirects back to the current page.
 */
export function LanguageSwitcher({ currentLocale }: LanguageSwitcherProps) {
  const t = useTranslations('locale')
  const pathname = usePathname()

  const localeLabels: Record<Locale, string> = {
    en: t('en'),
    vi: t('vi'),
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          'inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-xs font-medium',
          'hover:bg-accent hover:text-accent-foreground transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        )}
        aria-label="Switch language"
      >
        <Globe className="h-3.5 w-3.5" />
        <span>{localeLabels[currentLocale]}</span>
        <ChevronDown className="h-3 w-3 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px]">
        {SUPPORTED_LOCALES.map((loc) => (
          <DropdownMenuItem key={loc} className="p-0">
            {/* Each option is a self-contained form — works without JS */}
            <form action={setLocaleAction} className="w-full">
              <input type="hidden" name="locale" value={loc} />
              <input type="hidden" name="redirectTo" value={pathname} />
              <button
                type="submit"
                className="flex w-full items-center gap-2 px-1.5 py-1 text-sm"
                aria-current={loc === currentLocale ? 'true' : undefined}
              >
                <span
                  className={cn(
                    'h-1.5 w-1.5 rounded-full',
                    loc === currentLocale ? 'bg-primary' : 'bg-transparent',
                  )}
                  aria-hidden
                />
                {localeLabels[loc]}
              </button>
            </form>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
