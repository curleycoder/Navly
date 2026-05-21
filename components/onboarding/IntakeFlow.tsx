'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { Button, buttonVariants } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { NavlyLogo } from '@/components/ui/NavlyLogo'
import { loadProfile, saveProfile, saveProfileToSupabase, EMPTY_PROFILE, type IntakeData } from '@/lib/profile'
import { getSteps, stepTitles } from './flow'
import { canContinue, getValidationHint } from './validation'
import { SummaryView } from './SummaryView'
import { StepLocationSplit, StepPlannedEntry, StepInsideStatus, StepGoal } from './steps/LocationSteps'
import { StepPersonal, StepCanadaDates } from './steps/PersonalSteps'
import { StepSpouseLanguage, StepLanguage } from './steps/LanguageSteps'
import { StepEducation } from './steps/EducationStep'
import { StepWork } from './steps/WorkStep'
import { StepPRStatus } from './steps/PRStep'
import { StepSettlement } from './steps/SettlementStep'
import { StepProvince, StepManitobaFamily } from './steps/ProvinceSteps'
import { StepRisk } from './steps/RiskStep'
import { StepSignUp } from './steps/SignUpStep'

export function IntakeFlow() {
  const [data, setData] = useState<IntakeData>({ ...EMPTY_PROFILE })
  const [stepIndex, setStepIndex] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const saved = loadProfile()
    if (saved) setData(saved)
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [stepIndex])

  const steps = getSteps(data)
  const currentStep = steps[stepIndex]
  const progress = ((stepIndex + 1) / steps.length) * 100

  function update(fields: Partial<IntakeData>) {
    setData((d) => ({ ...d, ...fields }))
  }

  function next() {
    const currentSteps = getSteps(data)
    if (stepIndex < currentSteps.length - 1) {
      setStepIndex((i) => i + 1)
    } else {
      saveProfile(data)
      setDone(true)
    }
  }

  function back() {
    if (stepIndex > 0) setStepIndex((i) => i - 1)
  }

  function handleLocationSplit(v: string) {
    if (v === 'inside') {
      update({ locationStatus: 'inside', currentCountry: 'Canada', plannedEntry: '' })
    } else {
      update({ locationStatus: 'outside', status: 'outside-canada', arrivalDate: '', visaExpiryDate: '', province: '', canadianWorkMonths: '' })
    }
  }

  async function handleSignUpComplete(phone: string) {
    const withPhone = { ...data, phone, phoneVerified: 'yes' }
    setData(withPhone)
    saveProfile(withPhone)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) await saveProfileToSupabase(user.id, withPhone)
    setDone(true)
  }

  if (done) return <SummaryView data={data} />

  const isSignupStep = currentStep === 'signup'
  const ok = canContinue(currentStep, data)
  const hint = !ok ? getValidationHint(currentStep, data) : ''

  return (
    <div className="flex min-h-screen flex-col">
      <div className="sticky top-0 z-10 bg-white">
        <header className="border-b border-slate-200 px-6 py-4">
          <div className="mx-auto flex max-w-2xl items-center justify-between">
            <NavlyLogo size="sm" />
            <div className="text-right">
              <span className="text-sm text-slate-500">{stepIndex + 1} / {steps.length}</span>
              <p className="text-xs text-slate-400">{stepTitles[currentStep]}</p>
            </div>
          </div>
        </header>
        <div className="px-6 pb-2">
          <div className="mx-auto max-w-2xl">
            <Progress
              value={progress}
              className="h-1.5 bg-slate-100"
              aria-label="Onboarding progress"
              aria-valuenow={Math.round(progress)}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-1 items-start justify-center px-6 py-6 pb-28">
        <div className="w-full max-w-2xl">
          {currentStep === 'location-split' && <StepLocationSplit value={data.locationStatus} onChange={handleLocationSplit} />}
          {currentStep === 'planned-entry' && <StepPlannedEntry value={data.plannedEntry} onChange={(v) => update({ plannedEntry: v })} />}
          {currentStep === 'inside-status' && <StepInsideStatus value={data.status} onChange={(v) => update({ status: v })} />}
          {currentStep === 'goal' && <StepGoal data={data} onChange={(v) => update({ goal: v })} />}
          {currentStep === 'personal' && <StepPersonal data={data} onChange={update} />}
          {currentStep === 'canada-dates' && <StepCanadaDates data={data} onChange={update} />}
          {currentStep === 'pr-status' && <StepPRStatus data={data} onChange={update} />}
          {currentStep === 'spouse-language' && <StepSpouseLanguage data={data} onChange={update} />}
          {currentStep === 'language' && <StepLanguage data={data} onChange={update} />}
          {currentStep === 'education' && <StepEducation data={data} onChange={update} />}
          {currentStep === 'work' && <StepWork data={data} onChange={update} />}
          {currentStep === 'settlement' && <StepSettlement data={data} onChange={update} />}
          {currentStep === 'province' && <StepProvince data={data} onChange={update} />}
          {currentStep === 'manitoba-family' && <StepManitobaFamily value={data.manitobaFamilyRelative} onChange={(v) => update({ manitobaFamilyRelative: v })} />}
          {currentStep === 'risk' && <StepRisk data={data} onChange={update} />}
          {currentStep === 'signup' && <StepSignUp onComplete={(phone) => handleSignUpComplete(phone)} />}
        </div>
      </div>

      {/* Fixed bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-slate-200 bg-white px-6 py-3" style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          {!isSignupStep && (
            <div className="flex w-full flex-col gap-1">
              <div className="flex items-center justify-between">
                {stepIndex > 0 ? (
                  <Button variant="outline" onClick={back} className="gap-2 border-slate-300 text-slate-700 hover:bg-slate-50">
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back
                  </Button>
                ) : (
                  <Link href="/" className={buttonVariants({ variant: 'outline', className: 'gap-2 border-slate-300 text-slate-700 hover:bg-slate-50' })}>
                    <ArrowLeft className="h-4 w-4" />Back to home
                  </Link>
                )}
                <Button
                  onClick={next}
                  disabled={!ok}
                  aria-describedby={!ok && hint ? 'step-hint' : undefined}
                  className="gap-2 bg-[#D62828] text-white hover:bg-[#B91C1C] disabled:opacity-40"
                >
                  {stepIndex === steps.length - 2 ? 'Continue to account' : 'Continue'}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
              {!ok && hint && (
                <p id="step-hint" role="status" className="text-right text-xs text-slate-400">
                  {hint}
                </p>
              )}
            </div>
          )}
          {isSignupStep && (
            <Button variant="outline" onClick={back} className="gap-2 border-slate-300 text-slate-700 hover:bg-slate-50">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
