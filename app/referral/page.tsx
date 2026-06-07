'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { NavlyLogo } from '@/components/ui/NavlyLogo'
import { Gift, Copy, Check, Users } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

export default function ReferralPage() {
  const [referralCode, setReferralCode] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        const code = 'NAVLY-' + data.user.id.slice(0, 8).toUpperCase()
        setReferralCode(code)
      }
    })
  }, [])

  const referralLink = referralCode
    ? `${typeof window !== 'undefined' ? window.location.origin : 'https://navly.ca'}/signup?ref=${referralCode}`
    : null

  function handleCopy() {
    if (!referralLink) return
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  return (
    <div className="min-h-screen bg-surface text-heading">
      <header className="border-b border-subtle bg-surface-card px-6 py-4">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <Link href="/" className="pt-1"><NavlyLogo size="sm" /></Link>
          <Link href="/dashboard" className="text-sm pt-3 text-muted-text hover:text-heading">Back to app</Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-14">
        {/* Hero */}
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-navly-navy">
            <Gift className="h-6 w-6 text-white" />
          </div>
          <p className="mt-5 text-sm font-bold uppercase tracking-wide text-navly-red">Refer a Friend</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Share Navly, get rewarded</h1>
          <p className="mt-2 text-muted-text text-sm">Share your link. They sign up. You earn.</p>
        </div>

        {/* Referral link */}
        <div className="mt-10 rounded-2xl border border-subtle bg-surface-card p-6">
          <p className="text-sm font-semibold text-muted-text">Your referral link</p>
          {referralLink ? (
            <div className="mt-3 flex items-center gap-2 rounded-xl border border-subtle bg-surface-alt p-3">
              <span className="flex-1 truncate text-sm text-muted-text font-mono">{referralLink}</span>
              <button
                onClick={handleCopy}
                className="flex shrink-0 items-center gap-1.5 rounded-lg bg-navly-navy px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-navly-navy/90 active:scale-95"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          ) : (
            <div className="mt-3 rounded-xl border border-subtle bg-surface-alt p-3">
              <div className="h-5 w-64 animate-pulse rounded bg-subtle" />
            </div>
          )}
          {referralCode && (
            <p className="mt-2 text-xs text-muted-text/70">
              Code: <span className="font-mono font-semibold text-muted-text">{referralCode}</span>
            </p>
          )}
        </div>

        {/* Milestone reward */}
        <div className="mt-4 rounded-2xl border border-subtle bg-surface-card p-6">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-text/70">Milestone Reward</p>
          <div className="mt-4 flex items-center gap-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-navly-navy/5">
              <Users className="h-5 w-5 text-heading" />
            </div>
            <div>
              <p className="text-sm font-bold">Refer 3 active users</p>
              <p className="text-sm text-muted-text">1 month free</p>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted-text/70">
          Credits are non-transferable and cannot be redeemed for cash.
        </p>
      </main>
    </div>
  )
}
