'use client'

import type { ReactNode } from 'react'
import { NavbarShell } from '@/components/shared/navbar-shell'
import { Footer } from '@/components/shared/footer'

export function PageShell({
  title,
  description,
  actions,
  children,
}: {
  title: string
  description?: string
  actions?: ReactNode
  children?: ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <NavbarShell />
      <main>
        <section className="relative overflow-hidden border-b border-[rgb(53_88_114/0.1)] bg-[linear-gradient(180deg,rgb(255_255_255/0.95)_0%,rgb(247_248_240/0.9)_100%)]">
          <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 max-w-md bg-[radial-gradient(circle_at_70%_20%,rgb(156_213_255/0.28),transparent_65%)]" aria-hidden />
          <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl border-l-[3px] border-[#7aaace] pl-5 sm:pl-6">
                <h1 className="text-3xl font-semibold tracking-[-0.03em] text-foreground sm:text-4xl">{title}</h1>
                {description && (
                  <p className="mt-3 text-base leading-relaxed text-muted-foreground">{description}</p>
                )}
              </div>
              {actions && <div className="flex w-full flex-wrap gap-3 sm:w-auto sm:justify-end">{actions}</div>}
            </div>
          </div>
        </section>
        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">{children}</section>
      </main>
      <Footer />
    </div>
  )
}
