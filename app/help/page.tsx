import Link from 'next/link'
import type { Metadata } from 'next'
import { NavlyLogo } from '@/components/ui/NavlyLogo'
import { MessageCircle, MapPin, Calendar, BarChart2, Users, ShieldCheck } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Help Center — Navly',
  description: 'Answers to common questions about using Navly.',
}

const FAQS = [
  {
    q: 'What is Navly?',
    a: 'Navly is a Canadian PR pathway planning tool. It helps you understand which immigration pathways may be possible based on the information you enter — like your language scores, work experience, and education. Navly is not an immigration consultant and does not provide legal advice.',
  },
  {
    q: 'Is Navly a licensed immigration consultant?',
    a: 'No. Navly is a planning and data tool only. We help you organize your profile, estimate eligibility, and track important dates. For legal advice or application review, you should contact a Regulated Canadian Immigration Consultant (RCIC) or immigration lawyer.',
  },
  {
    q: 'What data does Navly collect?',
    a: 'Navly only collects profile information you enter — like your age, language test scores, work history, and education. We do not ask you to upload passports, birth certificates, bank statements, or any official documents.',
  },
  {
    q: 'How is my CRS score estimated?',
    a: 'Navly calculates an estimated CRS score based on the profile data you enter. This is an estimate only — your official score is assigned by IRCC when you create an Express Entry profile. Small differences in how data is entered may affect the estimate.',
  },
  {
    q: 'Do job offers still add CRS points?',
    a: 'No. As of March 25, 2025, job offers no longer add points to your Express Entry CRS score. A job offer may still strengthen your eligibility for certain Provincial Nominee Program (PNP) streams.',
  },
  {
    q: 'How does the Canada Days tracker work?',
    a: 'You enter your arrival date and confirm your presence in Canada daily. The tracker counts your confirmed days and helps you plan toward residency obligation (730 days in 5 years for PRs) or citizenship (1,095 days in 5 years). This tracker is for personal planning only — official calculations are determined by IRCC.',
  },
  {
    q: 'Does work done while studying full-time count for CEC?',
    a: 'No. Work performed while you were a full-time student does not count toward the Canadian Experience Class (CEC) skilled work requirement. Only paid, skilled work after graduation on a PGWP (or other qualifying permit) may count.',
  },
  {
    q: 'How do I update my profile?',
    a: 'Go to My Profile from the bottom navigation or the menu. You can update your language scores, work details, education, and more at any time. Your pathway estimates will update automatically.',
  },
  {
    q: 'Can I use Navly if I am outside Canada?',
    a: 'Yes. Navly supports users who are outside Canada and planning to immigrate, as well as users already in Canada on a study permit, work permit, or as a permanent resident.',
  },
  {
    q: 'How do I contact support?',
    a: 'Email us at support@navly.ca. We aim to respond within 2 business days.',
  },
]

const FEATURES = [
  { icon: BarChart2, title: 'CRS & Score Tracker', desc: 'Estimate your Express Entry CRS score and see what improves it.' },
  { icon: MapPin, title: 'Pathway Matching', desc: 'See which PR pathways fit your profile and what is missing.' },
  { icon: Calendar, title: 'Canada Days Counter', desc: 'Track physical presence for PR obligation and citizenship.' },
  { icon: MessageCircle, title: 'AI Assistant', desc: 'Ask general immigration questions in plain language.' },
  { icon: Users, title: 'Consultant Connect', desc: 'Find certified Canadian immigration consultants.' },
  { icon: ShieldCheck, title: 'Missing Requirements', desc: 'See exactly what you need to strengthen a pathway.' },
]

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-surface text-heading">
      <header className="border-b border-subtle bg-surface-card px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link href="/" className="pt-1">
            <NavlyLogo size="sm" />
          </Link>
          <Link href="/dashboard" className="text-sm pt-3 text-muted-text hover:text-heading">Back to app</Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-6">
        <p className="text-sm font-bold uppercase tracking-wide text-navly-red">Support</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight">Help Center</h1>
        <p className="mt-3 text-muted-text text-sm leading-6">
          Quick answers about how Navly works. For legal immigration advice, contact a certified consultant.
        </p>

        {/* Feature overview */}
        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl border border-subtle bg-surface-card p-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-navly-navy/5">
                <Icon className="h-4 w-4 text-heading" />
              </div>
              <p className="mt-3 text-sm font-bold">{title}</p>
              <p className="mt-1 text-xs leading-5 text-muted-text">{desc}</p>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <h2 className="mt-14 text-xl font-bold">Frequently asked questions</h2>
        <div className="mt-4 flex flex-col gap-2">
          {FAQS.map(({ q, a }) => (
            <details
              key={q}
              className="group rounded-2xl border border-subtle bg-surface-card px-5 py-4 open:pb-5"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-heading marker:hidden">
                {q}
                <span className="shrink-0 text-muted-text/70 transition group-open:rotate-180">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </summary>
              <p className="mt-3 text-sm leading-7 text-muted-text">{a}</p>
            </details>
          ))}
        </div>

        {/* Disclaimer */}
        <div className="mt-10 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-7 text-amber-900">
          <p className="font-bold">Navly is not legal advice</p>
          <p className="mt-1">
            Navly is an educational planning tool. Nothing in this app should be treated as a substitute
            for advice from a licensed Regulated Canadian Immigration Consultant (RCIC) or immigration lawyer.
          </p>
        </div>

        {/* Contact */}
        <div className="mt-10 rounded-2xl border border-subtle bg-surface-card p-6 text-center">
          <p className="font-bold">Still have a question?</p>
          <p className="mt-1 text-sm text-muted-text">Our team typically responds within 2 business days.</p>
          <a
            href="mailto:support@navly.ca"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-navly-navy px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-navly-navy/90"
          >
            <MessageCircle className="h-4 w-4" />
            Email support@navly.ca
          </a>
        </div>
      </main>
    </div>
  )
}
