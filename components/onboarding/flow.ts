import type { IntakeData } from '@/lib/profile'

export type StepId =
  | 'location-split'
  | 'planned-entry'
  | 'inside-status'
  | 'goal'
  | 'province'
  | 'personal'
  | 'early-signup'
  | 'canada-dates'
  | 'pr-status'
  | 'spouse-language'
  | 'language'
  | 'education'
  | 'work'
  | 'settlement'
  | 'pnp-details'
  | 'manitoba-family'
  | 'risk'
  | 'contact-phone'

export function getSteps(data: IntakeData): StepId[] {
  const steps: StepId[] = ['location-split']

  if (!data.locationStatus) return steps

  const isInside = data.locationStatus === 'inside'
  const isPR = data.status === 'pr'

  const hasSpouse =
    (data.maritalStatus === 'married' || data.maritalStatus === 'common-law') &&
    data.spouseComing === 'yes'

  const hasSpecificProvince =
    Boolean(data.intendedProvince) &&
    data.intendedProvince !== 'QC' &&
    data.intendedProvince !== 'Any'

  const isManitoba = data.intendedProvince === 'MB'

  if (isInside) {
    steps.push('inside-status', 'goal', 'province', 'personal', 'early-signup')

    if (isPR) {
      steps.push('pr-status')

      if (hasSpouse) {
        steps.push('spouse-language')
      }

      steps.push('language', 'risk', 'contact-phone')
      return steps
    }

    steps.push('canada-dates')

    if (hasSpouse) {
      steps.push('spouse-language')
    }

    steps.push('language', 'education', 'work')

    const isStudent = data.status === 'student'
    const isWorker =
      data.status === 'work-permit' ||
      data.status === 'pgwp' ||
      data.status === 'open-work-permit' ||
      data.status === 'employer-specific-work-permit'

    if (!isStudent && !isWorker) {
      steps.push('settlement')
    }

    if (hasSpecificProvince) {
      steps.push('pnp-details')
    }

    if (isManitoba) {
      steps.push('manitoba-family')
    }

    steps.push('risk', 'contact-phone')
    return steps
  }

  steps.push('planned-entry', 'goal', 'province', 'personal', 'early-signup')

  if (hasSpouse) {
    steps.push('spouse-language')
  }

  steps.push('language', 'education', 'work')

  const needsSettlementFunds =
    data.goal === 'pr' ||
    data.plannedEntry === 'express-entry' ||
    data.plannedEntry === 'pnp' ||
    data.hasJobOffer === 'no'

  if (needsSettlementFunds) {
    steps.push('settlement')
  }

  if (hasSpecificProvince) {
    steps.push('pnp-details')
  }

  if (isManitoba) {
    steps.push('manitoba-family')
  }

  steps.push('risk', 'contact-phone')
  return steps
}

export const stepTitles: Record<StepId, string> = {
  'location-split': 'Your location',
  'planned-entry': 'Your plan',
  'inside-status': 'Your status',
  goal: 'Your goal',
  province: 'Province',
  personal: 'Basic details',
  'early-signup': 'Save your results',
  'canada-dates': 'Canada dates',
  'pr-status': 'PR details',
  'spouse-language': 'Spouse details',
  language: 'Language',
  education: 'Education',
  work: 'Work experience',
  settlement: 'Settlement funds',
  'pnp-details': 'Provincial ties',
  'manitoba-family': 'Family in Manitoba',
  risk: 'Background check',
  'contact-phone': 'Get updates',
}