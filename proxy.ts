import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const protectedRoutes = ['/dashboard', '/users', '/roles', '/reports', '/orders']
const authRoutes = ['/login', '/register']

// proxy.ts replaces middleware.ts in Next.js 16.
// This is an OPTIMISTIC check only — reads session cookie, NO DB queries.
// Detailed permission checks happen in Server Components via DAL.
export const proxy = auth(function proxy(req) {
  const { nextUrl } = req as NextRequest
  // @ts-expect-error — auth() injects .auth into the request
  const isLoggedIn = !!(req as NextRequest & { auth: unknown }).auth

  const isProtected = protectedRoutes.some((r) =>
    nextUrl.pathname.startsWith(r),
  )
  const isAuthRoute = authRoutes.some((r) => nextUrl.pathname.startsWith(r))

  // Already logged in → redirect away from auth pages
  if (isLoggedIn && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', nextUrl))
  }

  // Not logged in → block protected routes
  if (!isLoggedIn && isProtected) {
    return NextResponse.redirect(new URL('/login', nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
}
