'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

type Role = 'client' | 'draftsman'

export default function SignupPage() {
  const searchParams = useSearchParams()
  const initialRole: Role = searchParams.get('role') === 'draftsman' ? 'draftsman' : 'client'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<Role>(initialRole)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role },
        emailRedirectTo: `${window.location.origin}/api/auth/callback?next=/onboarding`,
      },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    router.push(`/onboarding?role=${role}`)
  }

  async function handleGoogleSignup() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?next=/onboarding&role=${role}`,
      },
    })
  }

  return (
    <>
      <div className="mb-8">
        <p className="blueprint-label mb-2">Create account</p>
        <h1 className="text-2xl font-bold text-[var(--color-blueprint-text-primary)]">Join DraftRoom</h1>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {(['client', 'draftsman'] as Role[]).map(r => (
          <button
            key={r}
            type="button"
            onClick={() => setRole(r)}
            className={cn(
              'p-4 rounded-lg border text-left transition-colors',
              role === r
                ? 'border-[var(--color-blueprint-accent)] bg-[var(--color-blueprint-accent)]/10'
                : 'border-[var(--color-blueprint-border-strong)] hover:border-[var(--color-blueprint-accent)]/50'
            )}
          >
            <p className="font-medium text-[var(--color-blueprint-text-primary)] text-sm">
              {r === 'client' ? 'I need a drafter' : 'I am a drafter'}
            </p>
            <p className="text-xs text-[var(--color-blueprint-text-muted)] mt-0.5">
              {r === 'client' ? 'Post jobs, hire talent' : 'Find work, get paid'}
            </p>
          </button>
        ))}
      </div>

      <form onSubmit={handleSignup} className="space-y-4">
        <Input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
        <Input type="password" placeholder="Password (min 8 characters)" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} autoComplete="new-password" />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Creating account...' : 'Create account'}
        </Button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[var(--color-blueprint-border-strong)]" />
        </div>
        <div className="relative flex justify-center">
          <span className="px-3 bg-[var(--color-blueprint-surface)] text-[var(--color-blueprint-text-muted)] text-xs">or</span>
        </div>
      </div>

      <Button variant="outline" className="w-full" onClick={handleGoogleSignup} type="button">
        Continue with Google
      </Button>

      <p className="text-center text-[var(--color-blueprint-text-secondary)] text-sm mt-6">
        Already have an account?{' '}
        <Link href="/login" className="text-[var(--color-blueprint-accent)] hover:underline">Sign in</Link>
      </p>
    </>
  )
}
