'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    router.push('/dashboard')
    router.refresh()
  }

  async function handleGoogleLogin() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/api/auth/callback` },
    })
  }

  return (
    <>
      <div className="mb-8">
        <p className="blueprint-label mb-2">Welcome back</p>
        <h1 className="text-2xl font-bold text-[var(--color-blueprint-text-primary)]">Sign in to DraftRoom</h1>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <Input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
        <Input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center">
          <span className="px-3 bg-[var(--color-blueprint-surface)] text-[var(--color-blueprint-text-muted)] text-xs">or</span>
        </div>
      </div>

      <Button variant="outline" className="w-full" onClick={handleGoogleLogin} type="button">
        Continue with Google
      </Button>

      <p className="text-center text-[var(--color-blueprint-text-secondary)] text-sm mt-6">
        No account?{' '}
        <Link href="/signup" className="text-[var(--color-blueprint-accent)] hover:underline">Sign up free</Link>
      </p>
    </>
  )
}
