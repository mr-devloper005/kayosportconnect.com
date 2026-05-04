export const siteIdentity = {
  code: process.env.NEXT_PUBLIC_SITE_CODE || 'ks5x9q2m4v',
  /** Bump when replacing `public/favicon.png` so browsers pick up the new mark. */
  brandMark: '/favicon.png?v=ksc-brand-20260418',
  name: process.env.NEXT_PUBLIC_SITE_NAME || 'Kayo Sport Connect',
  tagline: process.env.NEXT_PUBLIC_SITE_TAGLINE || 'Sport frames, long reads, one connected studio',
  description:
    process.env.NEXT_PUBLIC_SITE_DESCRIPTION ||
    'Kayo Sport Connect is where photographers and writers publish match-day galleries, training diaries, and long-form sport stories—imagery and articles in one editorial space.',
  domain: process.env.NEXT_PUBLIC_SITE_DOMAIN || 'kayosportconnect.com',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://kayosportconnect.com',
  ogImage: process.env.NEXT_PUBLIC_SITE_OG_IMAGE || '/og-default.png',
  googleMapsEmbedApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_API_KEY || 'AIzaSyBco7dIECu3rJWjP3J0MImnR_uxlbeqAe0',

} as const

export const defaultAuthorProfile = {
  name: 'Kayo Editorial Desk',
  avatar: '/placeholder.svg?height=80&width=80',
} as const

