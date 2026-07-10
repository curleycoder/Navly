export type CRSAgeRow = {
  from: number
  to: number
  noSpouse: number
  withSpouse: number
}

export type CRSTableData = {
  /** Age point rows, checked in order. Ages outside all rows score 0. */
  age: CRSAgeRow[]

  education: {
    noSpouse: Record<string, number>
    withSpouse: Record<string, number>
  }

  /**
   * Per-skill language points. Rows are ordered high-to-low CLB.
   * minCLB = minimum CLB to qualify for that row's points.
   */
  firstLanguageSkill: { minCLB: number; noSpouse: number; withSpouse: number }[]

  /**
   * canadianWork[years] = points, where years = Math.min(floor(months/12), 5).
   * Index 0 = 0 years, index 5 = 5+ years.
   */
  canadianWork: {
    noSpouse: number[]
    withSpouse: number[]
  }

  skillTransferability: {
    advancedEducation: string[]
    anyPostEducation: string[]
    /**
     * Each tuple is [highA+highB, highA+lowB, lowA+highB, lowA+lowB] = points.
     * For education+language: highA=advancedEdu, highB=CLB9+, lowA=anyPost, lowB=CLB7-8.
     * For education+canadian: highA=advancedEdu, highB=2+yrs, lowA=anyPost, lowB=1yr.
     * For foreign+language:   highA=3+yrs,       highB=CLB9+, lowA=1+yr,   lowB=CLB7-8.
     * For foreign+canadian:   highA=3+yrs,       highB=2+yrs, lowA=1+yr,   lowB=1yr.
     */
    educationLanguage: [number, number, number, number]
    educationCanadian: [number, number, number, number]
    foreignLanguage:   [number, number, number, number]
    foreignCanadian:   [number, number, number, number]
    maxPerCategory: number
    maxTotal: number
  }

  additional: {
    /** Arranged employment (job offer) points. Zeroed as of 2025-03-25. */
    arrangedEmployment: { teer01: number; teer23: number }
    canadianEducation: { oneToTwo: number; threePlus: number }
    sibling: number
    pnpNomination: number
  }
}
