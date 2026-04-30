import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getApplicationsForJob, getDraftsmanApplications } from '@/lib/data/applications'
import { getClientJobs } from '@/lib/data/jobs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { acceptApplication, rejectApplication } from '@/lib/actions/applications'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function ApplicationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!userData) redirect('/onboarding')

  const isClient = userData.role === 'client'

  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <p className="blueprint-label mb-2">// APPLICATIONS</p>
      <h1 className="text-2xl font-bold text-[var(--color-blueprint-text-primary)] mb-8">
        {isClient ? 'Applications Received' : 'My Applications'}
      </h1>

      {isClient
        ? <ClientApplications userId={user.id} />
        : <DraftsmanApplications userId={user.id} />
      }
    </main>
  )
}

async function ClientApplications({ userId }: { userId: string }) {
  const jobs = await getClientJobs(userId)
  const openJobs = jobs.filter((j: any) => j.status === 'open' || j.status === 'in_progress')

  if (openJobs.length === 0) {
    return (
      <div className="blueprint-card p-8 text-center">
        <p className="text-[var(--color-blueprint-text-secondary)] mb-4">No active jobs yet.</p>
        <Button asChild><Link href="/post-project">Post your first job →</Link></Button>
      </div>
    )
  }

  const jobsWithApplications = await Promise.all(
    openJobs.map(async (job: any) => ({
      job,
      applications: await getApplicationsForJob(job.id),
    }))
  )

  return (
    <div className="space-y-8">
      {jobsWithApplications.map(({ job, applications }) => (
        <div key={job.id}>
          <div className="flex items-center justify-between mb-3">
            <Link href={`/projects/${job.id}`} className="font-semibold text-[var(--color-blueprint-text-primary)] hover:text-[var(--color-blueprint-accent)] transition-colors">
              {job.title}
            </Link>
            <Badge variant={job.status === 'open' ? 'available' : 'skill'}>
              {applications.length} application{applications.length !== 1 ? 's' : ''}
            </Badge>
          </div>

          {applications.length === 0 ? (
            <p className="text-sm text-[var(--color-blueprint-text-muted)] pl-2">No applications yet.</p>
          ) : (
            <div className="space-y-3">
              {applications.map((app: any) => (
                <div key={app.id} className="blueprint-card p-5">
                  <div className="flex items-start justify-between flex-wrap gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Link href={`/draftsmen/${app.draftsman_id}`} className="font-medium text-[var(--color-blueprint-text-primary)] hover:text-[var(--color-blueprint-accent)]">
                          {app.users.name}
                        </Link>
                        {app.profiles.is_verified && <Badge variant="verified">Verified</Badge>}
                        <Badge variant={app.status === 'accepted' ? 'available' : app.status === 'rejected' ? 'skill' : 'founding'}>
                          {app.status}
                        </Badge>
                      </div>
                      <div className="flex gap-1.5 flex-wrap mb-2">
                        {app.profiles.skills.slice(0, 3).map((s: string) => (
                          <Badge key={s} variant="skill">{s}</Badge>
                        ))}
                      </div>
                      {app.cover_note && (
                        <p className="text-sm text-[var(--color-blueprint-text-secondary)] line-clamp-2">
                          {app.cover_note}
                        </p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-medium text-[var(--color-blueprint-accent)]">
                        ₹{app.proposed_rate}/hr
                      </p>
                      {app.status === 'pending' && job.status === 'open' && (
                        <div className="flex gap-2 mt-2">
                          <form action={async () => {
                            'use server'
                            await acceptApplication(app.id, job.id)
                          }}>
                            <Button size="sm" type="submit">Accept</Button>
                          </form>
                          <form action={async () => {
                            'use server'
                            await rejectApplication(app.id)
                          }}>
                            <Button size="sm" variant="outline" type="submit">Reject</Button>
                          </form>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

async function DraftsmanApplications({ userId }: { userId: string }) {
  const applications = await getDraftsmanApplications(userId)

  if (applications.length === 0) {
    return (
      <div className="blueprint-card p-8 text-center">
        <p className="text-[var(--color-blueprint-text-secondary)] mb-4">You haven&apos;t applied to any jobs yet.</p>
        <Button asChild><Link href="/projects">Browse open jobs →</Link></Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {applications.map((app: any) => (
        <div key={app.id} className="blueprint-card p-5">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <Link href={`/projects/${app.jobs.id}`} className="font-medium text-[var(--color-blueprint-text-primary)] hover:text-[var(--color-blueprint-accent)] transition-colors">
                {app.jobs.title}
              </Link>
              <p className="text-sm text-[var(--color-blueprint-text-muted)] mt-0.5">
                by {app.jobs.users.name} · {app.jobs.users.city}
              </p>
              {app.cover_note && (
                <p className="text-sm text-[var(--color-blueprint-text-secondary)] mt-2 line-clamp-2">
                  {app.cover_note}
                </p>
              )}
            </div>
            <div className="text-right shrink-0">
              <Badge variant={app.status === 'accepted' ? 'available' : app.status === 'rejected' ? 'skill' : 'founding'}>
                {app.status}
              </Badge>
              <p className="text-sm text-[var(--color-blueprint-accent)] mt-1">₹{app.proposed_rate}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
