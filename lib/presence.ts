export type TravelEntry = {
  id: string
  departureDate: string  // 'YYYY-MM-DD'
  returnDate: string     // 'YYYY-MM-DD' — empty string if still away
  country: string
  reason: string
}

export type PresenceData = {
  totalDays: number
  streak: number
  longestStreak: number
  lastCheckIn: string | null       // 'YYYY-MM-DD' — last day confirmed as "in Canada"
  lastAcknowledgedDate: string | null // 'YYYY-MM-DD' — last day answered (yes or no)
  arrivalDate: string | null       // 'YYYY-MM-DD' — when user first arrived
  travelLog: TravelEntry[]
}

const KEY = 'navly_presence'

export const EMPTY_PRESENCE: PresenceData = {
  totalDays: 0,
  streak: 0,
  longestStreak: 0,
  lastCheckIn: null,
  lastAcknowledgedDate: null,
  arrivalDate: null,
  travelLog: [],
}

export function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export function todayStr(): string {
  return toDateStr(new Date())
}

function yesterdayStr(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return toDateStr(d)
}

function daysBetween(a: string, b: string): number {
  return Math.floor((new Date(b).getTime() - new Date(a).getTime()) / (1000 * 60 * 60 * 24))
}

export function loadPresence(): PresenceData {
  if (typeof window === 'undefined') return EMPTY_PRESENCE
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return EMPTY_PRESENCE
    const parsed = JSON.parse(raw) as Partial<PresenceData>
    return {
      ...EMPTY_PRESENCE,
      ...parsed,
      travelLog: parsed.travelLog ?? [],
    }
  } catch {
    return EMPTY_PRESENCE
  }
}

// ─── Supabase sync ────────────────────────────────────────────────────────────
// Saves presence data to profiles.presence_data so users don't lose their
// streak and travel log when switching devices or clearing the browser.

export async function syncPresenceToSupabase(userId: string, data: PresenceData): Promise<void> {
  try {
    const { supabase } = await import('./supabase/client')
    await supabase
      .from('profiles')
      .update({ presence_data: data })
      .eq('id', userId)
  } catch {
    // Non-fatal — localStorage is the primary store; DB is the backup
  }
}

// Returns presence data from the database, or null if none exists yet.
// Used as a fallback when localStorage is empty (e.g. new device).
export async function loadPresenceFromSupabase(userId: string): Promise<PresenceData | null> {
  try {
    const { supabase } = await import('./supabase/client')
    const { data } = await supabase
      .from('profiles')
      .select('presence_data')
      .eq('id', userId)
      .maybeSingle()
    if (!data?.presence_data || Object.keys(data.presence_data).length === 0) return null
    return { ...EMPTY_PRESENCE, ...(data.presence_data as Partial<PresenceData>), travelLog: (data.presence_data as Partial<PresenceData>).travelLog ?? [] }
  } catch {
    return null
  }
}

// Advance a YYYY-MM-DD date string by one day
function addOneDay(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  d.setDate(d.getDate() + 1)
  return toDateStr(d)
}

export function savePresence(data: PresenceData) {
  if (typeof window === 'undefined') return
  localStorage.setItem(KEY, JSON.stringify(data))
}

export function checkIn(): PresenceData {
  const data = loadPresence()
  const today = todayStr()
  if (data.lastCheckIn === today) return data

  const newStreak = data.lastCheckIn === yesterdayStr() ? data.streak + 1 : 1
  const updated: PresenceData = {
    ...data,
    totalDays: data.totalDays + 1,
    streak: newStreak,
    longestStreak: Math.max(data.longestStreak, newStreak),
    lastCheckIn: today,
    lastAcknowledgedDate: today,
  }
  savePresence(updated)
  return updated
}

// Returns the list of unconfirmed days between last acknowledged date and yesterday,
// capped at 30 to avoid overwhelming the user after a long absence.
// Never returns dates before the user's arrival date — arrival date is the earliest
// possible day in Canada and pre-arrival prompts would be meaningless.
export function getMissedDays(data: PresenceData): string[] {
  const baseline = data.lastAcknowledgedDate ?? data.lastCheckIn
  if (!baseline) return []
  const yesterday = yesterdayStr()
  if (baseline >= yesterday) return []

  // Start the day after the last acknowledged date, but never before arrival
  let current = addOneDay(baseline)
  if (data.arrivalDate && current < data.arrivalDate) {
    current = data.arrivalDate
  }

  const missed: string[] = []
  while (current <= yesterday && missed.length < 30) {
    missed.push(current)
    current = addOneDay(current)
  }
  return missed
}

