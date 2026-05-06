import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getClientJobs } from '@/lib/data/jobs'
import { getDraftsmanApplications, getContracts } from '@/lib/data/applications'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

import { ContractStatus, ACTIVE_STATUSES } from '@/lib/contracts/states'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userData } = await supabase.from('users').select('*').eq('id', user.id).single()
  if (!userData) redirect('/onboarding')

  const { data: profileData } = await supabase
    .from('profiles')
    .select('bio, skills, hourly_rate, firm_name')
    .eq('user_id', user.id)
    .single()

  const isClient = userData.role === 'client'
  const isProfileIncomplete = isClient
    ? !userData.city || !userData.state
    : !profileData?.bio || !profileData?.skills?.length

  return (
    <main className="max-w-5xl mx-auto px-6 py-12">
      <p className="blueprint-label mb-2">// DASHBOARD</p>
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-blueprint-text-primary)]">
          Welcome back, {userData.name}
        </h1>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
          isClient
            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            : 'bg-[var(--color-blueprint-accent)]/10 text-[var(--color-blueprint-accent)] border-[var(--color-blueprint-accent)]/30'
        }`}>
          {isClient ? 'Client' : 'Draftsman'}
        </span>
      </div>

      {isProfileIncomplete && (
        <div className="mb-6 p-4 rounded-lg border border-amber-500/30 bg-amber-500/5 flex items-center justify-between gap-4 flex-wrap">
          <p className="text-sm text-amber-400">
            {isClient
              ? 'Complete your profile — add your city and state so draftsmen know where you\'re based.'
              : 'Add your bio and skills — required before you can apply to projects.'}
          </p>
          <Button size="sm" asChild>
            <Link href="/profile/edit">Complete profile →</Link>
          </Button>
        </div>
      )}

      {isClient
        ? <ClientDashboard userId={user.id} />
        : <DraftsmanDashboard userId={user.id} />
      }
    </main>
  )
}

async function ClientDashboard({ userId }: { userId: string }) {
  const projects = await getClientJobs(userId)
  const activeProjects = projects.filter((j: any) => j.status === 'open' || j.status === 'in_progress')
  const contracts = await getContracts(userId, 'client')
  const actionRequired = contracts.filter((c: any) => c.status === ContractStatus.CLIENT_TURN)
  const activeContracts = contracts.filter((c: any) => (ACTIVE_STATUSES as string[]).includes(c.status))
  return (
    <div className="space-y-8">
      <div className="flex gap-3 flex-wrap">
        <Button asChild><Link href="/post-project">Post a Project →</Link></Button>
        <Button variant="outline" asChild><Link href="/draftsmen">Browse Draftsmen</Link></Button>
        <Button variant="outline" asChild><Link href="/profile/edit">Edit Profile</Link></Button>
      </div>

      {actionRequired.length > 0 && (
        <div>
          <p className="blueprint-label mb-3">// ACTION REQUIRED</p>
          <div className="space-y-2">
            {actionRequired.map((c: any) => (
              <Link key={c.id} href={`/contracts/${c.id}`} className="blueprint-card p-4 flex items-center justify-between hover:border-[var(--color-blueprint-accent)]/40 transition-colors border-[var(--color-blueprint-accent)]/30">
                <span className="font-medium text-[var(--color-blueprint-text-primary)]">{c.jobs.title}</span>
                <span className="text-xs text-[var(--color-blueprint-accent)]">Your turn →</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Active Projects', value: activeProjects.length },
          { label: 'Total Projects', value: projects.length },
          { label: 'Active Contracts', value: activeContracts.length },
        ].map(stat => (
          <div key={stat.label} className="blueprint-card p-5 text-center">
            <p className="text-3xl font-bold text-[var(--color-blueprint-accent)]">{stat.value}</p>
            <p className="text-sm text-[var(--color-blueprint-text-secondary)] mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {activeProjects.length > 0 && (
        <div>
          <p className="blueprint-label mb-3">// MY PROJECTS</p>
          <div className="space-y-2">
            {activeProjects.slice(0, 4).map((project: any) => (
              <Link key={project.id} href={`/projects/${project.id}`} className="blueprint-card p-4 flex items-center justify-between hover:border-[var(--color-blueprint-accent)]/40 transition-colors">
                <span className="font-medium text-[var(--color-blueprint-text-primary)]">{project.title}</span>
                <div className="flex items-center gap-2">
                  {project.application_count > 0 && (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[var(--color-blueprint-accent)]/10 text-[var(--color-blueprint-accent)] border border-[var(--color-blueprint-accent)]/30">
                      {project.application_count} applied
                    </span>
                  )}
                  <Badge variant={project.status === 'open' ? 'available' : 'founding'}>{project.status}</Badge>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {activeProjects.length === 0 && (
        <div className="blueprint-card p-8 text-center">
          <p className="text-[var(--color-blueprint-text-secondary)] mb-2">No active projects yet.</p>
          <p className="text-sm text-[var(--color-blueprint-text-muted)] mb-4">Post a project or hire a draftsman directly.</p>
          <div className="flex gap-3 justify-center">
            <Button asChild><Link href="/post-project">Post a Project →</Link></Button>
            <Button variant="outline" asChild><Link href="/draftsmen">Browse Draftsmen</Link></Button>
          </div>
        </div>
      )}
    </div>
  )
}

async function DraftsmanDashboard({ userId }: { userId: string }) {
  const applications = await getDraftsmanApplications(userId)
  const contracts = await getContracts(userId, 'draftsman')
  const actionRequired = contracts.filter((c: any) => c.status === ContractStatus.DRAFTSMAN_TURN || c.status === ContractStatus.OFFER_SENT || c.status === ContractStatus.REVISION_REQUESTED)
  const activeContracts = contracts.filter((c: any) => (ACTIVE_STATUSES as string[]).includes(c.status))
  const pendingApps = applications.filter((a: any) => a.status === 'pending')

  return (
    <div className="space-y-8">
      <div className="flex gap-3 flex-wrap">
        <Button asChild><Link href="/projects">Find Projects →</Link></Button>
        <Button variant="outline" asChild><Link href="/contracts">My Contracts</Link></Button>
        <Button variant="outline" asChild><Link href="/applications">My Applications</Link></Button>
        <Button variant="outline" asChild><Link href={`/draftsmen/${userId}`}>View Profile</Link></Button>
        <Button variant="outline" asChild><Link href="/profile/edit">Edit Profile</Link></Button>
      </div>

      {actionRequired.length > 0 && (
        <div>
          <p className="blueprint-label mb-3">// ACTION REQUIRED</p>
          <div className="space-y-2">
            {actionRequired.map((c: any) => (
              <Link key={c.id} href={`/contracts/${c.id}`} className="blueprint-card p-4 flex items-center justify-between hover:border-[var(--color-blueprint-accent)]/40 transition-colors border-[var(--color-blueprint-accent)]/30">
                <span className="font-medium text-[var(--color-blueprint-text-primary)]">{c.jobs.title}</span>
                <span className="text-xs text-[var(--color-blueprint-accent)]">
                  {c.status === ContractStatus.OFFER_SENT ? 'New offer →' : 'Your turn →'}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

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
          <div className="space-y-2">
            {activeContracts.slice(0, 4).map((contract: any) => (
              <Link key={contract.id} href={`/contracts/${contract.id}`} className="blueprint-card p-4 flex items-center justify-between hover:border-[var(--color-blueprint-accent)]/40 transition-colors">
                <span className="font-medium text-[var(--color-blueprint-text-primary)]">{contract.jobs.title}</span>
                <span className="text-[var(--color-blueprint-accent)] font-medium text-sm">
                  ₹{(contract.agreed_amount ?? contract.agreed_rate)?.toLocaleString('en-IN')}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {activeContracts.length === 0 && applications.length === 0 && (
        <div className="blueprint-card p-8 text-center">
          <p className="text-[var(--color-blueprint-text-secondary)] mb-2">No active work yet.</p>
          <p className="text-sm text-[var(--color-blueprint-text-muted)] mb-4">Browse open projects and submit your first application.</p>
          <Button asChild><Link href="/projects">Browse Projects →</Link></Button>
        </div>
      )}
    </div>
  )
}
