import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getJobs } from '@/lib/data/jobs'

export const metadata: Metadata = {
  title: 'Browse CAD Drafting Projects in India',
  description: 'Find open CAD drafting projects posted by architects and designers across India. AutoCAD, Revit, SketchUp, structural drawings — apply today.',
  openGraph: {
    title: 'Browse CAD Drafting Projects | DraftRoom',
    description: 'Open drafting projects across India. Apply as a verified draftsman.',
    url: 'https://draftroom.in/projects',
  },
  alternates: { canonical: 'https://draftroom.in/projects' },
}
import { JobCard } from '@/components/marketplace/job-card'
import { SkillFilter } from '@/components/marketplace/skill-filter'
import { createClient } from '@/lib/supabase/server'

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

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  let appliedJobIds: string[] = []

  if (user) {
    const { data: apps } = await supabase
      .from('applications')
      .select('job_id')
      .eq('draftsman_id', user.id)
    
    if (apps) {
      appliedJobIds = apps.map(a => a.job_id)
    }
  }

  return (
    <>
      {jobs.length === 0 ? (
        <div className="py-16 text-center text-[var(--color-blueprint-text-secondary)]">
          No projects found matching your filters.
        </div>
      ) : (
        jobs.map((job: any) => (
          <JobCard 
            key={job.id} 
            job={job} 
            hasApplied={appliedJobIds.includes(job.id)} 
          />
        ))
      )}
    </>
  )
}

export default async function JobsPage(props: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let showProfileNudge = false
  if (user) {
    const [{ data: userData }, { data: profileData }] = await Promise.all([
      supabase.from('users').select('role').eq('id', user.id).single(),
      supabase.from('profiles').select('bio, skills').eq('user_id', user.id).single(),
    ])
    if (userData?.role === 'draftsman' && (!profileData?.bio?.trim() || !profileData?.skills?.length)) {
      showProfileNudge = true
    }
  }

  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      {showProfileNudge && (
        <div className="mb-6 p-4 rounded-lg border border-amber-500/30 bg-amber-500/5 flex items-center justify-between gap-4 flex-wrap">
          <p className="text-sm text-amber-400">
            Add your bio and skills to your profile — required before you can apply to projects.
          </p>
          <a href="/profile/edit" className="text-sm font-medium text-amber-400 underline underline-offset-2 whitespace-nowrap">
            Complete profile →
          </a>
        </div>
      )}

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
              Loading projects...
            </div>
          }
        >
          <JobsGrid searchParams={props.searchParams} />
        </Suspense>
      </div>
    </main>
  )
}
