'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, CheckCircle2, Eye, EyeOff, AlertTriangle, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type SignUpPhase = 'phone' | 'otp' | 'details'

export function StepSignUp({ onComplete }: { onComplete: (phone: string) => void }) {
  const [phase, setPhase] = useState<SignUpPhase>('phone')
const router = useRouter()
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [consent, setConsent] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  async function handleSendOtp() {
    setLoading(true)
    setError('')
    const trimmedPhone = phone.trim()
    if (!trimmedPhone) { setError('Enter your phone number.'); setLoading(false); return }

    const res = await fetch('/api/auth/check-phone', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: trimmedPhone }),
    })
    const { taken } = await res.json()
    if (taken) {
      router.push(`/login?phone=${encodeURIComponent(trimmedPhone)}`)
    return

    }
    const { error: otpError } = await supabase.auth.signInWithOtp({ phone: trimmedPhone })
    if (otpError) { setError(otpError.message); setLoading(false); return }

    setPhase('otp')
    setLoading(false)
  }

  async function handleVerifyOtp() {
    setLoading(true)
    setError('')
    const { error: verifyError } = await supabase.auth.verifyOtp({ phone: phone.trim(), token: otp.trim(), type: 'sms' })
    if (verifyError) { setError('Incorrect code. Check your SMS and try again.'); setLoading(false); return }
    setPhase('details')
    setLoading(false)
  }

  async function handleForgotPassword() {
    if (!email) { setError('Enter your email address first.'); return }
    await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/dashboard` })
    setResetSent(true)
    setError('')
  }

  async function handleCompleteSignUp() {
    setLoading(true)
    setError('')
    const { error: updateError } = await supabase.auth.updateUser(
      { email, password, data: { phone: phone.trim() } },
      { emailRedirectTo: `${window.location.origin}/dashboard` }
    )
    if (updateError) {
      setError(
        updateError.message.toLowerCase().includes('already registered') || updateError.message.toLowerCase().includes('already been registered')
          ? 'An account with this email already exists. Please log in instead.'
          : updateError.message
      )
      setLoading(false)
      return
    }
    setDone(true)
    setLoading(false)
  }

  function ErrorBanner({ msg }: { msg: string }) {
    return (
      <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
        <p className="text-sm text-red-700">
          {msg}{' '}
          {msg.includes('already exists') && <Link href="/login" className="font-semibold underline">Log in →</Link>}
        </p>
      </div>
    )
  }

  if (done) {
    const emailDomain = email.split('@')[1]?.toLowerCase() ?? ''
    const emailLinks = [
      { label: 'Open Gmail', href: 'https://mail.google.com', match: ['gmail.com'] },
      { label: 'Open Outlook', href: 'https://outlook.live.com', match: ['outlook.com', 'hotmail.com', 'live.com', 'msn.com'] },
      { label: 'Open Yahoo Mail', href: 'https://mail.yahoo.com', match: ['yahoo.com', 'yahoo.ca'] },
      { label: 'Open iCloud Mail', href: 'https://www.icloud.com/mail', match: ['icloud.com', 'me.com', 'mac.com'] },
    ]
    const matchedLink = emailLinks.find(l => l.match.some(d => emailDomain.endsWith(d)))
    return (
      <div>
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100">
          <CheckCircle2 className="h-6 w-6 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-[#0B1F3A]">Verify your email</h1>
        <p className="mt-2 text-slate-500">
          We sent a confirmation link to <span className="font-semibold text-[#0B1F3A]">{email}</span>. Open your email and click the link to activate your account.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          {matchedLink && (
            <a href={matchedLink.href} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl bg-[#D62828] px-4 py-3 text-sm font-semibold text-white hover:bg-[#B91C1C]">
              {matchedLink.label} <ArrowRight className="h-4 w-4" />
            </a>
          )}
          <a href={`https://${emailDomain}`} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[#0B1F3A] hover:bg-slate-50">
            Open {emailDomain} <ArrowRight className="h-4 w-4" />
          </a>
        </div>
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm text-slate-600">
            <span className="font-semibold">Do not see the email?</span> Check your spam or junk folder. The email comes from Navly.
          </p>
        </div>
        <button type="button" onClick={() => onComplete(phone.trim())}
          className="mt-5 text-sm text-slate-400 underline hover:text-slate-600">
          Skip for now — go to dashboard
        </button>
      </div>
    )
  }

  if (phase === 'phone') {
    return (
      <div>
        <h1 className="text-3xl font-bold text-[#0B1F3A]">Verify your phone</h1>
        <p className="mt-2 text-slate-500">We'll send a one-time code to confirm your number. One phone number per account.</p>
        <div className="mt-8 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="su-phone" className="text-sm font-semibold text-[#0B1F3A]">Phone number</Label>
            <Input id="su-phone" type="tel" placeholder="+1 416 555 0100" value={phone}
              onChange={(e) => { setPhone(e.target.value); setError('') }}
              onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
              className="rounded-xl border-slate-200 bg-white px-4 py-3 text-[#0B1F3A] placeholder:text-slate-400 focus-visible:ring-[#D62828]" />
          </div>
          {error && <ErrorBanner msg={error} />}
          <Button onClick={handleSendOtp} disabled={!phone.trim() || loading}
            className="gap-2 bg-[#D62828] text-white hover:bg-[#B91C1C] disabled:opacity-40">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {loading ? 'Sending code…' : 'Send verification code'}
            {!loading && <ArrowRight className="h-4 w-4" />}
          </Button>
          <p className="text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-[#D62828] hover:underline">Log in →</Link>
          </p>
        </div>
      </div>
    )
  }

  if (phase === 'otp') {
    return (
      <div>
        <h1 className="text-3xl font-bold text-[#0B1F3A]">Enter the code</h1>
        <p className="mt-2 text-slate-500">We sent a 6-digit code to <span className="font-semibold text-[#0B1F3A]">{phone}</span>.</p>
        <div className="mt-8 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="su-otp" className="text-sm font-semibold text-[#0B1F3A]">Verification code</Label>
            <Input id="su-otp" type="text" inputMode="numeric" maxLength={6} placeholder="123456" value={otp}
              onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '')); setError('') }}
              onKeyDown={(e) => e.key === 'Enter' && handleVerifyOtp()}
              className="rounded-xl border-slate-200 bg-white px-4 py-3 text-center text-xl font-bold tracking-widest text-[#0B1F3A] placeholder:text-slate-300 focus-visible:ring-[#D62828]" />
          </div>
          {error && <ErrorBanner msg={error} />}
          <Button onClick={handleVerifyOtp} disabled={otp.length < 6 || loading}
            className="gap-2 bg-[#D62828] text-white hover:bg-[#B91C1C] disabled:opacity-40">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {loading ? 'Verifying…' : 'Verify code'}
            {!loading && <ArrowRight className="h-4 w-4" />}
          </Button>
          <button type="button" onClick={() => { setPhase('phone'); setOtp(''); setError('') }}
            className="text-center text-sm text-slate-400 hover:text-[#0B1F3A]">
            ← Use a different number
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
        <CheckCircle2 className="h-5 w-5 text-green-600" />
      </div>
      <h1 className="text-3xl font-bold text-[#0B1F3A]">Phone verified</h1>
      <p className="mt-2 text-slate-500">Now set your email and password to complete your account.</p>
      <div className="mt-8 flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Label htmlFor="su-email" className="text-sm font-semibold text-[#0B1F3A]">Email address</Label>
          <Input id="su-email" type="email" autoComplete="email" placeholder="you@example.com" value={email}
            onChange={(e) => { setEmail(e.target.value); setError('') }}
            className="rounded-xl border-slate-200 bg-white px-4 py-3 text-[#0B1F3A] placeholder:text-slate-400 focus-visible:ring-[#D62828]" />
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="su-password" className="text-sm font-semibold text-[#0B1F3A]">Password</Label>
            <button type="button" onClick={handleForgotPassword} className="text-xs text-slate-400 hover:text-[#D62828]">
              {resetSent ? 'Reset email sent ✓' : 'Forgot password?'}
            </button>
          </div>
          <div className="relative">
            <Input id="su-password" type={showPassword ? 'text' : 'password'} autoComplete="new-password"
              placeholder="At least 8 characters" value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-xl border-slate-200 bg-white px-4 py-3 pr-11 text-[#0B1F3A] placeholder:text-slate-400 focus-visible:ring-[#D62828]" />
            <button type="button" onClick={() => setShowPassword((v) => !v)}
              className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600">
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-[#D62828]" />
            <p className="text-sm leading-6 text-slate-600">
              I understand that Navly is a planning and information tool only — not legal advice or immigration consulting.
              By creating an account I agree to the{' '}
              <a href="/terms" target="_blank" rel="noopener noreferrer" className="font-semibold text-[#D62828] hover:underline">Terms of Service</a>
              {' '}and{' '}
              <a href="/privacy" target="_blank" rel="noopener noreferrer" className="font-semibold text-[#D62828] hover:underline">Privacy Policy</a>.
            </p>
          </label>
        </div>
        {error && <ErrorBanner msg={error} />}
        <Button onClick={handleCompleteSignUp} disabled={!email || password.length < 8 || !consent || loading}
          className="gap-2 bg-[#D62828] text-white hover:bg-[#B91C1C] disabled:opacity-40">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {loading ? 'Creating account…' : 'Create account'}
          {!loading && <ArrowRight className="h-4 w-4" />}
        </Button>
        <p className="text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-[#D62828] hover:underline">Log in →</Link>
        </p>
      </div>
    </div>
  )
}
