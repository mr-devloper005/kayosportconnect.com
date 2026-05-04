import type { TaskKey } from '@/lib/site-config'

export const siteContent = {
  navbar: {
    tagline: 'Sport photography & editorial',
  },
  footer: {
    tagline: 'Galleries, essays, and match-day culture',
  },
  hero: {
    badge: 'Frames & long reads',
    title: ['Where sport meets', 'the lens and the page.'],
    description:
      'Publish match albums, training stills, and photo essays beside long-form reporting—built for photographers and writers who cover sport in Australia and beyond.',
    primaryCta: {
      label: 'Browse image gallery',
      href: '/images',
    },
    secondaryCta: {
      label: 'Read articles',
      href: '/articles',
    },
    searchPlaceholder: 'Search images, articles, or topics…',
    focusLabel: 'Focus',
    featureCardBadge: 'From the desk',
    featureCardTitle: 'New frames and filed stories land here first.',
    featureCardDescription:
      'Contributors upload galleries and file essays through the same studio—search and navigation keep both lanes easy to reach.',
  },
  home: {
    metadata: {
      title: 'Sport images & articles | Kayo Sport Connect',
      description:
        'Explore sport photography galleries and long-form articles—match day, training, and culture from the Kayo Sport Connect community.',
      openGraphTitle: 'Kayo Sport Connect — sport imagery & writing',
      openGraphDescription:
        'Galleries and editorial sport stories in one calm, high-contrast experience.',
      keywords: [
        'sport photography',
        'sports articles',
        'match day gallery',
        'Australian sport',
        'photo essay',
        'Kayo Sport Connect',
      ],
    },
    introBadge: 'Why Kayo Sport Connect',
    introTitle: 'Imagery and writing for people who live match day.',
    introParagraphs: [
      'We foreground photo-led posts—ovals, courts, pools, and crowds—then give articles room to breathe with typography tuned for long reads.',
      'Whether you are filing from the boundary or editing a profile piece, the same navigation keeps galleries and essays one click apart.',
      'The palette stays cool ink on warm cream so colour in your frames—not chrome around the site—does the talking.',
    ],
    sideBadge: 'At a glance',
    sidePoints: [
      'Image routes tuned for large thumbnails and minimal chrome.',
      'Article surfaces with serif display and generous line height.',
      'Built for Australian venues, time zones, and outdoor light.',
      'Fast, CSS-first motion so pages stay light on match day traffic.',
    ],
    primaryLink: {
      label: 'Open image gallery',
      href: '/images',
    },
    secondaryLink: {
      label: 'Browse articles',
      href: '/articles',
    },
  },
  cta: {
    badge: 'Join the desk',
    title: 'Upload galleries, file stories, keep one premium home for both.',
    description:
      'Create an account to publish, or browse public galleries and essays—the same restrained UI whether you are shooting or reading.',
    primaryCta: {
      label: 'Create account',
      href: '/register',
    },
    secondaryCta: {
      label: 'Contact',
      href: '/contact',
    },
  },
  taskSectionHeading: 'Latest {label}',
  taskSectionDescriptionSuffix: 'Browse the newest posts in this section.',
} as const

export const taskPageMetadata: Record<Exclude<TaskKey, 'comment' | 'org' | 'social'>, { title: string; description: string }> = {
  article: {
    title: 'Sport articles & essays',
    description: 'Long-form reporting, match notes, profiles, and culture pieces from the Kayo Sport Connect editorial desk.',
  },
  listing: {
    title: 'Listings and discoverable pages',
    description: 'Explore listings, services, brands, and structured pages organized for easier browsing.',
  },
  classified: {
    title: 'Classifieds and announcements',
    description: 'Browse classifieds, offers, notices, and time-sensitive posts across categories.',
  },
  image: {
    title: 'Sport photography & galleries',
    description: 'Browse match-day albums, training frames, stadium light, and photo essays from contributors.',
  },
  profile: {
    title: 'Profiles and public pages',
    description: 'Discover public profiles, brand pages, and identity-focused posts in one place.',
  },
  sbm: {
    title: 'Curated links and saved resources',
    description: 'Browse useful links, saved references, and curated resources organized for discovery.',
  },
  pdf: {
    title: 'PDFs and downloadable resources',
    description: 'Open reports, documents, and downloadable resources shared across the platform.',
  },
}

export const taskIntroCopy: Record<
  TaskKey,
  { title: string; paragraphs: string[]; links: { label: string; href: string }[] }
> = {
  listing: {
    title: 'Listings, services, and structured pages',
    paragraphs: [
      'Explore listings, services, brands, and discoverable pages across categories. Each entry is organized to make browsing clearer and help visitors quickly understand what a post offers.',
      'Listings connect naturally with articles, images, resources, and other content types so supporting information stays easy to reach from the same platform.',
    ],
    links: [
      { label: 'Open search', href: '/search' },
      { label: 'Home', href: '/' },
    ],
  },
  classified: {
    title: 'Classifieds and short-form notices',
    paragraphs: [
      'Browse offers, announcements, and time-sensitive posts with compact cards and clear category cues.',
      'Classifieds stay visually distinct from gallery and editorial surfaces while remaining part of the same navigation model.',
    ],
    links: [
      { label: 'Search classifieds', href: '/search?task=classified' },
      { label: 'Home', href: '/' },
    ],
  },
  article: {
    title: 'Articles & long-form sport writing',
    paragraphs: [
      'Essays, match reports, and profiles use generous line height and display type so long reads feel like a magazine, not a dashboard.',
      'Move between codes and topics with filters while keeping the same quiet editorial frame.',
    ],
    links: [],
  },
  image: {
    title: 'Sport image gallery',
    paragraphs: [
      'Large thumbnails, tight crops, and light metadata so floodlit grass, skin tones, and crowd colour stay the hero.',
      'Hover and motion stay subtle—built for quick browsing when you are filing between quarters.',
    ],
    links: [],
  },
  profile: {
    title: 'Profiles and identity pages',
    paragraphs: [
      'Profiles highlight people and organizations with portrait-forward layouts and supporting context.',
      'They remain reachable even when not featured in the primary navigation.',
    ],
    links: [
      { label: 'Home', href: '/' },
      { label: 'Search', href: '/search' },
    ],
  },
  sbm: {
    title: 'Bookmarks and curated shelves',
    paragraphs: [
      'Social bookmarking surfaces use tighter density and link-forward cards suited to research workflows.',
      'Collections stay available for direct URLs and search-led discovery.',
    ],
    links: [
      { label: 'Search links', href: '/search?task=sbm' },
      { label: 'Home', href: '/' },
    ],
  },
  pdf: {
    title: 'PDF library',
    paragraphs: [
      'PDF posts use document-forward framing with clear download cues and lighter imagery.',
      'Ideal for reports, worksheets, and reference packs alongside gallery content.',
    ],
    links: [
      { label: 'Search documents', href: '/search?task=pdf' },
      { label: 'Home', href: '/' },
    ],
  },
  org: {
    title: 'Organizations',
    paragraphs: ['Organization profiles group teams and entities in a directory-friendly layout.'],
    links: [{ label: 'Home', href: '/' }],
  },
  social: {
    title: 'Community',
    paragraphs: ['Community posts follow the same modular system with social-specific presentation.'],
    links: [{ label: 'Home', href: '/' }],
  },
  comment: {
    title: 'Comments',
    paragraphs: ['Comment-style posts remain supported for compatibility with the base platform.'],
    links: [{ label: 'Articles', href: '/articles' }],
  },
}
