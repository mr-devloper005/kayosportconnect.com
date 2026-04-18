'use client'

import { useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { Search, Menu, X, User, FileText, Building2, LayoutGrid, Tag, Image as ImageIcon, Sparkles, MapPin, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import { SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import { cn } from '@/lib/utils'
import { siteContent } from '@/config/site.content'
import { siteIdentity } from '@/config/site.identity'
import { getFactoryState } from '@/design/factory/get-factory-state'
import { NAVBAR_OVERRIDE_ENABLED, NavbarOverride } from '@/overrides/navbar'

const NavbarAuthControls = dynamic(() => import('@/components/shared/navbar-auth-controls').then((mod) => mod.NavbarAuthControls), {
  ssr: false,
  loading: () => null,
})

const taskIcons: Record<TaskKey, any> = {
  article: FileText,
  listing: Building2,
  sbm: LayoutGrid,
  classified: Tag,
  image: ImageIcon,
  profile: User,
  social: LayoutGrid,
  pdf: FileText,
  org: Building2,
  comment: FileText,
}

const variantClasses = {
  'compact-bar': {
    shell: 'border-b border-slate-200/80 bg-white/88 text-slate-950 backdrop-blur-xl',
    logo: 'rounded-2xl border border-slate-200 bg-white shadow-sm',
    active: 'bg-slate-950 text-white',
    idle: 'text-slate-600 hover:bg-slate-100 hover:text-slate-950',
    cta: 'rounded-full bg-slate-950 text-white hover:bg-slate-800',
    mobile: 'border-t border-slate-200/70 bg-white/95',
  },
  'editorial-bar': {
    shell: 'border-b border-[#d7c4b3] bg-[#fff7ee]/90 text-[#2f1d16] backdrop-blur-xl',
    logo: 'rounded-full border border-[#dbc6b6] bg-white shadow-sm',
    active: 'bg-[#2f1d16] text-[#fff4e4]',
    idle: 'text-[#72594a] hover:bg-[#f2e5d4] hover:text-[#2f1d16]',
    cta: 'rounded-full bg-[#2f1d16] text-[#fff4e4] hover:bg-[#452920]',
    mobile: 'border-t border-[#dbc6b6] bg-[#fff7ee]',
  },
  'floating-bar': {
    shell: 'border-b border-transparent bg-transparent text-white',
    logo: 'rounded-[1.35rem] border border-white/12 bg-white/8 shadow-[0_16px_48px_rgba(15,23,42,0.22)] backdrop-blur',
    active: 'bg-[#8df0c8] text-[#07111f]',
    idle: 'text-slate-200 hover:bg-white/10 hover:text-white',
    cta: 'rounded-full bg-[#8df0c8] text-[#07111f] hover:bg-[#77dfb8]',
    mobile: 'border-t border-white/10 bg-[#09101d]/96',
  },
  'floating-bar-gallery': {
    shell: 'border-b border-[rgb(53_88_114/0.06)] bg-[rgb(255_255_255/0.82)] text-[#355872] shadow-[0_1px_0_rgb(53_88_114/0.04)] backdrop-blur-2xl supports-[backdrop-filter]:bg-[rgb(255_255_255/0.72)]',
    logo: 'rounded-2xl border border-[rgb(53_88_114/0.1)] bg-white shadow-[0_8px_28px_rgb(53_88_114/0.08),inset_0_1px_0_rgb(255_255_255/0.9)] ring-1 ring-[rgb(53_88_114/0.04)]',
    active: 'bg-[#355872] text-white shadow-sm',
    idle: 'text-[rgb(53_88_114/0.72)] hover:bg-[rgb(122_170_206/0.18)] hover:text-[#355872]',
    cta: 'rounded-full bg-[#355872] px-5 text-white shadow-[0_8px_24px_rgb(53_88_114/0.22)] transition-[box-shadow,transform,background-color] hover:bg-[rgb(45_72_94)] hover:shadow-[0_10px_28px_rgb(53_88_114/0.28)] active:translate-y-px',
    mobile: 'border-t border-[rgb(53_88_114/0.08)] bg-[rgb(252_253_251/0.96)] backdrop-blur-2xl',
  },
  'utility-bar': {
    shell: 'border-b border-[#d7deca] bg-[#f4f6ef]/94 text-[#1f2617] backdrop-blur-xl',
    logo: 'rounded-xl border border-[#d7deca] bg-white shadow-sm',
    active: 'bg-[#1f2617] text-[#edf5dc]',
    idle: 'text-[#56604b] hover:bg-[#e7edd9] hover:text-[#1f2617]',
    cta: 'rounded-lg bg-[#1f2617] text-[#edf5dc] hover:bg-[#2f3a24]',
    mobile: 'border-t border-[#d7deca] bg-[#f4f6ef]',
  },
} as const

const directoryPalette = {
  'directory-clean': {
    shell: 'border-b border-slate-200 bg-white/94 text-slate-950 shadow-[0_1px_0_rgba(15,23,42,0.04)] backdrop-blur-xl',
    logo: 'rounded-2xl border border-slate-200 bg-slate-50',
    nav: 'text-slate-600 hover:text-slate-950',
    search: 'border border-slate-200 bg-slate-50 text-slate-600',
    cta: 'bg-slate-950 text-white hover:bg-slate-800',
    post: 'border border-slate-200 bg-white text-slate-950 hover:bg-slate-50',
    mobile: 'border-t border-slate-200 bg-white',
  },
  'market-utility': {
    shell: 'border-b border-[#d7deca] bg-[#f4f6ef]/96 text-[#1f2617] shadow-[0_1px_0_rgba(64,76,34,0.06)] backdrop-blur-xl',
    logo: 'rounded-xl border border-[#d7deca] bg-white',
    nav: 'text-[#56604b] hover:text-[#1f2617]',
    search: 'border border-[#d7deca] bg-white text-[#56604b]',
    cta: 'bg-[#1f2617] text-[#edf5dc] hover:bg-[#2f3a24]',
    post: 'border border-[#d7deca] bg-white text-[#1f2617] hover:bg-[#eef2e4]',
    mobile: 'border-t border-[#d7deca] bg-[#f4f6ef]',
  },
} as const

export function Navbar() {
  if (NAVBAR_OVERRIDE_ENABLED) {
    return <NavbarOverride />
  }

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { isAuthenticated } = useAuth()
  const { recipe } = getFactoryState()

  const navigation = useMemo(() => SITE_CONFIG.tasks.filter((task) => task.enabled && task.key !== 'profile'), [])
  const primaryNavigation = useMemo(() => {
    const primary = recipe.primaryTask
    const secondary = recipe.secondaryTask
    const primaryItem = navigation.find((t) => t.key === primary)
    const secondaryItem = secondary ? navigation.find((t) => t.key === secondary) : null
    const rest = navigation.filter((t) => t.key !== primary && t.key !== secondary)
    const ordered = [primaryItem, secondaryItem, ...rest].filter(Boolean) as typeof navigation
    return ordered.length ? ordered : navigation
  }, [navigation, recipe.primaryTask, recipe.secondaryTask])
  const mobileNavigation = primaryNavigation.map((task) => ({
    name: task.label,
    href: task.route,
    icon: taskIcons[task.key] || LayoutGrid,
  }))
  const primaryTask = SITE_CONFIG.tasks.find((task) => task.key === recipe.primaryTask && task.enabled) || primaryNavigation[0]
  const isDirectoryProduct = recipe.homeLayout === 'listing-home' || recipe.homeLayout === 'classified-home'

  if (isDirectoryProduct) {
    const palette = directoryPalette[(recipe.brandPack === 'market-utility' ? 'market-utility' : 'directory-clean') as keyof typeof directoryPalette]

    return (
      <header className={cn('sticky top-0 z-50 w-full', palette.shell)}>
        <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-4">
            <Link href="/" className="flex shrink-0 items-center gap-3">
              <div className={cn('flex h-12 w-12 items-center justify-center overflow-hidden p-1.5', palette.logo)}>
                <img src={siteIdentity.brandMark} alt="" width="48" height="48" className="h-full w-full object-contain" />
              </div>
              <div className="min-w-0 hidden sm:block">
                <span className="block truncate text-xl font-semibold">{SITE_CONFIG.name}</span>
                <span className="block text-[10px] uppercase tracking-[0.24em] opacity-60">{siteContent.navbar.tagline}</span>
              </div>
            </Link>

            <div className="hidden items-center gap-5 xl:flex">
              {primaryNavigation.slice(0, 4).map((task) => {
                const isActive = pathname.startsWith(task.route)
                return (
                  <Link key={task.key} href={task.route} className={cn('text-sm font-semibold transition-colors', isActive ? 'text-foreground' : palette.nav)}>
                    {task.label}
                  </Link>
                )
              })}
            </div>
          </div>

          <div className="hidden min-w-0 flex-1 items-center justify-center lg:flex">
            <div className={cn('flex w-full max-w-xl items-center gap-3 rounded-full px-4 py-3', palette.search)}>
              <Search className="h-4 w-4" />
              <span className="text-sm">Find businesses, spaces, and local services</span>
              <div className="ml-auto hidden items-center gap-1 text-xs opacity-75 md:flex">
                <MapPin className="h-3.5 w-3.5" />
                Local discovery
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {primaryTask ? (
              <Link href={primaryTask.route} className="hidden items-center gap-2 rounded-full border border-current/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] opacity-75 md:inline-flex">
                <Sparkles className="h-3.5 w-3.5" />
                {primaryTask.label}
              </Link>
            ) : null}

            {isAuthenticated ? (
              <NavbarAuthControls />
            ) : (
              <div className="hidden items-center gap-2 md:flex">
                <Button variant="ghost" size="sm" asChild className="rounded-full px-4">
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button size="sm" asChild className={cn('rounded-full', palette.cta)}>
                  <Link href="/register">
                    <Plus className="mr-1 h-4 w-4" />
                    Add Listing
                  </Link>
                </Button>
              </div>
            )}

            <Button variant="ghost" size="icon" className="rounded-full lg:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </nav>

        {isMobileMenuOpen && (
          <div className={palette.mobile}>
            <div className="space-y-2 px-4 py-4">
              <div className={cn('mb-3 flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium', palette.search)}>
                <Search className="h-4 w-4" />
                Find businesses, spaces, and services
              </div>
              {mobileNavigation.map((item) => {
                const isActive = pathname.startsWith(item.href)
                return (
                  <Link key={item.name} href={item.href} onClick={() => setIsMobileMenuOpen(false)} className={cn('flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-colors', isActive ? 'bg-foreground text-background' : palette.post)}>
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </header>
    )
  }

  const galleryCream = recipe.brandPack === 'gallery-cream'
  const style =
    recipe.navbar === 'floating-bar' && galleryCream
      ? variantClasses['floating-bar-gallery']
      : variantClasses[recipe.navbar]
  const isFloating = recipe.navbar === 'floating-bar'
  const isEditorial = recipe.navbar === 'editorial-bar'
  const isUtility = recipe.navbar === 'utility-bar'
  const navSearchDefaultQ = pathname.startsWith('/search') ? (searchParams.get('q') || '').trim() : ''
  const navSearchDefaultTask = pathname.startsWith('/search') ? (searchParams.get('task') || '').trim().toLowerCase() : ''

  return (
    <header className={cn('sticky top-0 z-50 w-full', style.shell)}>
      <nav
        className={cn(
          'mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8',
          isFloating && galleryCream ? 'min-h-[5rem] py-3 lg:min-h-[5.25rem]' : isFloating ? 'h-24 pt-4' : 'h-20',
        )}
      >
        <div className={cn('flex min-w-0 items-center gap-3 sm:gap-4 lg:gap-7', !(isFloating && galleryCream) && 'flex-1', isFloating && galleryCream && 'shrink-0')}>
          {isFloating && galleryCream ? (
            <Link
              href="/"
              className="group flex min-w-0 shrink-0 items-center gap-3 pr-1 sm:gap-4 sm:pr-2 md:gap-5"
            >
              <div className="relative shrink-0">
                <div
                  className="pointer-events-none absolute -inset-1 rounded-2xl bg-[linear-gradient(145deg,rgb(156_213_255/0.65)_0%,rgb(122_170_206/0.4)_50%,rgb(53_88_114/0.15)_100%)] opacity-95 blur-[2px]"
                  aria-hidden
                />
                <div
                  className={cn(
                    'relative flex shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white',
                    'h-[3.25rem] w-[3.25rem] sm:h-[3.75rem] sm:w-[3.75rem] md:h-16 md:w-16',
                    'shadow-[0_12px_32px_-8px_rgb(53_88_114/0.28),inset_0_1px_0_rgb(255_255_255/1),inset_0_-1px_0_rgb(53_88_114/0.04)]',
                    'ring-[1.5px] ring-[rgb(122_170_206/0.35)] ring-offset-[3px] ring-offset-[rgb(252_253_251/0.95)]',
                    'transition-shadow duration-300 group-hover:shadow-[0_16px_40px_-8px_rgb(53_88_114/0.32)]',
                  )}
                >
                  <img
                    src={siteIdentity.brandMark}
                    alt={`${SITE_CONFIG.name} mark`}
                    width={64}
                    height={64}
                    className="h-full w-full object-contain p-1 sm:p-1.5 md:p-2"
                  />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <span
                  className={cn(
                    'font-display block truncate text-[1.2rem] font-semibold leading-[1.12] tracking-[-0.035em]',
                    'text-[#2a4a66] sm:text-[1.38rem] md:text-[1.48rem]',
                    '[text-shadow:0_1px_0_rgb(255_255_255/0.95),0_2px_14px_rgb(53_88_114/0.08)]',
                  )}
                >
                  {SITE_CONFIG.name}
                </span>
                <span className="mt-1.5 flex min-w-0 items-center gap-2 sm:mt-2">
                  <span
                    className="h-[3px] w-6 shrink-0 rounded-full bg-[linear-gradient(90deg,#355872_0%,#7aaace_55%,rgb(156_213_255/0.35)_100%)] sm:w-8"
                    aria-hidden
                  />
                  <span className="min-w-0 truncate text-[10px] font-bold uppercase leading-snug tracking-[0.16em] text-[rgb(53_88_114/0.78)] sm:text-[11px] sm:tracking-[0.18em] md:text-[12px] md:tracking-[0.2em]">
                    {siteContent.navbar.tagline}
                  </span>
                </span>
              </div>
            </Link>
          ) : (
            <Link href="/" className="group flex shrink-0 items-center gap-3 whitespace-nowrap pr-1 sm:gap-3.5 sm:pr-2">
              <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden p-1.5', style.logo)}>
                <img src={siteIdentity.brandMark} alt="" width="48" height="48" className="h-full w-full object-contain" />
              </div>
              <div className="min-w-0 hidden sm:block">
                <span className="block truncate text-xl font-semibold">{SITE_CONFIG.name}</span>
                <span className="block text-[10px] uppercase tracking-[0.24em] opacity-60">{siteContent.navbar.tagline}</span>
              </div>
            </Link>
          )}

          {isEditorial ? (
            <div className="hidden min-w-0 flex-1 items-center gap-4 xl:flex">
              <div className="h-px flex-1 bg-[#d8c8bb]" />
              {primaryNavigation.map((task) => {
                const isActive = pathname.startsWith(task.route)
                return (
                  <Link key={task.key} href={task.route} className={cn('text-sm font-semibold uppercase tracking-[0.18em] transition-colors', isActive ? 'text-[#2f1d16]' : 'text-[#7b6254] hover:text-[#2f1d16]')}>
                    {task.label}
                  </Link>
                )
              })}
              <div className="h-px flex-1 bg-[#d8c8bb]" />
            </div>
          ) : isFloating && galleryCream ? (
            <form
              key={`${navSearchDefaultQ}-${navSearchDefaultTask}`}
              method="get"
              action="/search"
              className="mx-auto hidden min-w-0 flex-1 flex-col gap-1.5 md:mx-4 md:flex lg:mx-6 lg:max-w-[min(40rem,calc(100%-11rem)))]"
            >
              <input type="hidden" name="master" value="1" />
              <p className="hidden pl-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-[rgb(53_88_114/0.42)] lg:block">Search images or articles</p>
              <div className="flex w-full flex-col gap-2 rounded-[1.35rem] border border-[rgb(53_88_114/0.1)] bg-[rgb(255_255_255/0.94)] p-1.5 pl-2 shadow-[inset_0_1px_0_rgb(255_255_255/1),0_12px_40px_-14px_rgb(53_88_114/0.2)] transition-[border-color,box-shadow] focus-within:border-[rgb(122_170_206/0.4)] focus-within:shadow-[inset_0_1px_0_rgb(255_255_255/1),0_16px_48px_-12px_rgb(53_88_114/0.24)] sm:flex-row sm:items-center sm:gap-1 sm:rounded-full sm:pl-2">
                <fieldset className="flex shrink-0 flex-wrap items-center gap-1 border-0 p-0 sm:pl-1">
                  <legend className="sr-only">Search in</legend>
                  {(
                    [
                      { value: '', label: 'All', Icon: LayoutGrid },
                      { value: 'image', label: 'Images', Icon: ImageIcon },
                      { value: 'article', label: 'Articles', Icon: FileText },
                    ] as const
                  ).map(({ value, label, Icon }) => (
                    <label
                      key={value || 'all'}
                      className="relative cursor-pointer select-none rounded-full px-0.5 py-0.5 has-[input:checked]:bg-[rgb(53_88_114/0.06)]"
                    >
                      <input
                        type="radio"
                        name="task"
                        value={value}
                        defaultChecked={
                          value === 'image'
                            ? navSearchDefaultTask === 'image'
                            : value === 'article'
                              ? navSearchDefaultTask === 'article'
                              : navSearchDefaultTask !== 'image' && navSearchDefaultTask !== 'article'
                        }
                        className="peer sr-only"
                      />
                      <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[rgb(53_88_114/0.55)] transition-colors peer-checked:bg-[#355872] peer-checked:text-white peer-checked:shadow-sm sm:px-3 sm:py-2 sm:text-[11px]">
                        <Icon className="h-3 w-3 opacity-80 sm:h-3.5 sm:w-3.5" strokeWidth={2.25} />
                        {label}
                      </span>
                    </label>
                  ))}
                </fieldset>
                <div className="mx-1 hidden h-7 w-px shrink-0 bg-[rgb(53_88_114/0.08)] sm:block" aria-hidden />
                <label className="flex min-w-0 flex-1 cursor-text items-center gap-2 rounded-full bg-[rgb(247_248_240/0.5)] px-2.5 py-1 sm:bg-transparent sm:px-1 sm:py-0">
                  <span className="sr-only">Search query</span>
                  <Search className="h-[15px] w-[15px] shrink-0 text-[rgb(53_88_114/0.3)]" strokeWidth={2} aria-hidden />
                  <input
                    type="search"
                    name="q"
                    defaultValue={navSearchDefaultQ}
                    placeholder={siteContent.hero.searchPlaceholder}
                    className="h-9 min-w-0 flex-1 border-0 bg-transparent py-2 text-[14px] leading-snug text-[#355872] outline-none placeholder:text-[rgb(53_88_114/0.38)] sm:h-10 sm:text-[15px]"
                    autoComplete="off"
                  />
                </label>
                <button
                  type="submit"
                  className="shrink-0 rounded-full bg-[#355872] px-4 py-2.5 text-[13px] font-semibold tracking-wide text-white transition-[background-color,transform] hover:bg-[rgb(45_72_94)] active:scale-[0.98] sm:py-2.5 sm:text-sm"
                >
                  Search
                </button>
              </div>
            </form>
          ) : isFloating ? (
            <div className="hidden min-w-0 flex-1 items-center gap-2 xl:flex">
              {primaryNavigation.map((task) => {
                const Icon = taskIcons[task.key] || LayoutGrid
                const isActive = pathname.startsWith(task.route)
                return (
                  <Link key={task.key} href={task.route} className={cn('flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors', isActive ? style.active : style.idle)}>
                    <Icon className="h-4 w-4" />
                    <span>{task.label}</span>
                  </Link>
                )
              })}
            </div>
          ) : isUtility ? (
            <div className="hidden min-w-0 flex-1 items-center gap-2 xl:flex">
              {primaryNavigation.map((task) => {
                const isActive = pathname.startsWith(task.route)
                return (
                  <Link key={task.key} href={task.route} className={cn('rounded-lg px-3 py-2 text-sm font-semibold transition-colors', isActive ? style.active : style.idle)}>
                    {task.label}
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="hidden min-w-0 flex-1 items-center gap-1 overflow-hidden xl:flex">
              {primaryNavigation.map((task) => {
                const Icon = taskIcons[task.key] || LayoutGrid
                const isActive = pathname.startsWith(task.route)
                return (
                  <Link key={task.key} href={task.route} className={cn('flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold transition-colors whitespace-nowrap', isActive ? style.active : style.idle)}>
                    <Icon className="h-4 w-4" />
                    <span>{task.label}</span>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          {primaryTask && (recipe.navbar === 'utility-bar' || (recipe.navbar === 'floating-bar' && !galleryCream)) ? (
            <Link href={primaryTask.route} className="hidden items-center gap-2 rounded-full border border-current/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] opacity-80 md:inline-flex">
              <Sparkles className="h-3.5 w-3.5" />
              {primaryTask.label}
            </Link>
          ) : null}

          {isFloating && galleryCream ? (
            <Button variant="ghost" size="icon" asChild className="rounded-full md:hidden">
              <Link href="/search">
                <Search className="h-5 w-5" />
                <span className="sr-only">Open search</span>
              </Link>
            </Button>
          ) : (
            <Button variant="ghost" size="icon" asChild className="hidden rounded-full md:flex">
              <Link href="/search">
                <Search className="h-5 w-5" />
                <span className="sr-only">Search</span>
              </Link>
            </Button>
          )}

          {isAuthenticated ? (
            <NavbarAuthControls />
          ) : (
            <div className="hidden items-center gap-1.5 md:flex md:gap-2">
              <Button variant="ghost" size="sm" asChild className={cn('rounded-full px-3 text-[rgb(53_88_114/0.85)] lg:px-4', galleryCream && isFloating && 'font-medium')}>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button size="sm" asChild className={cn(style.cta, galleryCream && isFloating && 'rounded-full px-5 shadow-sm')}>
                <Link href="/register">{isEditorial ? 'Subscribe' : isUtility ? 'Post Now' : 'Get Started'}</Link>
              </Button>
            </div>
          )}

          <Button variant="ghost" size="icon" className="rounded-full lg:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </nav>

      {isFloating && primaryTask && !galleryCream ? (
        <div className="mx-auto hidden max-w-7xl px-4 pb-3 sm:px-6 lg:block lg:px-8">
          <Link
            href={primaryTask.route}
            className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-200 backdrop-blur transition-colors hover:bg-white/12"
          >
            Featured surface
            <span>{primaryTask.label}</span>
          </Link>
        </div>
      ) : null}

      {isMobileMenuOpen && (
        <div className={style.mobile}>
          <div className="space-y-3 px-4 py-4">
            {galleryCream && isFloating ? (
              <form
                key={`m-${navSearchDefaultQ}-${navSearchDefaultTask}`}
                method="get"
                action="/search"
                onSubmit={() => setIsMobileMenuOpen(false)}
                className="space-y-3"
              >
                <input type="hidden" name="master" value="1" />
                <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-[rgb(53_88_114/0.45)]">Search images or articles</p>
                <fieldset className="flex flex-wrap gap-1.5 border-0 p-0">
                  <legend className="sr-only">Search in</legend>
                  {(
                    [
                      { value: '', label: 'All', Icon: LayoutGrid },
                      { value: 'image', label: 'Images', Icon: ImageIcon },
                      { value: 'article', label: 'Articles', Icon: FileText },
                    ] as const
                  ).map(({ value, label, Icon }) => (
                    <label key={value || 'all'} className="cursor-pointer select-none rounded-full px-0.5 py-0.5 has-[input:checked]:bg-[rgb(53_88_114/0.06)]">
                      <input
                        type="radio"
                        name="task"
                        value={value}
                        defaultChecked={
                          value === 'image'
                            ? navSearchDefaultTask === 'image'
                            : value === 'article'
                              ? navSearchDefaultTask === 'article'
                              : navSearchDefaultTask !== 'image' && navSearchDefaultTask !== 'article'
                        }
                        className="peer sr-only"
                      />
                      <span className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[rgb(53_88_114/0.55)] peer-checked:bg-[#355872] peer-checked:text-white peer-checked:shadow-sm">
                        <Icon className="h-3.5 w-3.5" strokeWidth={2.25} />
                        {label}
                      </span>
                    </label>
                  ))}
                </fieldset>
                <div className="flex items-center gap-1 rounded-2xl border border-[rgb(53_88_114/0.1)] bg-white p-1.5 pl-3 shadow-[0_10px_32px_-12px_rgb(53_88_114/0.15)]">
                  <label className="flex min-w-0 flex-1 items-center gap-2">
                    <Search className="h-4 w-4 shrink-0 text-[rgb(53_88_114/0.35)]" />
                    <input
                      type="search"
                      name="q"
                      defaultValue={navSearchDefaultQ}
                      placeholder={siteContent.hero.searchPlaceholder}
                      className="h-10 w-full min-w-0 border-0 bg-transparent text-[15px] text-[#355872] outline-none placeholder:text-[rgb(53_88_114/0.38)]"
                    />
                  </label>
                  <Button type="submit" className="h-10 shrink-0 rounded-full bg-[#355872] px-5 text-sm font-semibold text-white hover:bg-[rgb(45_72_94)]">
                    Search
                  </Button>
                </div>
                {!isAuthenticated ? (
                  <div className="flex items-center justify-center gap-6 border-t border-[rgb(53_88_114/0.08)] pt-3 text-sm font-medium">
                    <Link href="/login" className="text-[rgb(53_88_114/0.75)] hover:text-[#355872]" onClick={() => setIsMobileMenuOpen(false)}>
                      Sign In
                    </Link>
                    <Link href="/register" className="text-[#355872] hover:underline" onClick={() => setIsMobileMenuOpen(false)}>
                      Get Started
                    </Link>
                  </div>
                ) : null}
              </form>
            ) : (
              <>
                <Link href="/search" onClick={() => setIsMobileMenuOpen(false)} className="mb-1 flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-sm font-semibold text-muted-foreground">
                  <Search className="h-4 w-4" />
                  Search the site
                </Link>
                {mobileNavigation.map((item) => {
                  const isActive = pathname.startsWith(item.href)
                  return (
                    <Link key={item.name} href={item.href} onClick={() => setIsMobileMenuOpen(false)} className={cn('flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-colors', isActive ? style.active : style.idle)}>
                      <item.icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  )
                })}
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
