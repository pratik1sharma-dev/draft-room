import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Hire Verified CAD Drafters for Architecture Projects in India | DraftRoom',
  description: "India's first dedicated drafting marketplace. Find AutoCAD, Revit, SketchUp, structural, and interiors drafters across India. Scope agreed before work starts.",
  openGraph: {
    title: 'Hire Verified CAD Drafters in India | DraftRoom',
    description: "India's first dedicated drafting marketplace. Scope agreed. Work starts.",
    url: 'https://www.thedraftroom.in',
  },
}

const features = [
  {
    ref: 'REF: 001',
    title: 'Verified Drafters',
    desc: 'Every drafter is manually reviewed. Portfolio checked, credentials verified. No guesswork.',
  },
  {
    ref: 'REF: 002',
    title: 'AI-Assisted Briefs',
    desc: 'When you hire directly, AI turns your requirements into a structured project spec — deliverables, timeline, format. Both sides review and confirm before work starts.',
  },
  {
    ref: 'REF: 003',
    title: 'All CAD Skills',
    desc: 'AutoCAD, Revit, SketchUp, 3D rendering, structural drawings — every skill in one place.',
  },
]

const audiences = [
  {
    label: 'For Architects',
    title: 'Hire drafters who understand your workflow',
    desc: 'Post requirements, review verified portfolios, and pick a drafter who matches your project and timeline.',
    cta: 'Post a Project',
    href: '/signup?role=client',
  },
  {
    label: 'For Builders',
    title: 'Structural, MEP, and site drawings — on demand',
    desc: 'Find experienced drafters for your construction projects. Agree on deliverables before a single line is drawn.',
    cta: 'Browse Drafters',
    href: '/drafters',
  },
  {
    label: 'For Drafters',
    title: 'Get hired for what you\'re actually good at',
    desc: 'Browse open projects, receive direct offers from clients, and work with a clear scope — no scope creep.',
    cta: 'Join as Drafter',
    href: '/signup?role=drafter',
  },
]

const steps = [
  { n: '01', title: 'Post a project or browse drafters', desc: 'Describe your project or search directly by skill and city.' },
  { n: '02', title: 'Review portfolios and hire', desc: 'See portfolios, rates, and availability. Send a direct offer — AI helps generate the project brief.' },
  { n: '03', title: 'Agree on scope before work starts', desc: 'Confirm deliverables, timeline, and rate. Both sides sign off before anything begins.' },
  { n: '04', title: 'Review and approve', desc: 'Track progress milestone by milestone. Request revisions if needed, then mark it complete.' },
]

