import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  MessageSquare,
  CalendarCheck,
  Target,
} from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { NavlyLogo } from "@/components/ui/NavlyLogo";
import { getUpdates, categoryLabels, categoryColors, importanceDot, formatDate } from "@/lib/news";

const features = [
  {
    title: "Smart intake",
    desc: "Answer a guided set of questions to build a complete immigration profile.",
    icon: FileText,
  },
  {
    title: "Pathway screening",
    desc: "See your strongest PR pathways, estimated CRS score, and what you're missing.",
    icon: Target,
  },
  {
    title: "AI assistant",
    desc: "Ask immigration questions in plain language. Always with safe legal reminders.",
    icon: MessageSquare,
  },
  {
    title: "Canada days tracker",
    desc: "Log daily presence, track trips abroad, and monitor your physical presence count.",
    icon: CalendarCheck,
  },
];

export default async function Home() {
  const updates = await getUpdates({ limit: 3 });

  return (
    <main className="min-h-screen bg-white pt-16 text-[#0B1F3A]">

      <Navbar />

      {/* ── Hero ── */}
      <section className="bg-[#0B1F3A]">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-14 lg:grid-cols-2 lg:gap-16 lg:py-24">

          {/* Left */}
          <div>
            <span className="inline-block rounded-full border border-[#D62828]/40 bg-[#D62828]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#D62828]">
              Educational guidance — not legal advice
            </span>

            <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Your Canadian PR pathway,{" "}
              <span className="text-[#D62828]">made clear.</span>
            </h1>

            <p className="mt-5 max-w-lg text-base leading-7 text-slate-400">
              Navly helps you understand possible Canadian PR pathways based on
              the information you enter. For legal advice, connect with a
              certified Canadian immigration consultant.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/onboarding"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#D62828] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#B91C1C] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D62828]"
              >
                Start Free <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#how"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/5"
              >
                See how it works
              </a>
            </div>

            <p className="mt-6 text-xs text-slate-500">
              Free to start. No documents required. No legal advice.
            </p>
          </div>

          {/* Dashboard preview card */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#D62828]">Navly Dashboard</p>
                <p className="mt-0.5 text-xl font-bold text-white">Profile overview</p>
              </div>
              <span className="rounded-full bg-[#D62828]/20 px-3 py-1 text-xs font-bold text-[#D62828]">
                72% complete
              </span>
            </div>

            <div className="grid gap-3">
              <div className="rounded-xl bg-white/5 p-3.5">
                <p className="text-xs text-slate-400">Current status</p>
                <p className="mt-0.5 font-semibold text-white">International student</p>
              </div>
              <div className="rounded-xl bg-white/5 p-3.5">
                <p className="text-xs text-slate-400">Main goal</p>
                <p className="mt-0.5 font-semibold text-white">Prepare for PR options</p>
              </div>
              <div className="rounded-xl bg-white/5 p-3.5">
                <p className="text-xs text-slate-400">Estimated CRS score</p>
                <div className="mt-2 h-1.5 rounded-full bg-white/10">
                  <div className="h-1.5 w-3/5 rounded-full bg-[#D62828]" />
                </div>
                <p className="mt-1.5 text-xs text-slate-400">438 pts — Canadian Experience Class possible</p>
              </div>
              <div className="rounded-xl bg-white/5 p-3.5">
                <p className="text-xs font-semibold text-slate-300">
                  Navly organizes your information. It does not replace a licensed immigration consultant or lawyer.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="bg-white px-6 py-14 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-[#D62828]">Features</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#0B1F3A] md:text-4xl">
              Built for clarity, not confusion.
            </h2>
            <p className="mt-3 max-w-xl text-slate-500">
              Navly turns scattered immigration information into a clean, organized workflow.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="rounded-xl border border-slate-200 bg-white p-5 transition hover:border-[#0B1F3A]/20 hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#0B1F3A]">
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="font-bold text-[#0B1F3A]">{feature.title}</h3>
                  </div>
                  <p className="mt-1.5 text-sm leading-6 text-slate-500">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how" className="bg-[#F4F6F9] px-6 py-14 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-[#D62828]">How it works</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#0B1F3A] md:text-4xl">
              From scattered info to a clear next step.
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              { title: "Answer a few questions", desc: "Tell us your current status, language scores, education, and work history. Takes about 5 minutes." },
              { title: "See your pathway estimate", desc: "Get an estimated CRS score, strongest PR pathways, and exactly what you are missing." },
              { title: "Track and improve", desc: "Log your Canada presence daily, monitor permit expiry, and get next-action guidance." },
            ].map((step, index) => (
              <div
                key={step.title}
                className="rounded-xl border border-slate-200 bg-white p-5"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#D62828] text-sm font-bold text-white">
                    {index + 1}
                  </div>
                  <h3 className="font-bold text-[#0B1F3A]">{step.title}</h3>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Latest IRCC Updates ── */}
      <section className="bg-white px-6 py-14 md:py-20">
            <div className="mx-auto max-w-7xl">
              <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-[#D62828]">Official Updates</p>
                  <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#0B1F3A] md:text-4xl">
                    Latest IRCC news.
                  </h2>
                  <p className="mt-2 text-slate-500">
                    Sourced from IRCC, Canada Gazette, and official government notices.
                  </p>
                </div>
                <Link
                  href="/onboarding"
                  className="flex shrink-0 items-center gap-1 text-sm font-semibold text-[#D62828] hover:underline"
                >
                  Sign in for updates relevant to you <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {updates.map((u) => (
                  <div
                    key={u.id}
                    className="flex flex-col rounded-xl border border-slate-200 bg-white p-5"
                  >
                    <div className="mb-3 flex items-center gap-2">
                      <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${categoryColors[u.category]}`}>
                        {categoryLabels[u.category]}
                      </span>
                      <span className={`ml-auto h-2 w-2 rounded-full ${importanceDot[u.importance]}`} />
                    </div>
                    <p className="flex-1 text-sm font-bold leading-snug text-[#0B1F3A]">{u.title}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs text-slate-400">{formatDate(u.publishedAt)}</span>
                      <a
                        href={u.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-[#D62828] hover:underline"
                      >
                        {u.sourceName} →
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              <p className="mt-5 text-center text-xs text-slate-400">
                Updates are for educational purposes only — not legal advice. Always verify at canada.ca.
              </p>
            </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="bg-[#F4F6F9] px-6 py-14 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-[#D62828]">Pricing</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#0B1F3A] md:text-4xl">
              Start free. Upgrade when ready.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-slate-500">
              Navly is free to start. Pay only when you want a full personalized report or ongoing tracking.
            </p>
          </div>

          <div className="mx-auto grid max-w-4xl gap-4 md:grid-cols-3">
            {[
              { name: "Free Check", price: "$0", desc: "Profile screening and pathway overview", href: "/onboarding", featured: false },
              { name: "Personalized Report", price: "$29", desc: "Full personalized report with gap analysis", href: "/pricing", featured: true },
              { name: "PR Tracker", price: "$14/mo", desc: "Ongoing tracking, alerts, and AI access", href: "/pricing", featured: false },
            ].map(({ name, price, desc, href, featured }) => (
              <div
                key={name}
                className={`rounded-xl p-6 ${
                  featured
                    ? "bg-[#0B1F3A] text-white"
                    : "border border-slate-200 bg-white"
                }`}
              >
                {featured && (
                  <span className="mb-3 inline-block rounded-full bg-[#D62828]/20 px-3 py-0.5 text-xs font-bold text-[#D62828]">
                    Most popular
                  </span>
                )}
                <h3 className={`font-bold ${featured ? "text-white" : "text-[#0B1F3A]"}`}>{name}</h3>
                <p className={`mt-3 text-3xl font-bold ${featured ? "text-white" : "text-[#0B1F3A]"}`}>{price}</p>
                <p className={`mt-2 text-sm ${featured ? "text-slate-400" : "text-slate-500"}`}>{desc}</p>
                <Link
                  href={href}
                  className={`mt-5 inline-flex w-full items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                    featured
                      ? "bg-[#D62828] text-white hover:bg-[#B91C1C] focus-visible:outline-[#D62828]"
                      : "border border-[#0B1F3A] text-[#0B1F3A] hover:bg-[#0B1F3A] hover:text-white focus-visible:outline-[#0B1F3A]"
                  }`}
                >
                  {name === "Free Check" ? "Get started" : `Choose ${name}`}
                </Link>
              </div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <Link href="/pricing" className="text-sm font-semibold text-[#D62828] hover:underline">
              See full feature comparison →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="bg-[#D62828] px-6 py-14 md:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <CheckCircle2 className="mx-auto mb-4 h-10 w-10 text-white/80" />
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            Your clearest path to Canadian PR starts here.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-white/80">
            See your estimated CRS score, strongest pathways, and exactly what you need to improve — before spending money on a consultant.
          </p>
          <Link
            href="/onboarding"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-bold text-[#D62828] transition hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Start Free <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-[#0B1F3A] px-6 py-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div>
              <NavlyLogo size="sm" variant="light" />
              <p className="mt-2 max-w-xs text-xs leading-5 text-slate-400">
                Educational immigration planning tool. Not a licensed immigration consultant or law firm.
              </p>
            </div>
            <nav className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-400">
              <Link href="/pricing" className="transition hover:text-white">Pricing</Link>
              <Link href="/privacy" className="transition hover:text-white">Privacy Policy</Link>
              <Link href="/terms" className="transition hover:text-white">Terms of Service</Link>
              <a href="mailto:support@navly.ca" className="transition hover:text-white">Support</a>
            </nav>
          </div>
          <div className="mt-8 border-t border-white/10 pt-6 text-center text-xs text-slate-500">
            <p>© {new Date().getFullYear()} Navly. All rights reserved.</p>
            <p className="mt-1">
              Navly provides general educational information only — not legal advice.
              Always consult a licensed RCIC or immigration lawyer for your specific situation.
            </p>
          </div>
        </div>
      </footer>

    </main>
  );
}
