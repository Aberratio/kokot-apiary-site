import type { NextConfig } from 'next'
import { defaultLocale } from './src/i18n/config'

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // Product photos uploaded through the CMS live in Vercel Blob.
    remotePatterns: [{ protocol: 'https', hostname: '*.public.blob.vercel-storage.com' }],
  },
  experimental: {
    serverActions: {
      // Photo uploads go through a Server Action. Vercel caps a request at 4.5 MB.
      bodySizeLimit: '4mb',
    },
  },
  async redirects() {
    // Every page lives under a language segment; the bare paths go to the default one.
    return [
      { source: '/', destination: `/${defaultLocale}`, permanent: false },
      { source: '/admin', destination: `/admin/${defaultLocale}`, permanent: false },
    ]
  },
}

export default nextConfig
