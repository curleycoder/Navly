import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  MessageSquare,
  CalendarCheck,
  Target,
  ShieldCheck,
  GraduationCap,
  BriefcaseBusiness,
  Plane,
  BadgeCheck,
  AlertTriangle,
  XCircle,
  ExternalLink,
} from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { NavlyLogo } from "@/components/ui/NavlyLogo";
import { recentDraws } from "@/lib/draws";
import { FAQAccordion } from "@/components/ui/FAQAccordion";
import { createClient } from "@/lib/supabase/server";
import type { ConsultantListing } from "@/lib/consultants";

const userTypes = [
  {
    title: "International students",
    desc: "Track study timeline, PGWP planning, CEC readiness, and next PR steps.",
    icon: GraduationCap,
  },
  {
    title: "Workers and PGWP holders",
    desc: "Track skilled work months, permit expiry, CRS readiness, and possible PNP options.",
    icon: BriefcaseBusiness,
  },
  {
    title: "Visitors in Canada",
    desc: "Understand realistic options. Visitor status alone is not a direct PR pathway.",
    icon: Plane,
  },
  {
    title: "Permanent residents",
    desc: "Track citizenship days, PR card expiry, travel history, and residency obligation.",
    icon: BadgeCheck,
  },
];

const features = [
  {
    title: "Smart intake",
    desc: "Build a profile based on your status, language scores, education, work, province, and goal.",
    icon: FileText,
  },
  {
    title: "Pathway screening",
    desc: "See possible routes like CEC, FSW, FST, PNP, study-to-PR, or citizenship.",
    icon: Target,
  },
  {
    title: "Deadline tracker",
    desc: "Track permit expiry, PR card expiry, citizenship days, and key immigration reminders.",
    icon: CalendarCheck,
  },
  {
    title: "AI assistant",
    desc: "Ask general immigration questions in plain English with clear legal-safety reminders.",
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
    desc: "Get an estimated pathway view, score gaps, missing requirements, and deadline reminders.",
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
  "Ask for passport, SIN, or government ID for the free check",
];

const pricingPlans = [
  {
    name: "Free Check",
    price: "$0",
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
    cta: "Start Free →",
  },
  {
    name: "Personalized Report",
    price: "$29.99",
    desc: "Understand exactly where you stand today.",
    points: [
      "Full CRS + FSW score breakdown",
      "Top 3 PR pathways ranked for your profile",
      "Score improvement roadmap",
      "Province-by-province PNP match",
      "Consultant-ready PDF summary",
    ],
    href: "/pricing",
    featured: true,
    cta: "Get My Report →",
  },
  {
    name: "PR Tracker",
    price: "$14.99/mo",
    desc: "We watch your immigration journey so you don't miss anything.",
    points: [
      "Canada physical presence days tracker",
      "Permit expiry reminders",
      "Express Entry draw alerts",
      "Monthly CRS recalculation",
      "Profile update reminders",
      "AI immigration assistant",
    ],
    href: "/pricing",
    featured: false,
    cta: "Start Tracking →",
  },
];

const DRAW_TYPE_SHORT: Record<string, string> = {
  'All programs': 'All Programs',
  'Canadian Experience Class': 'CEC',
  'Federal Skilled Worker': 'FSW',
  'Provincial Nominee Program': 'PNP',
  'French Language Proficiency': 'French',
}

export default async function Home() {
  // Fetch one sponsored consultant for the homepage ad slot
  let featuredConsultant: ConsultantListing | null = null
  try {
    const db = await createClient()
    const { data } = await db
      .from('consultants')
      .select('id, name, business_name, city, province, languages, services, booking_link, avatar_url, certification_type, agency_code, license_number, contact_email, sponsored, verified, active')
      .eq('active', true)
      .eq('sponsored', true)
      .limit(1)
      .maybeSingle()
    featuredConsultant = data as ConsultantListing | null
  } catch {
    // silently skip if unavailable
  }

  return (
    <main className="min-h-screen bg-(--page-bg) pt-20 text-(--page-heading)">
      <Navbar />

      {/* Hero — intentionally always dark navy */}
      <section className="relative overflow-hidden bg-navly-navy px-4 py-8 sm:px-6 md:py-20">
        <div className="absolute inset-0 opacity-25">
          <div className="absolute left-[-10%] top-[-20%] h-72 w-72 rounded-full bg-navly-red/30 blur-3xl" />
          <div className="absolute bottom-[-20%] right-[-10%] h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        </div>

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white/70">
              <ShieldCheck className="h-3.5 w-3.5 text-navly-red" />
              Educational planning — not legal advice
            </div>

            <h1 className="mt-6 text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-6xl">
              Your Canadian PR pathway,{" "}
              <span className="text-navly-red">made clear.</span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-7 text-white/70">
              Answer a few questions and see your estimated PR pathway, score gaps,
              missing requirements, and next steps — without uploading documents.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/onboarding"
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-navly-red px-6 text-sm font-bold text-white transition hover:bg-navly-red/80 sm:w-auto"
              >
                Check My PR Pathway <ArrowRight className="h-4 w-4" />
              </Link>

              <a
                href="#how"
                className="inline-flex h-12 w-full items-center justify-center rounded-xl border border-white/20 px-6 text-sm font-bold text-white transition hover:border-white/40 hover:bg-white/5 sm:w-auto"
              >
                See How It Works
              </a>
            </div>

            {/* Trust chips */}
            <div className="mt-8 flex flex-wrap gap-2">
              {["No passport number", "No SIN", "No documents required"].map(
                (item) => (
                  <div
                    key={item}
                    className="flex items-center justify-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1.5 text-center text-[10px] font-semibold leading-tight text-white/70"
                  >
                    <XCircle className="h-2.5 w-2.5 shrink-0 text-navly-red" />
                    <span>{item}</span>
                  </div>
                )
              )}
            </div>

            <p className="mt-4 max-w-xl text-xs leading-5 text-white/75">
              Not affiliated with IRCC or the Government of Canada. Always verify on canada.ca or with a licensed professional. Last updated: June 2026.
            </p>
          </div>

          <div className="relative hidden lg:block">
            <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/10 p-3 shadow-2xl">
              <div className="overflow-hidden rounded-[1.5rem]">
                <img
                  src="/images/hero-group.jpg"
                  alt="People in Canada"
                  className="h-[500px] w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* EE Draw Ticker */}
      <section className="border-b border-(--page-border) bg-(--page-alt) px-4 py-2.5 sm:px-6">
        <div className="relative mx-auto flex max-w-7xl items-center justify-between overflow-x-auto no-scrollbar md:justify-center md:gap-4">
          <div className="flex shrink-0 items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-(--page-body)">Latest EE Draws</span>
          </div>
          <div className="mx-3 flex shrink-0 items-center gap-2 md:mx-0">
            {recentDraws.slice(0, 3).map((draw, i) => (
              <div key={i} className="flex items-center gap-1.5 rounded-full border border-(--page-border) bg-(--page-card) px-3 py-1 text-xs whitespace-nowrap">
                <span className="font-bold text-(--page-heading)">{draw.cutoff}</span>
                <span className="text-(--page-body)">{DRAW_TYPE_SHORT[draw.type] ?? draw.type}</span>
                <span className="text-(--page-body)/60">{draw.date}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who Navly Helps */}
      {/* Who & Features — merged */}
      <section id="features" className="bg-(--page-alt) px-4 py-8 sm:px-6 md:py-14">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 max-w-2xl md:mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-navly-red">
              Features
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-(--page-heading) sm:text-3xl md:text-4xl">
              Built for clarity, not confusion.
            </h2>
            <p className="mt-3 text-(--page-body)">
              Navly adapts to your immigration stage — different questions, different dashboard, different tracking.
            </p>
          </div>

          {/* Persona pills */}
          <div className="mb-6 flex flex-wrap gap-2">
            {userTypes.map(({ title, icon: Icon }) => (
              <div key={title} className="flex items-center gap-2 rounded-full border border-(--page-border) bg-(--page-card) px-3 py-1.5 text-sm font-medium text-(--page-heading) shadow-sm">
                <Icon className="h-3.5 w-3.5 shrink-0 text-navly-red" />
                {title}
              </div>
            ))}
          </div>

          {/* Feature cards */}
          <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="w-[78vw] shrink-0 snap-start rounded-2xl border border-(--page-border) bg-(--page-card) p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:w-auto"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navly-navy">
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="font-bold text-(--page-heading)">{feature.title}</h3>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-(--page-body)">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="bg-(--page-alt) px-4 py-8 sm:px-6 md:py-14">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 text-center md:mb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-navly-red">
              How It Works
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-(--page-heading) sm:text-3xl md:text-4xl">
              From confusion to a clear next step.
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-(--page-body)">
              You do not need to understand every immigration program before
              starting. Navly organizes the first step for you.
            </p>
          </div>

          <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 md:pb-0">
            {howSteps.map((step, index) => (
              <div
                key={step.title}
                className="w-[82vw] shrink-0 snap-start rounded-2xl border border-(--page-border) bg-(--page-card) p-5 shadow-sm md:w-auto"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navly-red text-sm font-bold text-white">
                    {index + 1}
                  </div>
                  <h3 className="font-bold text-(--page-heading)">{step.title}</h3>
                </div>
                <p className="mt-3 text-sm leading-6 text-(--page-body)">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Consultant Ad */}
      {featuredConsultant && (
        <section className="border-b border-(--page-border) bg-(--page-bg) px-4 py-6 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <div className="mb-4 flex items-center gap-3">
              <p className="text-xs font-bold uppercase tracking-widest text-(--page-body)/60">Featured Consultant</p>
              <span className="rounded-full bg-navly-red/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-navly-red">Sponsored</span>
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
              <div className="flex-1 min-w-0">
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
                  {featuredConsultant.languages?.length > 0 && ` · ${featuredConsultant.languages.join(', ')}`}
                </p>
                {featuredConsultant.services?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {featuredConsultant.services.slice(0, 4).map((s) => (
                      <span key={s} className="rounded-full border border-(--page-border) px-2 py-0.5 text-xs text-(--page-body)">{s}</span>
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
            <p className="mt-3 text-xs text-muted-text/60">
              Independent professional. Navly does not provide immigration consulting services and is not responsible for services offered by listed consultants.
            </p>
          </div>
        </section>
      )}

      {/* What Navly Does Not Do — always dark navy */}
      <section className="bg-navly-navy px-4 py-8 text-white sm:px-6 md:py-14">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[0.9fr_1.1fr] md:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-navly-red">
              Trust and Safety
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
              Clear planning. No fake promises.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-white">
              Immigration decisions are serious. Navly is designed to organize
              your information, track deadlines, and explain general pathways —
              not to replace professional legal advice.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h3 className="font-bold text-xl text-white">Navly does not:</h3>
            <div className="mt-5 grid gap-3">
              {notDoItems.map((item) => (
                <div key={item} className="flex gap-3">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-navly-red" />
                  <p className="text-sm text-white">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-(--page-alt) px-4 py-8 sm:px-6 md:py-14">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 text-center md:mb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-navly-red">
              Pricing
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-(--page-heading) sm:text-3xl md:text-4xl">
              Start free. Upgrade when ready.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-(--page-body)">
              Use the free check first. Pay only when you want a deeper report
              or ongoing immigration tracking.
            </p>
          </div>

          <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 md:mx-auto md:grid md:max-w-6xl md:grid-cols-3 md:overflow-visible md:px-0 md:pb-0">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`w-[82vw] shrink-0 snap-start rounded-2xl p-6 shadow-sm md:w-auto ${
                  plan.featured
                    ? "bg-navly-navy text-white ring-2 ring-navly-red"
                    : "border border-(--page-border) bg-(--page-card)"
                }`}
              >
                {plan.featured && (
                  <span className="mb-4 inline-block rounded-full bg-navly-red/20 px-3 py-0.5 text-xs font-bold text-navly-red">
                    Best value
                  </span>
                )}

                <h3 className={`font-bold ${plan.featured ? "text-white" : "text-(--page-heading)"}`}>
                  {plan.name}
                </h3>

                <p className={`mt-3 text-3xl font-bold ${plan.featured ? "text-white" : "text-(--page-heading)"}`}>
                  {plan.price}
                </p>

                <p className={`mt-2 text-sm leading-6 ${plan.featured ? "text-white" : "text-(--page-body)"}`}>
                  {plan.desc}
                </p>

                <div className="mt-5 space-y-3">
                  {plan.points.map((point) => (
                    <div key={point} className="flex gap-2">
                      <CheckCircle2
                        className={`mt-0.5 h-4 w-4 shrink-0 ${plan.featured ? "text-navly-red" : "text-navly-red"}`}
                      />
                      <p className={`text-sm ${plan.featured ? "text-white" : "text-(--page-body)"}`}>
                        {point}
                      </p>
                    </div>
                  ))}
                </div>

                <Link
                  href={plan.href}
                  className={`mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                    plan.featured
                      ? "bg-navly-red text-white hover:bg-navly-red/80 focus-visible:outline-navly-red"
                      : "border border-navly-navy text-heading hover:bg-navly-navy hover:text-white focus-visible:outline-navly-navy"
                  }`}
                >
                  {plan.cta} <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/pricing"
              className="text-sm font-semibold text-navly-red hover:underline"
            >
              See full feature comparison →
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA — always red */}
      <section className="bg-navly-red px-4 py-8 sm:px-6 md:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <CheckCircle2 className="mx-auto mb-4 h-10 w-10 text-white" />
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl">
            Know what to work on before you spend money.
          </h2>
          <p className="mx-auto font-bold mt-4 max-w-xl text-base leading-7 text-white/90">
            Start with a free pathway check. See your status, gaps, and next
            steps in one organized dashboard.
          </p>
          <Link
            href="/onboarding"
            className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-navly-red transition hover:bg-white/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:w-auto"
          >
            Check My PR Pathway <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-(--page-bg) px-4 py-8 sm:px-6 md:py-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-5 md:mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-navly-red">FAQ</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-(--page-heading)">
              Common questions.
            </h2>
          </div>
          <FAQAccordion />
        </div>
      </section>

      {/* Footer — always dark navy */}
      <footer className="bg-navly-navy px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <NavlyLogo size="sm" variant="light" />
              <p className="mt-1.5 max-w-sm text-xs leading-5 text-white/80">
                Educational planning tool — not a law firm or government service.
              </p>
            </div>

            <nav className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-white/85">
              <Link href="/pricing" className="transition hover:text-white">Pricing</Link>
              <Link href="/privacy" className="transition hover:text-white">Privacy</Link>
              <Link href="/terms" className="transition hover:text-white">Terms</Link>
              <a href="mailto:support@navly.ca" className="transition hover:text-white">Support</a>
              <a href="https://www.instagram.com/navly.ca" target="_blank" rel="noopener noreferrer" className="transition hover:text-white">Instagram</a>
            </nav>
          </div>

          <div className="mt-4 border-t border-white/10 pt-4 text-center text-xs text-white/65">
            <p>© {new Date().getFullYear()} Navly. All rights reserved. General educational information only — not legal advice.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
