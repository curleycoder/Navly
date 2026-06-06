'use client'

import { useState } from 'react'
import { ArrowRight, Bell, Loader2, Phone, ShieldCheck } from 'lucide-react'

import type { IntakeData } from '@/lib/profile'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type StepContactPhoneProps = {
  data: IntakeData
  onComplete: (phone: string) => void | Promise<void>
}

function formatPhone(value: string) {
  return value.replace(/[^\d+]/g, '').slice(0, 16)
}

function isValidPhone(value: string) {
  return value.replace(/\D/g, '').length >= 10
}

export function StepContactPhone({ data, onComplete }: StepContactPhoneProps) {
  const [phone, setPhone] = useState(data.phone || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const cleanPhone = formatPhone(phone)
  const validPhone = isValidPhone(cleanPhone)

  async function handleSave() {
    if (!validPhone) { setError('Enter a valid phone number.'); return }

    setLoading(true)
    setError('')

    // Check for duplicate before saving
    const check = await fetch('/api/auth/check-phone', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: cleanPhone }),
    })
    const result = await check.json()
    if (result.taken) {
      setError('This phone number is already linked to another account.')
      setLoading(false)
      return
    }

    await onComplete(cleanPhone)
    setLoading(false)
  }

  return (
    <div>
      <div className="mb-2 flex items-center gap-2 text-[#D62828]">
        <Bell className="h-5 w-5" aria-hidden="true" />
        <span className="text-sm font-semibold uppercase tracking-wide">Final step</span>
      </div>

      <h1 className="text-3xl font-bold text-[#0B1F3A]">Get your immigration updates</h1>

      <p className="mt-2 text-slate-500">
        Add your phone number so Navly can send important reminders, checklist updates, and next-step alerts.
      </p>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#D62828]" aria-hidden="true" />
          <div>
            <p className="font-semibold text-[#0B1F3A]">Why we ask for this</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Immigration timelines can change. Your phone number helps us send reminders for deadlines, expiring permits, and important PR tasks.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-2">
        <Label htmlFor="phone" className="text-sm font-semibold text-[#0B1F3A]">
          Phone number
        </Label>
        <div className="relative">
          <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <Input
            id="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+1 604 123 4567"
            value={phone}
            onChange={(e) => { setPhone(formatPhone(e.target.value)); setError('') }}
            className="rounded-xl border-slate-200 bg-white py-3 pl-11 pr-4 text-[#0B1F3A] placeholder:text-slate-400 focus-visible:ring-[#D62828]"
          />
        </div>
        <p className="text-xs leading-5 text-slate-400">
          Include country code, e.g. +1 for Canada/US.
        </p>

        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>

      <div className="mt-8 flex flex-col gap-3">
        <Button
          onClick={handleSave}
          disabled={!validPhone || loading}
          className="gap-2 bg-[#D62828] text-white hover:bg-[#B91C1C] disabled:opacity-40"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? 'Saving…' : 'Save phone number'}
          {!loading && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
        </Button>

      </div>

      <p className="mt-5 text-center text-xs leading-5 text-slate-400">
        Navly is not a law firm or immigration consultant. Your answers help us organise your planning dashboard.
      </p>
    </div>
  )
}
