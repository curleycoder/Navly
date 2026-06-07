import Link from 'next/link'
import type { Metadata } from 'next'
import { NavlyLogo } from '@/components/ui/NavlyLogo'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms and conditions for using Navly.',
}

const LAST_UPDATED = 'May 4, 2026'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0B1F3A]">
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link href="/" className="pt-1">
            <NavlyLogo size="sm" />
          </Link>
          <Link href="/dashboard" className="text-sm pt-3 text-slate-600 hover:text-[#0B1F3A]">Back to app</Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-6">
        <p className="text-sm font-bold uppercase tracking-wide text-[#D62828]">Legal</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight">Terms of Service</h1>
        <p className="mt-3 text-sm text-slate-500">Last updated: {LAST_UPDATED}</p>

        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-7 text-amber-900">
          <p className="font-bold">Important — please read before using Navly</p>
          <p className="mt-1">
            Navly is an educational planning tool. It does not provide legal advice, immigration
            consulting, or legal representation. Nothing on this platform should be treated as a
            substitute for advice from a licensed Regulated Canadian Immigration Consultant (RCIC)
            or immigration lawyer.
          </p>
        </div>

        <div className="mt-10 flex flex-col gap-10 text-sm leading-7 text-slate-700">

          <section>
            <h2 className="text-lg font-bold text-[#0B1F3A]">1. Acceptance of terms</h2>
            <p className="mt-3">
              By accessing or using Navly (&ldquo;the Service&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;),
              you agree to be bound by these Terms of Service and our{' '}
              <Link href="/privacy" className="font-semibold text-[#D62828] hover:underline">Privacy Policy</Link>.
              If you do not agree, do not use Navly.
            </p>
            <p className="mt-3">
              We may update these terms from time to time. Continued use of the Service after changes
              are posted constitutes acceptance of the updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#0B1F3A]">2. What Navly is — and is not</h2>

            <h3 className="mt-4 font-semibold text-[#0B1F3A]">Navly is</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>An educational tool to help you understand possible Canadian immigration pathways</li>
              <li>A calculator for estimated CRS scores, FSW grid scores, and CLB equivalencies</li>
              <li>A personal tracker for Canada presence days and permit expiry dates</li>
              <li>A directory to help you find certified immigration consultants</li>
            </ul>

            <h3 className="mt-4 font-semibold text-[#0B1F3A]">Navly is not</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>A Regulated Canadian Immigration Consultant (RCIC) or law firm</li>
              <li>A government agency or affiliated with IRCC</li>
              <li>A provider of legal advice, immigration opinions, or application preparation</li>
              <li>A guarantor of any immigration outcome</li>
            </ul>

            <p className="mt-4">
              All estimates, scores, and pathway assessments shown by Navly are based solely on the
              information you enter and general publicly available eligibility criteria. They are
              provided for educational purposes only and may not reflect current government policy,
              draw cutoffs, or your actual eligibility. Immigration rules change frequently — always
              verify with IRCC or a licensed professional before making decisions.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#0B1F3A]">3. Not legal advice</h2>
            <p className="mt-3">
              Nothing on Navly — including scores, pathway assessments, task lists, AI assistant
              responses, or consultant listings — constitutes legal advice. No attorney-client or
              consultant-client relationship is created by using Navly.
            </p>
            <p className="mt-3">
              Navly&rsquo;s AI assistant provides general educational information about Canadian immigration
              processes and terminology. It may make errors, become outdated, or misinterpret your
              situation. Do not rely on AI responses as the basis for submitting any immigration
              application or making legal decisions.
            </p>
            <p className="mt-3">
              For advice specific to your situation, consult a licensed RCIC registered with the
              College of Immigration and Citizenship Consultants (CICC), or a Canadian immigration lawyer.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#0B1F3A]">4. Your account and responsibilities</h2>
            <p className="mt-3">When you create an account or use Navly, you agree to:</p>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              <li>Provide accurate information to the best of your ability</li>
              <li>Not create duplicate accounts or impersonate another person</li>
              <li>Keep your login credentials confidential</li>
              <li>Not use Navly for any unlawful purpose</li>
              <li>Not attempt to reverse-engineer, scrape, or interfere with the Service</li>
            </ul>
            <p className="mt-4">
              You are responsible for the accuracy of information you enter. Navly&rsquo;s estimates are
              only as accurate as the data you provide. Inaccurate inputs will produce inaccurate results.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#0B1F3A]">5. Consultant listings</h2>
            <p className="mt-3">
              Consultants listed on Navly are independent professionals. They are not employees,
              agents, or partners of Navly. Navly does not endorse any individual consultant or
              guarantee the quality, accuracy, or outcome of their services.
            </p>
            <p className="mt-3">
              Navly verifies consultant certification status where possible, but you should independently
              confirm that any consultant you engage is in good standing with the CICC (for RCICs) or
              the relevant law society (for lawyers) before retaining their services.
            </p>
            <p className="mt-3">
              Any engagement between you and a consultant is a direct relationship between you and
              that professional. Navly is not a party to that relationship and is not liable for the
              services provided.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#0B1F3A]">6. Payment and refunds</h2>
            <p className="mt-3">
              Paid features (Personalized Report and PR Tracker) are charged as described on the{' '}
              <Link href="/pricing" className="font-semibold text-[#D62828] hover:underline">pricing page</Link>.
              All prices are in Canadian dollars (CAD) and include applicable taxes.
            </p>
            <p className="mt-3">
              The Personalized Report is a one-time purchase. The PR Tracker is a recurring monthly
              subscription that you may cancel at any time. Cancellation takes effect at the end of
              the current billing period — no partial refunds are issued for unused time.
            </p>
            <p className="mt-3">
              If you are not satisfied with a one-time Report purchase, contact us at{' '}
              <a href="mailto:support@navly.ca" className="font-semibold text-[#D62828] hover:underline">
                support@navly.ca
              </a>{' '}
              within 7 days and we will review your request.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#0B1F3A]">7. Limitation of liability</h2>
            <p className="mt-3">
              To the maximum extent permitted by applicable law, Navly and its owners, employees,
              and contractors are not liable for:
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              <li>Any immigration application refusal, delay, or adverse outcome</li>
              <li>Errors or inaccuracies in CRS scores, pathway assessments, or AI responses</li>
              <li>Loss of data stored in your browser due to clearing cache or device changes</li>
              <li>Actions or advice provided by independent consultants listed on Navly</li>
              <li>Any indirect, consequential, or special damages arising from use of the Service</li>
            </ul>
            <p className="mt-4">
              Navly is provided &ldquo;as is&rdquo; without warranty of any kind. We do not warrant that scores
              or pathway assessments are accurate, complete, or current.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#0B1F3A]">8. Intellectual property</h2>
            <p className="mt-3">
              All content, design, code, and scoring logic on Navly is owned by Navly and protected
              by copyright. You may not reproduce, distribute, or create derivative works without
              written permission, except as permitted by Canadian copyright law.
            </p>
            <p className="mt-3">
              Your profile data remains yours. By using Navly, you grant us a limited licence to
              process that data to provide the Service, as described in our Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#0B1F3A]">9. Governing law</h2>
            <p className="mt-3">
              These Terms are governed by the laws of Canada and the Province of Ontario, without
              regard to conflict of law provisions. Any disputes arising from these Terms or use of
              Navly will be resolved in the courts of Ontario, Canada.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#0B1F3A]">10. Contact us</h2>
            <p className="mt-3">Questions about these Terms?</p>
            <p className="mt-2">
              <strong>Navly</strong><br />
              Email:{' '}
              <a href="mailto:legal@navly.ca" className="text-[#D62828] hover:underline">
                legal@navly.ca
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
