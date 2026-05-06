import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getContracts } from '@/lib/data/applications'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const STATUS_LABELS: Record<string, string> = {
  offer_sent: 'Offer Sent',
  client_turn: 'Action Required',
  draftsman_turn: 'Action Required',
  terms_agreed: 'Terms Agreed',
  in_progress: 'In Progress',
  in_review: 'In Review',
  revision_requested: 'Revision Requested',
  completed: 'Completed',
  declined: 'Declined',
  cancelled: 'Cancelled',
  disputed: 'Disputed',
}

const STATUS_VARIANTS: Record<string, 'available' | 'verified' | 'founding' | 'skill'> = {
  offer_sent: 'founding',
  client_turn: 'founding',
  draftsman_turn: 'founding',
  terms_agreed: 'available',
  in_progress: 'available',
  in_review: 'founding',
  revision_requested: 'founding',
  completed: 'verified',
  declined: 'skill',
  cancelled: 'skill',
  disputed: 'skill',
}

export default async function ContractsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!userData) redirect('/onboarding')

  const contracts = await getContracts(user.id, userData.role as 'client' | 'draftsman')

  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <p className="blueprint-label mb-2">// ACTIVE WORK</p>
      <h1 className="text-2xl font-bold text-[var(--color-blueprint-text-primary)] mb-8">
        Contracts
      </h1>

      {contracts.length === 0 ? (
        <div className="blueprint-card p-8 text-center">
          <p className="text-[var(--color-blueprint-text-secondary)] mb-4">No contracts yet.</p>
          {userData.role === 'client' ? (
            <Button asChild><Link href="/post-project">Post a project →</Link></Button>
          ) : (
            <Button asChild><Link href="/projects">Browse projects →</Link></Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {contracts.map((contract: any) => {
            const isActionRequired =
              (userData.role === 'client' && contract.status === 'client_turn') ||
              (userData.role === 'draftsman' && ['draftsman_turn', 'offer_sent'].includes(contract.status))

            return (
              <Link key={contract.id} href={`/contracts/${contract.id}`} className="block">
                <div className={`blueprint-card p-6 hover:border-[var(--color-blueprint-accent)]/40 transition-colors ${isActionRequired ? 'border-[var(--color-blueprint-accent)]/30' : ''}`}>
                  <div className="flex items-start justify-between flex-wrap gap-4">
                    <div>
                      <p className="blueprint-label mb-1">REF: {contract.id.slice(0, 8).toUpperCase()}</p>
                      <h3 className="font-semibold text-[var(--color-blueprint-text-primary)] mb-1">
                        {contract.jobs.title}
                      </h3>
                      <p className="text-sm text-[var(--color-blueprint-text-secondary)]">
                        {userData.role === 'client'
                          ? `Drafter: ${contract.draftsman.name}`
                          : `Client: ${contract.client.name}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-[var(--color-blueprint-accent)]">
                        ₹{(contract.agreed_amount ?? contract.agreed_rate)?.toLocaleString('en-IN')}
                      </p>
                      <Badge
                        variant={STATUS_VARIANTS[contract.status] ?? 'skill'}
                        className="mt-1"
                      >
                        {STATUS_LABELS[contract.status] ?? contract.status}
                      </Badge>
                    </div>
                  </div>

                  {isActionRequired && (
                    <p className="mt-3 text-xs text-[var(--color-blueprint-accent)]">
                      Your action required →
                    </p>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </main>
  )
}
