import Link from 'next/link'
import { Button } from '@/components/ui/button'

const features = [
  {
    ref: 'REF: 001',
    title: 'Verified Draftsmen',
    desc: 'Every draftsman is manually reviewed. Portfolio checked, credentials verified. No guesswork.',
  },
  {
    ref: 'REF: 002',
    title: 'Secure Payments',
    desc: 'Pay via UPI, cards, or NEFT. Formal invoices generated automatically for every project.',
  },
  {
    ref: 'REF: 003',
    title: 'All CAD Skills',
    desc: 'AutoCAD, Revit, SketchUp, 3D rendering, structural drawings — every skill in one place.',
  },
]

const steps = [
  { n: '01', title: 'Post a job or browse draftsmen', desc: 'Describe your project or search directly by skill and city.' },
  { n: '02', title: 'Review and hire', desc: 'See portfolios, reviews, and rates. Accept an application or send a direct offer.' },
  { n: '03', title: 'Collaborate and deliver', desc: 'Chat, share files, and track delivery — all on platform.' },
  { n: '04', title: 'Pay and review', desc: 'Pay securely via UPI or cards. Get a formal invoice. Leave a review.' },
]

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative pt-24 pb-20 px-6 grid-bg">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 border border-white/10 rounded-full px-4 py-1.5 text-sm text-[var(--color-blueprint-text-secondary)] mb-10">
            <span className="w-2 h-2 rounded-full bg-[var(--color-blueprint-accent)] animate-pulse" />
            Now live — India's first dedicated drafting marketplace
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-[var(--color-blueprint-text-primary)] tracking-tight mb-6 leading-tight">
            India's Drafting Room<br />
            <span className="text-[var(--color-blueprint-accent)]">for Architects.</span>
          </h1>

          <p className="text-xl text-[var(--color-blueprint-text-secondary)] max-w-2xl mx-auto mb-10">
            Connect with skilled draftsmen. Get your drawings done.
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/signup?role=client">Post a Job — It's Free</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/signup?role=draftsman">Join as Draftsman</Link>
            </Button>
          </div>

          <p className="text-xs text-[var(--color-blueprint-text-muted)] mt-6">
            First 100 draftsmen and clients earn a{' '}
            <span className="text-amber-400">Founding Member</span> badge.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 border-t border-white/8">
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

      {/* How it works */}
      <section className="py-20 px-6 border-t border-white/8 bg-[var(--color-blueprint-surface)]/40">
        <div className="max-w-5xl mx-auto">
          <p className="blueprint-label mb-3">// HOW IT WORKS</p>
          <h2 className="text-3xl font-bold text-[var(--color-blueprint-text-primary)] mb-12">Four steps to done</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {steps.map(s => (
              <div key={s.n} className="flex gap-4">
                <span className="text-4xl font-bold text-[var(--color-blueprint-accent)]/30 font-mono leading-none shrink-0">{s.n}</span>
                <div>
                  <h3 className="font-semibold text-[var(--color-blueprint-text-primary)] mb-1">{s.title}</h3>
                  <p className="text-[var(--color-blueprint-text-secondary)] text-sm">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 border-t border-white/8">
        <div className="max-w-3xl mx-auto text-center">
          <p className="blueprint-label mb-3">// GET STARTED</p>
          <h2 className="text-3xl font-bold text-[var(--color-blueprint-text-primary)] mb-4">
            Ready to find your drafting partner?
          </h2>
          <p className="text-[var(--color-blueprint-text-secondary)] mb-8">
            Join the community of architects and draftsmen building India's best technical drawings.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button size="lg" asChild>
              <Link href="/signup?role=client">Post a Job</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/draftsmen">Browse Draftsmen</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}
