import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { HireForm } from './hire-form'

export const dynamic = 'force-dynamic'

export default async function DirectHirePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ job_id?: string }>
}) {
  const { id: draftsmanId } = await params
  const { job_id: preselectedJobId } = await searchParams

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userData?.role !== 'client') redirect(`/drafters/${draftsmanId}`)

  const { data: draftsmanUser } = await supabase
    .from('users')
    .select('name')
    .eq('id', draftsmanId)
    .single()

  const { data: jobs } = await supabase
    .from('jobs')
    .select('id, title, budget_amount, budget_type')
    .eq('client_id', user.id)
    .eq('status', 'open')
    .order('created_at', { ascending: false })

  return (
    <main className="max-w-xl mx-auto px-6 py-12">
      <p className="blueprint-label mb-2">// DIRECT HIRE</p>
      <h1 className="text-2xl font-bold text-[var(--color-blueprint-text-primary)] mb-8">
        Send a Direct Offer
      </h1>

      <HireForm
        draftsmanId={draftsmanId}
        draftsmanName={draftsmanUser?.name ?? 'this drafter'}
        existingJobs={jobs ?? []}
        preselectedJobId={preselectedJobId}
      />
    </main>
  )
}
