# Drafting Platform — Plan 1: Foundation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bootstrap a working Next.js app with Blueprint design system, Supabase DB schema + auth, and onboarding flows — so a user can sign up, pick a role, complete their profile, and land on a dashboard.

**Architecture:** Next.js 15 App Router with Tailwind CSS for UI. Supabase handles auth (email + Google OAuth), PostgreSQL database, and row-level security. All forms use React Hook Form + Zod for validation. Server Actions handle form submissions.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS, Supabase (`@supabase/ssr`), React Hook Form, Zod, Space Grotesk font, Vitest + React Testing Library, Vercel (deployment).

**This is Plan 1 of 3:**
- **Plan 1 (this):** Foundation — project setup, design system, DB schema, auth, onboarding, landing page
- **Plan 2:** Marketplace Core — profiles, job posting, browse/discovery, applications, contracts
- **Plan 3:** Engagement & Trust — realtime chat, payments + invoices, reviews, badges, resources section

---

## File Structure

Files created in this plan:

```
drafting-platform/
├── app/
│   ├── layout.tsx                        # Root layout: font, theme, header/footer
│   ├── page.tsx                          # Landing page (Blueprint hero + features)
│   ├── globals.css                       # CSS variables + grid background texture
│   ├── (auth)/
│   │   ├── layout.tsx                   # Centered auth layout (no nav)
│   │   ├── login/page.tsx               # Email + Google login
│   │   ├── signup/page.tsx              # Email signup + role selection
│   │   └── onboarding/page.tsx          # Role-aware onboarding form
│   └── api/
│       └── auth/
│           └── callback/route.ts        # Supabase OAuth callback handler
├── components/
│   ├── ui/
│   │   ├── button.tsx                   # Blueprint-styled button (3 variants)
│   │   ├── input.tsx                    # Blueprint-styled text input
│   │   └── badge.tsx                   # Inline badge (verified, founding, etc.)
│   └── layout/
│       ├── header.tsx                   # Nav: logo, links, auth state
│       └── footer.tsx                   # Footer: Discord link, tagline
├── lib/
│   ├── supabase/
│   │   ├── client.ts                    # Browser Supabase client
│   │   └── server.ts                    # Server Supabase client (uses cookies)
│   ├── actions/
│   │   └── onboarding.ts               # Server actions: completeOnboarding (client + draftsman)
│   ├── types.ts                         # TypeScript types matching DB schema
│   └── utils.ts                         # cn() utility for className merging
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql       # All tables + RLS policies + founding member trigger
├── middleware.ts                         # Auth route protection
├── tailwind.config.ts                   # Blueprint theme: colors, fonts, grid pattern
├── vitest.config.ts                     # Vitest config
├── vitest.setup.ts                      # @testing-library/jest-dom setup
├── next.config.ts
├── .env.local.example
└── package.json
```

---

## Task 1: Initialize Next.js Project

**Files:**
- Create: `package.json`, `next.config.ts`, `tsconfig.json`, `tailwind.config.ts`

- [ ] **Step 1: Scaffold the project**

```bash
cd /Users/pratiksharma/projects/drafting-platform
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*"
```

Expected: Next.js project created in `drafting-platform/`.

- [ ] **Step 2: Install dependencies**

```bash
npm install @supabase/supabase-js @supabase/ssr react-hook-form @hookform/resolvers zod clsx tailwind-merge lucide-react pdf-lib resend razorpay next-themes
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom @vitest/coverage-v8
```

- [ ] **Step 3: Create environment variables file**

Create `.env.local.example`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
RESEND_API_KEY=your_resend_api_key
```

Copy to `.env.local` and fill in values from Supabase dashboard.

- [ ] **Step 4: Commit**

```bash
git init
git add .
git commit -m "feat: initialize Next.js project with dependencies"
```

---

## Task 2: Configure Blueprint Design System

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `app/globals.css`
- Create: `vitest.config.ts`, `vitest.setup.ts`

- [ ] **Step 1: Update tailwind.config.ts**

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        blueprint: {
          bg: '#0A0F1E',
          surface: '#111827',
          'surface-2': '#1a2235',
          accent: '#2D7DD2',
          'accent-hover': '#1E6BBF',
          border: 'rgba(255,255,255,0.08)',
          'text-primary': '#F9FAFB',
          'text-secondary': '#9CA3AF',
          'text-muted': '#6B7280',
        },
      },
      fontFamily: {
        sans: ['var(--font-space-grotesk)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
}

export default config
```

- [ ] **Step 2: Update app/globals.css**

