# Drafting Platform — Design Spec
**Date:** 2026-04-29
**Tagline:** "India's Drafting Room for Architects."
**Status:** Approved

---

## 1. Problem

Architects and designers in India rely on WhatsApp groups and informal referrals to find draftsmen for AutoCAD, Revit, SketchUp, and other technical drawing work. There is no dedicated, trustworthy platform for this. Generic platforms (Upwork, Fiverr, Truelancer) exist but are not built for this workflow — no domain-specific tools, no portfolio verification, no drawing file support.

---

## 2. Solution

A niche marketplace connecting architects, designers, contractors, and real estate developers with skilled draftsmen across India. The platform is built around the work itself — portfolios of real drawings lead the experience, not job listings.

**Future extensions (post-MVP):**
- Escrow / milestone-based payment guarantee
- AI quality verification of delivered drawings
- Mobile app (iOS + Android)
- Global expansion

---

## 3. Target Users

### Clients (post work)
- Individual freelance architects
- Small architecture firms (2–20 people)
- Interior designers
- Contractors and real estate developers

### Draftsmen (complete work)
- AutoCAD specialists (2D drafting, layouts, shop drawings)
- Revit / BIM modelers
- SketchUp + 3D visualization artists
- Structural drawing specialists

---

## 4. Tech Stack

| Layer | Technology | Cost |
|---|---|---|
| Frontend + API | Next.js (App Router) | Free (Vercel) |
| Database + Auth + Realtime | Supabase | Free tier |
| File Storage | Cloudinary | Free tier (25 GB) |
| Payments | Razorpay | Free (2% per txn) |
| Hosting | Vercel | Free tier |

**Total infra cost at MVP: ₹0**

---

## 5. Architecture

```
┌─────────────────────────────────────────────┐
│           Next.js (Vercel)                  │
│  ┌─────────────┐    ┌──────────────────┐   │
│  │  Frontend   │    │   API Routes /   │   │
│  │ (App Router │    │  Server Actions  │   │
│  │ + Tailwind) │    │                  │   │
│  └──────┬──────┘    └────────┬─────────┘   │
└─────────┼────────────────────┼─────────────┘
          │                    │
          ▼                    ▼
┌─────────────────────────────────────────────┐
│              Supabase                        │
│  ┌──────────┐ ┌──────────┐ ┌─────────────┐ │
│  │ Postgres │ │  Auth    │ │  Realtime   │ │
│  │    DB    │ │ (email + │ │  (chat)     │ │
│  │          │ │  Google) │ │             │ │
│  └──────────┘ └──────────┘ └─────────────┘ │
└─────────────────────────────────────────────┘
          │
          ▼
┌──────────────────┐    ┌─────────────────┐
│   Cloudinary     │    │    Razorpay     │
│  (portfolios,    │    │  (UPI, cards,   │
│   drawings,      │    │   NEFT)         │
│   deliverables)  │    │                 │
└──────────────────┘    └─────────────────┘
```

---

## 6. Data Model

```sql
users
  id, email, role (client | draftsman)
  name, phone, city, state
  created_at

profiles
  user_id (FK → users)
  bio, avatar_url
  is_founding_member   -- boolean, first 100 of each role
  -- draftsman only --
  skills[]             -- e.g. ["AutoCAD", "Revit", "SketchUp"]
  hourly_rate
  experience_years
  portfolio_urls[]     -- Cloudinary URLs
  availability         -- boolean
  is_verified          -- boolean, set by admin after manual review
  linkedin_url         -- submitted during onboarding for verification
  -- client only --
  firm_name
  project_types[]      -- e.g. ["Residential", "Commercial"]

jobs
  id, client_id (FK → users)
  title, description
  skills_required[]
  budget_type        -- fixed | hourly
  budget_amount
  deadline
  status             -- open | in_progress | completed | cancelled
  attachments[]      -- Cloudinary URLs

applications
  id
  job_id (FK → jobs)
  draftsman_id (FK → users)
  cover_note
  proposed_rate
  status             -- pending | accepted | rejected

contracts
  id
  job_id (FK → jobs)
  client_id (FK → users)
  draftsman_id (FK → users)
  agreed_rate
  status             -- active | completed | disputed
  created_at

messages
  id
  contract_id (FK → contracts)
  sender_id (FK → users)
  content
  file_url           -- Cloudinary URL (optional)
  created_at

reviews
  id
  contract_id (FK → contracts)
  reviewer_id (FK → users)
  reviewee_id (FK → users)
  rating             -- 1 to 5
  comment
  created_at
```

---

## 7. MVP Features

### Authentication & Onboarding
- Sign up / login via email or Google (Supabase Auth)
- Role selection: Client or Draftsman
- Guided onboarding form captures role-specific profile data

### Draftsman Profile (public)
- Skills, experience, hourly rate
- Portfolio gallery (images, PDFs via Cloudinary)
- Availability badge
- Reviews and average rating
- **Verified badge** — awarded after manual admin review of portfolio + credentials (LinkedIn profile, reference check). Unverified draftsmen can still use the platform but verified ones are ranked higher in search.

