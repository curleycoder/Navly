import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  MessageSquare,
  ShieldCheck,
  ListChecks,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { NavlyLogo } from "@/components/ui/NavlyLogo";

const features = [
  {
    title: "Smart intake",
    desc: "Collect immigration profile details in a clear step-by-step flow.",
    icon: FileText,
  },
  {
    title: "Document checklist",
    desc: "Track missing, ready, and expiring documents before a consultation.",
    icon: ListChecks,
  },
  {
    title: "AI assistant",
    desc: "Answer repeated questions in simple language with safe legal reminders.",
    icon: MessageSquare,
  },
  {
    title: "Consultation prep",
    desc: "Create a clean summary before speaking with a licensed professional.",
    icon: ShieldCheck,
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
            <Button
              variant="ghost"
              className="text-[#0B1F3A] hover:bg-slate-100 hover:text-[#0B1F3A]"
            >
              Log in
            </Button>
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

        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:py-28">
          <div className="relative z-10">
            <div className="mb-6 inline-flex rounded-full border border-[#D62828]/20 bg-[#D62828]/5 px-4 py-2 text-sm font-semibold text-[#D62828] shadow-sm">
              Educational immigration guidance — not legal advice
            </div>

            <h1 className="max-w-3xl text-5xl font-bold tracking-tight text-[#0B1F3A] md:text-7xl">
              Immigration intake made clearer.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              Navly helps users organize their immigration profile, documents,
              tasks, and consultation questions before speaking with a licensed
              professional.
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
                  <p className="text-sm text-slate-500">Documents</p>
                  <div className="mt-3 h-2 rounded-full bg-slate-100">
                    <div className="h-2 w-2/3 rounded-full bg-[#D62828]" />
                  </div>
                  <p className="mt-2 text-sm text-slate-600">8 of 12 ready</p>
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
              "Create your immigration profile",
              "Organize documents and tasks",
              "Prepare a consultation summary",
            ].map((step, index) => (
              <div
                key={step}
                className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"
              >
                <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-full bg-[#D62828] text-sm font-bold text-white">
                  {index + 1}
                </div>
                <h3 className="text-xl font-bold text-[#0B1F3A]">{step}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Keep the process simple and organized so nothing important
                  gets missed.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

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
            Start small. Upgrade when it saves time.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-600">
            First version should prove value before adding complex payments or
            advanced automation.
          </p>

          <div className="mx-auto mt-10 grid max-w-4xl gap-6 md:grid-cols-3">
            {[
              ["Free", "$0", "Basic intake and checklist"],
              ["Starter", "$49/mo", "For solo consultants"],
              ["Pro", "$149/mo", "For busy consultants"],
            ].map(([name, price, desc]) => (
              <Card
                key={name}
                className={`rounded-2xl bg-white ${
                  name === "Starter"
                    ? "border-[#D62828] shadow-xl shadow-red-100"
                    : "border-slate-200"
                }`}
              >
                <CardContent className="p-6">
                  {name === "Starter" && (
                    <div className="mb-4 rounded-full bg-[#D62828]/10 px-3 py-1 text-xs font-bold text-[#D62828]">
                      Best first plan
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-[#0B1F3A]">{name}</h3>
                  <p className="mt-4 text-3xl font-bold text-[#0B1F3A]">
                    {price}
                  </p>
                  <p className="mt-3 text-sm text-slate-600">{desc}</p>
                  <Link
                    href="/onboarding"
                    className={buttonVariants({
                      variant: name === "Starter" ? "default" : "outline",
                      className: name === "Starter"
                        ? "mt-6 w-full bg-[#D62828] text-white hover:bg-[#B91C1C]"
                        : "mt-6 w-full border-[#0B1F3A] text-[#0B1F3A] hover:bg-[#0B1F3A] hover:text-white",
                    })}
                  >
                    Choose {name}
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-white px-6 py-20">
        <div className="mx-auto max-w-5xl rounded-3xl bg-[#0B1F3A] px-8 py-14 text-center text-white">
          <CheckCircle2 className="mx-auto mb-5 h-10 w-10 text-[#D62828]" />
          <h2 className="text-4xl font-bold tracking-tight">
            Build the first version. Test with real users.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-300">
            Navly should start as a focused intake, checklist, and consultation
            prep tool. That is enough to test demand.
          </p>
          <Link
            href="/onboarding"
            className={buttonVariants({ className: "mt-8 bg-[#D62828] text-white hover:bg-[#B91C1C]" })}
          >
            Start Free
          </Link>
        </div>
      </section>
    </main>
  );
}