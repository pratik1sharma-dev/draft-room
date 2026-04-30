import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getClientJobs } from '@/lib/data/jobs'
import { getDraftsmanApplications, getContracts } from '@/lib/data/applications'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!userData) redirect('/onboarding')

  const isClient = userData.role === 'client'

  return (
    <main className="max-w-5xl mx-auto px-6 py-12">
      <p className="blueprint-label mb-2">// DASHBOARD</p>
      <div className="flex items-center gap-3 mb-8">
        <h1 className="text-2xl font-bold text-[var(--color-blueprint-text-primary)]">
          Welcome back, {userData.name}
        </h1>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
          userData.role === 'draftsman'
            ? 'bg-[var(--color-blueprint-accent)]/10 text-[var(--color-blueprint-accent)] border-[var(--color-blueprint-accent)]/30'
            : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
        }`}>
          {userData.role === 'draftsman' ? 'Draftsman' : 'Client'}
        </span>
      </div>

      {isClient
        ? <ClientDashboard userId={user.id} />
        : <DraftsmanDashboard userId={user.id} />
      }
    </main>
  )
}

async function ClientDashboard({ userId }: { userId: string }) {
  const jobs = await getClientJobs(userId)
  const activeJobs = jobs.filter((j: any) => j.status === 'open' || j.status === 'in_progress')
  const contracts = await getContracts(userId, 'client')

  return (
    <div className="space-y-8">
      <div className="flex gap-3 flex-wrap">
        <Button asChild><Link href="/post-project">Post a Project →</Link></Button>
        <Button variant="outline" asChild><Link href="/draftsmen">Browse Draftsmen</Link></Button>
        <Button variant="outline" asChild><Link href="/applications">View Applications</Link></Button>
        <Button variant="ghost" asChild><Link href="/profile/edit">Edit Profile</Link></Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Active Jobs', value: activeJobs.length },
          { label: 'Total Jobs', value: jobs.length },
          { label: 'Contracts', value: contracts.length },
        ].map(stat => (
          <div key={stat.label} className="blueprint-card p-5 text-center">
            <p className="text-3xl font-bold text-[var(--color-blueprint-accent)]">{stat.value}</p>
            <p className="text-sm text-[var(--color-blueprint-text-secondary)] mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {activeJobs.length > 0 && (
        <div>
          <p className="blueprint-label mb-3">// ACTIVE JOBS</p>
          <div className="space-y-3">
            {activeJobs.slice(0, 3).map((job: any) => (
              <Link key={job.id} href={`/jobs/${job.id}`} className="blueprint-card p-4 flex items-center justify-between hover:border-[var(--color-blueprint-accent)]/40 transition-colors">
                <span className="font-medium text-[var(--color-blueprint-text-primary)]">{job.title}</span>
                <Badge variant={job.status === 'open' ? 'available' : 'founding'}>{job.status}</Badge>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

async function DraftsmanDashboard({ userId }: { userId: string }) {
  const applications = await getDraftsmanApplications(userId)
  const contracts = await getContracts(userId, 'draftsman')
  const activeContracts = contracts.filter((c: any) => c.status === 'active')
  const pendingApps = applications.filter((a: any) => a.status === 'pending')

  return (
    <div className="space-y-8">
      <div className="flex gap-3 flex-wrap">
        <Button asChild><Link href="/projects">Browse Projects →</Link></Button>
        <Button variant="outline" asChild><Link href="/applications">My Applications</Link></Button>
        <Button variant="outline" asChild><Link href="/contracts">My Contracts</Link></Button>
        <Button variant="ghost" asChild><Link href="/profile/edit">Edit Profile</Link></Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Active Contracts', value: activeContracts.length },
          { label: 'Pending Applications', value: pendingApps.length },
          { label: 'Total Applications', value: applications.length },
        ].map(stat => (
          <div key={stat.label} className="blueprint-card p-5 text-center">
            <p className="text-3xl font-bold text-[var(--color-blueprint-accent)]">{stat.value}</p>
            <p className="text-sm text-[var(--color-blueprint-text-secondary)] mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {activeContracts.length > 0 && (
        <div>
          <p className="blueprint-label mb-3">// ACTIVE CONTRACTS</p>
          <div className="space-y-3">
            {activeContracts.slice(0, 3).map((contract: any) => (
              <Link key={contract.id} href="/contracts" className="blueprint-card p-4 flex items-center justify-between hover:border-[var(--color-blueprint-accent)]/40 transition-colors">
                <span className="font-medium text-[var(--color-blueprint-text-primary)]">{contract.jobs.title}</span>
                <span className="text-[var(--color-blueprint-accent)] font-medium">₹{contract.agreed_rate}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
