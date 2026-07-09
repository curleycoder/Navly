'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, ArrowRight, CalendarCheck, Loader2 } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { supabase } from '@/lib/supabase/client'

type ActivationState = 'verifying' | 'active' | 'timeout'

function SuccessContent() {
  const params = useSearchParams()
  const plan = params.get('plan')
  const billing = params.get('billing')
  const priceLabel = billing === 'annual' ? '$119.99 / year' : '$14.99 / month'

  const [activation, setActivation] = useState<ActivationState>('verifying')
  const isTracker = plan !== 'report'

  useEffect(() => {
    let attempts = 0
    const maxAttempts = 12   // 12 × 1.5 s ≈ 18 s total
    const interval = 1500    // ms

    async function check() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setActivation('timeout'); return }

      const { data } = await supabase
        .from('subscriptions')
        .select('plan')
        .eq('user_id', user.id)
        .eq('plan', isTracker ? 'tracker' : 'report')
        .eq('status', 'active')
        .maybeSingle()

      if (data) {
        setActivation('active')
      } else {
        attempts++
        if (attempts >= maxAttempts) {
          setActivation('timeout')
        } else {
          setTimeout(check, interval)
        }
      }
    }

    check()
  }, [plan, isTracker])

  const trackerFeatures = [
    'Full CRS + FSW score breakdown',
    'Top 3 PR pathways ranked for your profile',
    'Score improvement roadmap',
    'Province-by-province PNP match',
    'Consultant-ready PDF summary',
    'Canada physical presence days tracker',
    'Permit expiry reminders',
    'Express Entry draw alerts',
    'Monthly CRS recalculation',
    'AI immigration assistant',
  ]

  const reportFeatures = [
    'Full CRS + FSW score breakdown',
    'Top 3 PR pathways ranked',
    'Gap analysis with risk flags',
    'Province-by-province PNP match',
    'Timeline estimate to eligibility',
    'Best next actions — personalized',
    'Downloadable PDF (consultant-ready)',
  ]

  const features = isTracker ? trackerFeatures : reportFeatures

  return (
    <div className="mx-auto w-full max-w-lg px-6 py-16 text-center">
      <div className="mb-6 flex justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
      </div>

      <h1 className="t-page-title">Payment successful!</h1>
      <p className="mt-3 text-muted-text">
        Your{' '}
        <span className="font-semibold text-heading">
          {isTracker ? 'PR Tracker' : 'Readiness Report'}
        </span>{' '}
        {isTracker ? 'is now active.' : 'is being prepared.'}
      </p>

      <div className="mt-8 rounded-2xl border border-subtle bg-surface-card p-6 text-left">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navly-red text-white">
            <CalendarCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="font-bold text-heading">{isTracker ? 'PR Tracker' : 'Readiness Report'}</p>
            <p className="text-sm text-muted-text">{isTracker ? priceLabel : '$69.99 one-time'}</p>
          </div>
        </div>
        <ul className="mt-4 space-y-2 text-sm text-muted-text">
          {features.map((f) => (
            <li key={f} className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
              {f}
            </li>
          ))}
        </ul>
      </div>

      {/* Activation status — only relevant for tracker (subscription) */}
      <div className="mt-6">
        {isTracker ? (
          activation === 'verifying' ? (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-text">
              <Loader2 className="h-4 w-4 animate-spin" />
              Activating your plan…
            </div>
          ) : activation === 'active' ? (
            <Link
              href="/dashboard/pr-tracker"
              className={buttonVariants({ className: 'gap-2 bg-navly-red text-white hover:bg-navly-red/80' })}
            >
              Go to PR Tracker
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-text">
                Your plan is activating — it may take a moment to reflect in the dashboard.
              </p>
              <Link
                href="/dashboard"
                className={buttonVariants({ className: 'gap-2 bg-navly-red text-white hover:bg-navly-red/80' })}
              >
                Go to my dashboard <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )
        ) : activation === 'verifying' ? (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-text">
            <Loader2 className="h-4 w-4 animate-spin" />
            Activating your report…
          </div>
        ) : activation === 'active' ? (
          <Link
            href="/dashboard/report"
            className={buttonVariants({ className: 'gap-2 bg-navly-red text-white hover:bg-navly-red/80' })}
          >
            View my report
            <ArrowRight className="h-4 w-4" />
          </Link>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-text">
              Your report is activating — it may take a moment. Head to your dashboard and open the Report tab.
            </p>
            <Link
              href="/dashboard/report"
              className={buttonVariants({ className: 'gap-2 bg-navly-red text-white hover:bg-navly-red/80' })}
            >
              Go to my report <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  )
}
