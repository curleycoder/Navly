'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, ArrowRight, Zap, CalendarCheck } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'

function SuccessContent() {
  const params = useSearchParams()
  const plan = params.get('plan')
  const isTracker = plan === 'tracker'

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
            <p className="text-sm text-slate-500">{isTracker ? '$14 / month' : '$29 one-time'}</p>
          </div>
        </div>
        <ul className="mt-4 space-y-2 text-sm text-slate-600">
          {isTracker ? (
            <>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" /> Canada days tracker with streak</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" /> Permit expiry reminders</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" /> Express Entry draw alerts</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" /> Monthly CRS recalculation</li>
            </>
          ) : (
            <>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" /> Full CRS and FSW score breakdown</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" /> Top 3 PR pathways ranked</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" /> Score improvement roadmap</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" /> Consultant-ready summary</li>
            </>
          )}
        </ul>
      </div>

      <Link
        href="/dashboard"
        className={buttonVariants({ className: 'mt-8 gap-2 bg-[#D62828] text-white hover:bg-[#B91C1C]' })}
      >
        Go to my dashboard <ArrowRight className="h-4 w-4" />
      </Link>
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
