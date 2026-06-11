'use client'

import { useState } from 'react'
import { ArrowRight, CalendarCheck, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type Billing = 'monthly' | 'annual'

export function UpgradeBanner({ className }: { className?: string }) {
  const [billing, setBilling] = useState<Billing>('annual')
  const [loading, setLoading] = useState(false)

  async function startCheckout() {
    setLoading(true)
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: 'tracker', billing }),
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
      'rounded-2xl border border-navly-red/20 bg-linear-to-br from-navly-navy/3 to-navly-red/5 p-5',
      className
    )}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-navly-red text-white">
            <CalendarCheck className="h-4 w-4" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-bold text-heading">We watch your immigration journey so you don't miss anything</p>
            </div>
            <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
              {[
                'Full CRS + FSW breakdown',
                'Top 3 PR pathways ranked',
                'Score improvement roadmap',
                'PNP province match',
                'Consultant-ready PDF',
                'Canada days tracker',
                'Permit expiry reminders',
                'Express Entry draw alerts',
                'AI immigration assistant',
              ].map((f) => (
                <li key={f} className="flex items-center gap-1 text-xs text-muted-text">
                  <span className="h-1 w-1 shrink-0 rounded-full bg-navly-red" aria-hidden="true" />
                  {f}
                </li>
              ))}
            </ul>

            {/* Inline billing toggle */}
            <div className="mt-3 flex items-center gap-2">
              <div className="flex rounded-lg border border-subtle bg-surface-alt p-0.5 text-xs font-semibold">
                <button
                  onClick={() => setBilling('monthly')}
                  className={cn(
                    'rounded-md px-2.5 py-1 transition-colors',
                    billing === 'monthly' ? 'bg-surface-card text-heading shadow-sm' : 'text-muted-text'
                  )}
                >
                  $14.99/mo
                </button>
                <button
                  onClick={() => setBilling('annual')}
                  className={cn(
                    'flex items-center gap-1 rounded-md px-2.5 py-1 transition-colors',
                    billing === 'annual' ? 'bg-surface-card text-heading shadow-sm' : 'text-muted-text'
                  )}
                >
                  $9.99/mo annual
                  <span className="rounded-full bg-navly-red/10 px-1 text-[10px] font-bold text-navly-red">−33%</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        <button
          onClick={startCheckout}
          disabled={loading}
          className="flex shrink-0 items-center gap-1.5 rounded-xl bg-navly-red px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-navly-red/80 disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
          {loading ? 'Redirecting…' : 'Start free trial'}
          {!loading && <ArrowRight className="h-3.5 w-3.5" />}
        </button>
      </div>
      <p className="mt-3 text-xs text-muted-text/70">
        7-day free trial · no credit card required · cancel anytime
        {billing === 'annual' && ' · billed $119.99/year'}
      </p>
    </div>
  )
}
