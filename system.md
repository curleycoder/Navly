# Navly — System Documentation

> Last updated: August 2026
> This document describes what Navly is, what it does, how it is built, and how each part of the system works together.

---

## 1. What Navly Is

Navly is a **Canadian immigration planning and tracking app** — not an immigration consultant.

It helps users:
- Understand which Canadian PR pathways may be possible based on their profile
- Estimate their CRS score and FSW 67-point grid result
- Track physical presence in Canada (days, streak, travel log)
- Monitor permit expiry, PR card, passport, and language test deadlines
- Match against Provincial Nominee Program (PNP) streams
- Track progress toward citizenship or PR residency obligation
- Ask general immigration questions through an AI assistant
- Connect with certified Canadian immigration consultants

Navly never collects documents, passport numbers, SINs, or official government IDs. It collects only user-entered profile data.

---

## 2. Product Boundary

| Navly does | Navly does not |
|---|---|
| Estimate CRS / CLB / FSW scores | Provide legal advice |
| Rank possible pathways | Guarantee any outcome |
| Track Canada presence days | Replace an RCIC or immigration lawyer |
| Alert on permit / deadline expiry | Review documents |
| Match PNP streams by province | Submit applications |
| Explain immigration terms with AI | Collect passports, SINs, or official IDs |
| Connect users with certified consultants | Claim to be an IRCC service |

---

## 3. Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js App Router (TypeScript) |
| Styling | Tailwind CSS v4 |
| UI components | shadcn/ui (Radix primitives) |
| Database & Auth | Supabase (PostgreSQL + Auth) |
| AI / LLM | Groq API — model `openai/gpt-oss-120b` |
| Payments | Stripe (Checkout + webhooks) |
| Analytics | PostHog |
| Deployment | Vercel (implied by Next.js App Router) |
| Icons | Lucide React |
| Internationalization | Custom `lib/i18n.tsx` with English + French locales |

---

## 4. Repository Structure

```
app/                     — Next.js App Router pages and API routes
  page.tsx               — Public landing page
  onboarding/page.tsx    — Onboarding flow entry
  dashboard/             — All authenticated dashboard pages
    page.tsx             — Main dashboard
    days/page.tsx        — Canada presence tracker
    citizenship/page.tsx — Citizenship physical presence calculator
    residency/page.tsx   — PR residency obligation tracker
    dates/page.tsx       — Deadlines & key dates
    chat/page.tsx        — AI immigration assistant
    news/page.tsx        — EE draws + immigration news
    consultants/page.tsx — Consultant directory
    tasks/page.tsx       — Settlement task list
    report/page.tsx      — Readiness report (paid)
    pr-tracker/page.tsx  — Full PR pathway tracker (paid)
    prep/page.tsx        — Application prep checklist
    profile/page.tsx     — Profile editor
  admin/                 — Admin pages (consultants, updates)
  api/
    chat/route.ts        — AI chat endpoint (Groq streaming)
    checkout/route.ts    — Stripe checkout session creator
    webhook/route.ts     — Stripe webhook handler
    draws/route.ts       — EE draws endpoint
    news/route.ts        — Immigration news endpoint
    auth/check-phone/    — Duplicate phone check
    admin/               — Admin seed and management routes
    cron/                — Scheduled jobs (news sync, EE draws sync, reminders)

components/
  onboarding/
    IntakeFlow.tsx       — Onboarding orchestrator
    flow.ts              — Dynamic step list (getSteps)
    validation.ts        — canContinue + hint per step
    steps/               — One file per step group
  dashboard/
    Sidebar.tsx          — Desktop sidebar nav
    BottomNav.tsx        — Mobile bottom nav
    ActionableScoreSheet.tsx
    ScoreTimelineChart.tsx
    ProgressGauge.tsx
    RequirementCard.tsx
    DocumentStorage.tsx
  ui/
    Navbar.tsx           — Public nav
    PlanGate.tsx         — Paywall wrapper
    UpgradeModal.tsx
    LanguageSwitcher.tsx

lib/
  profile.ts             — IntakeData type, EMPTY_PROFILE, localStorage + Supabase sync
  presence.ts            — PresenceData type, check-in, travel log, streak, cloud sync
  scoring.ts             — CLB conversion, CRS calculation, FSW 67-pt, pathway assessment
  pr-math.ts             — PR residency obligation + citizenship presence calculation
  pnp.ts                 — PNP stream matching engine (BC, ON, AB, SK, MB, Atlantic)
  deadlines.ts           — Deadline computation from profile dates
  draws.ts               — Express Entry draw history + cutoff data
  crs-tables.ts          — CRS point tables (age, education, language, Canadian work)
  rough-crs.ts           — Quick rough CRS estimate for pre-signup preview
  subscription.ts        — usePlan hook, plan checks (tracker / report)
  tasks.ts               — Settlement task list with defaults
  consultants.ts         — ConsultantListing type
  news.ts                — Immigration news fetching
  settlement-funds.ts    — IRCC settlement fund requirements
  ircc-rss.ts            — IRCC RSS feed parser
  i18n.tsx               — Internationalization (EN / FR)
  analytics.ts           — PostHog track + identify wrappers
  geo.ts                 — Geo detection helpers
  history.ts             — Profile history tracking
  supabase/
    client.ts            — Browser Supabase client
    server.ts            — Server-side Supabase client

rules/                   — Versioned immigration rule snapshots
  clb/                   — CLB conversion tables (IELTS, CELPIP, PTE, TEF, TCF)
  crs/                   — CRS additional points table
  loader.ts              — getActiveRule() — selects the most recent rule version
```