```css
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&display=swap');
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --font-space-grotesk: 'Space Grotesk', sans-serif;
}

@layer base {
  body {
    @apply bg-blueprint-bg text-blueprint-text-primary;
    font-family: var(--font-space-grotesk), system-ui, sans-serif;
  }

  * {
    @apply border-blueprint-border;
  }
}

@layer components {
  /* Blueprint card: thin border, technical corner accent */
  .blueprint-card {
    @apply bg-blueprint-surface border border-blueprint-border rounded-lg relative overflow-hidden;
  }

  .blueprint-card::before {
    content: '';
    @apply absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-blueprint-accent opacity-60;
  }

  .blueprint-card::after {
    content: '';
    @apply absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-blueprint-accent opacity-60;
  }

  /* Blueprint grid texture overlay */
  .grid-bg {
    background-image: radial-gradient(circle, rgba(45, 125, 210, 0.12) 1px, transparent 1px);
    background-size: 32px 32px;
  }

  /* Mono label — used for section refs like "// FEATURES" or "REF: 001" */
  .blueprint-label {
    @apply text-xs font-mono text-blueprint-accent tracking-widest uppercase;
  }
}
```

- [ ] **Step 3: Create vitest.config.ts**

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
})
```

- [ ] **Step 4: Create vitest.setup.ts**

```typescript
import '@testing-library/jest-dom'
```

- [ ] **Step 5: Add test script to package.json**

In `package.json`, add to `"scripts"`:
```json
"test": "vitest",
"test:ui": "vitest --ui",
"test:coverage": "vitest run --coverage"
```

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat: configure Blueprint design system and Vitest"
```

---

## Task 3: Supabase Database Schema

**Files:**
- Create: `supabase/migrations/001_initial_schema.sql`

- [ ] **Step 1: Create Supabase project**

Go to https://supabase.com → New project. Copy URL and anon key into `.env.local`.

- [ ] **Step 2: Write the migration file**

Create `supabase/migrations/001_initial_schema.sql`:

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users table (extends Supabase auth.users)
create table public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  role text not null check (role in ('client', 'draftsman')),
  name text not null,
  phone text,
  city text,
  state text,
  created_at timestamptz default now()
);

-- Profiles table (role-specific fields in one table, nullable per role)
create table public.profiles (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade unique not null,
  bio text,
  avatar_url text,
  is_founding_member boolean default false,
  -- draftsman fields
  skills text[] default '{}',
  hourly_rate numeric(10,2),
  experience_years integer,
  portfolio_urls text[] default '{}',
  availability boolean default true,
  is_verified boolean default false,
  linkedin_url text,
  -- client fields
  firm_name text,
  project_types text[] default '{}'
);

-- Jobs table
create table public.jobs (
  id uuid default uuid_generate_v4() primary key,
  client_id uuid references public.users(id) on delete cascade not null,
  title text not null,
  description text not null,
  skills_required text[] default '{}',
  budget_type text not null check (budget_type in ('fixed', 'hourly')),
  budget_amount numeric(10,2) not null,
  deadline date,
  status text not null default 'open' check (status in ('open', 'in_progress', 'completed', 'cancelled')),
  attachments text[] default '{}',
  created_at timestamptz default now()
);

-- Applications table
create table public.applications (
  id uuid default uuid_generate_v4() primary key,
  job_id uuid references public.jobs(id) on delete cascade not null,
  draftsman_id uuid references public.users(id) on delete cascade not null,
  cover_note text,
  proposed_rate numeric(10,2) not null,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  created_at timestamptz default now(),
  unique(job_id, draftsman_id)
);

-- Contracts table
create table public.contracts (
  id uuid default uuid_generate_v4() primary key,
  job_id uuid references public.jobs(id) not null,
  client_id uuid references public.users(id) not null,
  draftsman_id uuid references public.users(id) not null,
  agreed_rate numeric(10,2) not null,
  status text not null default 'active' check (status in ('active', 'completed', 'disputed')),
  created_at timestamptz default now()
);

-- Messages table
create table public.messages (
  id uuid default uuid_generate_v4() primary key,
  contract_id uuid references public.contracts(id) on delete cascade not null,
  sender_id uuid references public.users(id) not null,
  content text,
  file_url text,
  created_at timestamptz default now()
);

-- Reviews table
create table public.reviews (
  id uuid default uuid_generate_v4() primary key,
  contract_id uuid references public.contracts(id) not null,
  reviewer_id uuid references public.users(id) not null,
  reviewee_id uuid references public.users(id) not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamptz default now(),
  unique(contract_id, reviewer_id)
);

-- ─── Row Level Security ───────────────────────────────────────────────────────

alter table public.users enable row level security;
alter table public.profiles enable row level security;
alter table public.jobs enable row level security;
alter table public.applications enable row level security;
alter table public.contracts enable row level security;
alter table public.messages enable row level security;
alter table public.reviews enable row level security;

-- users: own row only
create policy "users_select_own" on public.users for select using (auth.uid() = id);
create policy "users_insert_own" on public.users for insert with check (auth.uid() = id);
create policy "users_update_own" on public.users for update using (auth.uid() = id);

-- profiles: public read, own write
create policy "profiles_select_all" on public.profiles for select using (true);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = user_id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = user_id);

-- jobs: public read, client writes own
create policy "jobs_select_all" on public.jobs for select using (true);
create policy "jobs_insert_own" on public.jobs for insert with check (auth.uid() = client_id);
create policy "jobs_update_own" on public.jobs for update using (auth.uid() = client_id);

