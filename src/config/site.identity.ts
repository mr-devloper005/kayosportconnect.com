export const siteIdentity = {
  code: process.env.NEXT_PUBLIC_SITE_CODE || 'ks5x9q2m4v',
  name: process.env.NEXT_PUBLIC_SITE_NAME || 'Kayo Sport Connect',
  tagline: process.env.NEXT_PUBLIC_SITE_TAGLINE || 'Visual sports moments and fresh coverage',
  description:
    process.env.NEXT_PUBLIC_SITE_DESCRIPTION ||
    'A media-led platform combining image-focused discovery with article-based sports coverage.',
  domain: process.env.NEXT_PUBLIC_SITE_DOMAIN || 'kayosportconnect.com',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://kayosportconnect.com',
  ogImage: process.env.NEXT_PUBLIC_SITE_OG_IMAGE || '/og-default.png',
  googleMapsEmbedApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_API_KEY || 'AIzaSyBco7dIECu3rJWjP3J0MImnR_uxlbeqAe0',

} as const

export const defaultAuthorProfile = {
  name: siteIdentity.name,
  avatar: '/placeholder.svg?height=80&width=80',
} as const