---

## 5. User Flows

### 5.1 Onboarding Flow (pre-signup)

Users complete a short questionnaire before creating an account. This lets them see their plan preview before committing. Sign-up is the final step.

**Step sequence** (dynamic, driven by `components/onboarding/flow.ts`):

```
goal-first         "What do you need help with today?"
                   Options: deadlines / pr / citizenship / residency / explore

location-split     "Are you in Canada right now?"
                   Options: inside / outside

[inside only]
inside-status      Current immigration status
                   Options: student / work-permit / visitor / refugee /
                            family-member / out-of-status / pr / other

[outside only]
planned-entry      Planned route to Canada
                   Options: study-permit / work-permit / visitor /
                            express-entry / family / business / unsure

[inside non-PR with known status]
key-date           One key date relevant to their status
                   (permit expiry for workers/students/visitors, PR date for PRs)

[all users except PR]
quick-crs          Quick scoring inputs: age (birth year + month), education level,
                   self-reported CLB, Canadian work months, foreign work years

plan-preview       Shows rough CRS estimate + what Navly will track for them

early-signup       Account creation: email, password, phone verification
```

The step list is recalculated dynamically after every field change. Steps are added or removed based on `data.locationStatus`, `data.status`, and other answers.

Profile data is stored in `localStorage` throughout onboarding and synced to Supabase after login.

---

### 5.2 Dashboard

After login, users land on the main dashboard. The dashboard:

- Syncs profile from Supabase on mount (`syncProfile`)
- Syncs presence data from Supabase on mount (`syncPresence`)
- Calculates score (`calculateScore`) from the loaded profile
- Shows CRS strength (Competitive / Developing / Below target) vs the latest EE draw cutoff
- Shows Canada presence day count + check-in button
- Shows urgent deadlines (permit expiry within 60–180 days)
- Shows incomplete tasks count
- Links to all sub-pages

Dashboard sub-pages:

| Route | Purpose |
|---|---|
| `/dashboard/days` | Canada presence tracker — daily check-in, travel log, streak |
| `/dashboard/citizenship` | Citizenship physical presence calculator (1,095-day rule) |
| `/dashboard/residency` | PR residency obligation tracker (730-day rule) |
| `/dashboard/dates` | All deadlines with status and action links |
| `/dashboard/chat` | AI immigration assistant |
| `/dashboard/news` | Express Entry draw history + immigration news |
| `/dashboard/consultants` | Certified consultant directory |
| `/dashboard/tasks` | Settlement task list |
| `/dashboard/report` | Readiness Report PDF (paid: `report` or `tracker` plan) |
| `/dashboard/pr-tracker` | Full pathway + score breakdown (paid: `tracker` plan) |
| `/dashboard/profile` | Edit intake profile |
| `/dashboard/prep` | Application preparation checklist |