const trustSignals = [
  { label: 'Verified Portfolios', desc: 'Every drafter manually reviewed' },
  { label: 'AI-Assisted Briefs', desc: 'Structured spec generated automatically' },
  { label: 'Dispute-Free Delivery', desc: 'Clear terms, no surprises' },
  { label: 'India-Focused', desc: 'Built for Indian architects and drafters' },
]

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative pt-24 pb-20 px-6 grid-bg">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 border border-[var(--color-blueprint-border-strong)] rounded-full px-4 py-1.5 text-sm text-[var(--color-blueprint-text-secondary)] mb-10">
            <span className="w-2 h-2 rounded-full bg-[var(--color-blueprint-accent)] animate-pulse" />
            Now live — AI-assisted briefs · verified drafters · structured delivery
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-[var(--color-blueprint-text-primary)] tracking-tight mb-6 leading-tight">
            Hire verified CAD drafters<br />
            <span className="text-[var(--color-blueprint-accent)]">for architecture projects.</span>
          </h1>

          <p className="text-xl text-[var(--color-blueprint-text-secondary)] max-w-2xl mx-auto mb-10">
            Connecting architects, builders &amp; drafters across India — scope agreed before work starts.
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/signup?role=client">Post a Project — It's Free</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/signup?role=drafter">Join as Drafter</Link>
            </Button>
          </div>

          <p className="text-xs text-[var(--color-blueprint-text-muted)] mt-8">
            First 100 drafters and clients earn a{' '}
            <span className="text-amber-400">Founding Member</span> badge.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 border-t border-[var(--color-blueprint-border)]">
        <div className="max-w-5xl mx-auto">
          <p className="blueprint-label mb-3">// WHY DRAFTROOM</p>
          <h2 className="text-3xl font-bold text-[var(--color-blueprint-text-primary)] mb-12 max-w-xl">
            Built for the way architects actually work
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map(f => (
              <div key={f.ref} className="blueprint-card p-6">
                <p className="blueprint-label mb-3">{f.ref}</p>
                <h3 className="text-lg font-semibold text-[var(--color-blueprint-text-primary)] mb-2">{f.title}</h3>
                <p className="text-[var(--color-blueprint-text-secondary)] text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Audience cards */}
      <section className="py-20 px-6 border-t border-[var(--color-blueprint-border)] bg-[var(--color-blueprint-surface)]/40">
        <div className="max-w-5xl mx-auto">
          <p className="blueprint-label mb-3">// WHO IT'S FOR</p>
          <h2 className="text-3xl font-bold text-[var(--color-blueprint-text-primary)] mb-12 max-w-xl">
            Built for every side of the project
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {audiences.map(a => (
              <div key={a.label} className="blueprint-card p-6 flex flex-col">
                <p className="blueprint-label mb-3">{a.label.toUpperCase()}</p>
                <h3 className="text-lg font-semibold text-[var(--color-blueprint-text-primary)] mb-2">{a.title}</h3>
                <p className="text-[var(--color-blueprint-text-secondary)] text-sm leading-relaxed flex-1">{a.desc}</p>
                <Link
                  href={a.href}
                  className="mt-5 text-sm font-medium text-[var(--color-blueprint-accent)] hover:underline"
                >
                  {a.cta} →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6 border-t border-[var(--color-blueprint-border)]">
        <div className="max-w-5xl mx-auto">
          <p className="blueprint-label mb-3">// HOW IT WORKS</p>
          <h2 className="text-3xl font-bold text-[var(--color-blueprint-text-primary)] mb-12">
            Scope agreed. Work starts.
          </h2>
          <div className="grid md:grid-cols-4 gap-0">
            {steps.map((s, i) => (
              <div key={s.n} className="flex flex-col md:flex-row">
                <div className="flex-1 flex flex-col items-start">
                  <span className="text-3xl font-bold text-[var(--color-blueprint-accent)]/30 font-mono mb-3">{s.n}</span>
                  <h3 className="font-semibold text-[var(--color-blueprint-text-primary)] mb-1 text-sm">{s.title}</h3>
                  <p className="text-[var(--color-blueprint-text-muted)] text-xs leading-relaxed">{s.desc}</p>
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden md:flex items-start pt-4 px-3 text-[var(--color-blueprint-border-strong)] text-lg">→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust signals */}
      <section className="py-12 px-6 border-t border-[var(--color-blueprint-border)] bg-[var(--color-blueprint-surface)]/40">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {trustSignals.map(t => (
            <div key={t.label} className="text-center">
              <p className="font-semibold text-[var(--color-blueprint-text-primary)] text-sm mb-1">{t.label}</p>
              <p className="text-xs text-[var(--color-blueprint-text-muted)]">{t.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 border-t border-[var(--color-blueprint-border)]">
        <div className="max-w-3xl mx-auto text-center">
          <p className="blueprint-label mb-3">// GET STARTED</p>
          <h2 className="text-3xl font-bold text-[var(--color-blueprint-text-primary)] mb-4">
            Ready to find your drafting partner?
          </h2>
          <p className="text-[var(--color-blueprint-text-secondary)] mb-8">
            Join the community of architects and drafters building India's best technical drawings.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button size="lg" asChild>
              <Link href="/signup?role=client">Post a Project</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/drafters">Browse Drafters</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}
