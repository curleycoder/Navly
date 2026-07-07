# Navly

Canadian permanent residency pathway tracker and planning tool.

Navly helps users understand possible Canadian PR pathways, estimate CRS scores, track physical presence in Canada, and identify missing requirements — without providing legal advice.

---

## What it does

- **Onboarding flow** — dynamic question set based on immigration status (outside Canada, temporary resident, permanent resident)
- **CRS estimator** — calculates Express Entry Comprehensive Ranking System score from profile data
- **Canada days tracker** — daily check-in system to track physical presence for CEC, PR residency obligation, and citizenship eligibility
- **Pathway matcher** — scores and ranks eligible PR streams (CEC, FSW, PNP, etc.) based on user profile
- **Missing requirements engine** — identifies gaps and suggests next actions
- **AI chat assistant** — answers general immigration questions using profile context (powered by Claude / Groq)
- **Express Entry draws feed** — synced from IRCC data
- **Partner listings** — verified immigration consultants with booking links
- **Stripe billing** — subscription plans for advanced tracking features

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4, shadcn/ui |
| Auth + DB | Supabase (Postgres + Row Level Security) |
| AI | Anthropic Claude API + Groq SDK |
| Payments | Stripe |
| Email | Brevo (transactional) |
| Analytics | PostHog |
| Deployment | Vercel / Netlify |

---

## Getting started

### Prerequisites

- Node.js 20+
- A Supabase project
- A Stripe account (for billing features)
- A Groq or Anthropic API key (for AI chat)

### 1. Clone and install

```bash
git clone https://github.com/your-org/navly.git
cd navly
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_PRICE_TRACKER=
STRIPE_PRICE_TRACKER_ANNUAL=

# AI
GROQ_API_KEY=

# Email (Brevo)
BREVO_API_KEY=
BREVO_FROM_EMAIL=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
ADMIN_EMAIL=
CRON_SECRET=

# Analytics
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=
```

### 3. Run database migrations

```bash
# Apply migrations in order via Supabase CLI or the SQL editor
supabase db push
```

Migrations are in `supabase/migrations/`.

### 4. Start dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project structure

```
app/                    # Next.js App Router pages and API routes
  api/                  # API routes (auth, chat, cron, Stripe webhook, etc.)
  dashboard/            # Authenticated user dashboard
    days/               # Canada days tracker
    citizenship/        # Citizenship presence calculator
    pr-tracker/         # PR residency obligation tracker
    chat/               # AI assistant
    consultants/        # Partner listings
    news/               # IRCC updates feed
  onboarding/           # Multi-step intake flow
  admin/                # Admin panel (consultant management)
  login/                # Auth pages
  pricing/              # Pricing page

components/
  onboarding/           # Intake flow steps and orchestrator
  dashboard/            # Dashboard widgets and panels
  ui/                   # Shared UI primitives (shadcn-based)

lib/
  profile.ts            # IntakeData type, EMPTY_PROFILE, Supabase sync
  scoring/              # CRS, FSW, CLB calculators
  pathways/             # Pathway eligibility logic
  supabase/             # Client and server Supabase helpers

supabase/
  migrations/           # SQL migration files
```

---

## Key rules

- **No document collection.** Navly only stores user-entered profile data. No passports, government IDs, or official documents.
- **No legal advice.** The AI assistant and pathway results are for planning only. Users are directed to certified RCICs for legal review.
- **Job offer CRS rule.** As of March 25, 2025, job offers no longer add CRS points. The codebase reflects this.
- **One account per phone/email.** Duplicate account detection is enforced at the API level.

---

## Legal

Navly is a planning and information tool. It does not provide immigration consulting or legal advice. Users should consult a certified Canadian immigration consultant (RCIC) or lawyer before making any immigration decisions.