---

## 6. Data Model

### 6.1 Profile (IntakeData)

All user-entered immigration data lives in a single flat TypeScript type `IntakeData` in [lib/profile.ts](lib/profile.ts).

Major field groups:

| Group | Fields |
|---|---|
| Identity | fullName, email, phone, gender |
| Primary use | primaryUse (deadlines / pr / citizenship / residency / explore) |
| Location | locationStatus, status, plannedEntry, province, city, arrivalDate, visaExpiryDate |
| Goal | goal, timeline |
| Personal | age, birthYear, birthMonth, maritalStatus, spouseComing |
| Spouse | spouseLangTestType, spouseLangScores, spouseEducationLevel, spouseCanadianWorkMonths |
| Language | langTestType, langTestDate, langReading/Writing/Listening/Speaking |
| Second language | lang2TestType, lang2Scores |
| French | frenchTestType, frenchScores |
| Education | educationLevel, canadianEducation, ecaCompleted, ecaIssueDate, ecaExpiryDate |
| Work | noc, teerLevel, foreignWorkYears, canadianWorkMonths, hasJobOffer, wage, hoursPerWeek |
| Settlement | familySize, settlementFunds |
| Family ties | canadianSibling, manitobaFamilyRelative, parentOrChildSponsor, relativesInCanada |
| PNP | pnpNomination, pnpJobOfferProvince, pnpEducationProvince, employerSupportsPNP, etc. |
| Risk flags | previousRefusals, lostStatus, criminalityIssues, removalOrder, medicalInadmissibility |
| Student | programLevel, programLengthMonths, schoolName, dliNumber, pgwpApplied, pgwpExpiry, etc. |
| Worker | workPermitType, permitExpiry, lmiaNumber, workStartDate, fullTimeOrPartTime, etc. |
| PR | prDate, prCardExpiry, prPreStatus, taxFilingComplete, citizenshipLangProof, etc. |
| Dates | passportExpiry, visitorRecordExpiry |
| Preferences | reminderOptIn |
| Quick onboarding | selfReportedCLB |
| Sync metadata | _updatedAt (ISO timestamp for conflict resolution) |

Storage: `localStorage` key `navly_profile` + Supabase `profiles.profile_data` (JSONB column).

Sync strategy: `_updatedAt` inside `profile_data` is the single source of truth. Whichever record has the newer `_updatedAt` wins. The DB `updated_at` column is audit metadata only and is never used for conflict resolution.

### 6.2 Presence (PresenceData)

Physical presence tracking data lives in [lib/presence.ts](lib/presence.ts).

```typescript
PresenceData {
  totalDays: number           // confirmed days in Canada
  streak: number              // current consecutive days
  longestStreak: number
  lastCheckIn: string | null  // 'YYYY-MM-DD'
  lastAcknowledgedDate: string | null
  arrivalDate: string | null
  travelLog: TravelEntry[]    // each trip outside Canada
  deletedTravelIds: string[]  // IDs propagated for multi-device delete sync
  _updatedAt: string
}

TravelEntry {
  id: string           // crypto.randomUUID()
  departureDate: string
  returnDate: string   // empty if still away
  country: string
  reason: string
  createdAt: string
  updatedAt: string
}
```

Storage: `localStorage` key `navly_presence` + Supabase `profiles.presence_data` (JSONB column).

Sync strategy: Travel logs are **union-merged** by ID — newest `updatedAt` per entry wins. Deleted IDs are combined from both sources so deletes propagate cross-device. Scalar fields (streak, totalDays, etc.) come from whichever record has the newer `_updatedAt`.

