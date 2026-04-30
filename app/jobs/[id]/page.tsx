import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getJob } from '@/lib/data/jobs'
import { Badge } from '@/components/ui/badge'
import { ApplyForm } from '@/components/marketplace/apply-form'
import { SuggestedDraftsmen } from '@/components/marketplace/suggested-draftsmen'
import { getSuggestedDraftsmen } from '@/lib/data/draftsmen'

export const dynamic = 'force-dynamic'

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

  let hasApplied = false
  if (isDraftsman && user) {
    const { data } = await supabase
      .from('applications')
      .select('id')
      .eq('job_id', id)
      .eq('draftsman_id', user.id)
      .single()
    hasApplied = !!data
  }

  const suggestedDraftsmen = isOwner
    ? await getSuggestedDraftsmen((job as any).skills_required)
    : []

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
          {isDraftsman && (job as any).status === 'open' && (
            <div className="blueprint-card p-5">
              <p className="blueprint-label mb-3">// APPLY</p>
              {hasApplied ? (
                <p className="text-sm text-[var(--color-blueprint-text-secondary)]">
                  You have already applied to this job.
                </p>
              ) : (
                <ApplyForm jobId={id} />
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

          {(job as any).status !== 'open' && (
            <div className="blueprint-card p-5">
              <Badge variant="skill" className="text-sm">{(job as any).status.replace('_', ' ')}</Badge>
              <p className="text-sm text-[var(--color-blueprint-text-secondary)] mt-2">
                This job is no longer accepting applications.
              </p>
            </div>
          )}
        </div>
      </div>

      {isOwner && <SuggestedDraftsmen draftsmen={suggestedDraftsmen as any} jobId={id} />}
    </main>
  )
}
