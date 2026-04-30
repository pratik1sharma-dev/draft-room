import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SpecForm } from './spec-form'

export const dynamic = 'force-dynamic'

export default async function PostProjectPage({
  searchParams,
}: {
  searchParams: Promise<{ hire_after?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (userData?.role !== 'client') redirect('/dashboard')

  const { hire_after } = await searchParams

  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <p className="blueprint-label mb-2">// NEW PROJECT</p>
      <h1 className="text-2xl font-bold text-[var(--color-blueprint-text-primary)] mb-2">
        Post a Project
      </h1>
      <p className="text-sm text-[var(--color-blueprint-text-muted)] mb-8">
        Describe your project in plain language — AI will generate a full spec and deliverables list for you to review.
      </p>
      <SpecForm hireAfter={hire_after} />
    </main>
  )
}