### 6.3 Supabase Tables

| Table | Purpose |
|---|---|
| `profiles` | One row per user — `profile_data` (JSONB) + `presence_data` (JSONB) |
| `subscriptions` | Active plans — `user_id`, `plan` (tracker/report), `status`, `expires_at` |
| `consultants` | Consultant directory — name, province, languages, services, booking_link, sponsored, verified |
| `immigration_news` | Synced immigration news — title, summary, source_name, source_type, published_at, category |
| `rule_snapshots` | Versioned IRCC rule data — rule_key, category, data (JSONB), source_url, effective_date, status |

---

## 7. Scoring Engine

All scoring lives in [lib/scoring.ts](lib/scoring.ts) with point tables in [lib/crs-tables.ts](lib/crs-tables.ts).

### 7.1 CLB Conversion

Raw test scores are converted to Canadian Language Benchmark (CLB) levels per skill (reading, writing, listening, speaking).

Supported tests:
- **IELTS General Training** — lookup tables per skill
- **CELPIP-General** — 1:1 mapping (score IS the CLB, capped at range)
- **PTE Core** — lookup tables per skill
- **TEF Canada** — lookup tables per skill
- **TCF Canada** — lookup tables per skill

Tables live in `rules/clb/` and are loaded via `getActiveRule()` so they can be updated with a new version when IRCC publishes new equivalencies.

### 7.2 CRS Calculation

```
CRS Total = age + education + firstLanguage + secondLanguage +
            spouseFactors + canadianExperience + skillTransferability + additional
```

| Component | Max (with spouse) | Max (no spouse) |
|---|---|---|
| Age | 100 | 110 |
| Education | 140 | 150 |
| First language | 128 | 136 |
| Second language (French) | 50 | 50 |
| Spouse factors | 40 | — |
| Canadian experience | 70 | 80 |
| Skill transferability | 100 | 100 |
| Additional (PNP, sibling, Canadian education) | 600 | 600 |

Key rule: **Job offers no longer add CRS points as of March 25, 2025.** The arranged employment factor is 0 in the active CRS rule.

French bonus: CLB 7+ French with CLB 5+ English = 50 extra CRS points. CLB 7+ French alone = 25 points.

Age: Computed dynamically from `birthYear` + `birthMonth` so it auto-updates when the user's birthday passes — not frozen at a typed number.

Canadian work hours cross-check: If `hoursPerWeek` is provided, the app computes both months-based and hours-based (at 1,560 hrs/year) year equivalents and uses the more conservative of the two.

### 7.3 FSW 67/100 Grid

```
FSW Total = language + education + workExperience + age + jobOffer + adaptability
```

| Factor | Max |
|---|---|
| Language (CLB 7 minimum) | 28 |
| Education | 25 |
| Work experience | 15 |
| Age | 12 |
| Job offer | 10 |
| Adaptability | 10 |

Pass mark: 67/100. Also requires CLB 7+ in all 4 skills and 1 year of continuous TEER 0–3 skilled work.

Note: Job offer still gives 10 FSW selection-factor points — it just no longer adds CRS points.

Settlement funds are required for FSW unless the user is currently authorized to work in Canada with a valid job offer (funds exemption).

### 7.4 Pathway Assessment

The main `calculateScore()` function returns a `ScoreResult` containing:

```typescript
{
  clb: CLBScores | null
  crs: CRSBreakdown | null
  fsw: FSWResult | null
  pathways: PathwayStatus[]       // status: 'eligible' | 'not-yet' | 'possible' | 'not-applicable' | 'high-risk'
  improvements: Improvement[]     // specific next actions with CRS impact
  riskFlags: RiskFlag[]           // warnings and critical flags
  hasEnoughData: boolean
  missingFields: string[]
}
```

Pathways assessed:

