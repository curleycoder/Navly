// Rough CRS estimator — uses the shared crs-tables as scoring.ts does, but
// only needs the 5 fields collected in StepQuickCRS (no real test scores).
// Returns a ±30 band to acknowledge the approximation.
//
// Key assumptions (documented so users aren't misled):
// - selfReportedCLB is applied uniformly to all 4 language skills
// - married/common-law users are treated as if spouse is coming to Canada
// - foreign work years used for skill transferability; Canadian months only
//   known for inside-Canada workers (derived from foreignWorkYears × 12)

import type { IntakeData } from './profile'
import {
  crsAgePts,
  crsEducationPts,
  crsFirstLangSkillPts,
  crsCanadianWorkPts,
  crsSkillTransferabilityPts,
} from './crs-tables'

export function roughCRS(data: IntakeData): { low: number; high: number } | null {
  const age = parseInt(data.age)
  const clb = parseInt(data.selfReportedCLB)
  if (!data.educationLevel || isNaN(clb) || clb < 4 || isNaN(age) || age < 18) return null

  const hasSpouse = data.maritalStatus === 'married' || data.maritalStatus === 'common-law'

  const agePts  = crsAgePts(age, hasSpouse)
  const eduPts  = crsEducationPts(data.educationLevel, hasSpouse)
  const langPts = crsFirstLangSkillPts(clb, hasSpouse) * 4  // same CLB for all 4 skills

  // For inside workers, treat their reported work years as Canadian months
  const isInsideWorker = data.locationStatus === 'inside' &&
    ['work-permit', 'pgwp', 'open-work-permit', 'employer-specific-work-permit'].includes(data.status)
  const workYears = parseFloat(data.foreignWorkYears) || 0
  const canMonths = isInsideWorker ? workYears * 12 : parseFloat(data.canadianWorkMonths) || 0
  const workPts  = crsCanadianWorkPts(canMonths, hasSpouse)

  const skillPts = crsSkillTransferabilityPts(data.educationLevel, clb, workYears, canMonths)

  const base = agePts + eduPts + langPts + workPts + skillPts
  return { low: Math.max(base - 30, 0), high: base + 30 }
}
