import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

const nextConfig: NextConfig = {
  experimental: {
    authInterrupts: true, // Enables unauthorized() and forbidden() from next/navigation
  },
}

export default withNextIntl(nextConfig)
