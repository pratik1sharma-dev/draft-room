import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getJobs } from '@/lib/data/jobs'

export const metadata: Metadata = {
  title: 'Browse CAD Drafting Projects in India',
  description: 'Find open CAD drafting projects posted by architects and designers across India. AutoCAD, Revit, SketchUp, structural drawings — apply today.',
  openGraph: {
    title: 'Browse CAD Drafting Projects | DraftRoom',
    description: 'Open drafting projects across India. Apply as a verified drafter.',
    url: 'https://draftroom.in/projects',
  },
  alternates: { canonical: 'https://draftroom.in/projects' },
}
import { JobCard } from '@/components/marketplace/job-card'
import { SkillFilter } from '@/components/marketplace/skill-filter'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const PREVIEW_LIMIT = 6

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
  const isLoggedIn = !!user
  let appliedJobIds: string[] = []

  if (user) {
    const { data: apps } = await supabase
      .from('applications')
      .select('job_id')
      .eq('draftsman_id', user.id)
    if (apps) appliedJobIds = apps.map(a => a.job_id)
  }

  const visible = isLoggedIn ? jobs : jobs.slice(0, PREVIEW_LIMIT)
  const hiddenCount = isLoggedIn ? 0 : Math.max(0, jobs.length - PREVIEW_LIMIT)

  return (
    <>
      {jobs.length === 0 ? (
        <div className="py-16 text-center text-[var(--color-blueprint-text-secondary)]">
          No projects found matching your filters.
        </div>
      ) : (
        <>
          {visible.map((job: any) => (
            <JobCard key={job.id} job={job} hasApplied={appliedJobIds.includes(job.id)} />
          ))}
          {hiddenCount > 0 && (
            <div className="mt-4 blueprint-card p-8 text-center">
              <p className="text-lg font-semibold text-[var(--color-blueprint-text-primary)] mb-1">
                {hiddenCount} more project{hiddenCount !== 1 ? 's' : ''} available
              </p>
              <p className="text-sm text-[var(--color-blueprint-text-secondary)] mb-6">
                Create a free drafter account to see all open projects and start applying.
              </p>
              <div className="flex gap-3 justify-center flex-wrap">
                <Link
                  href="/signup?role=drafter"
                  className="inline-block bg-[var(--color-blueprint-accent)] text-white text-sm font-medium px-5 py-2.5 rounded-md hover:opacity-90 transition-opacity"
                >
                  Join as Drafter — It's Free
                </Link>
                <Link
                  href="/signup?role=client"
                  className="inline-block border border-[var(--color-blueprint-border-strong)] text-[var(--color-blueprint-text-primary)] text-sm font-medium px-5 py-2.5 rounded-md hover:border-[var(--color-blueprint-accent)]/50 transition-colors"
                >
                  Sign up as Project Owner
                </Link>
              </div>
              <p className="text-xs text-[var(--color-blueprint-text-muted)] mt-4">
                Already have an account?{' '}
                <Link href="/login" className="text-[var(--color-blueprint-accent)] hover:underline">Log in</Link>
              </p>
            </div>
          )}
        </>
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
