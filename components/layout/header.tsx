import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { signOut } from '@/lib/actions/auth'
import { MobileMenu } from './mobile-menu'

export async function Header() {
  let user = null
  let userRole: string | null = null
  try {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    user = data.user
    if (user) {
      const { data: userData } = await supabase
        .from('users').select('role').eq('id', user.id).single()
      userRole = userData?.role ?? null
    }
  } catch {
    // Supabase not configured yet — render unauthenticated header
  }

  const isDraftsman = userRole === 'draftsman'

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-[var(--color-blueprint-border)] bg-[var(--color-blueprint-bg)]/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-6 h-6 border-2 border-[var(--color-blueprint-accent)] rounded-sm flex items-center justify-center">
            <div className="w-2 h-2 bg-[var(--color-blueprint-accent)] rounded-sm" />
          </div>
          <span className="font-bold text-[var(--color-blueprint-text-primary)] tracking-wide">DraftRoom</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/draftsmen" className="text-sm text-[var(--color-blueprint-text-secondary)] hover:text-[var(--color-blueprint-text-primary)] transition-colors">
            Find Draftsmen
          </Link>
          <Link href="/jobs" className="text-sm text-[var(--color-blueprint-text-secondary)] hover:text-[var(--color-blueprint-text-primary)] transition-colors">
            Browse Jobs
          </Link>
          <Link href="/resources" className="text-sm text-[var(--color-blueprint-text-secondary)] hover:text-[var(--color-blueprint-text-primary)] transition-colors">
            Resources
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                {isDraftsman ? (
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/jobs">Find Jobs</Link>
                  </Button>
                ) : (
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/post-job">Post a Job</Link>
                  </Button>
                )}
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
                <form action={signOut}>
                  <Button variant="outline" size="sm" type="submit">Sign out</Button>
                </form>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Sign in</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/signup">Get started</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <MobileMenu isLoggedIn={!!user} role={userRole} />
        </div>
      </div>
    </header>
  )
}
