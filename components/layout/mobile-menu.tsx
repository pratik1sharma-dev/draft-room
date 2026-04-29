'use client'

import { useState } from 'react'
import Link from 'next/link'

interface MobileMenuProps {
  isLoggedIn: boolean
  role: string | null
}

export function MobileMenu({ isLoggedIn, role }: MobileMenuProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex flex-col gap-1.5 p-2 text-[var(--color-blueprint-text-secondary)] hover:text-[var(--color-blueprint-text-primary)] transition-colors"
        aria-label="Toggle menu"
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4l12 12M16 4L4 16" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 5h14M3 10h14M3 15h14" />
          </svg>
        )}
      </button>

      {open && (
        <div
          className="absolute top-16 left-0 right-0 bg-[var(--color-blueprint-bg)] border-b border-[var(--color-blueprint-border)] px-6 py-4 space-y-1 z-40"
          onClick={() => setOpen(false)}
        >
          <Link href="/draftsmen" className="block py-2.5 text-sm text-[var(--color-blueprint-text-secondary)] hover:text-[var(--color-blueprint-text-primary)]">
            Find Draftsmen
          </Link>
          <Link href="/jobs" className="block py-2.5 text-sm text-[var(--color-blueprint-text-secondary)] hover:text-[var(--color-blueprint-text-primary)]">
            Browse Jobs
          </Link>
          <Link href="/resources" className="block py-2.5 text-sm text-[var(--color-blueprint-text-secondary)] hover:text-[var(--color-blueprint-text-primary)]">
            Resources
          </Link>

          <div className="border-t border-[var(--color-blueprint-border)] pt-3 mt-3 space-y-1">
            {isLoggedIn ? (
              <>
                {role !== 'draftsman' && (
                  <Link href="/post-job" className="block py-2.5 text-sm text-[var(--color-blueprint-text-secondary)] hover:text-[var(--color-blueprint-text-primary)]">
                    Post a Job
                  </Link>
                )}
                {role === 'draftsman' && (
                  <Link href="/jobs" className="block py-2.5 text-sm text-[var(--color-blueprint-text-secondary)] hover:text-[var(--color-blueprint-text-primary)]">
                    Find Jobs
                  </Link>
                )}
                <Link href="/dashboard" className="block py-2.5 text-sm text-[var(--color-blueprint-text-secondary)] hover:text-[var(--color-blueprint-text-primary)]">
                  Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className="block py-2.5 text-sm text-[var(--color-blueprint-text-secondary)] hover:text-[var(--color-blueprint-text-primary)]">
                  Sign in
                </Link>
                <Link href="/signup" className="block py-2.5 text-sm text-[var(--color-blueprint-accent)]">
                  Get started →
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