-- applications: draftsman creates; both parties read their side; client updates status
create policy "applications_insert_own" on public.applications for insert with check (auth.uid() = draftsman_id);
create policy "applications_select_draftsman" on public.applications for select using (auth.uid() = draftsman_id);
create policy "applications_select_client" on public.applications for select using (
  auth.uid() in (select client_id from public.jobs where id = job_id)
);
create policy "applications_update_client" on public.applications for update using (
  auth.uid() in (select client_id from public.jobs where id = job_id)
);

-- contracts: parties only
create policy "contracts_select_parties" on public.contracts for select using (
  auth.uid() = client_id or auth.uid() = draftsman_id
);
create policy "contracts_insert_client" on public.contracts for insert with check (auth.uid() = client_id);
create policy "contracts_update_client" on public.contracts for update using (auth.uid() = client_id);

-- messages: contract parties only
create policy "messages_select_parties" on public.messages for select using (
  auth.uid() in (select client_id from public.contracts where id = contract_id)
  or auth.uid() in (select draftsman_id from public.contracts where id = contract_id)
);
create policy "messages_insert_parties" on public.messages for insert with check (
  auth.uid() in (select client_id from public.contracts where id = contract_id)
  or auth.uid() in (select draftsman_id from public.contracts where id = contract_id)
);

-- reviews: public read, contract parties write
create policy "reviews_select_all" on public.reviews for select using (true);
create policy "reviews_insert_parties" on public.reviews for insert with check (
  auth.uid() in (select client_id from public.contracts where id = contract_id)
  or auth.uid() in (select draftsman_id from public.contracts where id = contract_id)
);

-- ─── Founding Member Trigger ─────────────────────────────────────────────────
-- Auto-grants founding member badge to first 100 of each role

create or replace function public.handle_new_user()
returns trigger as $$
declare
  role_count integer;
begin
  select count(*) into role_count
  from public.users
  where role = NEW.role;

  insert into public.profiles (user_id, is_founding_member)
  values (NEW.id, role_count <= 100)
  on conflict (user_id) do nothing;

  return NEW;
end;
$$ language plpgsql security definer;

create trigger on_user_created
  after insert on public.users
  for each row execute procedure public.handle_new_user();
```

- [ ] **Step 3: Run migration in Supabase dashboard**

Go to Supabase Dashboard → SQL Editor → paste the contents of `001_initial_schema.sql` → Run.

Expected: All tables created with no errors.

- [ ] **Step 4: Commit**

```bash
git add supabase/
git commit -m "feat: add initial database schema with RLS policies"
```

---

## Task 4: TypeScript Types + Utility

**Files:**
- Create: `lib/types.ts`
- Create: `lib/utils.ts`

- [ ] **Step 1: Create lib/types.ts**

```typescript
export type UserRole = 'client' | 'draftsman'
export type BudgetType = 'fixed' | 'hourly'
export type JobStatus = 'open' | 'in_progress' | 'completed' | 'cancelled'
export type ApplicationStatus = 'pending' | 'accepted' | 'rejected'
export type ContractStatus = 'active' | 'completed' | 'disputed'

export interface User {
  id: string
  email: string
  role: UserRole
  name: string
  phone: string | null
  city: string | null
  state: string | null
  created_at: string
}

export interface Profile {
  id: string
  user_id: string
  bio: string | null
  avatar_url: string | null
  is_founding_member: boolean
  // draftsman
  skills: string[]
  hourly_rate: number | null
  experience_years: number | null
  portfolio_urls: string[]
  availability: boolean
  is_verified: boolean
  linkedin_url: string | null
  // client
  firm_name: string | null
  project_types: string[]
}

export interface Job {
  id: string
  client_id: string
  title: string
  description: string
  skills_required: string[]
  budget_type: BudgetType
  budget_amount: number
  deadline: string | null
  status: JobStatus
  attachments: string[]
  created_at: string
}

export interface Application {
  id: string
  job_id: string
  draftsman_id: string
  cover_note: string | null
  proposed_rate: number
  status: ApplicationStatus
  created_at: string
}

export interface Contract {
  id: string
  job_id: string
  client_id: string
  draftsman_id: string
  agreed_rate: number
  status: ContractStatus
  created_at: string
}

export interface Message {
  id: string
  contract_id: string
  sender_id: string
  content: string | null
  file_url: string | null
  created_at: string
}

export interface Review {
  id: string
  contract_id: string
  reviewer_id: string
  reviewee_id: string
  rating: number
  comment: string | null
  created_at: string
}
```

- [ ] **Step 2: Create lib/utils.ts**

```typescript
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

- [ ] **Step 3: Write tests for utils**

Create `__tests__/lib/utils.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('resolves Tailwind conflicts (last wins)', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
  })

  it('ignores falsy values', () => {
    expect(cn('foo', false, undefined, null, 'bar')).toBe('foo bar')
  })

  it('handles conditional classes', () => {
    expect(cn('base', { active: true, hidden: false })).toBe('base active')
  })
})
```

- [ ] **Step 4: Run tests**

```bash
npm test
```

Expected: 4 tests pass.

