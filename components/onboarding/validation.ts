import type { StepId } from './flow'
import type { IntakeData } from '@/lib/profile'

export function getValidationHint(stepId: StepId, data: IntakeData): string {
  switch (stepId) {
    case 'location-split': return 'Select whether you are inside or outside Canada to continue.'
    case 'planned-entry': return 'Select your planned entry route to continue.'
    case 'inside-status': return 'Select your current immigration status to continue.'
    case 'goal': return 'Select your main immigration goal to continue.'
    case 'personal': {
      const age = parseInt(data.age)
      if (!data.age || isNaN(age) || age < 18 || age > 99) return 'Enter your age (must be 18–99).'
      if (!data.originCountry) return 'Select your country of citizenship.'
      if (!data.maritalStatus) return 'Select your marital status.'
      if ((data.maritalStatus === 'married' || data.maritalStatus === 'common-law') && !data.spouseComing) return 'Indicate whether your spouse is coming to Canada.'
      if (!data.canadianSibling) return 'Answer the Canadian sibling question.'
      return ''
    }
    case 'pr-status': {
      if (!data.prDate) return 'Enter the date you became a PR.'
      if (!data.prCardExpiry) return 'Enter your PR card expiry date.'
      if (!data.prPreStatus) return 'Select your status before becoming a PR.'
      if (!data.hasTraveledSincePR) return 'Indicate whether you have travelled outside Canada since becoming a PR.'
      if (!data.taxFilingComplete) return 'Answer the tax filing question.'
      if (!data.citizenshipProhibitions) return 'Answer the prohibitions question.'
      return ''
    }
    case 'canada-dates': {
      if (!data.arrivalDate) return 'Enter your arrival date in Canada.'
      if (!data.province) return 'Select your province or territory.'
      if (!data.visaExpiryDate) return 'Enter your visa or permit expiry date.'
      return ''
    }
    case 'spouse-language': {
      if (!data.spouseLangTestType) return "Select your spouse's language test type."
      if (!data.spouseEducationLevel) return "Select your spouse's education level."
      return ''
    }
    case 'language': {
      if (!data.firstOfficialLanguage) return 'Select your first official language (English or French).'
      if (!data.langTestType) return 'Select your language test type.'
      if (data.langTestType === 'none') return ''
      if (!data.langTestDate) return 'Enter the exact date you took the test.'
      if (!data.langReading || !data.langWriting || !data.langListening || !data.langSpeaking) return 'Enter all four test scores.'
      return ''
    }
    case 'education': {
      if (!data.educationLevel) return 'Select your highest level of education.'
      const isForeign = !['less-than-secondary', 'secondary'].includes(data.educationLevel)
      if (isForeign && !data.canadianEducation) return 'Indicate whether you have Canadian education.'
      if (isForeign && data.canadianEducation === 'none' && !data.ecaCompleted) return 'Indicate whether your ECA is completed.'
      return ''
    }
    case 'work': {
      if (!data.teerLevel) return 'Select your TEER level.'
      const isInside = data.locationStatus === 'inside'
      if (isInside && data.status === 'student' && !data.programLevel) return 'Select your program level.'
      if (isInside && data.status === 'work-permit' && !data.workPermitType) return 'Select your work permit type.'
      if (!data.hasJobOffer) return 'Indicate whether you have a Canadian job offer.'
      return ''
    }
    case 'settlement': return 'Enter your family size to continue.'
    case 'risk': {
      if (!data.previousRefusals) return 'Answer the visa refusals question.'
      if (!data.lostStatus) return 'Answer the lost status question.'
      if (!data.criminalityIssues) return 'Answer the criminality question.'
      if (!data.removalOrder) return 'Answer the removal order question.'
      if (!data.medicalInadmissibility) return 'Answer the medical inadmissibility question.'
      return ''
    }
    case 'province': {
      if (!data.intendedProvince) return data.locationStatus === 'inside' ? 'Choose whether you are staying or moving province.' : 'Select your intended province.'
      if (data.locationStatus === 'outside' && !data.targetArrivalTimeline) return 'Select your planned arrival timeline.'
      return ''
    }
    case 'pnp-details': {
      if (!data.workExpInTargetProvince) return 'Indicate whether you have work experience in your target province.'
      if (!data.ruralCommunityInterest) return 'Indicate your interest in rural or smaller community settlement.'
      return ''
    }
    default: return ''
  }
}

export function canContinue(stepId: StepId, data: IntakeData): boolean {
  switch (stepId) {
    case 'location-split': return !!data.locationStatus
    case 'planned-entry': return !!data.plannedEntry
    case 'inside-status': return !!data.status
    case 'goal': return !!data.goal
    case 'personal': {
      const age = parseInt(data.age)
      if (isNaN(age) || age < 18 || age > 99) return false
      if (!data.originCountry) return false
      if (!data.maritalStatus) return false
      if ((data.maritalStatus === 'married' || data.maritalStatus === 'common-law') && !data.spouseComing) return false
      if (!data.canadianSibling) return false
      return true
    }
    case 'pr-status': {
      const age = parseInt(data.age) || 0
      const needsLangProof = age >= 18 && age <= 54
      return !!data.prDate && !!data.prCardExpiry && !!data.prPreStatus &&
        !!data.hasTraveledSincePR && !!data.taxFilingComplete && !!data.citizenshipProhibitions &&
        (!needsLangProof || !!data.citizenshipLangProof)
    }
    case 'canada-dates': return !!data.arrivalDate && !!data.province && !!data.visaExpiryDate
    case 'spouse-language': return !!data.spouseLangTestType && !!data.spouseEducationLevel
    case 'language': {
      if (!data.firstOfficialLanguage) return false
      if (!data.langTestType) return false
      if (data.langTestType === 'none') return true
      return !!(data.langTestDate && data.langReading && data.langWriting && data.langListening && data.langSpeaking)
    }
    case 'education': {
      if (!data.educationLevel) return false
      const isForeign = !['less-than-secondary', 'secondary'].includes(data.educationLevel)
      if (isForeign && !data.canadianEducation) return false
      if (isForeign && data.canadianEducation === 'none' && !data.ecaCompleted) return false
      return true
    }
    case 'work': {
      if (!data.teerLevel) return false
      const isInside = data.locationStatus === 'inside'
      if (isInside && data.status === 'student') return !!data.programLevel
      if (isInside && data.status === 'work-permit') return !!data.workPermitType
      return !!data.hasJobOffer
    }
    case 'settlement': return !!data.familySize
    case 'risk': return !!data.previousRefusals && !!data.lostStatus && !!data.criminalityIssues && !!data.removalOrder && !!data.medicalInadmissibility
    case 'province': {
      if (!data.intendedProvince) return false
      if (data.locationStatus === 'outside') return !!data.targetArrivalTimeline
      return true
    }
    case 'pnp-details': return !!data.workExpInTargetProvince && !!data.ruralCommunityInterest
    case 'manitoba-family': return !!data.manitobaFamilyRelative
    case 'early-signup': return false
    default: return false
  }
}
