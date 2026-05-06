import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const SOFTWARE_GUIDES = [
  {
    title: 'AutoCAD for Beginners',
    description: 'Commands, shortcuts, and workflows every drafter needs to know.',
    tag: 'AutoCAD',
    link: 'https://knowledge.autodesk.com/support/autocad/getting-started',
  },
  {
    title: 'Revit BIM Fundamentals',
    description: 'Families, views, sheets, and collaboration in Revit.',
    tag: 'Revit',
    link: 'https://knowledge.autodesk.com/support/revit',
  },
  {
    title: 'SketchUp Quick Start',
    description: 'Modelling, textures, and exporting for presentations.',
    tag: 'SketchUp',
    link: 'https://help.sketchup.com/en/getting-started-sketchup',
  },
  {
    title: 'V-Ray Rendering Tips',
    description: 'Lighting, materials, and camera settings for photorealistic output.',
    tag: '3D Rendering',
    link: 'https://docs.chaos.com/display/VRAYSKETCHUP/Quick+Start',
  },
]

const INDIA_STANDARDS = [
  {
    title: 'NBC 2016 — National Building Code',
    description: 'The reference standard for building design and construction across India.',
    tag: 'Codes',
    link: 'https://bis.gov.in/product/national-building-code-of-india-2016-nbc-2016/',
  },
  {
    title: 'SP 7 — Explanatory Handbook on NBC',
    description: 'Simplified explanations of NBC provisions — useful for day-to-day drafting.',
    tag: 'Codes',
    link: 'https://bis.gov.in',
  },
  {
    title: 'IS 962 — Code of Practice for Architectural Drawing',
    description: 'BIS standard covering line types, notation, and sheet layout.',
    tag: 'Drawing Standards',
    link: 'https://bis.gov.in/product/is-962/',
  },
  {
    title: 'IS 1477 — Symbols for Building Materials',
    description: 'Standard symbols used in architectural and structural drawings.',
    tag: 'Drawing Standards',
    link: 'https://bis.gov.in',
  },
]

const FREELANCE_TIPS = [
  {
    title: 'How to price your drafting work',
    description: 'Fixed vs hourly, market rates in India, and how to quote confidently.',
    tag: 'Pricing',
  },
  {
    title: 'Writing a winning proposal',
    description: 'What clients look for and how to make your cover note stand out.',
    tag: 'Proposals',
  },
  {
    title: 'Protecting yourself with contracts',
    description: 'Key clauses every freelance drafter should include before starting work.',
    tag: 'Legal',
  },
  {
    title: 'Building a portfolio that converts',
    description: 'Which projects to showcase and how to present them effectively.',
    tag: 'Portfolio',
  },
]

export default function ResourcesPage() {
  return (
    <main className="max-w-5xl mx-auto px-6 py-12">
      <div className="mb-12">
        <p className="blueprint-label mb-2">// KNOWLEDGE BASE</p>
        <h1 className="text-3xl font-bold text-[var(--color-blueprint-text-primary)] mb-4">
          Resources
        </h1>
        <p className="text-[var(--color-blueprint-text-secondary)] max-w-2xl">
          Guides, standards, and tips for drafters and architecture firms working in India.
        </p>
      </div>

      {/* Software Guides */}
      <section className="mb-12">
        <p className="blueprint-label mb-4">// SOFTWARE GUIDES</p>
        <div className="grid md:grid-cols-2 gap-4">
          {SOFTWARE_GUIDES.map(item => (
            <a
              key={item.title}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="blueprint-card p-5 hover:border-[var(--color-blueprint-accent)]/40 transition-colors group block"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-[var(--color-blueprint-text-primary)] group-hover:text-[var(--color-blueprint-accent)] transition-colors">
                  {item.title}
                </h3>
                <Badge variant="skill">{item.tag}</Badge>
              </div>
              <p className="text-sm text-[var(--color-blueprint-text-secondary)]">{item.description}</p>
              <p className="text-xs text-[var(--color-blueprint-accent)] mt-3">Official docs →</p>
            </a>
          ))}
        </div>
      </section>

      {/* India Standards */}
      <section className="mb-12">
        <p className="blueprint-label mb-4">// INDIAN STANDARDS & CODES</p>
        <div className="grid md:grid-cols-2 gap-4">
          {INDIA_STANDARDS.map(item => (
            <a
              key={item.title}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="blueprint-card p-5 hover:border-[var(--color-blueprint-accent)]/40 transition-colors group block"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-[var(--color-blueprint-text-primary)] group-hover:text-[var(--color-blueprint-accent)] transition-colors">
                  {item.title}
                </h3>
                <Badge variant="founding">{item.tag}</Badge>
              </div>
              <p className="text-sm text-[var(--color-blueprint-text-secondary)]">{item.description}</p>
              <p className="text-xs text-[var(--color-blueprint-accent)] mt-3">BIS portal →</p>
            </a>
          ))}
        </div>
      </section>

      {/* Freelance Tips */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <p className="blueprint-label">// FREELANCING IN INDIA</p>
          <span className="text-xs text-[var(--color-blueprint-text-muted)] border border-[var(--color-blueprint-border-strong)] rounded-full px-2 py-0.5">
            Articles coming soon
          </span>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {FREELANCE_TIPS.map(item => (
            <div key={item.title} className="blueprint-card p-5 opacity-70">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-[var(--color-blueprint-text-primary)]">{item.title}</h3>
                <Badge variant="available">{item.tag}</Badge>
              </div>
              <p className="text-sm text-[var(--color-blueprint-text-secondary)]">{item.description}</p>
              <p className="text-xs text-[var(--color-blueprint-text-muted)] mt-3">Coming soon</p>
            </div>
          ))}
        </div>
      </section>

      {/* Community CTA */}
      <div className="blueprint-card p-8 text-center">
        <p className="blueprint-label mb-3">// COMMUNITY</p>
        <h2 className="text-xl font-bold text-[var(--color-blueprint-text-primary)] mb-3">
          Join the DraftRoom Community
        </h2>
        <p className="text-[var(--color-blueprint-text-secondary)] mb-6 max-w-lg mx-auto text-sm">
          Ask questions, share work, get feedback, and connect with other drafters and architecture firms across India.
        </p>
        <Button asChild>
          <a href="https://discord.gg/draftroom" target="_blank" rel="noopener noreferrer">
            Join Discord →
          </a>
        </Button>
      </div>
    </main>
  )
}