- [ ] **Step 5: Commit**

```bash
git add lib/ __tests__/
git commit -m "feat: add TypeScript types and cn utility"
```

---

## Task 5: Supabase Client Setup

**Files:**
- Create: `lib/supabase/client.ts`
- Create: `lib/supabase/server.ts`
- Create: `middleware.ts`

- [ ] **Step 1: Create lib/supabase/client.ts** (used in Client Components)

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

- [ ] **Step 2: Create lib/supabase/server.ts** (used in Server Components + Server Actions)

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}
```

- [ ] **Step 3: Create middleware.ts** (protects dashboard + onboarding routes)

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const protectedPaths = ['/dashboard', '/post-job', '/contracts', '/onboarding']
  const isProtected = protectedPaths.some(p =>
    request.nextUrl.pathname.startsWith(p)
  )

  if (isProtected && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirect logged-in users away from login/signup
  const authPaths = ['/login', '/signup']
  const isAuthPage = authPaths.some(p => request.nextUrl.pathname === p)
  if (isAuthPage && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

- [ ] **Step 4: Commit**

```bash
git add lib/supabase/ middleware.ts
git commit -m "feat: add Supabase client utilities and auth middleware"
```

---

## Task 6: UI Primitives

**Files:**
- Create: `components/ui/button.tsx`
- Create: `components/ui/input.tsx`
- Create: `components/ui/badge.tsx`

- [ ] **Step 1: Write failing test for Button**

Create `__tests__/components/ui/button.test.tsx`:

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  it('applies primary variant styles by default', () => {
    render(<Button>Primary</Button>)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('bg-blueprint-accent')
  })

  it('applies outline variant styles', () => {
    render(<Button variant="outline">Outline</Button>)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('border')
  })

  it('is disabled when disabled prop is set', () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
```

- [ ] **Step 2: Run test — confirm it fails**

```bash
npm test -- button
```

Expected: FAIL with "Cannot find module '@/components/ui/button'"

- [ ] **Step 3: Create components/ui/button.tsx**

```typescript
import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-colors rounded-md',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blueprint-accent',
          'disabled:pointer-events-none disabled:opacity-40',
          variant === 'primary' && 'bg-blueprint-accent text-white hover:bg-blueprint-accent-hover',
          variant === 'outline' && 'border border-blueprint-border text-blueprint-text-primary hover:border-blueprint-accent hover:text-blueprint-accent',
          variant === 'ghost' && 'text-blueprint-text-secondary hover:text-blueprint-text-primary',
          size === 'sm' && 'h-8 px-3 text-sm',
          size === 'md' && 'h-10 px-4 text-sm',
          size === 'lg' && 'h-12 px-6 text-base',
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button }
```

- [ ] **Step 4: Run tests — confirm pass**

```bash
npm test -- button
```

Expected: 4 tests pass.

- [ ] **Step 5: Create components/ui/input.tsx**

```typescript
import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'w-full h-10 px-3 rounded-md text-sm',
          'bg-blueprint-surface border border-blueprint-border',
          'text-blueprint-text-primary placeholder:text-blueprint-text-muted',
          'focus:outline-none focus:ring-2 focus:ring-blueprint-accent focus:border-transparent',
          'disabled:opacity-40 disabled:cursor-not-allowed',
          className
        )}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }
```

- [ ] **Step 6: Create components/ui/badge.tsx**

```typescript
import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'verified' | 'founding' | 'available' | 'skill'
  className?: string
}

export function Badge({ children, variant = 'skill', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium',
        variant === 'verified' && 'bg-blueprint-accent/20 text-blueprint-accent border border-blueprint-accent/30',
        variant === 'founding' && 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
        variant === 'available' && 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
        variant === 'skill' && 'bg-blueprint-surface-2 text-blueprint-text-secondary border border-blueprint-border',
        className
      )}
    >
      {children}
    </span>
  )
}
```

- [ ] **Step 7: Commit**

```bash
git add components/ui/ __tests__/components/
git commit -m "feat: add Blueprint UI primitives (Button, Input, Badge)"
```

---

## Task 7: App Layout (Header + Footer)

**Files:**
- Create: `components/layout/header.tsx`
- Create: `components/layout/footer.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Create components/layout/header.tsx**

```typescript
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'