// Confirm a specific past date as "in Canada".
// Extends the streak only if this date is consecutive with lastCheckIn.
export function confirmMissedDay(date: string): PresenceData {
  const data = loadPresence()
  const isConsecutive = data.lastCheckIn !== null && addOneDay(data.lastCheckIn) === date
  const newStreak = isConsecutive ? data.streak + 1 : data.streak
  const updated: PresenceData = {
    ...data,
    totalDays: data.totalDays + 1,
    streak: newStreak,
    longestStreak: Math.max(data.longestStreak, newStreak),
    lastCheckIn: isConsecutive ? date : data.lastCheckIn,
    lastAcknowledgedDate: date,
  }
  savePresence(updated)
  return updated
}

// Decline a specific past date as "not in Canada".
// Breaks the streak if the decline falls on the next expected consecutive day.
export function declineMissedDay(date: string): PresenceData {
  const data = loadPresence()
  const isConsecutive = data.lastCheckIn !== null && addOneDay(data.lastCheckIn) === date
  const updated: PresenceData = {
    ...data,
    streak: isConsecutive ? 0 : data.streak,
    lastAcknowledgedDate: date,
  }
  savePresence(updated)
  return updated
}

// Set/update arrival date
export function setArrivalDate(date: string): PresenceData {
  const data = loadPresence()
  const updated: PresenceData = { ...data, arrivalDate: date }
  savePresence(updated)
  return updated
}

// Add a travel entry (trip outside Canada)
export function addTravel(entry: Omit<TravelEntry, 'id'>): PresenceData {
  const data = loadPresence()
  const newEntry: TravelEntry = { ...entry, id: `travel-${Date.now()}` }
  const updated: PresenceData = { ...data, travelLog: [...data.travelLog, newEntry] }
  savePresence(updated)
  return updated
}

// Remove a travel entry
export function removeTravel(id: string): PresenceData {
  const data = loadPresence()
  const updated: PresenceData = {
    ...data,
    travelLog: data.travelLog.filter((e) => e.id !== id),
  }
  savePresence(updated)
  return updated
}

// Calculate total days outside Canada from travel log.
// Counts departure → return (exclusive of return day, matching IRCC convention).
export function getTravelDays(travelLog: TravelEntry[]): number {
  return travelLog.reduce((sum, entry) => {
    if (!entry.departureDate) return sum
    const end = entry.returnDate || todayStr()
    const days = Math.max(0, daysBetween(entry.departureDate, end))
    return sum + days
  }, 0)
}

// Total calendar days from arrival date to today, inclusive of arrival day.
export function getDaysSinceArrival(data: PresenceData): number {
  if (!data.arrivalDate) return 0
  const today = todayStr()
  if (data.arrivalDate > today) return 0
  return daysBetween(data.arrivalDate, today) + 1
}

// Exact days physically in Canada = days from arrival through yesterday + today if checked in.
// Today is only credited after the user checks in — this makes the check-in button
// visually add +1 to the counter, which matches user expectations.
export function getDaysInCanada(data: PresenceData): number {
  if (!data.arrivalDate) return 0
  const today = todayStr()
  if (data.arrivalDate > today) return 0

  // Count completed days: arrival through yesterday (inclusive)
  const d = new Date(today + 'T12:00:00')
  d.setDate(d.getDate() - 1)
  const yesterday = toDateStr(d)

  let confirmed = 0
  if (data.arrivalDate <= yesterday) {
    confirmed = daysBetween(data.arrivalDate, yesterday) + 1
  }

  // Credit today only if checked in
  if (data.lastCheckIn === today) confirmed += 1

  return Math.max(0, confirmed - getTravelDays(data.travelLog))
}

export function isCheckedInToday(data: PresenceData): boolean {
  return data.lastCheckIn === todayStr()
}

// Compute consecutive days in Canada right now, based on arrival date and travel log.
// Does not depend on manual check-ins — counts every day since arrival that wasn't a travel day.
// Returns 0 if no arrival date or if user is currently on a trip.
export function computeStreak(data: PresenceData): number {
  if (!data.arrivalDate) return 0
  const today = todayStr()
  if (data.arrivalDate > today) return 0

  // If there is an ongoing (open-ended) trip, user is currently away
  const ongoingTrip = data.travelLog.find((e) => e.departureDate && !e.returnDate)
  if (ongoingTrip) return 0

  let streak = 0
  let current = today

  while (current >= data.arrivalDate) {
    const isAway = data.travelLog.some((entry) => {
      if (!entry.departureDate) return false
      const end = entry.returnDate || today
      return current >= entry.departureDate && current < end
    })
    if (isAway) break
    streak++
    const d = new Date(current + 'T12:00:00')
    d.setDate(d.getDate() - 1)
    current = d.toISOString().slice(0, 10)
  }

  return streak
}


export function getPresenceGoal(goal: string): { days: number; label: string } | null {
  if (goal === 'citizenship') return { days: 1095, label: 'Citizenship — 1,095 days in Canada within 5 years as a PR' }
  if (goal === 'pr') return { days: 365, label: 'PR (CEC) — 12 months of Canadian work experience' }
  return null
}
