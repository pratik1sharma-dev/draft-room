import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getContracts } from '@/lib/data/applications'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { markContractComplete } from '@/lib/actions/applications'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

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
            <Button asChild><Link href="/post-job">Post a job →</Link></Button>
          ) : (
            <Button asChild><Link href="/jobs">Browse jobs →</Link></Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {contracts.map((contract: any) => (
            <div key={contract.id} className="blueprint-card p-6">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <p className="blueprint-label mb-1">REF: {contract.id.slice(0, 8).toUpperCase()}</p>
                  <h3 className="font-semibold text-[var(--color-blueprint-text-primary)] mb-1">
                    {contract.jobs.title}
                  </h3>
                  <p className="text-sm text-[var(--color-blueprint-text-secondary)]">
                    {userData.role === 'client'
                      ? `Draftsman: ${contract.draftsman.name}`
                      : `Client: ${contract.client.name}`
                    }
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-[var(--color-blueprint-accent)]">
                    ₹{contract.agreed_rate.toLocaleString('en-IN')}
                  </p>
                  <Badge
                    variant={contract.status === 'active' ? 'available' : contract.status === 'completed' ? 'verified' : 'founding'}
                    className="mt-1"
                  >
                    {contract.status}
                  </Badge>
                </div>
              </div>

              {contract.status === 'active' && userData.role === 'client' && (
                <div className="mt-4 pt-4 border-t border-[var(--color-blueprint-border)]">
                  <form action={async () => {
                    'use server'
                    await markContractComplete(contract.id)
                  }}>
                    <Button variant="outline" size="sm" type="submit">
                      Mark as complete
                    </Button>
                  </form>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