export async function Header() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-blueprint-border bg-blueprint-bg/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-6 h-6 border-2 border-blueprint-accent rounded-sm flex items-center justify-center">
            <div className="w-2 h-2 bg-blueprint-accent rounded-sm" />
          </div>
          <span className="font-bold text-blueprint-text-primary tracking-wide">DraftRoom</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/draftsmen" className="text-sm text-blueprint-text-secondary hover:text-blueprint-text-primary transition-colors">
            Find Draftsmen
          </Link>
          <Link href="/jobs" className="text-sm text-blueprint-text-secondary hover:text-blueprint-text-primary transition-colors">
            Browse Jobs
          </Link>
          <Link href="/resources" className="text-sm text-blueprint-text-secondary hover:text-blueprint-text-primary transition-colors">
            Resources
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <Button size="sm" asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
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
      </div>
    </header>
  )
}
```

- [ ] **Step 2: Create components/layout/footer.tsx**

```typescript
import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-blueprint-border py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-8">
        <div>
          <p className="font-bold text-blueprint-text-primary mb-1">DraftRoom</p>
          <p className="text-sm text-blueprint-text-secondary max-w-xs">
            India's Drafting Room for Architects.
          </p>
          <a
            href="https://discord.gg/draftroom"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-4 text-sm text-blueprint-accent hover:underline"
          >
            Join our Discord community →
          </a>
        </div>

        <div className="flex gap-12 text-sm text-blueprint-text-secondary">
          <div className="space-y-2">
            <p className="text-blueprint-text-primary font-medium">Platform</p>
            <Link href="/draftsmen" className="block hover:text-blueprint-text-primary">Find Draftsmen</Link>
            <Link href="/jobs" className="block hover:text-blueprint-text-primary">Browse Jobs</Link>
            <Link href="/resources" className="block hover:text-blueprint-text-primary">Resources</Link>
          </div>
          <div className="space-y-2">
            <p className="text-blueprint-text-primary font-medium">Company</p>
            <Link href="/about" className="block hover:text-blueprint-text-primary">About</Link>
            <Link href="/contact" className="block hover:text-blueprint-text-primary">Contact</Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-blueprint-border flex justify-between text-xs text-blueprint-text-muted">
        <p>© 2026 DraftRoom. All rights reserved.</p>
        <p className="blueprint-label">REF: DRAFTROOM-MVP</p>
      </div>
    </footer>
  )
}
```

- [ ] **Step 3: Update app/layout.tsx**

```typescript
import type { Metadata } from 'next'
import './globals.css'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

export const metadata: Metadata = {
  title: "DraftRoom — India's Drafting Room for Architects",
  description: 'Connect with skilled draftsmen. Get your drawings done.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-blueprint-bg text-blueprint-text-primary antialiased">
        <Header />
        <div className="pt-16">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add components/layout/ app/layout.tsx
git commit -m "feat: add Header and Footer layout components"
```

---

## Task 8: Auth Pages (Login + Signup)

**Files:**
- Create: `app/(auth)/layout.tsx`
- Create: `app/(auth)/login/page.tsx`
- Create: `app/(auth)/signup/page.tsx`
- Create: `app/api/auth/callback/route.ts`

- [ ] **Step 1: Create app/(auth)/layout.tsx**

```typescript
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-[calc(100vh-4rem)] grid-bg flex items-center justify-center px-6 py-12">
      <div className="blueprint-card w-full max-w-md p-8">
        {children}
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Create app/(auth)/login/page.tsx**

```typescript
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
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    })
  }

  return (
    <>
      <div className="mb-8">
        <p className="blueprint-label mb-2">Welcome back</p>
        <h1 className="text-2xl font-bold text-blueprint-text-primary">Sign in to DraftRoom</h1>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <Input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
        {error && (
          <p className="text-red-400 text-sm">{error}</p>
        )}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-blueprint-border" />
        </div>
        <div className="relative flex justify-center">
          <span className="px-3 bg-blueprint-surface text-blueprint-text-muted text-xs">or</span>
        </div>
      </div>

      <Button variant="outline" className="w-full" onClick={handleGoogleLogin} type="button">
        Continue with Google
      </Button>

      <p className="text-center text-blueprint-text-secondary text-sm mt-6">
        No account?{' '}
        <Link href="/signup" className="text-blueprint-accent hover:underline">
          Sign up free
        </Link>
      </p>
    </>
  )
}
```

- [ ] **Step 3: Create app/(auth)/signup/page.tsx**

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

type Role = 'client' | 'draftsman'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<Role>('client')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role },
        emailRedirectTo: `${window.location.origin}/api/auth/callback?next=/onboarding`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push(`/onboarding?role=${role}`)
  }

  async function handleGoogleSignup() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?next=/onboarding&role=${role}`,
      },
    })
  }

  return (
    <>
      <div className="mb-8">
        <p className="blueprint-label mb-2">Create account</p>
        <h1 className="text-2xl font-bold text-blueprint-text-primary">Join DraftRoom</h1>
      </div>

      {/* Role selection */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {(['client', 'draftsman'] as Role[]).map(r => (
          <button
            key={r}
            type="button"
            onClick={() => setRole(r)}
            className={cn(
              'p-4 rounded-lg border text-left transition-colors',
              role === r
                ? 'border-blueprint-accent bg-blueprint-accent/10'
                : 'border-blueprint-border hover:border-blueprint-accent/50'
            )}
          >
            <p className="font-medium text-blueprint-text-primary capitalize text-sm">
              {r === 'client' ? 'I need a draftsman' : 'I am a draftsman'}
            </p>
            <p className="text-xs text-blueprint-text-muted mt-0.5">
              {r === 'client' ? 'Post jobs, hire talent' : 'Find work, get paid'}
            </p>
          </button>
        ))}
      </div>

      <form onSubmit={handleSignup} className="space-y-4">
        <Input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <Input
          type="password"
          placeholder="Password (min 8 characters)"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          minLength={8}
          autoComplete="new-password"
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Creating account...' : 'Create account'}
        </Button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-blueprint-border" />
        </div>
        <div className="relative flex justify-center">
          <span className="px-3 bg-blueprint-surface text-blueprint-text-muted text-xs">or</span>
        </div>
      </div>

      <Button variant="outline" className="w-full" onClick={handleGoogleSignup} type="button">
        Continue with Google
      </Button>

      <p className="text-center text-blueprint-text-secondary text-sm mt-6">
        Already have an account?{' '}
        <Link href="/login" className="text-blueprint-accent hover:underline">Sign in</Link>
      </p>
    </>
  )
}
```

