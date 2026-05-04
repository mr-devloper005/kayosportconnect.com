import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Bookmark, Building2, Compass, FileText, Globe2, Image as ImageIcon, LayoutGrid, MapPin, Quote, ShieldCheck, Tag, User } from 'lucide-react'
import { ContentImage } from '@/components/shared/content-image'
import { NavbarShell } from '@/components/shared/navbar-shell'
import { Footer } from '@/components/shared/footer'
import { SchemaJsonLd } from '@/components/seo/schema-jsonld'
import { TaskPostCard } from '@/components/shared/task-post-card'
import { SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import { buildPageMetadata } from '@/lib/seo'
import { getMockPostsForTask } from '@/lib/mock-posts'
import { fetchTaskPosts } from '@/lib/task-data'
import { siteContent } from '@/config/site.content'
import { cn } from '@/lib/utils'
import { getFactoryState } from '@/design/factory/get-factory-state'
import { getProductKind, type ProductKind } from '@/design/factory/get-product-kind'
import type { SitePost } from '@/lib/site-connector'
import { HOME_PAGE_OVERRIDE_ENABLED, HomePageOverride } from '@/overrides/home-page'
import { defaultAuthorProfile } from '@/config/site.identity'

export const revalidate = 300

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    path: '/',
    title: siteContent.home.metadata.title,
    description: siteContent.home.metadata.description,
    openGraphTitle: siteContent.home.metadata.openGraphTitle,
    openGraphDescription: siteContent.home.metadata.openGraphDescription,
    image: SITE_CONFIG.defaultOgImage,
    keywords: [...siteContent.home.metadata.keywords],
  })
}

type EnabledTask = (typeof SITE_CONFIG.tasks)[number]
type TaskFeedItem = { task: EnabledTask; posts: SitePost[] }

const taskIcons: Record<TaskKey, any> = {
  article: FileText,
  listing: Building2,
  sbm: Bookmark,
  classified: Tag,
  image: ImageIcon,
  profile: User,
  social: Globe2,
  pdf: FileText,
  org: Building2,
  comment: FileText,
}

function resolveTaskKey(value: unknown, fallback: TaskKey): TaskKey {
  if (
    value === 'listing' ||
    value === 'classified' ||
    value === 'article' ||
    value === 'image' ||
    value === 'profile' ||
    value === 'sbm' ||
    value === 'pdf' ||
    value === 'social' ||
    value === 'org' ||
    value === 'comment'
  )
    return value
  return fallback
}

function postTaskKey(post: SitePost): unknown {
  return (post as SitePost & { task?: unknown }).task
}

function deskArticleExcerpt(post: SitePost) {
  const raw = (post.summary || '').trim()
  if (raw) return raw
  const content = post.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
  const desc = typeof content.description === 'string' ? content.description.trim() : ''
  if (desc) return desc.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  return 'Field notes from the Kayo Sport Connect desk—open the story for the full read.'
}

function getTaskHref(task: TaskKey, slug: string) {
  const route = SITE_CONFIG.tasks.find((item) => item.key === task)?.route || `/${task}`
  return `${route}/${slug}`
}

function getPostImage(post?: SitePost | null) {
  const media = Array.isArray(post?.media) ? post?.media : []
  const mediaUrl = media.find((item) => typeof item?.url === 'string' && item.url)?.url
  const contentImage = typeof post?.content === 'object' && post?.content && Array.isArray((post.content as any).images)
    ? (post.content as any).images.find((url: unknown) => typeof url === 'string' && url)
    : null
  const logo = typeof post?.content === 'object' && post?.content && typeof (post.content as any).logo === 'string'
    ? (post.content as any).logo
    : null
  return mediaUrl || contentImage || logo || '/placeholder.svg?height=900&width=1400'
}

function getPostMeta(post?: SitePost | null) {
  if (!post || typeof post.content !== 'object' || !post.content) return { location: '', category: '' }
  const content = post.content as Record<string, unknown>
  return {
    location: typeof content.address === 'string' ? content.address : typeof content.location === 'string' ? content.location : '',
    category: typeof content.category === 'string' ? content.category : typeof post.tags?.[0] === 'string' ? post.tags[0] : '',
  }
}

