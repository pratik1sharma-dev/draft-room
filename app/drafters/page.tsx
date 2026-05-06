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

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: Promise<{ skill?: string; city?: string; max_rate?: string }>
}

async function DraftersGrid({ searchParams }: Props) {
  const params = await searchParams
  const drafters = await getDraftsmen({
    skill: params.skill,
    city: params.city,
    max_rate: params.max_rate ? Number(params.max_rate) : undefined,
  })

  return (
    <>
      {drafters.length === 0 ? (
        <div className="col-span-3 py-16 text-center text-[var(--color-blueprint-text-secondary)]">
          No drafters found matching your filters.
        </div>
      ) : (
        drafters.map((profile: any) => (
          <DrafterCard key={profile.user_id} profile={profile} />
        ))
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
