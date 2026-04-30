import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-[var(--color-blueprint-border)] py-12 px-6 mt-20">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-8">
        <div>
          <p className="font-bold text-[var(--color-blueprint-text-primary)] mb-1">DraftRoom</p>
          <p className="text-sm text-[var(--color-blueprint-text-secondary)] max-w-xs">
            India's Drafting Room for Architects.
          </p>
          <a
            href="mailto:hello@draftroom.in"
            className="inline-flex items-center gap-2 mt-4 text-sm text-[var(--color-blueprint-accent)] hover:underline"
          >
            hello@draftroom.in →
          </a>
        </div>

        <div className="flex gap-12 text-sm text-[var(--color-blueprint-text-secondary)]">
          <div className="space-y-2">
            <p className="text-[var(--color-blueprint-text-primary)] font-medium">Platform</p>
            <Link href="/draftsmen" className="block hover:text-[var(--color-blueprint-text-primary)]">Find Draftsmen</Link>
            <Link href="/projects" className="block hover:text-[var(--color-blueprint-text-primary)]">Browse Projects</Link>
            <Link href="/resources" className="block hover:text-[var(--color-blueprint-text-primary)]">Resources</Link>
          </div>
          <div className="space-y-2">
            <p className="text-[var(--color-blueprint-text-primary)] font-medium">Company</p>
            <Link href="/about" className="block hover:text-[var(--color-blueprint-text-primary)]">About</Link>
            <Link href="/contact" className="block hover:text-[var(--color-blueprint-text-primary)]">Contact</Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-[var(--color-blueprint-border)] text-xs text-[var(--color-blueprint-text-muted)]">
        <p>© 2026 DraftRoom. All rights reserved.</p>
      </div>
    </footer>
  )
}