- [ ] **Step 4: Create app/api/auth/callback/route.ts**

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
```

- [ ] **Step 5: Enable Google OAuth in Supabase dashboard**

Go to Supabase Dashboard → Authentication → Providers → Google → Enable.
Add `http://localhost:3000/api/auth/callback` to allowed redirect URLs.

- [ ] **Step 6: Commit**

```bash
git add app/
git commit -m "feat: add login, signup, and OAuth callback pages"
```

---

## Task 9: Onboarding Flows

**Files:**
- Create: `lib/actions/onboarding.ts`
- Create: `app/(auth)/onboarding/page.tsx`

- [ ] **Step 1: Write failing test for onboarding validation**

Create `__tests__/lib/actions/onboarding.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { z } from 'zod'

// Extract schemas for testing (we export them for testability)
import { clientOnboardingSchema, draftmanOnboardingSchema } from '@/lib/actions/onboarding'

describe('clientOnboardingSchema', () => {
  it('validates a valid client payload', () => {
    const result = clientOnboardingSchema.safeParse({
      name: 'Rohan Mehta',
      city: 'Mumbai',
      state: 'Maharashtra',
      project_types: ['Residential'],
    })
    expect(result.success).toBe(true)
  })

  it('rejects short name', () => {
    const result = clientOnboardingSchema.safeParse({
      name: 'A',
      city: 'Mumbai',
      state: 'Maharashtra',
    })
    expect(result.success).toBe(false)
    expect(result.error?.errors[0].message).toContain('2 characters')
  })

  it('requires city', () => {
    const result = clientOnboardingSchema.safeParse({
      name: 'Rohan Mehta',
      city: '',
      state: 'Maharashtra',
    })
    expect(result.success).toBe(false)
  })
})

describe('draftmanOnboardingSchema', () => {
  it('validates a valid draftsman payload', () => {
    const result = draftmanOnboardingSchema.safeParse({
      name: 'Priya Singh',
      city: 'Pune',
      state: 'Maharashtra',
      skills: ['AutoCAD', 'Revit'],
      hourly_rate: 500,
      experience_years: 3,
    })
    expect(result.success).toBe(true)
  })

  it('requires at least one skill', () => {
    const result = draftmanOnboardingSchema.safeParse({
      name: 'Priya Singh',
      city: 'Pune',
      state: 'Maharashtra',
      skills: [],
      hourly_rate: 500,
      experience_years: 3,
    })
    expect(result.success).toBe(false)
  })
})
```

- [ ] **Step 2: Run test — confirm it fails**

```bash
npm test -- onboarding
```

Expected: FAIL with "Cannot find module"

- [ ] **Step 3: Create lib/actions/onboarding.ts**

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { z } from 'zod'

export const clientOnboardingSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  firm_name: z.string().optional(),
  project_types: z.array(z.string()).default([]),
})

export const draftmanOnboardingSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  skills: z.array(z.string()).min(1, 'Select at least one skill'),
  hourly_rate: z.number().min(1, 'Hourly rate must be greater than 0'),
  experience_years: z.number().min(0),
  linkedin_url: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
})

export async function completeClientOnboarding(
  _prev: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const result = clientOnboardingSchema.safeParse({
    name: formData.get('name'),
    phone: formData.get('phone') || undefined,
    city: formData.get('city'),
    state: formData.get('state'),
    firm_name: formData.get('firm_name') || undefined,
    project_types: formData.getAll('project_types'),
  })

  if (!result.success) {
    return { error: result.error.errors[0].message }
  }

  const { name, phone, city, state, firm_name, project_types } = result.data

  const { error: userError } = await supabase.from('users').upsert({
    id: user.id,
    email: user.email!,
    role: 'client',
    name, phone: phone ?? null, city, state,
  })

  if (userError) return { error: userError.message }

  const { error: profileError } = await supabase.from('profiles').upsert({
    user_id: user.id,
    firm_name: firm_name ?? null,
    project_types,
  })

  if (profileError) return { error: profileError.message }

  redirect('/dashboard')
}

