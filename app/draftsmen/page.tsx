import { Suspense } from 'react'
import { getDraftsmen } from '@/lib/data/draftsmen'
import { DraftsmanCard } from '@/components/marketplace/draftsman-card'
import { SkillFilter } from '@/components/marketplace/skill-filter'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: Promise<{ skill?: string; city?: string; max_rate?: string }>
}

async function DraftsmenGrid({ searchParams }: Props) {
  const params = await searchParams
  const draftsmen = await getDraftsmen({
    skill: params.skill,
    city: params.city,
    max_rate: params.max_rate ? Number(params.max_rate) : undefined,
  })

  return (
    <>
      {draftsmen.length === 0 ? (
        <div className="col-span-3 py-16 text-center text-[var(--color-blueprint-text-secondary)]">
          No draftsmen found matching your filters.
        </div>
      ) : (
        draftsmen.map((profile: any) => (
          <DraftsmanCard key={profile.user_id} profile={profile} />
        ))
      )}
    </>
  )
}

export default async function DraftsmenPage(props: Props) {
  return (
    <main className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-8">
        <p className="blueprint-label mb-2">// FIND TALENT</p>
        <h1 className="text-3xl font-bold text-[var(--color-blueprint-text-primary)] mb-4">
          Browse Draftsmen
        </h1>
        <Suspense fallback={null}>
          <SkillFilter type="draftsmen" />
        </Suspense>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        <Suspense
          fallback={
            <div className="col-span-3 py-16 text-center text-[var(--color-blueprint-text-secondary)]">
              Loading draftsmen...
            </div>
          }
        >
          <DraftsmenGrid searchParams={props.searchParams} />
        </Suspense>
      </div>
    </main>
  )
}
