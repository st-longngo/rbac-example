/**
 * Supported locale codes for the application.
 * Adding a new locale requires:
 *  1. Adding its code here
 *  2. Adding a matching messages/<code>.json file
 */
export const SUPPORTED_LOCALES = ['en', 'vi'] as const
export type Locale = (typeof SUPPORTED_LOCALES)[number]

/** Cookie name used to persist the user's locale preference. */
export const LOCALE_COOKIE = 'locale'

/** Default / fallback locale. */
export const DEFAULT_LOCALE: Locale = 'en'

/**
 * Validates that a raw string is a supported locale,
 * returning the default locale if it is not.
 */
export function toSupportedLocale(raw: string | undefined | null): Locale {
  if (raw && (SUPPORTED_LOCALES as readonly string[]).includes(raw)) {
    return raw as Locale
  }
  return DEFAULT_LOCALE
}
