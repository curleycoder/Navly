export type PresenceData = {
  totalDays: number
  streak: number
  longestStreak: number
  lastCheckIn: string | null // 'YYYY-MM-DD'
}

const KEY = 'navly_presence'

export const EMPTY_PRESENCE: PresenceData = {
  totalDays: 0,
  streak: 0,
  longestStreak: 0,
  lastCheckIn: null,
}

function toDateStr(d: Date): string {
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

export function loadPresence(): PresenceData {
  if (typeof window === 'undefined') return EMPTY_PRESENCE
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return EMPTY_PRESENCE
    return { ...EMPTY_PRESENCE, ...(JSON.parse(raw) as Partial<PresenceData>) }
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
    totalDays: data.totalDays + 1,
    streak: newStreak,
    longestStreak: Math.max(data.longestStreak, newStreak),
    lastCheckIn: today,
  }
  savePresence(updated)
  return updated
}

export function isCheckedInToday(data: PresenceData): boolean {
  return data.lastCheckIn === todayStr()
}

// Days goal based on immigration goal
export function getPresenceGoal(goal: string): { days: number; label: string } | null {
  if (goal === 'citizenship') return { days: 1095, label: 'days required for citizenship (1,095 of 1,825)' }
  if (goal === 'pr') return { days: 365, label: 'days toward Canadian work experience (CEC)' }
  return null
}
