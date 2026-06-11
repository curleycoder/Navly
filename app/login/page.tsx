'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NavlyLogo } from '@/components/ui/NavlyLogo'
import { supabase } from '@/lib/supabase/client'
import { loadProfile, loadProfileFromSupabase, saveProfileToSupabase } from '@/lib/profile'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/dashboard'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [unconfirmed, setUnconfirmed] = useState(false)
  const [resentAt, setResentAt] = useState<number | null>(null)
  const [loginMode, setLoginMode] = useState<'email' | 'phone'>('email')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)

  async function handleResendVerification() {
    await supabase.auth.resend({ type: 'signup', email, options: { emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin}/dashboard` } })
    setResentAt(Date.now())
  }
  async function handleSendPhoneOtp() {
  setLoading(true)
  setError('')

  const trimmedPhone = phone.trim()

  if (!trimmedPhone) {
    setError('Enter your phone number.')
    setLoading(false)
    return
  }

  const { error: otpError } = await supabase.auth.signInWithOtp({
    phone: trimmedPhone,
  })

  if (otpError) {
    setError(otpError.message)
    setLoading(false)
    return
  }

  setOtpSent(true)
  setLoading(false)
}
async function handleVerifyPhoneOtp() {
  setLoading(true)
  setError('')

  const { data, error: verifyError } = await supabase.auth.verifyOtp({
    phone: phone.trim(),
    token: otp.trim(),
    type: 'sms',
  })

  if (verifyError) {
    setError('Incorrect code. Check your SMS and try again.')
    setLoading(false)
    return
  }

  if (data.user) {
    const dbProfile = await loadProfileFromSupabase(data.user.id)

    if (!dbProfile) {
      const localProfile = loadProfile()
      if (localProfile?.locationStatus) {
        await saveProfileToSupabase(data.user.id, localProfile)
      }
    }
  }

  window.location.href = redirectTo
}

  async function handleLogin() {
    setLoading(true)
    setError('')
    setUnconfirmed(false)

    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    if (signInError) {
      const msg = signInError.message.toLowerCase()
      if (msg.includes('email not confirmed') || msg.includes('not confirmed')) {
        setUnconfirmed(true)
        setLoading(false)
        return
      }
      setError('Invalid email or password. Check your details and try again.')
      setLoading(false)
      return
    }

    if (data.user) {
      // Sync profile: if no DB profile, push local one up
      const dbProfile = await loadProfileFromSupabase(data.user.id)
      if (!dbProfile) {
        const localProfile = loadProfile()
        if (localProfile?.locationStatus) {
          await saveProfileToSupabase(data.user.id, localProfile)
        }
      }
    }

    window.location.href = redirectTo
  }

  async function handleForgotPassword() {
    if (!email) {
      setError('Enter your email address above first.')
      return
    }
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin}/dashboard`,
    })
    setError('')
    alert(`Password reset email sent to ${email}. Check your inbox.`)
  }

  return (
    <main className="flex min-h-screen">

      {/* ── Left panel — brand (desktop only) ── */}
      <div className="relative hidden flex-col justify-start overflow-hidden p-12 lg:flex lg:w-5/10">
        {/* Background image */}
        <img
          src="/images/hero-group.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-navly-navy/75" />
        <Link href="/" className="relative z-10">
          <NavlyLogo size="sm" variant="light" />
        </Link>

        <div className="relative z-10 mt-12">
          <h2 className="text-4xl font-bold leading-tight text-white">
            Your Canadian PR journey, organized.
          </h2>
          <p className="mt-5 text-white/70">
            Log in to access your profile, track your Canada days, and see your strongest pathways.
          </p>
          <ul className="mt-10 flex flex-col gap-3 text-sm text-white/70">
            {[
              'Estimated CRS score & gap analysis',
              'Daily Canada presence tracker',
              'Personalized pathway screening',
              'AI assistant for immigration questions',
            ].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-navly-red" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative mt-80 text-xs text-white/70">
          Educational tool only — not legal advice. Always consult a licensed RCIC or immigration lawyer.
        </p>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex flex-1 flex-col bg-surface">
        {/* Mobile header */}
        <header className="flex items-center justify-between border-b border-subtle bg-surface-card px-6 py-4 lg:hidden">
          <Link href="/"><NavlyLogo size="sm" /></Link>
          <Link href="/" className="flex items-center gap-1.5 text-sm font-medium text-muted-text hover:text-heading">
            <ArrowLeft className="h-4 w-4" /> Home
          </Link>
        </header>

        <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
          {/* Desktop back link */}
          <div className="mb-8 hidden w-full max-w-md lg:block">
            <Link href="/" className="flex items-center gap-1.5 text-sm font-medium text-muted-text hover:text-heading">
              <ArrowLeft className="h-4 w-4" /> Back to home
            </Link>
          </div>

          <div className="w-full max-w-md">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-heading">Welcome back</h1>
              <p className="mt-2 text-muted-text">Log in to your Navly account to continue.</p>
            </div>

            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <Label htmlFor="email" className="text-sm font-semibold text-heading">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError('') }}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  className="rounded-xl border-subtle bg-surface-card px-4 py-3 text-heading placeholder:text-muted-text/70 focus-visible:ring-navly-red"
                />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-semibold text-heading">Password</Label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-xs text-muted-text/70 hover:text-navly-red"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Your password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError('') }}
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                    className="rounded-xl border-subtle bg-surface-card px-4 py-3 pr-11 text-heading placeholder:text-muted-text/70 focus-visible:ring-navly-red"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-3 flex items-center text-muted-text/70 hover:text-muted-text"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </p>
              )}

              {unconfirmed && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                  <p className="text-sm font-semibold text-amber-800">Your email is not verified yet.</p>
                  <p className="mt-1 text-sm text-amber-700">Check your inbox for the link we sent to <span className="font-semibold">{email}</span>.</p>
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={!!resentAt && Date.now() - resentAt < 60000}
                    className="mt-2 text-sm font-semibold text-amber-800 underline disabled:opacity-50"
                  >
                    {resentAt && Date.now() - resentAt < 60000 ? 'Verification email sent ✓' : 'Resend verification email'}
                  </button>
                </div>
              )}

              <Button
                onClick={handleLogin}
                disabled={!email || !password || loading}
                className="gap-2 bg-navly-red text-white hover:bg-navly-red/80 disabled:opacity-40"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? 'Logging in…' : 'Log in'}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </Button>

              <p className="text-center text-sm text-muted-text">
                Don&apos;t have an account?{' '}
                <Link href="/onboarding" className="font-semibold text-navly-red hover:underline">
                  Start free →
                </Link>
              </p>
            </div>

            <p className="mt-10 text-center text-xs text-muted-text/70">
              Navly provides general educational information only — not legal advice.
            </p>
          </div>
        </div>
      </div>

    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  )
}