| Pathway | Key requirements |
|---|---|
| Canadian Experience Class (CEC) | 1yr TEER 0-3 Canadian work, CLB 7 (TEER 0/1) or CLB 5 (TEER 2/3), authorized work only |
| Federal Skilled Worker (FSW) | CLB 7+, 1yr continuous TEER 0-3, 67+/100, settlement funds |
| Federal Skilled Trades (FST) | TEER 2/3, CLB 5 speaking/listening + CLB 4 reading/writing, 2yr trades work, job offer or certificate |
| PGWP → CEC pathway | DLI, 8+ month program, eligible program, language proof, field-of-study check (2026 rules) |
| Study permit extension | Shown for students |
| Work permit extension + BOWP | Shown for work permit holders |
| Visitor pathways | Visitor status, visitor-to-work/study permit exceptions |
| Maintained status | Shown if user applied before status expired |
| Rural Community Immigration Class | Job offer from designated rural employer, 1yr TEER 0-3, CLB 4-6 (TEER-dependent), high school min |
| Provincial Nominee Program | Matched by intended province (see PNP engine below) |

Risk flags built automatically:
- Lost status / overstay → critical
- Previous refusal → warning
- Visitor trying to work without exception → warning
- Student counting full-time study work toward CEC → warning
- FSW user with no settlement funds and no job offer → warning

---

## 8. PNP Matching Engine

[lib/pnp.ts](lib/pnp.ts) matches the user's profile against provincial streams.

Supported provinces and streams:

| Province | Streams |
|---|---|
| BC | Skilled Worker, International Graduate, Express Entry BC (200-pt grid) |
| ON | Employer Job Offer (Foreign Worker), Employer Job Offer (International Student), Human Capital Priorities |
| AB | Alberta Opportunity Stream, Express Entry Stream |
| SK | Employment Offer, Occupations In-Demand (100-pt grid + NOC list) |
| MB | Skilled Workers in Manitoba, Skilled Workers Overseas |
| NS / NB / PE / NL | AIP Skilled Worker, AIP International Graduate (readiness checklist model) |
| QC | Not supported — directs users to immigration.quebec.gouv.ca |

When `intendedProvince === 'Any'`, all provinces are evaluated and results can be grouped by province in the UI.

Each stream returns:
- `status`: eligible / possible / not-yet / not-applicable
- `reason`: one-line explanation
- `missingItems`: actionable list of what's blocking
- `score` / `maxScore`: numeric grid estimate (BC, SK) or connection strength indicator (ON, AB, MB)
- `readinessItems`: binary checklist display (AIP)

BC uses a 200-point internal grid (job offer, work experience, education, language, adaptability).
SK uses a 100-point grid (experience, education, language, age, SK connection).
ON, AB, MB use a 0–5 connection strength indicator (not a disclosed point grid).
AIP uses a 3-item binary readiness checklist (designated employer, language, education).

---

## 9. PR Math Engine

[lib/pr-math.ts](lib/pr-math.ts) handles the two major physical presence calculations for PR holders.

### 9.1 PR Residency Obligation

IRCC rule: physically present in Canada for at least **730 days in any 5-year rolling period**.

The window starts from the later of (PR date, 5 years ago) and runs to today.
Days outside Canada are subtracted using the `travelLog` from PresenceData.
Return day is counted as IN Canada; departure day is counted as OUT (IRCC convention).

Returns:
- `daysInCanada`, `daysRequired` (730), `daysNeeded`, `daysBuffer`
- `status`: `on_track` | `at_risk` | `breach`
- `estimatedMeetDate`: when 730 is reached assuming no future travel

### 9.2 Citizenship Physical Presence

IRCC rule: physically present in Canada for at least **1,095 days in the 5 years before the citizenship application date**.

Pre-PR days (as temp resident within the 5-year window) count as **half-days**, capped at a maximum credit of **365 days**.

```
totalCreditedDays = postPRDays + min(floor(prePRDays / 2), 365)
```

Returns:
- `postPRDays`, `prePRDays`, `prePRCredit`, `totalCreditedDays`
- `daysRequired` (1095), `daysNeeded`, `pctComplete`
- `status`: `eligible` | `on_track` | `needs_more_time` | `incomplete_data`
- `estimatedEligibilityDate`: when 1095 credited days will be reached

