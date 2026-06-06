'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, ArrowRight, Zap, CalendarCheck, Loader2 } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { supabase } from '@/lib/supabase/client'

type ActivationState = 'verifying' | 'active' | 'timeout'

function SuccessContent() {
  const params = useSearchParams()
  const plan = params.get('plan')
  const isTracker = plan === 'tracker'

  const [activation, setActivation] = useState<ActivationState>('verifying')

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
        .eq('plan', plan ?? '')
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
  }, [plan])

  const features = isTracker
    ? ['Canada days tracker with streak', 'Permit expiry reminders', 'Express Entry draw alerts', 'Monthly CRS recalculation']
    : ['Full CRS and FSW score breakdown', 'Top 3 PR pathways ranked', 'Score improvement roadmap', 'Consultant-ready summary']

  return (
    <div className="mx-auto w-full max-w-lg px-6 py-16 text-center">
      <div className="mb-6 flex justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
      </div>

      <h1 className="text-3xl font-bold text-[#0B1F3A]">Payment successful!</h1>
      <p className="mt-3 text-slate-500">
        Your{' '}
        <span className="font-semibold text-[#0B1F3A]">
          {isTracker ? 'PR Tracker' : 'Personalized Report'}
        </span>{' '}
        is now active.
      </p>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 text-left">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#D62828] text-white">
            {isTracker ? <CalendarCheck className="h-5 w-5" /> : <Zap className="h-5 w-5" />}
          </div>
          <div>
            <p className="font-bold text-[#0B1F3A]">{isTracker ? 'PR Tracker' : 'Personalized Report'}</p>
            <p className="text-sm text-slate-500">{isTracker ? '$14.99 / month' : '$29 one-time'}</p>
          </div>
        </div>
        <ul className="mt-4 space-y-2 text-sm text-slate-600">
          {features.map((f) => (
            <li key={f} className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
              {f}
            </li>
          ))}
        </ul>
      </div>

      {/* Activation status */}
      <div className="mt-6">
        {activation === 'verifying' ? (
          <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Activating your plan…
          </div>
        ) : activation === 'active' ? (
          <Link
            href={isTracker ? '/dashboard/days' : '/dashboard/pr-tracker'}
            className={buttonVariants({ className: 'gap-2 bg-[#D62828] text-white hover:bg-[#B91C1C]' })}
          >
            {isTracker ? 'Go to days tracker' : 'View my PR score'}
            <ArrowRight className="h-4 w-4" />
          </Link>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-slate-500">
              Your plan is activating — it may take a moment to reflect in the dashboard.
            </p>
            <Link
              href="/dashboard"
              className={buttonVariants({ className: 'gap-2 bg-[#D62828] text-white hover:bg-[#B91C1C]' })}
            >
              Go to my dashboard <ArrowRight className="h-4 w-4" />
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
