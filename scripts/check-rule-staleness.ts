/**
 * Checks all versioned IRCC rule sets for staleness.
 * A rule is stale if verifiedDate is more than 90 days ago.
 *
 * Run manually:   npx tsx scripts/check-rule-staleness.ts
 * Run in CI:      add to your CI pipeline; exits 1 if any rule is stale.
 */

import { isStale } from '../rules/loader'
import { crsVersions } from '../rules/crs'
import { clbVersions } from '../rules/clb'
import type { VersionedRule } from '../rules/types'

const rulesets: { name: string; rule: VersionedRule<unknown> }[] = [
  ...crsVersions.map(r => ({ name: `crs@${r.effectiveDate}`, rule: r as VersionedRule<unknown> })),
  ...clbVersions.map(r => ({ name: `clb@${r.effectiveDate}`, rule: r as VersionedRule<unknown> })),
]

let anyStale = false

for (const { name, rule } of rulesets) {
  if (isStale(rule)) {
    console.error(`STALE  ${name}  — verifiedDate ${rule.verifiedDate} is >90 days old. Re-verify against ${rule.sourceUrl}`)
    anyStale = true
  } else {
    console.log(`OK     ${name}  — verified ${rule.verifiedDate}`)
  }
}

if (anyStale) {
  console.error('\nOne or more rule sets need re-verification. Update verifiedDate in the rule file after confirming the values match the official source.')
  process.exit(1)
}
