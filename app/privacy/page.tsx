import Link from 'next/link'
import type { Metadata } from 'next'
import { NavlyLogo } from '@/components/ui/NavlyLogo'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Navly collects, uses, and protects your personal information.',
}

const LAST_UPDATED = 'May 4, 2026'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0B1F3A]">
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link href="/"><NavlyLogo size="sm" /></Link>
          <Link href="/terms" className="text-sm text-slate-500 hover:text-[#0B1F3A]">Terms of Service</Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-14">
        <p className="text-sm font-bold uppercase tracking-wide text-[#D62828]">Legal</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="mt-3 text-sm text-slate-500">Last updated: {LAST_UPDATED}</p>

        <div className="mt-10 flex flex-col gap-10 text-sm leading-7 text-slate-700">

          <section>
            <h2 className="text-lg font-bold text-[#0B1F3A]">1. Who we are</h2>
            <p className="mt-3">
              Navly (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) is an educational immigration planning tool
              based in Canada. We help users understand possible Canadian permanent residence pathways
              based on profile information they enter. Navly is not an immigration consultant, law firm,
              or government agency.
            </p>
            <p className="mt-3">
              This Privacy Policy explains what personal information we collect, why we collect it, how we
              use it, and your rights under Canada&rsquo;s <em>Personal Information Protection and Electronic
              Documents Act</em> (PIPEDA).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#0B1F3A]">2. What we collect</h2>
            <p className="mt-3">We only collect information you choose to enter. We collect two categories of data:</p>

            <h3 className="mt-5 font-semibold text-[#0B1F3A]">Profile data</h3>
            <p className="mt-2">
              Information you enter during onboarding or profile editing, used to calculate pathway estimates:
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              <li>Current immigration status and location</li>
              <li>Age, marital status, family details</li>
              <li>Country of citizenship and residence</li>
              <li>Language test type and scores</li>
              <li>Education level and credential status</li>
              <li>Work experience, occupation, and TEER level</li>
              <li>Settlement funds available</li>
              <li>Intended province</li>
              <li>Permit type and expiry date</li>
              <li>Previous refusals or status history (self-reported)</li>
            </ul>

            <h3 className="mt-5 font-semibold text-[#0B1F3A]">Presence tracking data</h3>
            <p className="mt-2">
              If you use the Canada days tracker: your arrival date, daily check-in confirmations,
              and any travel periods you log manually.
            </p>

            <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="font-semibold text-emerald-800">What we do not collect</p>
              <p className="mt-1 text-emerald-700">
                Navly does not ask for, accept, or store any official documents. We do not collect
                passport numbers, SIN numbers, birth certificates, immigration forms, bank statements,
                medical records, police certificates, or any government-issued identity documents.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#0B1F3A]">3. How we use your information</h2>
            <p className="mt-3">We use your profile data for the following purposes only:</p>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              <li>Calculate an estimated CRS score and FSW grid score</li>
              <li>Identify possible PR pathways based on your profile</li>
              <li>Show missing requirements and recommended next steps</li>
              <li>Personalize the AI assistant&rsquo;s responses to your situation</li>
              <li>Track your Canada presence days for personal planning</li>
              <li>Send permit expiry and draw alerts (if you opt in)</li>
              <li>Improve our scoring models and app features using anonymized, aggregated data</li>
            </ul>
            <p className="mt-4">
              We do not use your personal information to make legal decisions about you, submit applications
              on your behalf, or share your identifiable data with government agencies.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#0B1F3A]">4. How your data is stored</h2>
            <p className="mt-3">
              Currently, profile and presence data is stored in your browser&rsquo;s local storage. This means
              your data stays on your device and is not transmitted to our servers during the free tier.
            </p>
            <p className="mt-3">
              When you create an account (paid tiers), your profile data is stored on secure servers
              hosted in Canada or the United States with encryption at rest and in transit. We use
              industry-standard safeguards including TLS encryption and access controls.
            </p>
            <p className="mt-3">
              We retain account data for as long as your account is active. You may request deletion
              at any time (see section 7).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#0B1F3A]">5. Who we share data with</h2>
            <p className="mt-3">We do not sell your personal information. We may share data only as follows:</p>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              <li>
                <span className="font-semibold">Service providers:</span> Infrastructure, hosting, email,
                and payment processors who process data on our behalf under confidentiality agreements.
              </li>
              <li>
                <span className="font-semibold">Consultants:</span> If you click &ldquo;Book a consultation&rdquo;
                or share your prep summary, you are choosing to share that information directly with
                a third-party consultant. Navly is not responsible for how consultants handle that data.
              </li>
              <li>
                <span className="font-semibold">Legal requirement:</span> If required by Canadian law
                or a court order.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#0B1F3A]">6. Cookies and analytics</h2>
            <p className="mt-3">
              We may use cookies or similar technologies for session management and basic analytics
              (page views, feature usage). We do not use advertising trackers or sell data to ad networks.
              You can disable cookies in your browser settings, though some features may not function correctly.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#0B1F3A]">7. Your rights (PIPEDA)</h2>
            <p className="mt-3">Under PIPEDA you have the right to:</p>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              <li>Access the personal information we hold about you</li>
              <li>Correct inaccurate information</li>
              <li>Withdraw consent and request deletion of your data</li>
              <li>File a complaint with the Office of the Privacy Commissioner of Canada</li>
            </ul>
            <p className="mt-4">
              To exercise any of these rights, email us at{' '}
              <a href="mailto:privacy@navly.ca" className="font-semibold text-[#D62828] hover:underline">
                privacy@navly.ca
              </a>
              . We will respond within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#0B1F3A]">8. Children</h2>
            <p className="mt-3">
              Navly is not intended for users under 18 years of age. We do not knowingly collect
              personal information from minors. If you believe a minor has submitted information
              to us, please contact privacy@navly.ca.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#0B1F3A]">9. Changes to this policy</h2>
            <p className="mt-3">
              We may update this Privacy Policy from time to time. When we do, we will update the
              &ldquo;Last updated&rdquo; date at the top of this page and, for material changes, notify registered
              users by email. Continued use of Navly after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#0B1F3A]">10. Contact us</h2>
            <p className="mt-3">
              For privacy questions or concerns:
            </p>
            <p className="mt-2">
              <strong>Navly</strong><br />
              Email:{' '}
              <a href="mailto:privacy@navly.ca" className="text-[#D62828] hover:underline">
                privacy@navly.ca
              </a>
            </p>
          </section>

        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white px-6 py-8 text-center text-xs text-slate-400">
        <p>© {new Date().getFullYear()} Navly. All rights reserved.</p>
        <div className="mt-2 flex justify-center gap-4">
          <Link href="/privacy" className="hover:text-[#0B1F3A]">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-[#0B1F3A]">Terms of Service</Link>
          <Link href="/pricing" className="hover:text-[#0B1F3A]">Pricing</Link>
        </div>
      </footer>
    </div>
  )
}