function getDirectoryTone(brandPack: string) {
  if (brandPack === 'market-utility') {
    return {
      shell: 'bg-[#f5f7f1] text-[#1f2617]',
      hero: 'bg-[linear-gradient(180deg,#eef4e4_0%,#f8faf4_100%)]',
      panel: 'border border-[#d5ddc8] bg-white shadow-[0_24px_64px_rgba(64,76,34,0.08)]',
      soft: 'border border-[#d5ddc8] bg-[#eff3e7]',
      muted: 'text-[#5b664c]',
      title: 'text-[#1f2617]',
      badge: 'bg-[#1f2617] text-[#edf5dc]',
      action: 'bg-[#1f2617] text-[#edf5dc] hover:bg-[#2f3a24]',
      actionAlt: 'border border-[#d5ddc8] bg-white text-[#1f2617] hover:bg-[#eef3e7]',
    }
  }
  return {
    shell: 'bg-[#f8fbff] text-slate-950',
    hero: 'bg-[linear-gradient(180deg,#eef6ff_0%,#ffffff_100%)]',
    panel: 'border border-slate-200 bg-white shadow-[0_24px_64px_rgba(15,23,42,0.08)]',
    soft: 'border border-slate-200 bg-slate-50',
    muted: 'text-slate-600',
    title: 'text-slate-950',
    badge: 'bg-slate-950 text-white',
    action: 'bg-slate-950 text-white hover:bg-slate-800',
    actionAlt: 'border border-slate-200 bg-white text-slate-950 hover:bg-slate-100',
  }
}

function getEditorialTone() {
  return {
    shell: 'bg-[#fbf6ee] text-[#241711]',
    panel: 'border border-[#dcc8b7] bg-[#fffdfa] shadow-[0_24px_60px_rgba(77,47,27,0.08)]',
    soft: 'border border-[#e6d6c8] bg-[#fff4e8]',
    muted: 'text-[#6e5547]',
    title: 'text-[#241711]',
    badge: 'bg-[#241711] text-[#fff1e2]',
    action: 'bg-[#241711] text-[#fff1e2] hover:bg-[#3a241b]',
    actionAlt: 'border border-[#dcc8b7] bg-transparent text-[#241711] hover:bg-[#f5e7d7]',
  }
}

function getVisualTone() {
  return {
    shell: 'bg-[#f7f8f0] text-[#355872]',
    panel: 'border border-[rgb(53_88_114/0.12)] bg-white shadow-[0_22px_60px_rgb(53_88_114/0.08)]',
    soft: 'border border-[rgb(53_88_114/0.1)] bg-[rgb(255_255_255/0.65)]',
    muted: 'text-[rgb(53_88_114/0.72)]',
    title: 'text-[#355872]',
    badge: 'border border-[rgb(53_88_114/0.14)] bg-[rgb(156_213_255/0.35)] text-[#355872]',
    action: 'bg-[#355872] text-white hover:bg-[rgb(45_72_94)]',
    actionAlt: 'border border-[rgb(53_88_114/0.2)] bg-white text-[#355872] hover:bg-[rgb(122_170_206/0.12)]',
    wash: 'bg-[linear-gradient(135deg,rgb(156_213_255/0.35)_0%,transparent_55%)]',
  }
}

function getCurationTone() {
  return {
    shell: 'bg-[#f7f1ea] text-[#261811]',
    panel: 'border border-[#ddcdbd] bg-[#fffaf4] shadow-[0_24px_60px_rgba(91,56,37,0.08)]',
    soft: 'border border-[#e8dbce] bg-[#f3e8db]',
    muted: 'text-[#71574a]',
    title: 'text-[#261811]',
    badge: 'bg-[#5b2b3b] text-[#fff0f5]',
    action: 'bg-[#5b2b3b] text-[#fff0f5] hover:bg-[#74364b]',
    actionAlt: 'border border-[#ddcdbd] bg-transparent text-[#261811] hover:bg-[#efe3d6]',
  }
}

