#!/usr/bin/env ts-node
/**
 * Add a new Express Entry draw to lib/draws.ts
 *
 * Usage:
 *   npx ts-node scripts/add-draw.ts --type "Canadian Experience Class" --date "Jun 18, 2026" --cutoff 512 --invited 1200
 *
 * Supported --type values:
 *   "All programs"
 *   "Canadian Experience Class"
 *   "Federal Skilled Worker"
 *   "Provincial Nominee Program"
 *
 * After running, git diff lib/draws.ts to verify, then commit.
 * IRCC source: canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/submit-profile/rounds-invitations.html
 */

import fs from 'fs'
import path from 'path'

const DRAWS_FILE = path.join(__dirname, '../lib/draws.ts')

function parseArgs(): { type: string; date: string; cutoff: number; invited?: number } {
  const args = process.argv.slice(2)
  const get = (flag: string) => {
    const i = args.indexOf(flag)
    return i !== -1 ? args[i + 1] : undefined
  }

  const type = get('--type')
  const date = get('--date')
  const cutoffStr = get('--cutoff')
  const invitedStr = get('--invited')

  if (!type || !date || !cutoffStr) {
    console.error('Usage: npx ts-node scripts/add-draw.ts --type "<type>" --date "<date>" --cutoff <number> [--invited <number>]')
    console.error('Example: npx ts-node scripts/add-draw.ts --type "All programs" --date "Jun 18, 2026" --cutoff 491 --invited 4500')
    process.exit(1)
  }

  const validTypes = ['All programs', 'Canadian Experience Class', 'Federal Skilled Worker', 'Provincial Nominee Program', 'French Language Proficiency']
  if (!validTypes.includes(type)) {
    console.error(`Invalid --type. Must be one of:\n  ${validTypes.join('\n  ')}`)
    process.exit(1)
  }

  return {
    type,
    date,
    cutoff: parseInt(cutoffStr, 10),
    invited: invitedStr ? parseInt(invitedStr, 10) : undefined,
  }
}

function main() {
  const { type, date, cutoff, invited } = parseArgs()

  const source = fs.readFileSync(DRAWS_FILE, 'utf8')

  // Update DRAWS_LAST_UPDATED — convert "Jun 18, 2026" → "2026-06-18"
  const dateObj = new Date(date)
  if (isNaN(dateObj.getTime())) {
    console.error(`Could not parse date: "${date}". Use a format like "Jun 18, 2026".`)
    process.exit(1)
  }
  const isoDate = dateObj.toISOString().slice(0, 10)

  // Build the new row string (match existing indentation style)
  const invitedStr = invited !== undefined ? `, invited: ${invited}` : ''
  const typeCol = type.padEnd(36)
  const newRow = `  { date: '${date}',${' '.repeat(Math.max(1, 15 - date.length))}type: '${typeCol}', cutoff: ${cutoff}${invitedStr} },`

  // Insert after the opening of the recentDraws array
  const ARRAY_OPEN = 'export const recentDraws: EEDraw[] = ['
  const insertIdx = source.indexOf(ARRAY_OPEN)
  if (insertIdx === -1) {
    console.error('Could not find recentDraws array in lib/draws.ts')
    process.exit(1)
  }
  const afterOpen = insertIdx + ARRAY_OPEN.length

  // Replace DRAWS_LAST_UPDATED
  const updated = source
    .replace(/export const DRAWS_LAST_UPDATED = '[^']*'/, `export const DRAWS_LAST_UPDATED = '${isoDate}'`)
    .slice(0, afterOpen) + '\n' + newRow + source.slice(afterOpen)

  fs.writeFileSync(DRAWS_FILE, updated, 'utf8')

  console.log(`✓ Added draw: ${date} — ${type} — cutoff ${cutoff}${invited ? ` (${invited.toLocaleString()} invited)` : ''}`)
  console.log(`✓ Updated DRAWS_LAST_UPDATED → ${isoDate}`)
  console.log(`\nNext steps:`)
  console.log(`  git diff lib/draws.ts   # verify the row looks right`)
  console.log(`  git add lib/draws.ts && git commit -m "draws: ${date} ${type} cutoff ${cutoff}"`)
}

main()
