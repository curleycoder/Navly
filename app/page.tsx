import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  MessageSquare,
  CalendarCheck,
  Target,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-[#0B1F3A]">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <NavlyLogo size="sm" />
          </div>

          <nav className="hidden items-center gap-8 text-sm font-semibold text-slate-600 md:flex">
            <a href="#features" className="hover:text-[#D62828]">
              Features
            </a>
            <a href="#how" className="hover:text-[#D62828]">
              How it works
            </a>
            <a href="#pricing" className="hover:text-[#D62828]">
              Pricing
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className={buttonVariants({ variant: "ghost", className: "text-[#0B1F3A] hover:bg-slate-100 hover:text-[#0B1F3A]" })}
            >
              Log in
            </Link>
            <Link
              href="/onboarding"
              className={buttonVariants({ className: "bg-[#D62828] text-white hover:bg-[#B91C1C]" })}
            >
              Start Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-[#D62828]/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-[#0B1F3A]/10 blur-3xl" />

        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-10 lg:grid-cols-2 lg:py-16">
          <div className="relative z-10">
            <div className="mb-6 inline-flex rounded-full border border-[#D62828]/20 bg-[#D62828]/5 px-4 py-2 text-sm font-semibold text-[#D62828] shadow-sm">
              Educational immigration guidance — not legal advice
            </div>

            <h1 className="max-w-3xl text-5xl font-bold tracking-tight text-[#0B1F3A] md:text-7xl">
              Immigration intake made clearer.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              Navly helps you understand possible Canadian PR pathways based on
              the information you enter. For legal advice or application review,
              connect with a certified Canadian immigration consultant.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/onboarding"
                className={buttonVariants({ size: "lg", className: "bg-[#D62828] text-white hover:bg-[#B91C1C]" })}
              >
                Start Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <a
                href="#how"
                className={buttonVariants({ size: "lg", variant: "outline", className: "border-[#0B1F3A] text-[#0B1F3A] hover:bg-[#0B1F3A] hover:text-white" })}
              >
                See How It Works
              </a>
            </div>
          </div>

          {/* Dashboard Preview */}
          <Card className="relative z-10 rounded-3xl border-slate-200 bg-white shadow-2xl">
            <CardContent className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#D62828]">
                    Navly Dashboard
                  </p>
                  <h2 className="text-3xl font-bold text-[#0B1F3A]">
                    Profile overview
                  </h2>
                </div>
                <span className="rounded-full bg-[#D62828]/10 px-3 py-1 text-xs font-bold text-[#D62828]">
                  72% complete
                </span>
              </div>

              <div className="grid gap-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-sm text-slate-500">Current status</p>
                  <p className="mt-1 text-lg font-bold text-[#0B1F3A]">
                    International student
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-sm text-slate-500">Main goal</p>
                  <p className="mt-1 text-lg font-bold text-[#0B1F3A]">
                    Prepare for PR options
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-sm text-slate-500">Estimated CRS score</p>
                  <div className="mt-3 h-2 rounded-full bg-slate-100">
                    <div className="h-2 w-3/5 rounded-full bg-[#D62828]" />
                  </div>
                  <p className="mt-2 text-sm text-slate-600">438 pts — Canadian Experience Class possible</p>
                </div>

                <div className="rounded-2xl border border-[#0B1F3A]/15 bg-[#0B1F3A]/5 p-4">
                  <p className="text-sm font-bold text-[#0B1F3A]">Reminder</p>
                  <p className="mt-1 text-sm leading-6 text-slate-700">
                    Navly helps organize your information. It does not replace a
                    licensed immigration consultant or lawyer.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="border-y border-slate-200 bg-[#F8FAFC] px-6 py-20"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-wide text-[#D62828]">
              Features
            </p>
            <h2 className="mt-3 text-4xl font-bold tracking-tight text-[#0B1F3A]">
              Built for clarity, not confusion.
            </h2>
            <p className="mt-4 text-slate-600">
              Navly turns scattered immigration information into a clean,
              organized workflow.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <Card
                  key={feature.title}
                  className="rounded-2xl border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <CardContent className="p-6">
                    <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-[#0B1F3A] text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-xl font-bold text-[#0B1F3A]">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {feature.desc}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="bg-white px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <p className="text-sm font-bold uppercase tracking-wide text-[#D62828]">
              How it works
            </p>
            <h2 className="mx-auto mt-3 max-w-3xl text-4xl font-bold tracking-tight text-[#0B1F3A]">
              From messy information to a clear next step.
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              { title: "Answer a few questions", desc: "Tell us your current status, language scores, education, and work history. Takes about 5 minutes." },
              { title: "See your pathway estimate", desc: "Get an estimated CRS score, strongest PR pathways, and exactly what you are missing." },
              { title: "Track and improve", desc: "Log your Canada presence daily, monitor permit expiry, and get next-action guidance." },
            ].map((step, index) => (
              <div
                key={step.title}
                className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"
              >
                <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-full bg-[#D62828] text-sm font-bold text-white">
                  {index + 1}
                </div>
                <h3 className="text-xl font-bold text-[#0B1F3A]">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest IRCC Updates */}
      {(() => {
        const updates = getUpdates({ limit: 3 })
        return (
          <section className="bg-white px-6 py-20">
            <div className="mx-auto max-w-7xl">
              <div className="mb-10 flex items-end justify-between">
                <div>
                  <p className="text-sm font-bold uppercase tracking-wide text-[#D62828]">
                    Official Updates
                  </p>
                  <h2 className="mt-3 text-4xl font-bold tracking-tight text-[#0B1F3A]">
                    Latest IRCC news.
                  </h2>
                  <p className="mt-3 text-slate-600">
                    Sourced directly from IRCC, Canada Gazette, and official government notices.
                  </p>
                </div>
                <Link
                  href="/onboarding"
                  className="hidden items-center gap-1 text-sm font-semibold text-[#D62828] hover:underline md:flex"
                >
                  Sign in to see updates relevant to you <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="grid gap-5 md:grid-cols-3">
                {updates.map((u) => (
                  <div
                    key={u.id}
                    className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="mb-3 flex items-center gap-2">
                      <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${categoryColors[u.category]}`}>
                        {categoryLabels[u.category]}
                      </span>
                      <span className={`ml-auto h-2 w-2 rounded-full ${importanceDot[u.importance]}`} />
                    </div>
                    <p className="flex-1 font-bold leading-snug text-[#0B1F3A]">{u.title}</p>
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

              <p className="mt-6 text-center text-xs text-slate-400">
                Updates are for educational purposes only and are not legal advice. Always verify at canada.ca.
              </p>
            </div>
          </section>
        )
      })()}

      {/* Pricing Preview */}
      <section
        id="pricing"
        className="border-t border-slate-200 bg-[#F8FAFC] px-6 py-20"
      >
        <div className="mx-auto max-w-7xl text-center">
          <p className="text-sm font-bold uppercase tracking-wide text-[#D62828]">
            Pricing
          </p>
          <h2 className="mt-3 text-4xl font-bold tracking-tight text-[#0B1F3A]">
            Start free. Upgrade when you need more.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-600">
            Navly is free to start. Pay only when you want a full personalized
            report or ongoing tracking.
          </p>

          <div className="mx-auto mt-10 grid max-w-4xl gap-6 md:grid-cols-3">
            {[
              { name: "Free Check", price: "$0", desc: "Profile screening and pathway overview", href: "/onboarding" },
              { name: "Personalized Report", price: "$29", desc: "Full personalized report with gap analysis", href: "/pricing" },
              { name: "PR Tracker", price: "$14/mo", desc: "Ongoing tracking, alerts, and AI access", href: "/pricing" },
            ].map(({ name, price, desc, href }) => (
              <Card
                key={name}
                className={`rounded-2xl bg-white ${
                  name === "Personalized Report"
                    ? "border-[#D62828] shadow-xl shadow-red-100"
                    : "border-slate-200"
                }`}
              >
                <CardContent className="p-6">
                  {name === "Personalized Report" && (
                    <div className="mb-4 rounded-full bg-[#D62828]/10 px-3 py-1 text-xs font-bold text-[#D62828]">
                      Most popular
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-[#0B1F3A]">{name}</h3>
                  <p className="mt-4 text-3xl font-bold text-[#0B1F3A]">
                    {price}
                  </p>
                  <p className="mt-3 text-sm text-slate-600">{desc}</p>
                  <Link
                    href={href}
                    className={buttonVariants({
                      variant: name === "Personalized Report" ? "default" : "outline",
                      className: name === "Personalized Report"
                        ? "mt-6 w-full bg-[#D62828] text-white hover:bg-[#B91C1C]"
                        : "mt-6 w-full border-[#0B1F3A] text-[#0B1F3A] hover:bg-[#0B1F3A] hover:text-white",
                    })}
                  >
                    {name === "Free Check" ? "Get started" : `Choose ${name}`}
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link href="/pricing" className="text-sm font-semibold text-[#D62828] hover:underline">
              See full feature comparison →
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-white px-6 py-20">
        <div className="mx-auto max-w-5xl rounded-3xl bg-[#0B1F3A] px-8 py-14 text-center text-white">
          <CheckCircle2 className="mx-auto mb-5 h-10 w-10 text-[#D62828]" />
          <h2 className="text-4xl font-bold tracking-tight">
            Your clearest path to Canadian PR starts here.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-300">
            See your estimated CRS score, strongest pathways, and exactly what
            you need to improve — before spending money on a consultant.
          </p>
          <Link
            href="/onboarding"
            className={buttonVariants({ className: "mt-8 bg-[#D62828] text-white hover:bg-[#B91C1C]" })}
          >
            Start Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white px-6 py-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div>
              <p className="text-sm font-bold text-[#0B1F3A]">Navly</p>
              <p className="mt-1 max-w-xs text-xs leading-5 text-slate-500">
                Educational immigration planning tool. Not a licensed immigration consultant or law firm.
              </p>
            </div>
            <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-slate-500">
              <Link href="/pricing" className="hover:text-[#0B1F3A]">Pricing</Link>
              <Link href="/privacy" className="hover:text-[#0B1F3A]">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-[#0B1F3A]">Terms of Service</Link>
              <a href="mailto:support@navly.ca" className="hover:text-[#0B1F3A]">Support</a>
            </nav>
          </div>
          <div className="mt-8 border-t border-slate-100 pt-6 text-center text-xs text-slate-400">
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
