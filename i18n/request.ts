import { getRequestConfig } from 'next-intl/server'
import { cookies } from 'next/headers'
import { toSupportedLocale, LOCALE_COOKIE, DEFAULT_LOCALE } from '@/lib/locale'

/**
 * next-intl request configuration.
 * Reads the active locale from the `locale` cookie, falls back to `en`.
 * No URL-prefix routing — locale is cookie-based only.
 */
export default getRequestConfig(async () => {
  const cookieStore = await cookies()
  const raw = cookieStore.get(LOCALE_COOKIE)?.value
  const locale = toSupportedLocale(raw)

  return {
    locale,
    messages: (
      await import(`../messages/${locale}.json`)
    ).default as Record<string, unknown>,
    // Suppress missing-key warnings in production; they are caught in CI
    onError:
      process.env.NODE_ENV === 'production' ? () => DEFAULT_LOCALE : undefined,
  }
})
