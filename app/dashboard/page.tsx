import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

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

  return (
    <main className="max-w-5xl mx-auto px-6 py-12">
      <p className="blueprint-label mb-2">Dashboard</p>
      <h1 className="text-2xl font-bold text-[var(--color-blueprint-text-primary)] mb-8">
        Welcome back, {userData.name}
      </h1>
      <div className="blueprint-card p-6 text-[var(--color-blueprint-text-secondary)] text-sm">
        Marketplace features coming soon — jobs, applications, and contracts.
      </div>
    </main>
  )
}
