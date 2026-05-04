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
  lastCheckIn: string | null  // 'YYYY-MM-DD'
  arrivalDate: string | null  // 'YYYY-MM-DD' — when user first arrived
  travelLog: TravelEntry[]
}

const KEY = 'navly_presence'

export const EMPTY_PRESENCE: PresenceData = {
  totalDays: 0,
  streak: 0,
  longestStreak: 0,
  lastCheckIn: null,
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
  }
  savePresence(updated)
  return updated
}

// Retroactive check-in for yesterday (missed check-in recovery)
// Restores the streak if called the next morning; only counts today's totalDays once
export function checkInYesterday(): PresenceData {
  const data = loadPresence()
  const yesterday = yesterdayStr()

  // Already checked in yesterday or today — nothing to do
  if (data.lastCheckIn === yesterday || data.lastCheckIn === todayStr()) return data

  // Restore streak: if they last checked in the day before yesterday, it's still consecutive
  const dayBeforeYesterday = toDateStr(new Date(new Date().setDate(new Date().getDate() - 2)))
  const newStreak = data.lastCheckIn === dayBeforeYesterday ? data.streak + 1 : 1
  const updated: PresenceData = {
    ...data,
    totalDays: data.totalDays + 1,
    streak: newStreak,
    longestStreak: Math.max(data.longestStreak, newStreak),
    lastCheckIn: yesterday,
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

// Exact days physically in Canada = days since arrival minus days abroad.
// This is the authoritative number for PR / citizenship planning.
export function getDaysInCanada(data: PresenceData): number {
  const total = getDaysSinceArrival(data)
  if (total === 0) return 0
  return Math.max(0, total - getTravelDays(data.travelLog))
}

export function isCheckedInToday(data: PresenceData): boolean {
  return data.lastCheckIn === todayStr()
}

export function missedYesterday(data: PresenceData): boolean {
  const yesterday = yesterdayStr()
  return data.lastCheckIn !== yesterday && data.lastCheckIn !== todayStr()
}

export function getPresenceGoal(goal: string): { days: number; label: string } | null {
  if (goal === 'citizenship') return { days: 1095, label: 'Citizenship — 1,095 days in Canada within 5 years as a PR' }
  if (goal === 'pr') return { days: 365, label: 'PR (CEC) — 12 months of Canadian work experience' }
  return null
}
