import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  MessageSquare,
  CalendarCheck,
  Target,
  ShieldCheck,
  LockKeyhole,
  Map,
  GraduationCap,
  BriefcaseBusiness,
  Plane,
  BadgeCheck,
  AlertTriangle,
  Newspaper,
  XCircle,
} from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { NavlyLogo } from "@/components/ui/NavlyLogo";
import {
  getUpdates,
  categoryLabels,
  categoryColors,
  importanceDot,
  formatDate,
} from "@/lib/news";

const trustItems = [
  {
    title: "Built around your status",
    desc: "Navly adjusts questions for students, workers, visitors, and permanent residents.",
    icon: ShieldCheck,
  },
  {
    title: "Tracks real deadlines",
    desc: "Track permit expiry, PR card expiry, citizenship days, and key reminders.",
    icon: CalendarCheck,
  },
  {
    title: "Clear next steps",
    desc: "See missing requirements, score gaps, and practical actions to work on next.",
    icon: Target,
  },
];

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
    desc: "See possible routes like CEC, FSW, PNP, study-to-PR, family sponsorship, or citizenship.",
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
    desc: "Monitor your progress, update your profile, follow official changes, and prepare smarter.",
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
    desc: "See your CRS score and how far you are from the last draw.",
    points: [
      "CRS score estimate",
      "\"You need X more points\"",
      "Canada days counter",
      "Express Entry draw alerts",
      "1 pathway preview",
    ],
    href: "/onboarding",
    featured: false,
    cta: "Start Free",
  },
  {
    name: "Readiness Report",
    price: "$29",
    desc: "One-time deep analysis — see exactly where your missing points come from.",
    points: [
      "Full CRS breakdown by category",
      "All pathway options unlocked",
      "Missing docs checklist",
      "\"If I do X → score becomes Y\"",
      "Score improvement roadmap",
    ],
    href: "/pricing",
    featured: true,
    cta: "Get My Report",
  },
  {
    name: "PR Tracker",
    price: "$14/mo",
    desc: "Ongoing tracking with live alerts, AI assistant, and permit reminders.",
    points: [
      "Everything in Report",
      "Permit expiry warnings",
      "PR probability score",
      "AI immigration assistant",
      "Monthly CRS recalculation",
    ],
    href: "/pricing",
    featured: false,
    cta: "Start Tracking",
  },
];

