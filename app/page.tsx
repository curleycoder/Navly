import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  MessageSquare,
  CalendarCheck,
  Bell,
  Target,
  ShieldCheck,
  GraduationCap,
  BriefcaseBusiness,
  Plane,
  BadgeCheck,
  AlertTriangle,
  XCircle,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { NavlyLogo } from "@/components/ui/NavlyLogo";
import { recentDraws } from "@/lib/draws";
import { FAQAccordion } from "@/components/ui/FAQAccordion";
import { createClient } from "@/lib/supabase/server";
import type { ConsultantListing } from "@/lib/consultants";

const userTypes = [
  { title: "International students", icon: GraduationCap },
  { title: "Workers & PGWP holders", icon: BriefcaseBusiness },
  { title: "Visitors in Canada", icon: Plane },
  { title: "Permanent residents", icon: BadgeCheck },
];

const features = [
  {
    title: "Smart intake",
    desc: "Build a profile based on your status, language scores, education, work history, province, and goal.",
    icon: FileText,
  },
  {
    title: "Pathway screening",
    desc: "See possible routes like CEC, FSW, PNP streams, study-to-PR, or citizenship — ranked by your profile.",
    icon: Target,
  },
  {
    title: "Canada days tracker",
    desc: "Log your physical presence in Canada daily. Track your streak, total confirmed days, and trips outside Canada.",
    icon: CalendarCheck,
  },
  {
    title: "Deadline reminders",
    desc: "Track permit expiry, PR card renewal, passport expiry, and language test validity — with alerts before they expire.",
    icon: Bell,
  },
  {
    title: "AI assistant",
    desc: "Ask general immigration questions in plain English. Clear legal-safety reminders included.",
    icon: MessageSquare,
  },
];

const howSteps = [
  {
    title: "Answer a few questions",
    desc: "Tell Navly your status, goal, language score, education, work history, province, and key dates.",
  },
  {
    title: "See your planning dashboard",
    desc: "Get an estimated pathway view, score gaps, missing requirements, Canada presence tracker, and deadline reminders.",
  },
  {
    title: "Track and improve",
    desc: "Monitor your progress, update your profile as things change, and act on clear next steps.",
  },
];

const notDoItems = [
  "Submit immigration applications",
  "Guarantee approval or results",
  "Replace an RCIC or immigration lawyer",
  "Give legal advice",
  "Ask for passport, SIN, or government IDs",
];

const pricingPlans = [
  {
    name: "Free Check",
    price: "$0",
    priceNote: "forever",
    desc: "Find out if you're on the right track.",
    points: [
      "Inside/outside Canada intake",
      "Basic CRS score estimate",
      "FSW 67-point grid check",
      "Basic pathway overview",
      "Gap summary — what's missing",
      "Find a certified consultant (discount code included)",
    ],
    href: "/onboarding",
    featured: false,
    cta: "Start Free",
    badge: null,
  },
  {
    name: "PR Tracker",
    price: "$119.99",
    priceNote: "/ year",
    monthlyNote: "or $14.99/month, billed monthly",
    desc: "Full breakdown, daily tracking, permit alerts, and AI assistant — everything in one plan.",
    points: [
      "Full CRS + FSW score breakdown",
      "Top 3 PR pathways ranked for your profile",
      "Score improvement roadmap",
      "Province-by-province PNP match",
      "Consultant-ready PDF summary",
      "Canada physical presence days tracker",
      "Permit expiry reminders",
      "Express Entry draw alerts",
      "Monthly CRS recalculation",
      "AI immigration assistant",
    ],
    href: "/pricing",
    featured: true,
    cta: "Start Free 7-Day Trial",
    badge: "Best value",
  },
];

const DRAW_TYPE_SHORT: Record<string, string> = {
  "All programs": "All Programs",
  "Canadian Experience Class": "CEC",
  "Federal Skilled Worker": "FSW",
  "Provincial Nominee Program": "PNP",
  "French Language Proficiency": "French",
};

