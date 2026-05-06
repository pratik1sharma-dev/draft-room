import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: "About DraftRoom — India's Dedicated Drafting Marketplace",
  description: "Learn why we built DraftRoom — India's first marketplace for architects to find and hire verified CAD drafters. Built by architects, for architects.",
  openGraph: {
    title: "About DraftRoom — India's Drafting Marketplace",
    url: 'https://draftroom.in/about',
  },
  alternates: { canonical: 'https://draftroom.in/about' },
}

export default function AboutPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <p className="blueprint-label mb-2">// ABOUT</p>
      <h1 className="text-3xl font-bold text-[var(--color-blueprint-text-primary)] mb-6">
        Why we built DraftRoom
      </h1>

      <div className="space-y-6 text-[var(--color-blueprint-text-secondary)] leading-relaxed">
        <p>
          Every architect in India knows the problem. You have a deadline, a client breathing down your neck,
          and a set of drawings that need to be done by Friday. You call the usual drafter — busy. You ask
          around the office — nobody available. You end up doing it yourself at midnight.
        </p>
        <p>
          Finding reliable drafting support in India is still word-of-mouth. There&apos;s no marketplace, no
          verified profiles, no standard way to scope work or make payment. It&apos;s 2026 and architects are
          still hiring drafters over WhatsApp.
        </p>
        <p>
          DraftRoom is the platform we wish existed — a dedicated space where architects and designers can
          find skilled drafters quickly, see their actual work, agree on scope and rate, and get drawings
          done without the usual chaos.
        </p>
        <p>
          We&apos;re starting in India, where the gap between supply and demand for drafting talent is largest.
          Every drafter who signs up early earns a <span className="text-amber-400">Founding Member</span> badge
          — recognition that they helped build something new.
        </p>
      </div>

      <div className="mt-12 blueprint-card p-6">
        <p className="blueprint-label mb-3">// THE TEAM</p>
        <p className="text-[var(--color-blueprint-text-secondary)] text-sm">
          DraftRoom is built by a small team with backgrounds in architecture and software.
          We&apos;re based in India and building in public.
        </p>
      </div>

      <div className="mt-8 flex gap-4">
        <Button asChild>
          <Link href="/signup">Join DraftRoom →</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/contact">Get in touch</Link>
        </Button>
      </div>
    </main>
  )
}
