import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getDraftsmen } from '@/lib/data/draftsmen'

export const metadata: Metadata = {
  title: 'Hire CAD Drafters in India — AutoCAD, Revit, SketchUp',
  description: 'Browse verified CAD drafters across India. AutoCAD, Revit, SketchUp, structural drawings, interiors — check portfolios, rates, and hire directly.',
  openGraph: {
    title: 'Hire CAD Drafters in India | DraftRoom',
    description: 'Browse verified drafters across India. Check portfolios and hire directly.',
    url: 'https://draftroom.in/drafters',
  },
  alternates: { canonical: 'https://draftroom.in/drafters' },
}
import { DrafterCard } from '@/components/marketplace/drafter-card'
import { SkillFilter } from '@/components/marketplace/skill-filter'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const PREVIEW_LIMIT = 6

interface Props {
  searchParams: Promise<{ skill?: string; city?: string; max_rate?: string }>
}

async function DraftersGrid({ searchParams }: Props) {
  const params = await searchParams
  const [drafters, supabase] = await Promise.all([
    getDraftsmen({ skill: params.skill, city: params.city, max_rate: params.max_rate ? Number(params.max_rate) : undefined }),
    createClient(),
  ])
  const { data: { user } } = await supabase.auth.getUser()
  const isLoggedIn = !!user
  const visible = isLoggedIn ? drafters : drafters.slice(0, PREVIEW_LIMIT)
  const hiddenCount = isLoggedIn ? 0 : Math.max(0, drafters.length - PREVIEW_LIMIT)

  return (
    <>
      {drafters.length === 0 ? (
        <div className="col-span-3 py-16 text-center text-[var(--color-blueprint-text-secondary)]">
          No drafters found matching your filters.
        </div>
      ) : (
        <>
          {visible.map((profile: any) => (
            <DrafterCard key={profile.user_id} profile={profile} />
          ))}
          {hiddenCount > 0 && (
            <div className="col-span-full relative mt-2">
              {/* Ghost cards */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 blur-sm opacity-40 pointer-events-none select-none">
                {[0, 1, 2].map(i => (
                  <div key={i} className="blueprint-card p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[var(--color-blueprint-border-strong)]" />
                        <div>
                          <div className="h-4 bg-[var(--color-blueprint-border-strong)] rounded w-28 mb-1.5" />
                          <div className="h-3 bg-[var(--color-blueprint-border-strong)] rounded w-20" />
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1.5 mb-4">
                      <div className="h-5 bg-[var(--color-blueprint-border-strong)] rounded-full w-16" />
                      <div className="h-5 bg-[var(--color-blueprint-border-strong)] rounded-full w-14" />
                      <div className="h-5 bg-[var(--color-blueprint-border-strong)] rounded-full w-20" />
                    </div>
                    <div className="flex justify-between">
                      <div className="h-3 bg-[var(--color-blueprint-border-strong)] rounded w-20" />
                      <div className="h-3 bg-[var(--color-blueprint-border-strong)] rounded w-16" />
                    </div>
                  </div>
                ))}
              </div>
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--color-blueprint-bg)]/70 to-[var(--color-blueprint-bg)] flex items-end justify-center pb-6">
                <div className="text-center">
                  <p className="text-base font-semibold text-[var(--color-blueprint-text-primary)] mb-1">
                    More drafters available
                  </p>
                  <p className="text-sm text-[var(--color-blueprint-text-secondary)] mb-5">
                    Create a free account to see all verified drafters, rates, and portfolios.
                  </p>
                  <div className="flex gap-3 justify-center flex-wrap">
                    <Link
                      href="/signup?role=client"
                      className="inline-block bg-[var(--color-blueprint-accent)] text-white text-sm font-medium px-5 py-2.5 rounded-md hover:opacity-90 transition-opacity"
                    >
                      Sign up as Project Owner
                    </Link>
                    <Link
                      href="/signup?role=drafter"
                      className="inline-block border border-[var(--color-blueprint-border-strong)] text-[var(--color-blueprint-text-primary)] text-sm font-medium px-5 py-2.5 rounded-md hover:border-[var(--color-blueprint-accent)]/50 transition-colors"
                    >
                      Join as Drafter
                    </Link>
                  </div>
                  <p className="text-xs text-[var(--color-blueprint-text-muted)] mt-3">
                    Already have an account?{' '}
                    <Link href="/login" className="text-[var(--color-blueprint-accent)] hover:underline">Log in</Link>
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </>
  )
}

export default async function DraftersPage(props: Props) {
  return (
    <main className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-8">
        <p className="blueprint-label mb-2">// FIND TALENT</p>
        <h1 className="text-3xl font-bold text-[var(--color-blueprint-text-primary)] mb-4">
          Browse Drafters
        </h1>
        <Suspense fallback={null}>
          <SkillFilter type="drafters" />
        </Suspense>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        <Suspense
          fallback={
            <div className="col-span-3 py-16 text-center text-[var(--color-blueprint-text-secondary)]">
              Loading drafters...
            </div>
          }
        >
          <DraftersGrid searchParams={props.searchParams} />
        </Suspense>
      </div>
    </main>
  )
}
