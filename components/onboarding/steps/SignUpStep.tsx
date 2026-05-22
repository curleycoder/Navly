'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  AlertTriangle,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-react'

import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type StepSignUpProps = {
  defaultFullName?: string
  defaultEmail?: string
  onComplete: (account: {
    fullName: string
    email: string
  }) => void
}

export function StepSignUp({
  defaultFullName = '',
  defaultEmail = '',
  onComplete,
}: StepSignUpProps) {
  const router = useRouter()

  const [fullName, setFullName] = useState(defaultFullName)
  const [email, setEmail] = useState(defaultEmail)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [consent, setConsent] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleForgotPassword() {
    if (!email.trim()) {
      setError('Enter your email address first.')
      return
    }

    await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/dashboard`,
    })

    setResetSent(true)
    setError('')
  }

  async function handleCompleteSignUp() {
    const trimmedName = fullName.trim()
    const trimmedEmail = email.trim().toLowerCase()

    if (!trimmedName) {
      setError('Enter your full name.')
      return
    }

    if (!trimmedEmail) {
      setError('Enter your email address.')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    if (!consent) {
      setError('Please accept the terms to continue.')
      return
    }

    setLoading(true)
    setError('')

    const { error: signUpError } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: {
          fullName: trimmedName,
        },
      },
    })

    if (signUpError) {
      const message = signUpError.message.toLowerCase()

      if (
        message.includes('already registered') ||
        message.includes('already been registered') ||
        message.includes('user already registered')
      ) {
        setError('An account with this email already exists. Please log in instead.')
        setLoading(false)
        return
      }

      setError(signUpError.message)
      setLoading(false)
      return
    }

    onComplete({
      fullName: trimmedName,
      email: trimmedEmail,
    })

    router.refresh()
    setLoading(false)
  }

  function ErrorBanner({ msg }: { msg: string }) {
    return (
      <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3">
        <AlertTriangle
          className="mt-0.5 h-4 w-4 shrink-0 text-red-500"
          aria-hidden="true"
        />

        <p className="text-sm text-red-700">
          {msg}{' '}
          {msg.includes('already exists') && (
            <Link href="/login" className="font-semibold underline">
              Log in →
            </Link>
          )}
        </p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-[#0B1F3A]">
        Save your result
      </h1>

      <p className="mt-2 text-slate-500">
        Create your free account so Navly can save your answers and build your
        immigration roadmap.
      </p>

      <div className="mt-8 flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Label
            htmlFor="su-full-name"
            className="text-sm font-semibold text-[#0B1F3A]"
          >
            Full name
          </Label>

          <Input
            id="su-full-name"
            type="text"
            autoComplete="name"
            placeholder="Your full name"
            value={fullName}
            onChange={(event) => {
              setFullName(event.target.value)
              setError('')
            }}
            className="rounded-xl border-slate-200 bg-white px-4 py-3 text-[#0B1F3A] placeholder:text-slate-400 focus-visible:ring-[#D62828]"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label
            htmlFor="su-email"
            className="text-sm font-semibold text-[#0B1F3A]"
          >
            Email address
          </Label>

          <Input
            id="su-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value)
              setError('')
            }}
            className="rounded-xl border-slate-200 bg-white px-4 py-3 text-[#0B1F3A] placeholder:text-slate-400 focus-visible:ring-[#D62828]"
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="su-password"
              className="text-sm font-semibold text-[#0B1F3A]"
            >
              Password
            </Label>

            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-xs text-slate-400 hover:text-[#D62828]"
            >
              {resetSent ? 'Reset email sent ✓' : 'Forgot password?'}
            </button>
          </div>

          <div className="relative">
            <Input
              id="su-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value)
                setError('')
              }}
              className="rounded-xl border-slate-200 bg-white px-4 py-3 pr-11 text-[#0B1F3A] placeholder:text-slate-400 focus-visible:ring-[#D62828]"
            />

            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={consent}
              onChange={(event) => setConsent(event.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-[#D62828]"
            />

            <p className="text-sm leading-6 text-slate-600">
              I understand that Navly is a planning and information tool only —
              not legal advice or immigration consulting. By creating an
              account I agree to the{' '}
              <a
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[#D62828] hover:underline"
              >
                Terms of Service
              </a>{' '}
              and{' '}
              <a
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[#D62828] hover:underline"
              >
                Privacy Policy
              </a>
              .
            </p>
          </label>
        </div>

        {error && <ErrorBanner msg={error} />}

        <Button
          onClick={handleCompleteSignUp}
          disabled={
            !fullName.trim() ||
            !email.trim() ||
            password.length < 8 ||
            !consent ||
            loading
          }
          className="gap-2 bg-[#D62828] text-white hover:bg-[#B91C1C] disabled:opacity-40"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}

          {loading ? 'Creating account…' : 'Save and continue'}

          {!loading && <ArrowRight className="h-4 w-4" />}
        </Button>

        <p className="text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-semibold text-[#D62828] hover:underline"
          >
            Log in →
          </Link>
        </p>
      </div>
    </div>
  )
}