function DirectoryHome({ primaryTask, enabledTasks, listingPosts, classifiedPosts, profilePosts, brandPack }: {
  primaryTask?: EnabledTask
  enabledTasks: EnabledTask[]
  listingPosts: SitePost[]
  classifiedPosts: SitePost[]
  profilePosts: SitePost[]
  brandPack: string
}) {
  const tone = getDirectoryTone(brandPack)
  const featuredListings = (listingPosts.length ? listingPosts : classifiedPosts).slice(0, 3)
  const featuredTaskKey: TaskKey = listingPosts.length ? 'listing' : 'classified'
  const quickRoutes = enabledTasks.slice(0, 4)

  return (
    <main>
      <section className={tone.hero}>
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-18">
          <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
            <div>
              <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] ${tone.badge}`}>
                <Compass className="h-3.5 w-3.5" />
                Local discovery product
              </span>
              <h1 className={`mt-6 max-w-4xl text-5xl font-semibold tracking-[-0.06em] sm:text-6xl ${tone.title}`}>
                Search businesses, compare options, and act fast without digging through generic feeds.
              </h1>
              <p className={`mt-6 max-w-2xl text-base leading-8 ${tone.muted}`}>{SITE_CONFIG.description}</p>

              <div className={`mt-8 grid gap-3 rounded-[2rem] p-4 ${tone.panel} md:grid-cols-[1.25fr_0.8fr_auto]`}>
                <div className="rounded-full bg-black/5 px-4 py-3 text-sm">What do you need today?</div>
                <div className="rounded-full bg-black/5 px-4 py-3 text-sm">Choose area or city</div>
                <Link href={primaryTask?.route || '/listings'} className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold ${tone.action}`}>
                  Browse now
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {[
                  ['Verified businesses', `${featuredListings.length || 3}+ highlighted surfaces`],
                  ['Fast scan rhythm', 'More utility, less filler'],
                  ['Action first', 'Call, visit, shortlist, compare'],
                ].map(([label, value]) => (
                  <div key={label} className={`rounded-[1.4rem] p-4 ${tone.soft}`}>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] opacity-70">{label}</p>
                    <p className="mt-2 text-lg font-semibold">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4">
              <div className={`rounded-[2rem] p-6 ${tone.panel}`}>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] opacity-70">Primary lane</p>
                    <h2 className="mt-2 text-3xl font-semibold">{primaryTask?.label || 'Listings'}</h2>
                  </div>
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <p className={`mt-4 text-sm leading-7 ${tone.muted}`}>{primaryTask?.description || 'Structured discovery for services, offers, and business surfaces.'}</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {quickRoutes.map((task) => {
                  const Icon = taskIcons[task.key as TaskKey] || LayoutGrid
                  return (
                    <Link key={task.key} href={task.route} className={`rounded-[1.6rem] p-5 ${tone.soft}`}>
                      <Icon className="h-5 w-5" />
                      <h3 className="mt-4 text-lg font-semibold">{task.label}</h3>
                      <p className={`mt-2 text-sm leading-7 ${tone.muted}`}>{task.description}</p>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4 border-b border-border pb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Featured businesses</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">Strong listings with clearer trust cues.</h2>
          </div>
          <Link href="/listings" className="text-sm font-semibold text-primary hover:opacity-80">Open listings</Link>
        </div>
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {featuredListings.map((post) => (
            <TaskPostCard key={post.id} post={post} href={getTaskHref(featuredTaskKey, post.slug)} taskKey={featuredTaskKey} />
          ))}
        </div>
      </section>

      <section className={`${tone.shell}`}>
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8">
          <div className={`rounded-[2rem] p-7 ${tone.panel}`}>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] opacity-70">What makes this different</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">Built like a business directory, not a recolored content site.</h2>
            <ul className={`mt-6 space-y-3 text-sm leading-7 ${tone.muted}`}>
              <li>Search-first hero instead of a magazine headline.</li>
              <li>Action-oriented listing cards with trust metadata.</li>
              <li>Support lanes for offers, businesses, and profiles.</li>
            </ul>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {(profilePosts.length ? profilePosts : classifiedPosts).slice(0, 4).map((post) => {
              const meta = getPostMeta(post)
              const taskKey = resolveTaskKey(postTaskKey(post), profilePosts.length ? 'profile' : 'classified')
              return (
                <Link key={post.id} href={getTaskHref(taskKey, post.slug)} className={`overflow-hidden rounded-[1.8rem] ${tone.panel}`}>
                  <div className="relative h-44 overflow-hidden">
                    <ContentImage src={getPostImage(post)} alt={post.title} fill className="object-cover" />
                  </div>
                  <div className="p-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] opacity-70">{meta.category || String(postTaskKey(post) || 'Profile')}</p>
                    <h3 className="mt-2 text-xl font-semibold">{post.title}</h3>
                    <p className={`mt-2 text-sm leading-7 ${tone.muted}`}>{post.summary || 'Quick access to local information and related surfaces.'}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>
    </main>
  )
}

function EditorialHome({ primaryTask, articlePosts, supportTasks }: { primaryTask?: EnabledTask; articlePosts: SitePost[]; supportTasks: EnabledTask[] }) {
  const tone = getEditorialTone()
  const lead = articlePosts[0]
  const side = articlePosts.slice(1, 5)

  return (
    <main className={tone.shell}>
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-18">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
          <div>
            <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] ${tone.badge}`}>
              <FileText className="h-3.5 w-3.5" />
              Reading-first publication
            </span>
            <h1 className={`mt-6 max-w-4xl text-5xl font-semibold tracking-[-0.06em] sm:text-6xl ${tone.title}`}>
              Essays, analysis, and slower reading designed like a publication, not a dashboard.
            </h1>
            <p className={`mt-6 max-w-2xl text-base leading-8 ${tone.muted}`}>{SITE_CONFIG.description}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={primaryTask?.route || '/articles'} className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold ${tone.action}`}>
                Start reading
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/about" className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold ${tone.actionAlt}`}>
                About the publication
              </Link>
            </div>
          </div>

          <aside className={`rounded-[2rem] p-6 ${tone.panel}`}>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] opacity-70">Inside this issue</p>
            <div className="mt-5 space-y-5">
              {side.map((post) => (
                <Link key={post.id} href={`/articles/${post.slug}`} className="block border-b border-black/10 pb-5 last:border-b-0 last:pb-0">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] opacity-60">Feature</p>
                  <h3 className="mt-2 text-xl font-semibold">{post.title}</h3>
                  <p className={`mt-2 text-sm leading-7 ${tone.muted}`}>{post.summary || 'Long-form perspective with a calmer reading rhythm.'}</p>
                </Link>
              ))}
            </div>
          </aside>
        </div>

        {lead ? (
          <div className={`mt-12 overflow-hidden rounded-[2.5rem] ${tone.panel}`}>
            <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
              <div className="relative min-h-[360px] overflow-hidden">
                <ContentImage src={getPostImage(lead)} alt={lead.title} fill className="object-cover" />
              </div>
              <div className="p-8 lg:p-10">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] opacity-70">Lead story</p>
                <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em]">{lead.title}</h2>
                <p className={`mt-4 text-sm leading-8 ${tone.muted}`}>{lead.summary || 'A more deliberate lead story surface with room for a proper narrative setup.'}</p>
                <Link href={`/articles/${lead.slug}`} className={`mt-8 inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold ${tone.action}`}>
                  Read article
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        ) : null}

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {supportTasks.slice(0, 3).map((task) => (
            <Link key={task.key} href={task.route} className={`rounded-[1.8rem] p-6 ${tone.soft}`}>
              <h3 className="text-xl font-semibold">{task.label}</h3>
              <p className={`mt-3 text-sm leading-7 ${tone.muted}`}>{task.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}

function VisualHome({ primaryTask, imagePosts: _imagePosts, profilePosts, articlePosts }: { primaryTask?: EnabledTask; imagePosts: SitePost[]; profilePosts: SitePost[]; articlePosts: SitePost[] }) {
  const tone = getVisualTone()
  const articles = articlePosts.slice(0, 4)
  const articleTask = SITE_CONFIG.tasks.find((t) => t.key === 'article' && t.enabled)
  const deskArticles = articlePosts.length > 0 ? articlePosts.slice(0, 3) : getMockPostsForTask('article').slice(0, 3)

  return (
    <main className={tone.shell}>
      <section className="relative overflow-hidden border-b border-[rgb(53_88_114/0.08)]">
        <div className={`pointer-events-none absolute inset-0 ${tone.wash}`} aria-hidden />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35] mix-blend-multiply"
          style={{
            backgroundImage: `radial-gradient(circle at 18% 22%, rgb(156 213 255 / 0.22) 0%, transparent 42%),
              radial-gradient(circle at 88% 12%, rgb(122 170 206 / 0.18) 0%, transparent 38%),
              radial-gradient(circle at 72% 78%, rgb(53 88 114 / 0.06) 0%, transparent 45%)`,
          }}
          aria-hidden
        />
        <div className="pointer-events-none absolute left-0 top-0 h-full w-[min(42%,28rem)] border-r border-[rgb(53_88_114/0.06)] opacity-60 max-lg:hidden" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-28">
          <div
            className={cn(
              'grid grid-cols-1 items-stretch gap-12 lg:gap-12 xl:gap-14',
              articleTask ? 'lg:grid-cols-2 lg:items-center' : '',
            )}
          >
            <div className="relative order-1 flex flex-col justify-center lg:py-2 xl:py-4">
              <div
                className="absolute -left-4 top-6 hidden h-[calc(100%-3rem)] w-px bg-[linear-gradient(180deg,#7aaace_0%,rgb(156_213_255/0.35)_45%,transparent_100%)] sm:block lg:-left-2"
                aria-hidden
              />
              <div className="relative rounded-2xl border border-[rgb(53_88_114/0.08)] bg-[linear-gradient(165deg,rgb(255_255_255/0.97)_0%,rgb(252_253_251/0.88)_55%,rgb(247_248_240/0.92)_100%)] p-8 shadow-[0_24px_60px_-24px_rgb(53_88_114/0.18)] sm:p-10 lg:rounded-3xl lg:p-11">
                <p className="inline-flex items-center gap-2 font-sans text-[10px] font-bold uppercase tracking-[0.32em] text-[rgb(53_88_114/0.5)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#7aaace]" aria-hidden />
                  {SITE_CONFIG.name}
                </p>
                <h1 className="mt-6 font-display text-[2.1rem] font-semibold leading-[1.05] tracking-[-0.04em] text-[#355872] sm:text-[2.55rem] lg:text-[2.85rem]">
                  <span className="block bg-[linear-gradient(120deg,#355872_0%,#4a6d8a_40%,#355872_100%)] bg-clip-text text-transparent">
                    Frames that carry weight.
                  </span>
                  <span className="mt-3 block text-[1.35rem] font-medium leading-snug tracking-[-0.03em] text-[rgb(53_88_114/0.88)] sm:text-[1.55rem] lg:text-[1.65rem]">
                    Stories that carry context.
                  </span>
                </h1>
                <p className={`mt-7 max-w-[26rem] border-t border-[rgb(53_88_114/0.08)] pt-7 font-sans text-[0.95rem] leading-[1.75] sm:text-base ${tone.muted}`}>
                  {SITE_CONFIG.description}
                </p>
                <div className="mt-9 flex flex-wrap items-center gap-3 sm:gap-4">
                  <Link
                    href={primaryTask?.route || '/images'}
                    className={`inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold tracking-wide shadow-[0_12px_32px_-8px_rgb(53_88_114/0.35)] transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[0_16px_40px_-8px_rgb(53_88_114/0.4)] ${tone.action}`}
                  >
                    Browse images
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  {articleTask ? (
                    <Link
                      href={articleTask.route}
                      className={`inline-flex items-center gap-2 rounded-full border border-[rgb(53_88_114/0.16)] bg-white/90 px-7 py-3.5 text-sm font-semibold shadow-sm backdrop-blur-sm transition hover:border-[rgb(122_170_206/0.45)] hover:bg-white ${tone.actionAlt}`}
                    >
                      Read articles
                    </Link>
                  ) : null}
                </div>
              </div>
            </div>

            {articleTask ? (
              <aside className="relative order-2 flex w-full flex-col rounded-[1.65rem] border border-[rgb(53_88_114/0.09)] bg-[linear-gradient(165deg,rgb(255_255_255/0.98)_0%,rgb(247_248_240/0.95)_42%,rgb(236_244_252/0.9)_100%)] p-6 shadow-[0_28px_64px_-36px_rgb(53_88_114/0.38)] ring-1 ring-[rgb(255_255_255/0.65)] backdrop-blur-md sm:rounded-[1.85rem] sm:p-8 lg:max-w-none lg:self-stretch">
                <div className="absolute -right-4 top-8 hidden h-32 w-32 rounded-full bg-[rgb(156_213_255/0.22)] blur-3xl lg:block" aria-hidden />
                <div className="relative flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                  <div className="min-w-0">
                    <p className="font-sans text-[10px] font-bold uppercase tracking-[0.32em] text-[rgb(53_88_114/0.4)]">Reader&apos;s desk</p>
                    <p className="mt-2 font-display text-2xl font-semibold leading-[1.12] tracking-[-0.03em] text-[#355872] sm:text-[1.65rem]">
                      Latest reads &amp; pull quotes
                    </p>
                    <p className="mt-3 max-w-md font-sans text-[12px] leading-relaxed text-[rgb(53_88_114/0.55)]">
                      Straight from your CMS—edit an article and it shows here after the site refreshes (about every few minutes).
                    </p>
                  </div>
                  <div className="mt-3 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[rgb(122_170_206/0.16)] text-[#5a8ab8] ring-1 ring-[rgb(122_170_206/0.28)] sm:mt-0">
                    <Quote className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                  </div>
                </div>
                <ul className="relative mt-8 flex flex-col gap-4">
                  {deskArticles.map((post) => {
                    const byline = (post.authorName || defaultAuthorProfile.name || 'Editorial').trim()
                    const excerpt = deskArticleExcerpt(post)
                    const clip = excerpt.length > 118 ? `${excerpt.slice(0, 115).trimEnd()}…` : excerpt
                    return (
                      <li key={post.id}>
                        <Link
                          href={`/articles/${post.slug}`}
                          className="group relative flex gap-4 overflow-hidden rounded-2xl border border-[rgb(53_88_114/0.08)] bg-white/85 p-4 pl-5 shadow-[0_10px_28px_-18px_rgb(53_88_114/0.22)] transition duration-200 hover:border-[rgb(122_170_206/0.45)] hover:bg-white hover:shadow-[0_16px_36px_-20px_rgb(53_88_114/0.28)]"
                        >
                          <span
                            className="absolute left-0 top-4 bottom-4 w-1 rounded-full bg-[linear-gradient(180deg,#355872_0%,#7aaace_55%,#9cd5ff_100%)] opacity-80 transition group-hover:opacity-100"
                            aria-hidden
                          />
                          <div className="relative ml-0.5 h-[4.5rem] w-[4.5rem] shrink-0 overflow-hidden rounded-xl bg-[rgb(122_170_206/0.1)] ring-1 ring-[rgb(53_88_114/0.06)] sm:h-[5.25rem] sm:w-[5.25rem]">
                            <ContentImage src={getPostImage(post)} alt="" fill className="object-cover transition duration-300 group-hover:scale-105" sizes="(max-width:768px)72px,84px" />
                          </div>
                          <div className="min-w-0 flex-1 py-0.5">
                            <p className="font-display text-[14px] font-medium italic leading-snug text-[rgb(53_88_114/0.82)] sm:text-[15px]">&ldquo;{clip}&rdquo;</p>
                            <p className="mt-2.5 line-clamp-2 text-xs font-semibold uppercase tracking-[0.07em] text-[#355872]">{post.title}</p>
                            <p className="mt-1.5 text-[11px] font-medium text-[rgb(53_88_114/0.44)]">{byline}</p>
                          </div>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
                <Link
                  href={articleTask.route}
                  className="relative mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full border border-[rgb(53_88_114/0.12)] bg-[#355872] px-5 py-3.5 font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-white shadow-[0_12px_28px_-12px_rgb(53_88_114/0.45)] transition hover:bg-[#2d4a63] sm:w-auto sm:self-start"
                >
                  All articles
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </aside>
            ) : null}
          </div>
        </div>
      </section>

      {articles.length ? (
        <section className="border-b border-[rgb(53_88_114/0.08)] bg-white">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="flex flex-col justify-between gap-6 border-b border-[rgb(53_88_114/0.1)] pb-8 md:flex-row md:items-end">
              <div>
                <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.32em] text-[rgb(53_88_114/0.5)]">Articles</p>
                <h2 className="mt-3 max-w-xl text-3xl font-semibold tracking-[-0.03em] text-[#355872] sm:text-4xl">Writing with room to breathe.</h2>
              </div>
              {articleTask ? (
                <Link href={articleTask.route} className={`inline-flex w-fit items-center gap-2 rounded-md px-5 py-2.5 font-sans text-sm font-semibold ${tone.actionAlt}`}>
                  View all
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : null}
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {articles.map((post) => (
                <Link
                  key={post.id}
                  href={`/articles/${post.slug}`}
                  className={cn(
                    'group grid gap-5 rounded-2xl border border-[rgb(53_88_114/0.1)] bg-[#f7f8f0] p-5 transition sm:grid-cols-[minmax(0,0.42fr)_1fr] sm:p-6',
                    'hover:border-[rgb(122_170_206/0.45)] hover:shadow-[0_16px_40px_rgb(53_88_114/0.07)]',
                  )}
                >
                  <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-[rgb(122_170_206/0.15)]">
                    <ContentImage src={getPostImage(post)} alt={post.title} fill className="object-cover transition duration-500 group-hover:scale-[1.02]" />
                  </div>
                  <div className="flex min-w-0 flex-col justify-center">
                    <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.28em] text-[rgb(53_88_114/0.45)]">Essay</p>
                    <h3 className="mt-2 text-xl font-semibold leading-snug tracking-[-0.02em] text-[#355872] sm:text-2xl">{post.title}</h3>
                    <p className={`mt-3 line-clamp-3 font-sans text-sm leading-relaxed ${tone.muted}`}>{post.summary || 'A slower read with editorial spacing and clear hierarchy.'}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {profilePosts.length ? (
        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className={`rounded-2xl p-8 sm:p-10 ${tone.panel}`}>
            <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.28em] text-[rgb(53_88_114/0.5)]">Profiles</p>
            <h2 className="mt-3 max-w-2xl text-2xl font-semibold tracking-[-0.03em] text-[#355872] sm:text-3xl">People behind the lens.</h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {profilePosts.slice(0, 3).map((post) => (
                <Link key={post.id} href={`/profile/${post.slug}`} className={`rounded-xl border border-[rgb(53_88_114/0.08)] bg-[rgb(247_248_240/0.8)] p-4 transition hover:border-[rgb(122_170_206/0.4)]`}>
                  <div className="relative h-36 overflow-hidden rounded-lg">
                    <ContentImage src={getPostImage(post)} alt={post.title} fill className="object-cover" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-[#355872]">{post.title}</h3>
                  <p className={`mt-2 line-clamp-2 font-sans text-sm ${tone.muted}`}>{post.summary || 'Public profile and portfolio surface.'}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </main>
  )
}

function CurationHome({ primaryTask, bookmarkPosts, profilePosts, articlePosts }: { primaryTask?: EnabledTask; bookmarkPosts: SitePost[]; profilePosts: SitePost[]; articlePosts: SitePost[] }) {
  const tone = getCurationTone()
  const collections = bookmarkPosts.length ? bookmarkPosts.slice(0, 4) : articlePosts.slice(0, 4)
  const people = profilePosts.slice(0, 3)

  return (
    <main className={tone.shell}>
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-18">
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-start">
          <div>
            <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] ${tone.badge}`}>
              <Bookmark className="h-3.5 w-3.5" />
              Curated collections
            </span>
            <h1 className={`mt-6 max-w-4xl text-5xl font-semibold tracking-[-0.06em] sm:text-6xl ${tone.title}`}>
              Save, organize, and revisit resources through shelves, boards, and curated collections.
            </h1>
            <p className={`mt-6 max-w-2xl text-base leading-8 ${tone.muted}`}>{SITE_CONFIG.description}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={primaryTask?.route || '/sbm'} className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold ${tone.action}`}>
                Open collections
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/profile" className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold ${tone.actionAlt}`}>
                Explore curators
              </Link>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {collections.map((post) => (
              <Link key={post.id} href={getTaskHref(resolveTaskKey(postTaskKey(post), 'sbm'), post.slug)} className={`rounded-[1.8rem] p-6 ${tone.panel}`}>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] opacity-70">Collection</p>
                <h3 className="mt-3 text-2xl font-semibold">{post.title}</h3>
                <p className={`mt-3 text-sm leading-8 ${tone.muted}`}>{post.summary || 'A calmer bookmark surface with room for context and grouping.'}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className={`rounded-[2rem] p-7 ${tone.panel}`}>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] opacity-70">Why this feels different</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">More like saved boards and reading shelves than a generic post feed.</h2>
            <p className={`mt-4 max-w-2xl text-sm leading-8 ${tone.muted}`}>The structure is calmer, the cards are less noisy, and the page encourages collecting and returning instead of forcing everything into a fast-scrolling list.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {people.map((post) => (
              <Link key={post.id} href={`/profile/${post.slug}`} className={`rounded-[1.8rem] p-5 ${tone.soft}`}>
                <div className="relative h-32 overflow-hidden rounded-[1.2rem]">
                  <ContentImage src={getPostImage(post)} alt={post.title} fill className="object-cover" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{post.title}</h3>
                <p className={`mt-2 text-sm leading-7 ${tone.muted}`}>Curator profile, saved resources, and collection notes.</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

export default async function HomePage() {
  if (HOME_PAGE_OVERRIDE_ENABLED) {
    return <HomePageOverride />
  }

  const enabledTasks = SITE_CONFIG.tasks.filter((task) => task.enabled)
  const { recipe } = getFactoryState()
  const productKind = getProductKind(recipe)
  const taskFeed: TaskFeedItem[] = (
    await Promise.all(
      enabledTasks.map(async (task) => ({
        task,
        posts: await fetchTaskPosts(task.key, 8, { allowMockFallback: false, fresh: true }),
      }))
    )
  ).filter(({ posts }) => posts.length)

  const primaryTask = enabledTasks.find((task) => task.key === recipe.primaryTask) || enabledTasks[0]
  const supportTasks = enabledTasks.filter((task) => task.key !== primaryTask?.key)
  const listingPosts = taskFeed.find(({ task }) => task.key === 'listing')?.posts || []
  const classifiedPosts = taskFeed.find(({ task }) => task.key === 'classified')?.posts || []
  const articlePosts = taskFeed.find(({ task }) => task.key === 'article')?.posts || []
  const imagePosts = taskFeed.find(({ task }) => task.key === 'image')?.posts || []
  const profilePosts = taskFeed.find(({ task }) => task.key === 'profile')?.posts || []
  const bookmarkPosts = taskFeed.find(({ task }) => task.key === 'sbm')?.posts || []

  const schemaData = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.baseUrl,
      logo: `${SITE_CONFIG.baseUrl.replace(/\/$/, '')}${SITE_CONFIG.defaultOgImage}`,
      sameAs: [],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.baseUrl,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${SITE_CONFIG.baseUrl.replace(/\/$/, '')}/search?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      <NavbarShell />
      <SchemaJsonLd data={schemaData} />
      {productKind === 'directory' ? (
        <DirectoryHome
          primaryTask={primaryTask}
          enabledTasks={enabledTasks}
          listingPosts={listingPosts}
          classifiedPosts={classifiedPosts}
          profilePosts={profilePosts}
          brandPack={recipe.brandPack}
        />
      ) : null}
      {productKind === 'editorial' ? (
        <EditorialHome primaryTask={primaryTask} articlePosts={articlePosts} supportTasks={supportTasks} />
      ) : null}
      {productKind === 'visual' ? (
        <VisualHome primaryTask={primaryTask} imagePosts={imagePosts} profilePosts={profilePosts} articlePosts={articlePosts} />
      ) : null}
      {productKind === 'curation' ? (
        <CurationHome primaryTask={primaryTask} bookmarkPosts={bookmarkPosts} profilePosts={profilePosts} articlePosts={articlePosts} />
      ) : null}
      <Footer />
    </div>
  )
}
