import { defineSiteTheme } from '@/config/site.theme.defaults'

export const SITE_THEME = defineSiteTheme({
  shell: 'editorial',
  hero: {
    variant: 'gallery-mosaic',
    eyebrow: 'Gallery & editorial studio',
  },
  home: {
    layout: 'editorial-rhythm',
    primaryTask: 'image',
    featuredTaskKeys: ['image', 'article'],
  },
  navigation: {
    variant: 'capsule',
  },
  footer: {
    variant: 'editorial',
  },
  cards: {
    listing: 'listing-elevated',
    article: 'editorial-feature',
    image: 'studio-panel',
    profile: 'studio-panel',
    classified: 'catalog-grid',
    pdf: 'catalog-grid',
    sbm: 'editorial-feature',
    social: 'studio-panel',
    org: 'catalog-grid',
    comment: 'editorial-feature',
  },
})