export default async function Home() {
  const updates = await getUpdates({ limit: 3 });

  return (
    <main className="min-h-screen bg-(--page-bg) pt-20 text-(--page-heading)">
      <Navbar />

      {/* Hero — intentionally always dark navy */}
      <section className="relative overflow-hidden bg-[#0B1F3A] px-4 py-12 sm:px-6 md:py-20">
        <div className="absolute inset-0 opacity-25">
          <div className="absolute left-[-10%] top-[-20%] h-72 w-72 rounded-full bg-[#D62828]/30 blur-3xl" />
          <div className="absolute bottom-[-20%] right-[-10%] h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        </div>

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-200">
              <ShieldCheck className="h-3.5 w-3.5 text-[#D62828]" />
              Educational planning — not legal advice
            </div>

            <h1 className="mt-6 text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-6xl">
              Your Canadian PR pathway,{" "}
              <span className="text-[#D62828]">made clear.</span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-8 text-slate-300">
              Answer a few questions and see your estimated PR pathway, score gaps,
              missing requirements, and next steps — without uploading documents.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/onboarding"
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#D62828] px-6 text-sm font-bold text-white transition hover:bg-[#B91C1C] sm:w-auto"
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
            <div className="mt-8 flex gap-2">
              {["No passport number", "No SIN", "No documents required"].map(
                (item) => (
                  <div
                    key={item}
                    className="flex items-center justify-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1.5 text-center text-[10px] font-semibold leading-tight text-slate-200"
                  >
                    <XCircle className="h-2.5 w-2.5 shrink-0 text-[#D62828]" />
                    <span>{item}</span>
                  </div>
                )
              )}
            </div>

            <p className="mt-6 max-w-xl text-xs leading-5 text-slate-500">
              Navly is not affiliated with IRCC, the Government of Canada, or any
              immigration authority. Always verify official requirements on canada.ca
              or with a licensed professional.
            </p>

            <p className="mt-2 text-xs font-semibold text-slate-400">
              Last checked against public immigration updates: May 2026
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

      {/* Trust Strip */}
      <section className="border-b border-(--page-border) bg-(--page-bg) px-4 py-8 sm:px-6">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3">
          {trustItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="flex gap-4 rounded-2xl border border-(--page-border) bg-(--page-card) p-5 shadow-sm"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0B1F3A]">
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-(--page-heading)">{item.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-(--page-body)">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Who Navly Helps */}
      <section className="bg-(--page-alt) px-4 py-10 sm:px-6 md:py-14">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-widest text-[#D62828]">
              Who Navly Helps
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-(--page-heading) sm:text-3xl md:text-4xl">
              Built for different immigration stages.
            </h2>
            <p className="mt-3 text-(--page-body)">
              Navly changes the questions and tracking dashboard based on where
              you are in your immigration journey.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {userTypes.map((type) => {
              const Icon = type.icon;
              return (
                <div
                  key={type.title}
                  className="rounded-2xl border border-(--page-border) bg-(--page-card) p-5 shadow-sm"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#D62828]/10">
                    <Icon className="h-5 w-5 text-[#D62828]" />
                  </div>
                  <h3 className="mt-4 font-bold text-(--page-heading)">{type.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-(--page-body)">{type.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-(--page-bg) px-4 py-10 sm:px-6 md:py-14">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-widest text-[#D62828]">
              Features
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-(--page-heading) sm:text-3xl md:text-4xl">
              Built for clarity, not confusion.
            </h2>
            <p className="mt-3 text-(--page-body)">
              Navly turns scattered immigration information into a clean,
              organized workflow.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-(--page-border) bg-(--page-card) p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0B1F3A]">
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
      <section id="how" className="bg-(--page-alt) px-4 py-10 sm:px-6 md:py-14">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-[#D62828]">
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

          <div className="grid gap-4 md:grid-cols-3">
            {howSteps.map((step, index) => (
              <div
                key={step.title}
                className="rounded-2xl border border-(--page-border) bg-(--page-card) p-6 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#D62828] text-sm font-bold text-white">
                    {index + 1}
                  </div>
                  <h3 className="font-bold text-(--page-heading)">{step.title}</h3>
                </div>
                <p className="mt-4 text-sm leading-6 text-(--page-body)">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Official Updates */}
      <section className="bg-(--page-bg) px-4 py-10 sm:px-6 md:py-14">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#D62828]">
                Official Updates
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-(--page-heading) sm:text-3xl md:text-4xl">
                Latest immigration updates.
              </h2>
              <p className="mt-2 max-w-2xl text-(--page-body)">
                Navly tracks official immigration updates and helps users focus
                on what may affect their profile.
              </p>
            </div>
            <Link
              href="/onboarding"
              className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-[#D62828] hover:underline"
            >
              Get updates relevant to me <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {updates.map((u) => (
              <article
                key={u.id}
                className="flex flex-col rounded-2xl border border-(--page-border) bg-(--page-card) p-5 shadow-sm"
              >
                <div className="mb-3 flex items-center gap-2">
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${categoryColors[u.category]}`}
                  >
                    {categoryLabels[u.category]}
                  </span>
                  <span
                    className={`ml-auto h-2 w-2 rounded-full ${importanceDot[u.importance]}`}
                  />
                </div>
                <p className="flex-1 text-sm font-bold leading-snug text-(--page-heading)">
                  {u.title}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-(--page-body)">{formatDate(u.publishedAt)}</span>
                  <a
                    href={u.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-[#D62828] hover:underline"
                  >
                    {u.sourceName} →
                  </a>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-(--page-border) bg-(--page-alt) p-4">
            <div className="flex gap-3">
              <Newspaper className="mt-0.5 h-5 w-5 shrink-0 text-(--page-heading)" />
              <p className="text-sm leading-6 text-(--page-body)">
                Updates are provided for educational planning only. Always check
                official government pages before making immigration decisions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What Navly Does Not Do — always dark navy */}
      <section className="bg-[#0B1F3A] px-4 py-10 text-white sm:px-6 md:py-14">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[0.9fr_1.1fr] md:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#D62828]">
              Trust and Safety
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
              Clear planning. No fake promises.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300">
              Immigration decisions are serious. Navly is designed to organize
              your information, track deadlines, and explain general pathways —
              not to replace professional legal advice.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h3 className="font-bold text-white">Navly does not:</h3>
            <div className="mt-5 grid gap-3">
              {notDoItems.map((item) => (
                <div key={item} className="flex gap-3">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#D62828]" />
                  <p className="text-sm text-slate-300">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-(--page-alt) px-4 py-10 sm:px-6 md:py-14">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-[#D62828]">
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

          <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-3">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-6 shadow-sm ${
                  plan.featured
                    ? "bg-[#0B1F3A] text-white ring-2 ring-[#D62828]"
                    : "border border-(--page-border) bg-(--page-card)"
                }`}
              >
                {plan.featured && (
                  <span className="mb-4 inline-block rounded-full bg-[#D62828]/20 px-3 py-0.5 text-xs font-bold text-[#D62828]">
                    Best value
                  </span>
                )}

                <h3 className={`font-bold ${plan.featured ? "text-white" : "text-(--page-heading)"}`}>
                  {plan.name}
                </h3>

                <p className={`mt-3 text-3xl font-bold ${plan.featured ? "text-white" : "text-(--page-heading)"}`}>
                  {plan.price}
                </p>

                <p className={`mt-2 text-sm leading-6 ${plan.featured ? "text-slate-300" : "text-(--page-body)"}`}>
                  {plan.desc}
                </p>

                <div className="mt-5 space-y-3">
                  {plan.points.map((point) => (
                    <div key={point} className="flex gap-2">
                      <CheckCircle2
                        className={`mt-0.5 h-4 w-4 shrink-0 ${plan.featured ? "text-[#D62828]" : "text-[#D62828]"}`}
                      />
                      <p className={`text-sm ${plan.featured ? "text-slate-300" : "text-(--page-body)"}`}>
                        {point}
                      </p>
                    </div>
                  ))}
                </div>

                <Link
                  href={plan.href}
                  className={`mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                    plan.featured
                      ? "bg-[#D62828] text-white hover:bg-[#B91C1C] focus-visible:outline-[#D62828]"
                      : "border border-[#0B1F3A] text-[#0B1F3A] hover:bg-[#0B1F3A] hover:text-white focus-visible:outline-[#0B1F3A]"
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
              className="text-sm font-semibold text-[#D62828] hover:underline"
            >
              See full feature comparison →
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA — always red */}
      <section className="bg-[#D62828] px-4 py-12 sm:px-6 md:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <CheckCircle2 className="mx-auto mb-4 h-10 w-10 text-white/80" />
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl">
            Know what to work on before you spend money.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-white/85">
            Start with a free pathway check. See your status, gaps, and next
            steps in one organized dashboard.
          </p>
          <Link
            href="/onboarding"
            className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-[#D62828] transition hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:w-auto"
          >
            Check My PR Pathway <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer — always dark navy */}
      <footer className="bg-[#0B1F3A] px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div>
              <NavlyLogo size="sm" variant="light" />
              <p className="mt-2 max-w-sm text-xs leading-5 text-slate-400">
                Navly is an educational immigration planning and tracking tool.
                It is not a law firm, RCIC practice, or government service.
              </p>
            </div>

            <nav className="flex flex-wrap gap-x-6 gap-y-2 pt-4 text-xs text-slate-400">
              <Link href="/pricing" className="transition hover:text-white">Pricing</Link>
              <Link href="/privacy" className="transition hover:text-white">Privacy Policy</Link>
              <Link href="/terms" className="transition hover:text-white">Terms of Service</Link>
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

          <div className="mt-8 border-t border-white/10 pt-6 text-center text-xs text-slate-500">
            <p>© {new Date().getFullYear()} Navly. All rights reserved.</p>
            <p className="mt-1">
              Navly provides general educational information only — not legal
              advice. Always consult a licensed RCIC or immigration lawyer for
              advice about your specific situation.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