export default async function Home() {
  let featuredConsultant: ConsultantListing | null = null;
  try {
    const db = await createClient();
    const { data } = await db
      .from("consultants")
      .select(
        "id, name, business_name, city, province, languages, services, booking_link, avatar_url, certification_type, agency_code, license_number, contact_email, sponsored, verified, active"
      )
      .eq("active", true)
      .eq("sponsored", true)
      .limit(1)
      .maybeSingle();
    featuredConsultant = data as ConsultantListing | null;
  } catch {
    // silently skip if unavailable
  }

  return (
    <main className="min-h-screen bg-(--page-bg) pt-20 text-(--page-heading)">
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-navly-navy px-4 py-12 sm:px-6 md:py-24">
        {/* Background glows */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[-10%] top-[-20%] h-80 w-80 rounded-full bg-navly-red/25 blur-3xl" />
          <div className="absolute bottom-[-20%] right-[-10%] h-96 w-96 rounded-full bg-white/8 blur-3xl" />
        </div>

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1fr_1fr]">
          <div className="max-w-2xl">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white/70">
              <ShieldCheck className="h-3.5 w-3.5 text-navly-red" />
              Educational planning — not legal advice
            </div>

            {/* Headline */}
            <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Your Canadian PR pathway,{" "}
              <span className="text-navly-red">made clear.</span>
            </h1>

            <p className="mt-5 max-w-lg text-base leading-7 text-white/70">
              Answer a few questions and get your estimated PR pathway, CRS
              score gaps, Canada presence tracking, permit deadlines, and next
              steps — without uploading documents.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/onboarding"
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-navly-red px-7 text-sm font-bold text-white transition hover:bg-navly-red/85 sm:w-auto"
              >
                Check My PR Pathway <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#how"
                className="inline-flex h-12 w-full items-center justify-center rounded-xl border border-white/20 px-7 text-sm font-bold text-white transition hover:border-white/40 hover:bg-white/5 sm:w-auto"
              >
                See How It Works
              </a>
            </div>

            {/* Trust chips */}
            <div className="mt-7 flex flex-wrap gap-2">
              {["No passport number", "No SIN", "No documents required"].map(
                (item) => (
                  <div
                    key={item}
                    className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-white/70"
                  >
                    <XCircle className="h-3 w-3 shrink-0 text-navly-red" />
                    {item}
                  </div>
                )
              )}
            </div>

            <p className="mt-4 text-xs leading-5 text-white/50">
              Not affiliated with IRCC or the Government of Canada. Always
              verify on canada.ca or with a licensed professional. Last updated:
              June 2026.
            </p>
          </div>

          {/* Hero image */}
          <div className="relative hidden lg:block">
            <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/10 p-3 shadow-2xl">
              <div className="overflow-hidden rounded-[1.5rem]">
                <img
                  src="/images/hero-group.jpg"
                  alt="People in Canada"
                  className="h-[520px] w-full object-cover"
                />
              </div>
            </div>
            {/* Floating stat badge */}
            <div className="absolute -bottom-4 -left-5 rounded-2xl border border-white/10 bg-navly-navy/90 px-4 py-3 shadow-xl backdrop-blur-sm">
              <p className="text-xs font-semibold text-white/60">Free to start</p>
              <p className="mt-0.5 text-sm font-bold text-white">No credit card required</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── EE Draw Ticker ───────────────────────────────────────────────── */}
      <section className="border-b border-(--page-border) bg-(--page-card) px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center gap-4 overflow-x-auto no-scrollbar">
          <div className="flex shrink-0 items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="whitespace-nowrap text-xs font-bold uppercase tracking-wider text-(--page-body)">
              Latest EE Draws
            </span>
          </div>
          <div className="flex gap-2">
            {recentDraws.slice(0, 4).map((draw, i) => (
              <div
                key={i}
                className="flex items-center gap-2 rounded-full border border-(--page-border) bg-(--page-alt) px-3 py-1.5 text-xs whitespace-nowrap"
              >
                <span className="font-bold text-(--page-heading)">{draw.cutoff}</span>
                <span className="text-(--page-body)">{DRAW_TYPE_SHORT[draw.type] ?? draw.type}</span>
                {draw.invited && (
                  <span className="rounded-full bg-navly-red/10 px-1.5 py-0.5 text-[10px] font-bold text-navly-red">
                    {draw.invited.toLocaleString()} invited
                  </span>
                )}
                <span className="text-(--page-body)/50 text-[10px]">{draw.date}</span>
              </div>
            ))}
          </div>
          <Link
            href="/dashboard/news"
            className="ml-auto shrink-0 flex items-center gap-1 text-xs font-semibold text-navly-red hover:underline whitespace-nowrap"
          >
            All draws <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>

      {/* ── Who Navly Helps + Features ───────────────────────────────────── */}
      <section id="features" className="bg-(--page-bg) px-4 py-12 sm:px-6 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-widest text-navly-red">
              Features
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-(--page-heading) md:text-4xl">
              Built for clarity, not confusion.
            </h2>
            <p className="mt-3 text-(--page-body)">
              Navly adapts to your immigration stage — different questions,
              different dashboard, different tracking.
            </p>
          </div>

          {/* Who it's for */}
          <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {userTypes.map(({ title, icon: Icon }) => (
              <div
                key={title}
                className="flex items-center gap-3 rounded-2xl border border-(--page-border) bg-(--page-card) px-4 py-3.5 shadow-sm"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-navly-navy">
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <p className="text-sm font-semibold text-(--page-heading) leading-tight">{title}</p>
              </div>
            ))}
          </div>

          {/* Feature cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group rounded-2xl border border-(--page-border) bg-(--page-card) p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-navly-red/30 hover:shadow-md"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-navly-navy transition group-hover:bg-navly-red">
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="mt-4 font-bold text-(--page-heading)">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-(--page-body)">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────────────── */}
      <section id="how" className="bg-(--page-alt) px-4 py-12 sm:px-6 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-navly-red">
              How It Works
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-(--page-heading) md:text-4xl">
              From confusion to a clear next step.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-(--page-body)">
              You do not need to understand every immigration program before
              starting. Navly organizes the first step for you.
            </p>
          </div>

          <div className="relative grid gap-6 md:grid-cols-3">
            {/* Connector line — desktop only */}
            <div className="pointer-events-none absolute left-0 right-0 top-[22px] hidden h-px bg-gradient-to-r from-transparent via-navly-red/20 to-transparent md:block" />

            {howSteps.map((step, index) => (
              <div
                key={step.title}
                className="relative rounded-2xl border border-(--page-border) bg-(--page-card) p-6 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navly-red text-sm font-bold text-white shadow-md">
                    {index + 1}
                  </div>
                  <h3 className="font-bold text-(--page-heading)">{step.title}</h3>
                </div>
                <p className="mt-3 text-sm leading-6 text-(--page-body)">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/onboarding"
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-navly-red px-7 text-sm font-bold text-white transition hover:bg-navly-red/85"
            >
              Start My Free Check <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Featured Consultant Ad ───────────────────────────────────────── */}
      {featuredConsultant && (
        <section className="border-y border-(--page-border) bg-(--page-bg) px-4 py-8 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <div className="mb-4 flex items-center gap-3">
              <p className="text-xs font-bold uppercase tracking-widest text-(--page-body)/60">
                Featured Consultant
              </p>
              <span className="rounded-full bg-navly-red/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-navly-red">
                Sponsored
              </span>
            </div>
            <div className="flex flex-col gap-5 rounded-2xl border border-(--page-border) bg-(--page-card) p-6 shadow-sm sm:flex-row sm:items-center">
              {featuredConsultant.avatar_url ? (
                <img
                  src={featuredConsultant.avatar_url}
                  alt={featuredConsultant.name}
                  className="h-16 w-16 shrink-0 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-navly-navy text-xl font-bold text-white">
                  {featuredConsultant.name.charAt(0)}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-bold text-(--page-heading)">{featuredConsultant.name}</p>
                  {featuredConsultant.verified && (
                    <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                      <CheckCircle2 className="h-3 w-3" /> Verified
                    </span>
                  )}
                </div>
                {featuredConsultant.business_name && (
                  <p className="text-sm text-(--page-body)">{featuredConsultant.business_name}</p>
                )}
                <p className="mt-1 text-xs text-muted-text">
                  {featuredConsultant.city}, {featuredConsultant.province}
                  {featuredConsultant.languages?.length > 0 &&
                    ` · ${featuredConsultant.languages.join(", ")}`}
                </p>
                {featuredConsultant.services?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {featuredConsultant.services.slice(0, 4).map((s) => (
                      <span
                        key={s}
                        className="rounded-full border border-(--page-border) px-2 py-0.5 text-xs text-(--page-body)"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {featuredConsultant.booking_link && (
                <a
                  href={featuredConsultant.booking_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-navly-navy px-5 py-2.5 text-sm font-bold text-white transition hover:bg-navly-navy/80 sm:w-auto"
                >
                  Book a consultation <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
            <p className="mt-3 text-xs text-(--page-body)/50">
              Independent professional. Navly does not provide immigration
              consulting services and is not responsible for services offered by
              listed consultants.
            </p>
          </div>
        </section>
      )}

      {/* ── What Navly Does Not Do ───────────────────────────────────────── */}
      <section className="bg-navly-navy px-4 py-12 text-white sm:px-6 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-2 md:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-navly-red">
              Trust and Safety
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
              Clear planning. No fake promises.
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-7 text-white/70">
              Immigration decisions are serious. Navly is designed to organize
              your information, track deadlines, and explain general pathways —
              not to replace professional legal advice.
            </p>
            <Link
              href="/onboarding"
              className="mt-8 inline-flex h-11 items-center gap-2 rounded-xl border border-white/20 px-6 text-sm font-bold text-white transition hover:border-white/40 hover:bg-white/5"
            >
              Start your free check <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-lg font-bold text-white">Navly does not:</h3>
            <div className="mt-5 grid gap-3.5">
              {notDoItems.map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-navly-red" />
                  <p className="text-sm text-white/80">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────────────────── */}
      <section id="pricing" className="bg-(--page-bg) px-4 py-12 sm:px-6 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-navly-red">
              Pricing
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-(--page-heading) md:text-4xl">
              Start free. Upgrade when ready.
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-(--page-body)">
              Use the free check to see where you stand. Upgrade to PR Tracker
              for the full breakdown, daily tracking, and alerts.
            </p>
          </div>

          <div className="mx-auto grid max-w-3xl gap-6 md:grid-cols-2">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`flex flex-col rounded-2xl p-6 ${
                  plan.featured
                    ? "bg-navly-navy text-white shadow-2xl ring-2 ring-navly-red"
                    : "border border-(--page-border) bg-(--page-card) shadow-sm"
                }`}
              >
                {plan.badge && (
                  <span className="mb-3 inline-flex w-fit items-center rounded-full bg-navly-red/20 px-3 py-0.5 text-xs font-bold text-navly-red">
                    {plan.badge}
                  </span>
                )}

                <h3
                  className={`text-lg font-bold ${
                    plan.featured ? "text-white" : "text-(--page-heading)"
                  }`}
                >
                  {plan.name}
                </h3>

                <div className="mt-3 flex items-end gap-1.5">
                  <span
                    className={`text-4xl font-bold ${
                      plan.featured ? "text-white" : "text-(--page-heading)"
                    }`}
                  >
                    {plan.price}
                  </span>
                  <span
                    className={`mb-1 text-sm ${
                      plan.featured ? "text-white/60" : "text-(--page-body)"
                    }`}
                  >
                    {plan.priceNote}
                  </span>
                </div>
                {"monthlyNote" in plan && plan.monthlyNote && (
                  <p className="mt-0.5 text-xs text-white/50">{plan.monthlyNote}</p>
                )}

                <p
                  className={`mt-3 text-sm leading-6 ${
                    plan.featured ? "text-white/70" : "text-(--page-body)"
                  }`}
                >
                  {plan.desc}
                </p>

                <div className="mt-5 flex-1 space-y-2.5">
                  {plan.points.map((point) => (
                    <div key={point} className="flex items-start gap-2">
                      <CheckCircle2
                        className={`mt-0.5 h-4 w-4 shrink-0 ${
                          plan.featured ? "text-navly-red" : "text-navly-red"
                        }`}
                      />
                      <p
                        className={`text-sm ${
                          plan.featured ? "text-white/80" : "text-(--page-body)"
                        }`}
                      >
                        {point}
                      </p>
                    </div>
                  ))}
                </div>

                <Link
                  href={plan.href}
                  className={`mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition ${
                    plan.featured
                      ? "bg-navly-red text-white hover:bg-navly-red/85"
                      : "border border-(--page-border) text-(--page-heading) hover:bg-navly-navy hover:text-white hover:border-navly-navy"
                  }`}
                >
                  {plan.cta} <ArrowRight className="h-4 w-4" />
                </Link>

                {plan.featured && (
                  <p className="mt-2 text-center text-xs text-white/40">
                    7-day free trial · no credit card required
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1 text-sm font-semibold text-navly-red hover:underline"
            >
              See full feature comparison <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────────── */}
      <section className="bg-navly-red px-4 py-14 sm:px-6 md:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <CheckCircle2 className="mx-auto mb-5 h-10 w-10 text-white" />
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            Know what to work on before you spend money.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-white/85">
            Start with a free pathway check. See your status, gaps, and next
            steps in one organized dashboard.
          </p>
          <Link
            href="/onboarding"
            className="mt-8 inline-flex h-12 items-center gap-2 rounded-xl bg-white px-7 text-sm font-bold text-navly-red transition hover:bg-white/90"
          >
            Check My PR Pathway <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="bg-(--page-alt) px-4 py-12 sm:px-6 md:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 md:mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-navly-red">
              FAQ
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-(--page-heading) md:text-3xl">
              Common questions.
            </h2>
          </div>
          <FAQAccordion />
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="bg-navly-navy px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div>
              <NavlyLogo size="sm" variant="light" />
              <p className="mt-2 max-w-xs text-xs leading-5 text-white/60">
                Educational planning tool — not a law firm or government
                service.
              </p>
            </div>

            <nav className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-white/70">
              <Link href="/pricing" className="transition hover:text-white">Pricing</Link>
              <Link href="/privacy" className="transition hover:text-white">Privacy</Link>
              <Link href="/terms" className="transition hover:text-white">Terms</Link>
              <a href="mailto:support@navly.ca" className="transition hover:text-white">Support</a>
              <a
                href="https://www.instagram.com/navly.ca"
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-white"
              >
                Instagram
              </a>
            </nav>
          </div>

          <div className="mt-6 border-t border-white/10 pt-5 text-center text-xs text-white/40">
            <p>
              © {new Date().getFullYear()} Navly. All rights reserved. General
              educational information only — not legal advice.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
