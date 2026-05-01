import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getJob } from '@/lib/data/jobs'
import { getApplicationsForJob } from '@/lib/data/applications'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ApplyForm } from '@/components/marketplace/apply-form'
import { SuggestedDraftsmen } from '@/components/marketplace/suggested-draftsmen'
import { getSuggestedDraftsmen } from '@/lib/data/draftsmen'
import { acceptApplication, rejectApplication } from '@/lib/actions/applications'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const job = await getJob(id) as any
  if (!job) return {}
  const description = job.description
    ? job.description.slice(0, 155) + (job.description.length > 155 ? '…' : '')
    : `${job.skills_required?.join(', ')} drafting project in ${job.users?.city ?? 'India'}.`
  return {
    title: job.title,
    description,
    openGraph: {
      title: `${job.title} | DraftRoom`,
      description,
      url: `https://draftroom.in/projects/${id}`,
    },
    alternates: { canonical: `https://draftroom.in/projects/${id}` },
  }
}

export default async function JobDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ posted?: string }>
}) {
  const { id } = await params
  const { posted } = await searchParams
  const job = await getJob(id)

  if (!job) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: currentUserData } = user
    ? await supabase.from('users').select('role').eq('id', user.id).single()
    : { data: null }

  const isDraftsman = currentUserData?.role === 'draftsman'
  const isOwner = user?.id === (job as any).client_id

  let application = null
  let contract = null
  let profileReady = false
  if (isDraftsman && user) {
    const [{ data: appData }, { data: profileData }] = await Promise.all([
      supabase.from('applications').select('*').eq('job_id', id).eq('draftsman_id', user.id).maybeSingle(),
      supabase.from('profiles').select('bio, skills').eq('user_id', user.id).single(),
    ])
    application = appData
    profileReady = !!(profileData?.bio?.trim() && profileData?.skills?.length)

    if (application?.status === 'accepted') {
      const { data: contractData } = await supabase
        .from('contracts')
        .select('id')
        .eq('job_id', id)
        .eq('draftsman_id', user.id)
        .maybeSingle()
      contract = contractData
    }
  }

  const suggestedDraftsmen = isOwner
    ? await getSuggestedDraftsmen((job as any).skills_required)
    : []

  const applications = isOwner ? await getApplicationsForJob(id) : []

  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      {posted && (
        <div className="mb-6 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm">
          Job posted successfully! Draftsmen can now apply.
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {/* Job details */}
        <div className="md:col-span-2 space-y-6">
          <div className="blueprint-card p-6">
            <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
              <div>
                <p className="blueprint-label mb-1">// PROJECT</p>
                <h1 className="text-2xl font-bold text-[var(--color-blueprint-text-primary)]">
                  {(job as any).title}
                </h1>
                <p className="text-sm text-[var(--color-blueprint-text-muted)] mt-1">
                  Posted by {(job as any).users.name} · {(job as any).users.city}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-[var(--color-blueprint-accent)]">
                  ₹{(job as any).budget_amount.toLocaleString('en-IN')}
                </p>
                <p className="text-sm text-[var(--color-blueprint-text-muted)]">
                  {(job as any).budget_type === 'hourly' ? 'per hour' : 'fixed price'}
                </p>
              </div>
            </div>

            <p className="text-[var(--color-blueprint-text-secondary)] leading-relaxed mb-4">
              {(job as any).description}
            </p>

            <div className="flex flex-wrap gap-1.5">
              {(job as any).skills_required.map((skill: string) => (
                <Badge key={skill} variant="skill">{skill}</Badge>
              ))}
            </div>

            {(job as any).deadline && (
              <p className="mt-4 text-sm text-[var(--color-blueprint-text-muted)]">
                Deadline: {new Date((job as any).deadline).toLocaleDateString('en-IN')}
              </p>
            )}
          </div>
        </div>

        {/* Apply sidebar */}
        <div>
          {isDraftsman && (
            <div className="blueprint-card p-5">
              <p className="blueprint-label mb-3">// APPLICATION</p>
              {application ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-[var(--color-blueprint-text-muted)] uppercase mb-1">Status</p>
                    <Badge variant={application.status === 'accepted' ? 'available' : application.status === 'rejected' ? 'skill' : 'founding'}>
                      {application.status}
                    </Badge>
                  </div>
                  
                  {application.status === 'pending' && (
                    <p className="text-sm text-[var(--color-blueprint-text-secondary)]">
                      Your application is being reviewed by the client.
                    </p>
                  )}

                  {application.status === 'accepted' && contract && (
                    <div className="space-y-3">
                      <p className="text-sm text-[var(--color-blueprint-text-secondary)]">
                        Your application was accepted!
                      </p>
                      <Button asChild className="w-full">
                        <Link href={`/contracts/${contract.id}`}>Go to Contract →</Link>
                      </Button>
                    </div>
                  )}

                  {application.status === 'rejected' && (
                    <p className="text-sm text-[var(--color-blueprint-text-secondary)]">
                      This application was not selected.
                    </p>
                  )}
                </div>
              ) : (job as any).status === 'open' ? (
                !profileReady ? (
                  <div>
                    <p className="text-sm text-[var(--color-blueprint-text-secondary)] mb-3">
                      Add your bio and skills to your profile before applying.
                    </p>
                    <Link href="/profile/edit" className="text-sm text-[var(--color-blueprint-accent)] hover:underline">
                      Complete profile →
                    </Link>
                  </div>
                ) : (
                  <ApplyForm jobId={id} />
                )
              ) : (
                <p className="text-sm text-[var(--color-blueprint-text-secondary)]">
                  This job is no longer accepting applications.
                </p>
              )}
            </div>
          )}

          {!user && (
            <div className="blueprint-card p-5 text-center">
              <p className="text-sm text-[var(--color-blueprint-text-secondary)] mb-3">
                Sign in as a draftsman to apply
              </p>
              <a href="/login" className="text-[var(--color-blueprint-accent)] text-sm hover:underline">
                Sign in →
              </a>
            </div>
          )}


        </div>
      </div>

      {isOwner && applications.length > 0 && (
        <div className="mt-8">
          <p className="blueprint-label mb-3">// APPLICATIONS ({applications.length})</p>
          <div className="space-y-3">
            {applications.map((app: any) => (
              <div key={app.id} className="blueprint-card p-5 flex items-start justify-between flex-wrap gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Link href={`/draftsmen/${app.draftsman_id}`} className="font-medium text-[var(--color-blueprint-text-primary)] hover:text-[var(--color-blueprint-accent)]">
                      {app.users.name}
                    </Link>
                    {app.profiles?.is_verified && <Badge variant="verified">Verified</Badge>}
                    <Badge variant={app.status === 'accepted' ? 'available' : app.status === 'rejected' ? 'skill' : 'founding'}>
                      {app.status}
                    </Badge>
                  </div>
                  <div className="flex gap-1.5 flex-wrap mb-2">
                    {(app.profiles?.skills ?? []).slice(0, 4).map((s: string) => (
                      <Badge key={s} variant="skill">{s}</Badge>
                    ))}
                  </div>
                  {app.cover_note && (
                    <p className="text-sm text-[var(--color-blueprint-text-secondary)] line-clamp-2">{app.cover_note}</p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="font-medium text-[var(--color-blueprint-accent)] mb-2">₹{app.proposed_rate}/hr</p>
                  {app.status === 'pending' && (job as any).status === 'open' && (
                    <div className="flex gap-2">
                      <form action={async () => { 'use server'; await acceptApplication(app.id, id) }}>
                        <Button size="sm" type="submit">Accept</Button>
                      </form>
                      <form action={async () => { 'use server'; await rejectApplication(app.id) }}>
                        <Button size="sm" variant="outline" type="submit">Reject</Button>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isOwner && applications.length === 0 && (job as any).status === 'open' && (
        <div className="mt-8">
          <p className="blueprint-label mb-3">// APPLICATIONS</p>
          <div className="blueprint-card p-6 text-center">
            <p className="text-sm text-[var(--color-blueprint-text-muted)]">No applications yet. Share your project to get applicants.</p>
          </div>
        </div>
      )}

      {isOwner && <SuggestedDraftsmen draftsmen={suggestedDraftsmen as any} jobId={id} />}
    </main>
  )
}
