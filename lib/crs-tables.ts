import { getActiveRule } from '../rules/loader'
import { crsVersions } from '../rules/crs'

// Resolved once at module load using today's date.
// When IRCC changes the CRS grid, add a new version file under rules/crs/ — no changes needed here.
const { data: CRS } = getActiveRule(crsVersions)

export function crsAgePts(age: number, hasSpouse: boolean): number {
  const row = CRS.age.find(r => age >= r.from && age <= r.to)
  return row ? (hasSpouse ? row.withSpouse : row.noSpouse) : 0
}

export function crsEducationPts(level: string, hasSpouse: boolean): number {
  return hasSpouse ? (CRS.education.withSpouse[level] ?? 0) : (CRS.education.noSpouse[level] ?? 0)
}

// Points per individual language skill (reading / writing / listening / speaking).
// Multiply by 4 to get the total first-language score when all skills are at the same CLB.
export function crsFirstLangSkillPts(clb: number, hasSpouse: boolean): number {
  const row = CRS.firstLanguageSkill.find(r => clb >= r.minCLB)
  return row ? (hasSpouse ? row.withSpouse : row.noSpouse) : 0
}

export function crsCanadianWorkPts(months: number, hasSpouse: boolean): number {
  const years = Math.min(Math.floor(months / 12), 5)
  return (hasSpouse ? CRS.canadianWork.withSpouse : CRS.canadianWork.noSpouse)[years] ?? 0
}

// Skill transferability — mirrors the exact IRCC formula.
// clb is the minimum CLB across all 4 language skills.
// foreignWorkYears is total skilled work years outside Canada.
// canadianWorkMonths is months of skilled Canadian work.
export function crsSkillTransferabilityPts(
  educationLevel: string,
  clb: number,
  foreignWorkYears: number,
  canadianWorkMonths: number,
): number {
  const { skillTransferability: st } = CRS
  const canYears = Math.floor(canadianWorkMonths / 12)
  const advEdu  = st.advancedEducation.includes(educationLevel)
  const anyPost = st.anyPostEducation.includes(educationLevel)
  const hasCLB9 = clb >= 9
  const hasCLB7 = clb >= 7

  // Picks the right point value from a [highA+highB, highA+lowB, lowA+highB, lowA+lowB] tuple.
  // highA takes priority over lowA when both are true (e.g. advEdu ⊂ anyPost).
  function pick(
    table: [number, number, number, number],
    highA: boolean, lowA: boolean,
    highB: boolean, lowB: boolean,
  ): number {
    if (highA && highB) return table[0]
    if (highA && lowB)  return table[1]
    if (lowA  && highB) return table[2]
    if (lowA  && lowB)  return table[3]
    return 0
  }

  const el = pick(st.educationLanguage, advEdu, anyPost, hasCLB9, hasCLB7)
  const ec = pick(st.educationCanadian, advEdu, anyPost, canYears >= 2, canYears >= 1)
  const fl = pick(st.foreignLanguage,   foreignWorkYears >= 3, foreignWorkYears >= 1, hasCLB9, hasCLB7)
  const fc = pick(st.foreignCanadian,   foreignWorkYears >= 3, foreignWorkYears >= 1, canYears >= 2, canYears >= 1)

  return Math.min(Math.min(el + ec, st.maxPerCategory) + Math.min(fl + fc, st.maxPerCategory), st.maxTotal)
}

/** Exposes the additional-points config for use in scoring.ts additionalPts(). */
export function getCRSAdditional() {
  return CRS.additional
}
