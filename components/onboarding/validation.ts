import type { StepId } from './flow'
import type { IntakeData } from '@/lib/profile'

export function getValidationHint(stepId: StepId, data: IntakeData): string {
  switch (stepId) {
    case 'goal-first':     return 'Select what you need help with to continue.'
    case 'location-split': return 'Select whether you are inside or outside Canada to continue.'
    case 'planned-entry':  return 'Select your planned entry route to continue.'
    case 'inside-status':  return 'Select your current immigration status to continue.'
    case 'key-date':       return ''
    case 'quick-crs': {
      const age = parseInt(data.age)
      if (!data.age || isNaN(age) || age < 18 || age > 99) return 'Enter your age (18–99) to continue.'
      if (!data.educationLevel) return 'Select your education level to continue.'
      if (!data.selfReportedCLB) return 'Select your language level to continue.'
      if (!data.maritalStatus) return 'Select your marital status to continue.'
      return ''
    }
    case 'plan-preview':  return ''
    case 'early-signup':  return ''
    default: return ''
  }
}

export function canContinue(stepId: StepId, data: IntakeData): boolean {
  switch (stepId) {
    case 'goal-first':     return !!data.primaryUse
    case 'location-split': return !!data.locationStatus
    case 'planned-entry':  return !!data.plannedEntry
    case 'inside-status':  return !!data.status
    case 'key-date':       return true   // date is optional — always continuable
    case 'quick-crs': {
      const age = parseInt(data.age)
      return !isNaN(age) && age >= 18 && age <= 99 &&
        !!data.educationLevel && !!data.selfReportedCLB && !!data.maritalStatus
    }
    case 'plan-preview':  return false   // custom nav (onSave button) handles progression
    case 'early-signup':  return false   // custom nav handles progression
    default: return false
  }
}
