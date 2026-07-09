// Shared CRS point tables — single source of truth for scoring.ts and rough estimates.
// When IRCC updates the CRS grid, update here only.

export function crsAgePts(age: number, hasSpouse: boolean): number {
  if (!hasSpouse) {
    if (age >= 20 && age <= 29) return 110
    if (age === 19) return 105; if (age === 18) return 99
    if (age === 30) return 105; if (age === 31) return 99; if (age === 32) return 94
    if (age === 33) return 88;  if (age === 34) return 83; if (age === 35) return 77
    if (age === 36) return 72;  if (age === 37) return 66; if (age === 38) return 61
    if (age === 39) return 55;  if (age === 40) return 50; if (age === 41) return 39
    if (age === 42) return 28;  if (age === 43) return 17; if (age === 44) return 6
    return 0
  } else {
    if (age >= 20 && age <= 29) return 100
    if (age === 19) return 95;  if (age === 18) return 90
    if (age === 30) return 95;  if (age === 31) return 90; if (age === 32) return 85
    if (age === 33) return 80;  if (age === 34) return 75; if (age === 35) return 70
    if (age === 36) return 65;  if (age === 37) return 60; if (age === 38) return 55
    if (age === 39) return 50;  if (age === 40) return 45; if (age === 41) return 35
    if (age === 42) return 25;  if (age === 43) return 15; if (age === 44) return 5
    return 0
  }
}

export function crsEducationPts(level: string, hasSpouse: boolean): number {
  const noSpouse: Record<string, number> = {
    'less-than-secondary': 0, secondary: 30,
    '1-year': 90, '2-year': 98, bachelors: 120,
    'two-credentials': 128, masters: 135, professional: 135, doctoral: 150,
  }
  const withSpouse: Record<string, number> = {
    'less-than-secondary': 0, secondary: 28,
    '1-year': 84, '2-year': 91, bachelors: 112,
    'two-credentials': 119, masters: 126, professional: 126, doctoral: 140,
  }
  return hasSpouse ? (withSpouse[level] ?? 0) : (noSpouse[level] ?? 0)
}

// Points per individual language skill (reading / writing / listening / speaking).
// Multiply by 4 to get the total first-language score when all skills are at the same CLB.
export function crsFirstLangSkillPts(clb: number, hasSpouse: boolean): number {
  if (!hasSpouse) {
    if (clb >= 10) return 34; if (clb === 9) return 31; if (clb === 8) return 23
    if (clb === 7) return 17; if (clb === 6) return 9;  if (clb >= 4) return 6
    return 0
  } else {
    if (clb >= 10) return 32; if (clb === 9) return 29; if (clb === 8) return 22
    if (clb === 7) return 16; if (clb === 6) return 8;  if (clb >= 4) return 6
    return 0
  }
}

export function crsCanadianWorkPts(months: number, hasSpouse: boolean): number {
  const years = Math.min(Math.floor(months / 12), 5)
  const noSpouse  = [0, 40, 53, 64, 72, 80]
  const withSpouse = [0, 35, 46, 56, 63, 70]
  return (hasSpouse ? withSpouse : noSpouse)[years] ?? 0
}

// Skill transferability — mirrors the exact IRCC formula used in scoring.ts.
// clb is the minimum CLB across all 4 language skills (or self-reported level).
// foreignWorkYears is total skilled work years outside Canada.
// canadianWorkMonths is months of skilled Canadian work.
export function crsSkillTransferabilityPts(
  educationLevel: string,
  clb: number,
  foreignWorkYears: number,
  canadianWorkMonths: number,
): number {
  const canYears = Math.floor(canadianWorkMonths / 12)
  const advEdu  = ['bachelors', 'two-credentials', 'masters', 'professional', 'doctoral'].includes(educationLevel)
  const anyPost = ['1-year', '2-year', 'bachelors', 'two-credentials', 'masters', 'professional', 'doctoral'].includes(educationLevel)
  const hasCLB9 = clb >= 9
  const hasCLB7 = clb >= 7

  // Education + Language (max 50)
  let el = 0
  if      (advEdu && hasCLB9)  el = 50
  else if (advEdu && hasCLB7)  el = 25
  else if (anyPost && hasCLB9) el = 25
  else if (anyPost && hasCLB7) el = 13

  // Education + Canadian experience (max 50)
  let ec = 0
  if      (advEdu && canYears >= 2)  ec = 50
  else if (advEdu && canYears >= 1)  ec = 25
  else if (anyPost && canYears >= 2) ec = 25
  else if (anyPost && canYears >= 1) ec = 13

  // Foreign work + Language (max 50)
  let fl = 0
  if      (foreignWorkYears >= 3 && hasCLB9) fl = 50
  else if (foreignWorkYears >= 3 && hasCLB7) fl = 25
  else if (foreignWorkYears >= 1 && hasCLB9) fl = 25
  else if (foreignWorkYears >= 1 && hasCLB7) fl = 13

  // Foreign work + Canadian experience (max 50)
  let fc = 0
  if      (foreignWorkYears >= 3 && canYears >= 2) fc = 50
  else if (foreignWorkYears >= 3 && canYears >= 1) fc = 25
  else if (foreignWorkYears >= 1 && canYears >= 2) fc = 25
  else if (foreignWorkYears >= 1 && canYears >= 1) fc = 13

  return Math.min(Math.min(el + ec, 50) + Math.min(fl + fc, 50), 100)
}