---

## 10. Canada Presence Tracker

[lib/presence.ts](lib/presence.ts) powers the daily check-in system in [app/dashboard/days](app/dashboard/days).

### Check-in logic

- `checkIn()` — confirms today as a Canada day, increments streak if consecutive
- `getMissedDays()` — returns up to 30 unconfirmed days between last acknowledged date and yesterday
- `confirmMissedDay(date)` — marks a past day as "in Canada"
- `declineMissedDay(date)` — marks a past day as "outside Canada", breaks streak if consecutive
- `computeStreak()` — calculates current streak from arrival date + travel log (not dependent on check-ins alone)
- `getDaysInCanada()` — total confirmed Canada days = (days since arrival − travel days), credits today only if checked in

### Travel log

Each trip outside Canada is stored with departure date, return date, country, and reason.
`getTravelDays()` sums all travel log entries, excluding the return day.
Open trips (no return date) are counted as still ongoing to today.

---

## 11. Deadline System

[lib/deadlines.ts](lib/deadlines.ts) computes all upcoming deadlines from the user's profile.

Deadline types tracked:
- `work_permit` — work permit expiry
- `study_permit` — study permit expiry
- `pgwp` — PGWP expiry
- `visitor_record` — visitor record expiry
- `passport` — passport expiry (for renewal reminders)
- `language_test` — language test 2-year validity (EE requirement)
- `pr_card` — PR card expiry

Alert schedule: reminders fire at **180, 120, 90, 60, 30, and 7 days** before expiry.

Deadline status thresholds:
- `on_track` — more than 180 days away
- `action_soon` — 61–180 days away
- `urgent` — 1–60 days away
- `expired` — already past

YYYY-MM inputs (permit expiry) are normalized to the **last day of that month** to give the user the maximum benefit of the doubt.

---

## 12. AI Chat System

[app/api/chat/route.ts](app/api/chat/route.ts) powers the AI assistant in [app/dashboard/chat](app/dashboard/chat).

### Architecture

- **LLM**: Groq API, model `openai/gpt-oss-120b`, streaming response
- **Auth gate**: requires active Supabase session
- **Rate limit**: 20 messages per user per minute (in-memory)
- **Context window**: last 14 messages (7 turns) are sent to the model
- **RAG**: retrieves relevant rule snapshots and recent news from Supabase before each request

### RAG (Retrieval-Augmented Generation)

The query is keyword-matched against immigration topics:

| Keywords | Category pulled |
|---|---|
| express entry, CRS, EE draw, cutoff | `express_entry` + `latest_ee_draw` |
| PGWP, post-grad, work permit | `pgwp` |
| citizenship, naturalize | `citizenship` |
| PR card, residency obligation | `pr_residency` |
| settlement fund, proof of funds | `proof_of_funds` |
| French, bilingual | `express_entry` |
| PNP, provincial nominee | `express_entry` |

Up to 10 active rule snapshots are injected into the system prompt. The 8 most recent immigration news items are also included (excluding Quebec content).

### Profile context injection

The user's full profile is summarised and injected into the system prompt so the AI can personalise answers. The summary includes: status, origin, location, goal, age, marital status, language scores + CLB equivalents, education, TEER level, work history, job offer status, permit expiry, risk flags, family size, estimated CRS, FSW score, and pathway match summary.

### Safety guardrails in the system prompt

Critical overrides applied before any other logic:
- **Quebec**: redirects to immigration.quebec.gouv.ca — no further answer
- **Off-topic**: responds with "I can only help with Canadian immigration questions"
- **High-risk legal situation** (removal order, misrepresentation, criminal charge, detention, refugee claim, out-of-status): stops and escalates to RCIC/lawyer

Banned phrases: "You qualify", "You are eligible", "You will be approved", "You should apply", "You do not need a lawyer", "Submit this application", "You are safe to stay", etc.

