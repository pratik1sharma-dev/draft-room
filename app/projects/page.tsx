import { Suspense } from 'react'
import { getJobs } from '@/lib/data/jobs'
import { JobCard } from '@/components/marketplace/job-card'
import { SkillFilter } from '@/components/marketplace/skill-filter'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: Promise<{ skill?: string; budget_type?: string }>
}

async function JobsGrid({ searchParams }: Props) {
  const params = await searchParams
  const jobs = await getJobs({
    skill: params.skill,
    budget_type: params.budget_type as 'fixed' | 'hourly' | undefined,
  })

  return (
    <>
      {jobs.length === 0 ? (
        <div className="py-16 text-center text-[var(--color-blueprint-text-secondary)]">
          No jobs found matching your filters.
        </div>
      ) : (
        jobs.map((job: any) => <JobCard key={job.id} job={job} />)
      )}
    </>
  )
}

export default async function JobsPage(props: Props) {
  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-8">
        <p className="blueprint-label mb-2">// OPEN PROJECTS</p>
        <h1 className="text-3xl font-bold text-[var(--color-blueprint-text-primary)] mb-4">
          Browse Projects
        </h1>
        <Suspense fallback={null}>
          <SkillFilter type="jobs" />
        </Suspense>
      </div>

      <div className="space-y-4">
        <Suspense
          fallback={
            <div className="py-16 text-center text-[var(--color-blueprint-text-secondary)]">
              Loading jobs...
            </div>
          }
        >
          <JobsGrid searchParams={props.searchParams} />
        </Suspense>
      </div>
    </main>
  )
}