### Job Posting (client)
- Title, description, skills needed
- Budget (fixed or hourly) and deadline
- File attachments (briefs, reference drawings)

### Discovery & Matching
- Clients: browse draftsmen filtered by skill, city, rate
- Draftsmen: browse open jobs filtered by skill, budget
- Platform suggests matching draftsmen when a job is posted (simple DB query: skill overlap + availability = true, no ML)

### Applications
- Draftsman applies with cover note + proposed rate
- Client reviews all applications, accepts one
- Acceptance auto-creates a contract

### Messaging
- In-platform chat per contract (Supabase Realtime)
- File sharing within chat (drawings, briefs, deliverables via Cloudinary)

### Payments
- Client pays draftsman via Razorpay (UPI, cards, NEFT)
- Payment history visible to both parties
- No escrow in MVP — direct payment

### Reviews
- Both parties leave a rating (1–5) + written review after contract completion
- Reviews are public on profiles

### Community — Resources Section
- Static content section: drafting standards, AutoCAD/Revit tutorials, contract templates (downloadable)
- Managed by admin initially (no user-generated content in MVP)
- Discord community link prominently placed — zero build effort, gives users a place to network

### Early Adopter Program
- **Founding Member badge** on profiles for first 100 draftsmen and first 100 clients (DB flag: `is_founding_member`)
- **Satisfaction Guarantee (policy):** If a client's first project is subpar, admin issues a platform credit for a future job — no technical build needed in MVP, handled manually by admin
- **Zero commission promise:** First 5 projects per draftsman are commission-free — no technical enforcement needed in MVP since platform is free; this is a public commitment for when monetization starts

### Payments — Invoice Generation
- On payment completion, auto-generate a formal PDF invoice (client + draftsman details, job title, amount, date, invoice number)
- Invoice sent to both parties via email and available to download from dashboard
- Simple but powerful differentiator vs. informal WhatsApp channels

---

## 8. User Flows

### Flow 1 — Client posts and hires
```
Sign up → Profile → Post job →
Receive applications → Accept one →
Contract created → Chat + files →
Client marks contract complete → Pay → Review
```

### Flow 2 — Draftsman applies
```
Sign up → Profile + portfolio →
Browse jobs / see suggestions →
Apply → Accepted → Contract →
Chat + deliver → Get paid → Review
```

### Flow 3 — Client directly hires
```
Browse draftsmen → Filter →
View profile + portfolio →
Send direct hire offer (creates a pre-filled application with client's budget) →
Draftsman accepts or counters rate →
Contract created → Chat + deliver → Complete
```

---

## 9. Key Pages

| Page | Access |
|---|---|
| Landing | Public |
| Browse draftsmen | Public |
| Browse jobs | Public |
| Draftsman profile | Public |
| Post a job | Client (auth) |
| Client dashboard | Client (auth) |
| Draftsman dashboard | Draftsman (auth) |
| Applications inbox | Both (auth) |
| Contract + Chat | Both (auth) |
| Payment | Client (auth) |

---

## 10. Design Language — Blueprint Aesthetic

**Concept:** The UI feels like a technical drawing canvas. Architects visiting the platform should instantly recognize the visual language of their own work.

**Color Palette:**
- Background: `#0A0F1E` (deep navy)
- Surface: `#111827`
- Primary accent: `#2D7DD2` (electric blue)
- Lines/borders: `rgba(255,255,255,0.08)` (subtle grid)
- Text primary: `#F9FAFB`
- Text secondary: `#9CA3AF`

**Typography:**
- Font: Space Grotesk (geometric, technical, modern)
- Headings: bold, tracked slightly wide
- Body: regular weight, high legibility

**UI Motifs:**
- Subtle dot-grid or line-grid background texture
- Cards styled like drawing sheets (thin border, title block corner detail)
- Coordinate/ruler accents on section headers
- Blueprint-style labels (e.g. `REF: PROJ-001`)

**Tone:**
- Does NOT look like a job board
- Feels like a design tool / creative professional platform
- No stock photography — real drawing previews lead the visual experience

**Hero:**
> "India's Drafting Room for Architects."
> Sub: *Connect with skilled draftsmen. Get your drawings done.*

---

## 11. Monetization (Post-MVP)

Platform is free at launch to build liquidity on both sides. Future models to evaluate:

- **Commission:** 8–15% platform fee per transaction
- **Subscription:** Monthly plan for clients (unlimited job posts)
- **Premium features:** AI quality check as paid add-on, featured profile for draftsmen
- **Escrow fee:** Small fee for payment guarantee service

---

## 12. Future Roadmap

| Phase | Features |
|---|---|
| MVP | Marketplace, profiles, jobs, applications, chat, payments + invoice generation, reviews, Verified badge, Founding Member badge, Resources section, Discord community |
| V2 | Escrow + milestone payments, automated skill test / sample work submission, built-in forum |
| V3 | AI quality check on deliverables (file format, completeness, spec compliance) |
| V4 | Mobile app (iOS + Android), global expansion |
