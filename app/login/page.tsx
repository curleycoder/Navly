'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NavlyLogo } from '@/components/ui/NavlyLogo'
import { supabase } from '@/lib/supabase/client'
import { loadProfile, loadProfileFromSupabase, saveProfileToSupabase } from '@/lib/profile'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin() {
    setLoading(true)
    setError('')

    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    if (signInError) {
      setError('Invalid email or password.')
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

    router.push('/dashboard')
  }

  async function handleForgotPassword() {
    if (!email) {
      setError('Enter your email address above first.')
      return
    }
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/dashboard`,
    })
    setError('')
    alert(`Password reset email sent to ${email}. Check your inbox.`)
  }

  return (
    <main className="flex min-h-screen flex-col bg-[#F8FAFC]">
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="mx-auto max-w-md">
          <Link href="/">
            <NavlyLogo size="sm" />
          </Link>
        </div>
      </header>

      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#0B1F3A]">Welcome back</h1>
            <p className="mt-2 text-slate-500">Log in to your Navly account to continue.</p>
          </div>

          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email" className="text-sm font-semibold text-[#0B1F3A]">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError('') }}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                className="rounded-xl border-slate-200 bg-white px-4 py-3 text-[#0B1F3A] placeholder:text-slate-400 focus-visible:ring-[#D62828]"
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-semibold text-[#0B1F3A]">Password</Label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs text-slate-400 hover:text-[#D62828]"
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
                  className="rounded-xl border-slate-200 bg-white px-4 py-3 pr-11 text-[#0B1F3A] placeholder:text-slate-400 focus-visible:ring-[#D62828]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
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

            <Button
              onClick={handleLogin}
              disabled={!email || !password || loading}
              className="gap-2 bg-[#D62828] text-white hover:bg-[#B91C1C] disabled:opacity-40"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? 'Logging in…' : 'Log in'}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </Button>

            <p className="text-center text-sm text-slate-500">
              Don&apos;t have an account?{' '}
              <Link href="/onboarding" className="font-semibold text-[#D62828] hover:underline">
                Start free →
              </Link>
            </p>
          </div>

          <p className="mt-10 text-center text-xs text-slate-400">
            Navly provides general educational information only — not legal advice.
          </p>
        </div>
      </div>
    </main>
  )
}
