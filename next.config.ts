import type { NextConfig } from 'next'
import { defaultLocale } from './src/i18n/config'

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  async redirects() {
    // Every page lives under a language segment; the bare domain goes to the default one.
    return [{ source: '/', destination: `/${defaultLocale}`, permanent: false }]
  },
}

export default nextConfig
