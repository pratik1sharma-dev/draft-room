# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

# DraftRoom — Project Rules

## What this is
India's marketplace connecting architects/clients with CAD draftsmen. Clients post projects, draftsmen apply or get hired directly. No escrow for MVP — parties handle payment directly.

## Commands

```bash
npm run dev       # start dev server on localhost:3000
npm run build     # production build
npm run lint      # eslint
npx vitest        # run all tests
npx vitest run path/to/test.ts  # run a single test file
```

## Tech stack
- Next.js 16 App Router (see AGENTS.md — read docs before writing code)
- Tailwind CSS v4 with `@theme inline {}` — use CSS custom properties, not hardcoded colours
- Supabase (Postgres + RLS) — DB table is `jobs`, UI calls them "projects" everywhere
- `proxy.ts` handles auth redirects (not `middleware.ts`)
- Groq (`qwen/qwen3-32b`) for AI via `lib/ai/gemini.ts` (misnamed, uses Groq)
- Zod + react-hook-form for validation; server actions use `useActionState`

## Architecture

### Layer responsibilities
- `lib/data/` — pure Supabase reads, no business logic, called from Server Components
- `lib/actions/` — `'use server'` mutations; call `createClient()`, check auth, mutate, then `revalidatePath()`
- `lib/validations/` — Zod schemas shared between client and server
- `components/ui/` — design-system primitives (Button, Input, Badge, etc.)
- `components/layout/` — Header, Footer, MobileMenu
- `components/marketplace/` — domain components (JobCard, DraftsmanCard, ApplyForm, etc.)

### Supabase clients
- `lib/supabase/server.ts` → `createClient()` — use in Server Components and server actions
- `lib/supabase/client.ts` → `createBrowserClient()` — use only in Client Components

### Server action signature
Actions that handle forms use `useActionState`:
```ts
export async function myAction(
  _prev: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null>
```

### Two hiring paths
1. **Marketplace apply**: draftsman applies to an open project → client accepts → contract auto-created at `offer_sent` status
2. **Direct hire** (`/draftsmen/[id]/hire`): client picks a draftsman → optionally selects an existing job or creates one inline → contract created at `offer_sent` status immediately. The `hire_after` query param on job creation chains the two paths (create project then redirect to hire).

### `attachments` column gotcha
The `jobs.attachments` string[] column stores **deliverables** (lines from AI-generated spec), not file attachments. AI spec output is split on newlines and saved there.

## AI
- Use `generateJSON<T>(prompt, systemPrompt)` from `lib/ai/gemini.ts` for all AI calls
- Never use Claude API — use Groq only
- API key: `GROQ_API_KEY` in `.env.local`
- Log prompts and responses with `console.log('[Groq] ...')`

## Naming
- DB: `jobs` table, `job_id` columns
- UI/routes/copy: "project" everywhere — never say "job" to users
- Routes: `/projects`, `/post-project` (not `/jobs`)

## Theming
- All colours via CSS custom properties: `var(--color-blueprint-*)`
- Theme set via `data-theme` on `<html>` — config in `lib/config/theme.ts`
- Never hardcode colours like `#fff` or `blue-500`
- Font: Space Grotesk via `var(--font-sans)`

## Contract workflow states
`offer_sent` → `client_turn` ⇄ `draftsman_turn` → `terms_agreed` → `in_progress` → `in_review` ⇄ `revision_requested` → `completed`  
Also: `declined`, `cancelled`, `disputed`

Negotiation fields: `proposed_deliverables`, `proposed_amount` (cleared on agreement or client counter). Final agreed values: `agreed_deliverables`, `agreed_amount`, `agreed_at`.

## Key patterns
- Server actions in `lib/actions/` — always `'use server'` at top
- Data fetching in `lib/data/` — pure Supabase queries, no business logic
- All dynamic pages need `export const dynamic = 'force-dynamic'`
- Role check: query `users.role` — values are `'client'` or `'draftsman'`
- Applications shown on the project detail page (not a separate page) for the owner
- `revalidatePath()` after every mutation

## Workflow
- Before making any code changes, propose the plan and approach and wait for explicit approval
- Do not proactively add features, refactor, or clean up unless asked
- When asked an exploratory question ("what could we do?", "how should we approach?"), answer in 2-3 sentences with a recommendation — do not implement until the user confirms

## SEO
- Every page exports a `generateMetadata()` function (or static `metadata` object for non-dynamic pages) — title, description, canonical, og:image
- Page titles: `"<Page Name> | DraftRoom"` — include primary keyword (e.g. "CAD Drafting Services", "Hire a Draftsman")
- Dynamic pages (`/projects/[id]`, `/draftsmen/[id]`) generate metadata from DB data — use `generateMetadata({ params })` pattern
- Use Next.js `<Image>` for all images — never `<img>` — ensures lazy loading and proper sizing for Core Web Vitals
- All interactive pages are Server Components at the page level; keep `'use client'` to leaf components only — maximises SSR for indexability
- Public-facing routes (`/`, `/projects`, `/draftsmen`, `/projects/[id]`, `/draftsmen/[id]`) must be crawlable — do not gate them behind auth
- Structured data (`application/ld+json`) for listing pages and profile pages (JobPosting, Person schemas)
- `robots.ts` and `sitemap.ts` live in `app/` — update sitemap when adding new public routes
- Semantic HTML: one `<h1>` per page, logical heading hierarchy (`h2` → `h3`), landmark elements (`<main>`, `<nav>`, `<footer>`)
- Never use `export const dynamic = 'force-dynamic'` on public SEO pages unless required — prefer static or ISR

## Do not
- Add payment/escrow logic — out of scope for MVP
- Use `middleware.ts` for auth — use `proxy.ts`
- Hardcode any colour values
- Say "job" in any user-facing copy
