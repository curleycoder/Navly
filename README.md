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

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
