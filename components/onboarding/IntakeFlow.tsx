'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'

import { supabase } from '@/lib/supabase/client'
import {
  EMPTY_PROFILE,
  loadProfile,
  saveProfile,
  saveProfileToSupabase,
  type IntakeData,
} from '@/lib/profile'
import { loadPresence, syncPresenceToSupabase } from '@/lib/presence'

import { Button, buttonVariants } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { NavlyLogo } from '@/components/ui/NavlyLogo'

import { getSteps, stepTitles } from './flow'
import { canContinue, getValidationHint } from './validation'
import { SummaryView } from './SummaryView'

import {
  StepGoal,
  StepInsideStatus,
  StepLocationSplit,
  StepPlannedEntry,
} from './steps/LocationSteps'

import { StepCanadaDates, StepPersonal } from './steps/PersonalSteps'
import { StepLanguage, StepSpouseLanguage } from './steps/LanguageSteps'
import { StepEducation } from './steps/EducationStep'
import { StepWork } from './steps/WorkStep'
import { StepPRStatus } from './steps/PRStep'
import { StepSettlement } from './steps/SettlementStep'
import { StepProvince, StepManitobaFamily } from './steps/ProvinceSteps'
import { StepPNP } from './steps/PNPStep'
import { StepRisk } from './steps/RiskStep'
import { StepEarlySignup } from './steps/EarlySignupStep'
import { StepContactPhone } from './steps/ContactPhoneStep'

