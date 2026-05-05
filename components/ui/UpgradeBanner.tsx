'use client'

import { useState } from 'react'
import { ArrowRight, Zap, CalendarCheck, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type Plan = 'report' | 'tracker'

const config: Record<Plan, {
  icon: React.ElementType
  plan: string
  price: string
  teaser: string
  features: string[]
  cta: string
}> = {
  report: {
    icon: Zap,
    plan: 'Personalized Report',
    price: '$29 one-time',
    teaser: 'Unlock your full picture',
    features: ['Detailed readiness report PDF', 'Top 3 PR pathways with score breakdown', 'Score improvement roadmap', 'Consultant-ready summary'],
    cta: 'Get my report',
  },
  tracker: {
    icon: CalendarCheck,
    plan: 'PR Tracker',
    price: '$14 / month',
    teaser: 'Stay on track every month',
    features: ['Canada days tracker with streak', 'Permit expiry reminders', 'Express Entry draw alerts', 'Monthly CRS recalculation'],
    cta: 'Start tracking',
  },
}

export function UpgradeBanner({ plan, className }: { plan: Plan; className?: string }) {
  const c = config[plan]
  const Icon = c.icon
  const [loading, setLoading] = useState(false)

  async function startCheckout() {
    setLoading(true)
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan }),
    })
    const { url, error } = await res.json()
    if (url) {
      window.location.href = url
    } else {
      console.error('Checkout error:', error)
      setLoading(false)
    }
  }

  return (
    <div className={cn(
      'rounded-2xl border border-[#D62828]/20 bg-linear-to-br from-[#0B1F3A]/3 to-[#D62828]/5 p-5',
      className
    )}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#D62828] text-white">
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-bold text-[#0B1F3A]">{c.teaser}</p>
              <span className="rounded-full bg-[#0B1F3A] px-2.5 py-0.5 text-xs font-semibold text-white">
                {c.plan} · {c.price}
              </span>
            </div>
            <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
              {c.features.map((f) => (
                <li key={f} className="flex items-center gap-1 text-xs text-slate-600">
                  <span className="h-1 w-1 shrink-0 rounded-full bg-[#D62828]" aria-hidden="true" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <button
          onClick={startCheckout}
          disabled={loading}
          className="flex shrink-0 items-center gap-1.5 rounded-xl bg-[#D62828] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#B91C1C] disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
          {loading ? 'Redirecting…' : c.cta}
          {!loading && <ArrowRight className="h-3.5 w-3.5" />}
        </button>
      </div>
    </div>
  )
}