export async function completeDraftmanOnboarding(
  _prev: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const result = draftmanOnboardingSchema.safeParse({
    name: formData.get('name'),
    phone: formData.get('phone') || undefined,
    city: formData.get('city'),
    state: formData.get('state'),
    skills: formData.getAll('skills'),
    hourly_rate: Number(formData.get('hourly_rate')),
    experience_years: Number(formData.get('experience_years')),
    linkedin_url: formData.get('linkedin_url') || undefined,
  })

  if (!result.success) {
    return { error: result.error.errors[0].message }
  }

  const { name, phone, city, state, skills, hourly_rate, experience_years, linkedin_url } = result.data

  const { error: userError } = await supabase.from('users').upsert({
    id: user.id,
    email: user.email!,
    role: 'draftsman',
    name, phone: phone ?? null, city, state,
  })

  if (userError) return { error: userError.message }

  const { error: profileError } = await supabase.from('profiles').upsert({
    user_id: user.id,
    skills,
    hourly_rate,
    experience_years,
    linkedin_url: linkedin_url || null,
    availability: true,
  })

  if (profileError) return { error: profileError.message }

  redirect('/dashboard')
}
```

- [ ] **Step 4: Run tests — confirm pass**

```bash
npm test -- onboarding
```

Expected: 5 tests pass.

- [ ] **Step 5: Create app/(auth)/onboarding/page.tsx**

```typescript
'use client'

import { useActionState } from 'react'
import { useSearchParams } from 'next/navigation'
import { completeClientOnboarding, completeDraftmanOnboarding } from '@/lib/actions/onboarding'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const SKILLS = ['AutoCAD', 'Revit', 'SketchUp', '3D Rendering', 'Structural Drawings', 'BIM']
const PROJECT_TYPES = ['Residential', 'Commercial', 'Industrial', 'Interior Design', 'Landscape']
const INDIA_STATES = [
  'Andhra Pradesh', 'Delhi', 'Gujarat', 'Karnataka', 'Kerala',
  'Maharashtra', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana',
  'Uttar Pradesh', 'West Bengal',
]

