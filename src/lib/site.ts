/**
 * The site's absolute URL, for metadata. `NEXT_PUBLIC_SITE_URL` wins; on Vercel the production
 * domain is used when it is not set; locally it is localhost.
 */
export function siteUrl(): URL {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL
  return new URL(explicit ?? (vercel ? `https://${vercel}` : 'http://localhost:3000'))
}