Required safe replacements: "Based on the data you entered, this pathway may be possible", "This pathway appears to match your profile — a certified consultant should confirm", etc.

All specific rules, fees, or thresholds must be cited with source and effective date.

---

## 13. Express Entry Draw Data

[lib/draws.ts](lib/draws.ts) contains the complete history of Express Entry draw results as a static array.

Each draw entry:
```typescript
{ date: string, type: string, cutoff: number, invited?: number }
```

Draw types: All programs, Canadian Experience Class, Federal Skilled Worker, Provincial Nominee Program, French Language Proficiency.

The draw data is hand-maintained via `scripts/add-draw.ts`. The `DRAWS_LAST_UPDATED` constant tracks when data was last verified.

The latest draw cutoff is shown on the main dashboard to compare against the user's CRS score.

---

## 14. Monetization / Plans

Navly has three pricing tiers:

| Plan | Price | Type | Features |
|---|---|---|---|
| Free Check | $0 | Forever free | Basic CRS estimate, FSW check, basic pathway overview, consultant directory |
| Readiness Report | $69.99 | One-time payment | Full CRS + FSW breakdown, Top 3 pathways, gap analysis, PNP match, PDF report |
| PR Tracker | $119.99/yr or $14.99/mo | Subscription | Everything in Report + presence tracker, deadline alerts, EE draw alerts, monthly recalculation, AI assistant |

Plan gates are implemented via `components/ui/PlanGate.tsx` and `lib/subscription.ts`.

```typescript
// Check plan access
const { plan } = usePlan()
hasReport(plan)  // true for 'report' or 'tracker'
hasPlan(plan, 'tracker')  // true only for 'tracker'
```

---

## 15. Payment System (Stripe)

### Checkout

`POST /api/checkout` creates a Stripe Checkout session:

- `plan: 'report'` → one-time payment (mode: `payment`)
- `plan: 'tracker'` with `billing: 'monthly' | 'annual'` → subscription (mode: `subscription`)
- Tracker subscription includes a **7-day free trial**
- Promotion codes are allowed on all plans
- `client_reference_id` is set to the Supabase user ID for webhook matching

### Webhook

`POST /api/webhook` handles Stripe events:
- `checkout.session.completed` → writes row to `subscriptions` table with plan, status, and expiry
- `customer.subscription.deleted` → marks subscription inactive

---

## 16. Authentication

Supabase Auth handles login, signup, session management, and password reset.

- `lib/supabase/client.ts` — browser-side Supabase client (singleton pattern)
- `lib/supabase/server.ts` — server-side Supabase client (for API routes and Server Components)

Duplicate account prevention:
- `POST /api/auth/check-phone` — checks if a phone number is already registered before SMS verification
- One phone number = one account; one email = one account

Phone verification uses Supabase's built-in OTP flow.

---

## 17. Data Sync Architecture

Profile and presence data use a **local-first, optimistic sync** model:

```
User edits → localStorage (instant, always works offline)
           → Supabase (async, non-blocking)

On login / app load:
  syncProfile(userId)  — compares _updatedAt, winner is written to both stores
  syncPresence(userId) — travel logs are union-merged, scalar fields use newer timestamp
```

This means:
- The app works fully offline
- Multi-device is supported (cloud resolves conflicts)
- A server-side DB touch (like a migration) cannot silently overwrite a newer client record
- Travel log deletions propagate via the `deletedTravelIds` array

---

## 18. Internationalization

`lib/i18n.tsx` provides English and French translations.

Locale files: `lib/locales/en.ts` and `lib/locales/fr.ts`.

The `useLocale()` hook returns a `t(key)` translation function and the current locale. Language is switchable via `components/ui/LanguageSwitcher.tsx`.

---

## 19. Analytics

`lib/analytics.ts` wraps PostHog with two functions:
- `track(event, properties)` — logs an event
- `identify(userId)` — links events to a user

Key tracked events:
- `dashboard_viewed`
- `app_opened`
- `onboarding_*` (step completions)
- `checkin_completed`
- `chat_message_sent`

