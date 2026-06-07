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
    <div className="min-h-screen bg-[#F8FAFC] text-[#0B1F3A]">
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <Link href="/" className="pt-1"><NavlyLogo size="sm" /></Link>
          <Link href="/dashboard" className="text-sm pt-3 text-slate-600 hover:text-[#0B1F3A]">Back to app</Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-14">
        {/* Hero */}
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0B1F3A]">
            <Gift className="h-6 w-6 text-white" />
          </div>
          <p className="mt-5 text-sm font-bold uppercase tracking-wide text-[#D62828]">Refer a Friend</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Share Navly, get rewarded</h1>
          <p className="mt-2 text-slate-500 text-sm">Share your link. They sign up. You earn.</p>
        </div>

        {/* Referral link */}
        <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-sm font-semibold text-slate-700">Your referral link</p>
          {referralLink ? (
            <div className="mt-3 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <span className="flex-1 truncate text-sm text-slate-600 font-mono">{referralLink}</span>
              <button
                onClick={handleCopy}
                className="flex shrink-0 items-center gap-1.5 rounded-lg bg-[#0B1F3A] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#0B1F3A]/90 active:scale-95"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          ) : (
            <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="h-5 w-64 animate-pulse rounded bg-slate-200" />
            </div>
          )}
          {referralCode && (
            <p className="mt-2 text-xs text-slate-400">
              Code: <span className="font-mono font-semibold text-slate-600">{referralCode}</span>
            </p>
          )}
        </div>

        {/* Milestone reward */}
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Milestone Reward</p>
          <div className="mt-4 flex items-center gap-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#0B1F3A]/5">
              <Users className="h-5 w-5 text-[#0B1F3A]" />
            </div>
            <div>
              <p className="text-sm font-bold">Refer 3 active users</p>
              <p className="text-sm text-slate-500">1 month free</p>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Credits are non-transferable and cannot be redeemed for cash.
        </p>
      </main>
    </div>
  )
}