export default function OnboardingPage() {
  const searchParams = useSearchParams()
  const role = searchParams.get('role') === 'draftsman' ? 'draftsman' : 'client'

  const action = role === 'client' ? completeClientOnboarding : completeDraftmanOnboarding
  const [state, formAction, isPending] = useActionState(action, null)

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <p className="blueprint-label mb-2">
          {role === 'client' ? 'Client Profile' : 'Draftsman Profile'}
        </p>
        <h1 className="text-2xl font-bold text-blueprint-text-primary">
          Complete your profile
        </h1>
        <p className="text-blueprint-text-secondary text-sm mt-1">
          This is shown publicly on your profile.
        </p>
      </div>

      <Input name="name" placeholder="Full name" required />
      <Input name="phone" placeholder="Phone number (optional)" type="tel" />

      <div className="grid grid-cols-2 gap-3">
        <Input name="city" placeholder="City" required />
        <select
          name="state"
          required
          className="h-10 px-3 rounded-md text-sm bg-blueprint-surface border border-blueprint-border text-blueprint-text-primary focus:outline-none focus:ring-2 focus:ring-blueprint-accent"
        >
          <option value="">State</option>
          {INDIA_STATES.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {role === 'client' && (
        <>
          <Input name="firm_name" placeholder="Firm / company name (optional)" />
          <div>
            <p className="text-sm text-blueprint-text-secondary mb-2">Project types (select all that apply)</p>
            <div className="flex flex-wrap gap-2">
              {PROJECT_TYPES.map(pt => (
                <label key={pt} className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" name="project_types" value={pt} className="accent-blueprint-accent" />
                  <span className="text-sm text-blueprint-text-secondary">{pt}</span>
                </label>
              ))}
            </div>
          </div>
        </>
      )}

      {role === 'draftsman' && (
        <>
          <div>
            <p className="text-sm text-blueprint-text-secondary mb-2">Skills (select all that apply)</p>
            <div className="flex flex-wrap gap-2">
              {SKILLS.map(skill => (
                <label key={skill} className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" name="skills" value={skill} className="accent-blueprint-accent" />
                  <span className="text-sm text-blueprint-text-secondary">{skill}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input name="hourly_rate" placeholder="Hourly rate (₹)" type="number" min="1" required />
            <Input name="experience_years" placeholder="Years of experience" type="number" min="0" required />
          </div>
          <Input name="linkedin_url" placeholder="LinkedIn URL (for verification)" type="url" />
        </>
      )}

      {state?.error && (
        <p className="text-red-400 text-sm">{state.error}</p>
      )}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Saving...' : 'Complete profile →'}
      </Button>
    </form>
  )
}
```

- [ ] **Step 6: Commit**

```bash
git add lib/actions/ app/\(auth\)/onboarding/ __tests__/
git commit -m "feat: add onboarding server actions and onboarding page"
```

---

## Task 10: Landing Page

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Replace app/page.tsx with Blueprint landing page**

```typescript
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
    desc: 'AutoCAD, Revit, SketchUp, 3D rendering, structural drawings — find every skill in one place.',
  },
]

const steps = [
  { n: '01', title: 'Post a job or browse draftsmen', desc: 'Describe your project or search directly by skill and city.' },
  { n: '02', title: 'Review and hire', desc: 'See portfolios, reviews, and rates. Accept an application or send a direct offer.' },
  { n: '03', title: 'Collaborate and deliver', desc: 'Chat, share files, and track delivery — all on platform.' },
  { n: '04', title: 'Pay and review', desc: 'Pay securely. Get a formal invoice. Leave a review to build the community.' },
]

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative pt-24 pb-20 px-6 grid-bg">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 border border-blueprint-border rounded-full px-4 py-1.5 text-sm text-blueprint-text-secondary mb-10">
            <span className="w-2 h-2 rounded-full bg-blueprint-accent animate-pulse" />
            Now live — India's first dedicated drafting marketplace
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-blueprint-text-primary tracking-tight mb-6 leading-tight">
            India's Drafting Room<br />
            <span className="text-blueprint-accent">for Architects.</span>
          </h1>

          <p className="text-xl text-blueprint-text-secondary max-w-2xl mx-auto mb-10">
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

          <p className="text-xs text-blueprint-text-muted mt-6">
            First 100 draftsmen and clients earn a <span className="text-amber-400">Founding Member</span> badge.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 border-t border-blueprint-border">
        <div className="max-w-5xl mx-auto">
          <p className="blueprint-label mb-3">// WHY DRAFTROOM</p>
          <h2 className="text-3xl font-bold text-blueprint-text-primary mb-12 max-w-xl">
            Built for the way architects actually work
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map(f => (
              <div key={f.ref} className="blueprint-card p-6">
                <p className="blueprint-label mb-3">{f.ref}</p>
                <h3 className="text-lg font-semibold text-blueprint-text-primary mb-2">{f.title}</h3>
                <p className="text-blueprint-text-secondary text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6 border-t border-blueprint-border bg-blueprint-surface/40">
        <div className="max-w-5xl mx-auto">
          <p className="blueprint-label mb-3">// HOW IT WORKS</p>
          <h2 className="text-3xl font-bold text-blueprint-text-primary mb-12">Four steps to done</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {steps.map(s => (
              <div key={s.n} className="flex gap-4">
                <span className="text-4xl font-bold text-blueprint-accent/30 font-mono leading-none">{s.n}</span>
                <div>
                  <h3 className="font-semibold text-blueprint-text-primary mb-1">{s.title}</h3>
                  <p className="text-blueprint-text-secondary text-sm">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 border-t border-blueprint-border">
        <div className="max-w-3xl mx-auto text-center">
          <p className="blueprint-label mb-3">// GET STARTED</p>
          <h2 className="text-3xl font-bold text-blueprint-text-primary mb-4">
            Ready to find your drafting partner?
          </h2>
          <p className="text-blueprint-text-secondary mb-8">
            Join the community of architects and draftsmen building India's best technical drawings.
          </p>
          <div className="flex gap-4 justify-center">
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
```

- [ ] **Step 2: Commit**

```bash
git add app/page.tsx
git commit -m "feat: add Blueprint landing page"
```

---

## Task 11: Stub Dashboard + Start Dev Server

**Files:**
- Create: `app/dashboard/page.tsx`

- [ ] **Step 1: Create stub dashboard page**

```typescript
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  // New user who hasn't completed onboarding yet
  if (!userData) {
    redirect('/onboarding')
  }

  return (
    <main className="max-w-5xl mx-auto px-6 py-12">
      <p className="blueprint-label mb-2">Dashboard</p>
      <h1 className="text-2xl font-bold text-blueprint-text-primary mb-8">
        Welcome back, {userData.name}
      </h1>
      <div className="blueprint-card p-6 text-blueprint-text-secondary text-sm">
        Dashboard features coming in Plan 2 (Marketplace Core).
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Start dev server and verify the full flow works**

```bash
npm run dev
```

Open http://localhost:3000 and verify:
- [ ] Landing page loads with Blueprint aesthetic (dark background, grid texture, blue accent)
- [ ] "Get started" button → `/signup` → role selector shows
- [ ] Sign up → redirects to `/onboarding`
- [ ] Onboarding form shows correct fields per role
- [ ] Submit → redirects to `/dashboard`
- [ ] `/login` works with email/password
- [ ] Logged-in user is redirected from `/login` to `/dashboard`

- [ ] **Step 3: Run all tests**

```bash
npm test
```

Expected: All tests pass (cn utility + onboarding validation).

- [ ] **Step 4: Final commit**

```bash
git add app/dashboard/
git commit -m "feat: add stub dashboard and complete Plan 1 foundation"
```

---

## Plan 1 Complete

**What's working after this plan:**
- Next.js app with full Blueprint design system
- Supabase DB schema with all tables, RLS policies, and founding member trigger
- Email + Google OAuth authentication
- Role-aware onboarding flows (client + draftsman)
- Blueprint landing page with hero, features, how-it-works sections
- Protected routes via middleware
- Stub dashboard

**Next: Plan 2 — Marketplace Core**
Covers: public draftsman profiles, job posting, browse + filter draftsmen/jobs, smart skill matching, application flow, direct hire, contract creation, client and draftsman dashboards.