PostHog is initialized via `components/PostHogProvider.tsx`.

---

## 20. Cron Jobs

Scheduled API routes (`app/api/cron/`):

| Route | Purpose |
|---|---|
| `cron/news/route.ts` | Fetches new immigration news, deduplicates, stores in `immigration_news` |
| `cron/sync-ee-draws/route.ts` | Syncs latest EE draw data |
| `cron/sync-sources/route.ts` | Syncs IRCC RSS feeds via `lib/ircc-rss.ts` |
| `cron/reminders/route.ts` | Sends deadline reminder emails to opted-in users |

---

## 21. Admin System

Admin pages at `/admin/`:

- **Consultants** — create, edit, verify, sponsor, activate/deactivate consultant listings
- **Updates** — manage rule snapshots and immigration news

Admin API routes:
- `POST /api/admin/consultants` — CRUD for consultant listings
- `POST /api/admin/updates` — manage rule snapshots
- `POST /api/admin/seed-news` — seed initial news data
- `POST /api/admin/seed-rules` — seed rule snapshot data
- `POST /api/admin/test-rss` — test IRCC RSS parsing

---

## 22. Consultant Directory

[lib/consultants.ts](lib/consultants.ts) defines `ConsultantListing`:

```typescript
{
  id, name, business_name, certification_type, license_number,
  city, province, languages[], services[], booking_link,
  avatar_url, contact_email, sponsored, verified, active, agency_code
}
```

The landing page always fetches one sponsored + verified + active consultant to display as a featured ad. The `/dashboard/consultants` page shows the full searchable directory.

Legal disclaimer always shown: *"Independent professional. Navly does not provide immigration consulting services and is not responsible for services offered by listed consultants."*

---

## 23. Settlement Tasks

[lib/tasks.ts](lib/tasks.ts) provides a default settlement checklist for newcomers:

| Category | Default tasks |
|---|---|
| Settlement & Living | Find housing, learn where to shop, driver's license exchange |
| Taxes & Finance | File first tax return, build Canadian credit history |
| Immigration | (generated dynamically from profile) |
| Arrival Checklist | (status-specific) |

Tasks are stored in `localStorage` (`navly_tasks`). Users can add custom tasks and mark items done.

---

## 24. Versioned Rules System

Immigration rules change frequently. Navly handles this with a versioned rules loader:

- `rules/clb/` — CLB conversion tables. Each version has a `verifiedDate`. `getActiveRule()` picks the most recent.
- `rules/crs/` — CRS additional points table (PNP = 600, Canadian education = 15/30, sibling = 15, arranged employment = 0 as of 2025-03-25).
- `rule_snapshots` Supabase table — live rule data pulled for the AI chat (settlement funds, EE draw history, PGWP requirements, citizenship rules, etc.)

When IRCC updates a rule, a new version is added to `rules/` and the AI rule snapshot is updated in Supabase. No code change is needed for the AI to use updated data.

---

## 25. Legal and Safety Boundaries

The following rules are enforced throughout the entire app — in UI copy, in the AI system prompt, and in the product boundary:

1. Navly never says "You qualify", "You are eligible", or "You will be approved"
2. All eligibility language uses "may be possible", "appears to match", "based on the data you entered"
3. Every eligibility screen recommends consulting a certified RCIC or immigration lawyer
4. High-risk profiles (criminal issues, removal orders, misrepresentation, out-of-status) are stopped from the normal flow and shown a professional review warning
5. No documents are collected — no passport, no SIN, no birth certificate, no bank statements
6. Presence tracker includes the disclaimer: "This tracker is for personal planning only. Final physical presence calculations depend on official government records."
7. Settlement fund amounts are sourced from IRCC 2024 tables and shown with a last-verified date
8. PGWP rules display a last-verified date and always link to canada.ca
9. Job offer wording: "A job offer no longer adds CRS points as of March 25, 2025. It may still strengthen PNP streams."
10. Student work wording: "Work while studying full-time does not count for CEC. Post-graduation PGWP work may count."
