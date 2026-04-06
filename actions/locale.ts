'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { toSupportedLocale, LOCALE_COOKIE } from '@/lib/locale'

/**
 * Server Action — sets the locale cookie and redirects back to the referring
 * page (or `/` if no referrer is available).
 *
 * @param formData - Must contain a `locale` field and a `redirectTo` field.
 */
export async function setLocaleAction(formData: FormData): Promise<never> {
  const raw = formData.get('locale')?.toString()
  const locale = toSupportedLocale(raw)

  const cookieStore = await cookies()
  cookieStore.set(LOCALE_COOKIE, locale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: false, // readable client-side for JS-based hydration hints
  })

  // Redirect back to the page the user was on
  const redirectTo = formData.get('redirectTo')?.toString() ?? '/'
  redirect(redirectTo)
}
