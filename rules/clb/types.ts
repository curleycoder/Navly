/** Lookup table for one language skill: [minScore, clbEquivalent][]. Checked top-to-bottom. */
export type CLBSkillTable = [number, number][]

export type CLBTableData = {
  ieltsGeneral: { r: CLBSkillTable; w: CLBSkillTable; l: CLBSkillTable; s: CLBSkillTable }
  pteCore:      { r: CLBSkillTable; w: CLBSkillTable; l: CLBSkillTable; s: CLBSkillTable }
  tef:          { r: CLBSkillTable; w: CLBSkillTable; l: CLBSkillTable; s: CLBSkillTable }
  tcf:          { r: CLBSkillTable; w: CLBSkillTable; l: CLBSkillTable; s: CLBSkillTable }
  /** CELPIP: raw score maps 1:1 to CLB, floored and clamped to [min, max]. */
  celpip: { min: number; max: number }
}