export function IntakeFlow() {
  const [data, setData] = useState<IntakeData>({ ...EMPTY_PROFILE })
  const [stepIndex, setStepIndex] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const saved = loadProfile()

    if (saved) {
      setData(saved)
    }
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [stepIndex])

  const steps = useMemo(() => getSteps(data), [data])
  const safeStepIndex = Math.min(stepIndex, steps.length - 1)
  const currentStep = steps[safeStepIndex]

  const progress = ((safeStepIndex + 1) / steps.length) * 100

  const isAccountStep = currentStep === 'early-signup'
  const isPhoneStep = currentStep === 'contact-phone'
  const usesCustomNav = isAccountStep || isPhoneStep

  const ok = canContinue(currentStep, data)
  const hint = !ok ? getValidationHint(currentStep, data) : ''

  const nextStep = steps[safeStepIndex + 1]
  const isLastStep = safeStepIndex === steps.length - 1

  const continueLabel = isLastStep
    ? 'Complete profile'
    : nextStep === 'early-signup'
      ? 'Save progress'
      : 'Continue'

  function update(fields: Partial<IntakeData>) {
    setData((currentData) => {
      const nextData = { ...currentData, ...fields }
      return saveProfile(nextData)
    })
  }

  async function saveToSupabase(profileData: IntakeData) {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      await saveProfileToSupabase(user.id, profileData)
    }
  }

  async function next() {
    const currentSteps = getSteps(data)
    const isFinalStep = safeStepIndex >= currentSteps.length - 1

    if (!isFinalStep) {
      setStepIndex((currentIndex) => currentIndex + 1)
      return
    }

    saveProfile(data)
    await saveToSupabase(data)
    setDone(true)
  }

  function back() {
    if (safeStepIndex > 0) {
      setStepIndex((currentIndex) => currentIndex - 1)
    }
  }

  function handleLocationSplit(value: string) {
    if (value === 'inside') {
      update({
        locationStatus: 'inside',
        currentCountry: 'Canada',
        plannedEntry: '',
      })

      return
    }

    update({
      locationStatus: 'outside',
      status: 'outside-canada',
      arrivalDate: '',
      visaExpiryDate: '',
      province: '',
      canadianWorkMonths: '',
    })
  }

  async function handleEarlySignupComplete(account: {
    fullName: string
    email: string
  }) {
    const nextData = saveProfile({
      ...data,
      fullName: account.fullName,
      email: account.email,
    })

    setData(nextData)
    await saveToSupabase(nextData)

    // Upload any presence data collected before account creation
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      const presence = loadPresence()
      syncPresenceToSupabase(user.id, presence).catch(() => {})
    }

    const currentSteps = getSteps(nextData)
    if (safeStepIndex >= currentSteps.length - 1) {
      setDone(true)
      return
    }

    setStepIndex((currentIndex) => currentIndex + 1)
  }

  async function handlePhoneComplete(phone: string) {
    const finalData = saveProfile({
      ...data,
      phone,
      phoneVerified: phone ? 'yes' : '',
    })

    setData(finalData)
    await saveToSupabase(finalData)

    // Upload any presence data collected before account creation
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      const presence = loadPresence()
      syncPresenceToSupabase(user.id, presence).catch(() => {})
    }

    setDone(true)
  }


  if (done) {
    return <SummaryView data={data} />
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="sticky top-0 z-10 bg-surface-card">
        <header className="border-b border-subtle px-6 py-4">
          <div className="mx-auto flex max-w-2xl items-center justify-between">
            <NavlyLogo size="sm" />

            <div className="text-right">
              <span className="text-sm text-muted-text">
                {safeStepIndex + 1} / {steps.length}
              </span>

              <p className="text-xs text-muted-text/70">
                {stepTitles[currentStep]}
              </p>
            </div>
          </div>
        </header>

        <div className="px-6 pb-2">
          <div className="mx-auto max-w-2xl">
            <Progress
              value={progress}
              className="h-1.5 bg-subtle"
              aria-label="Onboarding progress"
              aria-valuenow={Math.round(progress)}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>
      </div>

      <main className="flex flex-1 items-start justify-center px-6 py-6 pb-28">
        <div className="w-full max-w-2xl">
          {currentStep === 'location-split' && (
            <StepLocationSplit
              value={data.locationStatus}
              onChange={handleLocationSplit}
            />
          )}

          {currentStep === 'planned-entry' && (
            <StepPlannedEntry
              value={data.plannedEntry}
              onChange={(value) => update({ plannedEntry: value })}
            />
          )}

          {currentStep === 'inside-status' && (
            <StepInsideStatus
              value={data.status}
              onChange={(value) => update({
                status: value,
                ...(value === 'pr' ? { goal: 'citizenship' } : {}),
              })}
            />
          )}

          {currentStep === 'goal' && (
            <StepGoal
              data={data}
              onChange={(value) => update({ goal: value })}
            />
          )}

          {currentStep === 'province' && (
            <StepProvince data={data} onChange={update} />
          )}

          {currentStep === 'personal' && (
            <StepPersonal data={data} onChange={update} />
          )}

          {currentStep === 'early-signup' && (
            <StepEarlySignup
              data={data}
              onComplete={handleEarlySignupComplete}
            />
          )}

          {currentStep === 'canada-dates' && (
            <StepCanadaDates data={data} onChange={update} />
          )}

          {currentStep === 'pr-status' && (
            <StepPRStatus data={data} onChange={update} />
          )}

          {currentStep === 'spouse-language' && (
            <StepSpouseLanguage data={data} onChange={update} />
          )}

          {currentStep === 'language' && (
            <StepLanguage data={data} onChange={update} />
          )}

          {currentStep === 'education' && (
            <StepEducation data={data} onChange={update} />
          )}

          {currentStep === 'work' && (
            <StepWork data={data} onChange={update} />
          )}

          {currentStep === 'settlement' && (
            <StepSettlement data={data} onChange={update} />
          )}

          {currentStep === 'pnp-details' && (
            <StepPNP data={data} onChange={update} />
          )}

          {currentStep === 'manitoba-family' && (
            <StepManitobaFamily
              value={data.manitobaFamilyRelative}
              onChange={(value) => update({ manitobaFamilyRelative: value })}
            />
          )}

          {currentStep === 'risk' && (
            <StepRisk data={data} onChange={update} />
          )}

          {currentStep === 'contact-phone' && (
            <StepContactPhone
              data={data}
              onComplete={handlePhoneComplete}
            />
          )}
        </div>
      </main>

      {!usesCustomNav && (
        <div
          className="fixed bottom-0 left-0 right-0 z-20 border-t border-subtle bg-surface-card px-6 py-3"
          style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
        >
          <div className="mx-auto flex max-w-2xl items-center justify-between">
            <div className="flex w-full flex-col gap-1">
              <div className="flex items-center justify-between">
                {safeStepIndex > 0 ? (
                  <Button
                    variant="outline"
                    onClick={back}
                    className="gap-2 border-subtle text-muted-text hover:bg-surface-alt"
                  >
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                    Back
                  </Button>
                ) : (
                  <Link
                    href="/"
                    className={buttonVariants({
                      variant: 'outline',
                      className:
                        'gap-2 border-subtle text-muted-text hover:bg-surface-alt',
                    })}
                  >
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                    Back to home
                  </Link>
                )}

                <Button
                  onClick={next}
                  disabled={!ok}
                  aria-describedby={!ok && hint ? 'step-hint' : undefined}
                  className="gap-2 bg-navly-red text-white hover:bg-navly-red/80 disabled:opacity-40"
                >
                  {continueLabel}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>

              {!ok && hint && (
                <p
                  id="step-hint"
                  role="status"
                  className="text-right text-xs text-muted-text/70"
                >
                  {hint}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {usesCustomNav && safeStepIndex > 0 && (
        <div
          className="fixed bottom-0 left-0 right-0 z-20 border-t border-subtle bg-surface-card px-6 py-3"
          style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
        >
          <div className="mx-auto flex max-w-2xl items-center justify-start">
            <Button
              variant="outline"
              onClick={back}
              className="gap-2 border-subtle text-muted-text hover:bg-surface-alt"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}