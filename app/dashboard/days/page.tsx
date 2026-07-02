'use client'

import { useEffect, useState } from 'react'
import { Flame, CalendarCheck, Target, Plane, PlusCircle, Trash2, MapPin, AlertTriangle, Info } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { loadProfile } from '@/lib/profile'
import {
  EMPTY_PRESENCE,
  loadPresence,
  checkIn,
  confirmMissedDay,
  declineMissedDay,
  getMissedDays,
  isCheckedInToday,
  setArrivalDate,
  addTravel,
  removeTravel,
  getTravelDays,
  getDaysInCanada,
  getDaysSinceArrival,
  computeStreak,
  getPresenceGoal,
  syncPresence,
  syncPresenceToSupabase,
  type PresenceData,
  type TravelEntry,
} from '@/lib/presence'
import { syncProfile } from '@/lib/profile'
import { supabase } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { useLocale } from '@/lib/i18n'

export default function DaysPage() {
  const { t } = useLocale()
  const [presence, setPresence] = useState<PresenceData>(EMPTY_PRESENCE)
  const [missedDays, setMissedDays] = useState<string[]>([])
  const [goal, setGoal] = useState<{ days: number; label: string } | null>(null)
  const [checkedIn, setCheckedIn] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [newTrip, setNewTrip] = useState({ departureDate: '', returnDate: '', country: '', reason: '' })

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      const uid = user?.id ?? null
      setUserId(uid)

      // Sync profile for goal display
      const profile = uid ? await syncProfile(uid) : loadProfile()
      if (profile?.goal) setGoal(getPresenceGoal(profile.goal))

      // Sync presence — merges local and cloud, resolves conflicts by timestamp
      let data = uid ? await syncPresence(uid) : loadPresence()

      // Seed arrival date from profile if not set in presence tracker
      if (!data.arrivalDate && profile?.arrivalDate) {
        data = setArrivalDate(profile.arrivalDate)
        if (uid) syncPresenceToSupabase(uid, data).catch(() => {})
      }

      setPresence(data)
      setMissedDays(getMissedDays(data))
      setCheckedIn(isCheckedInToday(data))
    }
    init()
  }, [])

  function sync(updated: PresenceData) {
    setPresence(updated)
    if (userId) syncPresenceToSupabase(userId, updated)
  }

  function handleCheckIn() {
    sync(checkIn())
    setCheckedIn(true)
  }

  function handleConfirmDay(date: string) {
    sync(confirmMissedDay(date))
    setMissedDays((prev) => prev.filter((d) => d !== date))
  }

  function handleDeclineDay(date: string) {
    sync(declineMissedDay(date))
    setMissedDays((prev) => prev.filter((d) => d !== date))
  }

  function handleAddTrip() {
    if (!newTrip.departureDate || !newTrip.country) return
    sync(addTravel(newTrip))
    setNewTrip({ departureDate: '', returnDate: '', country: '', reason: '' })
  }

  function handleRemoveTrip(id: string) {
    sync(removeTravel(id))
  }

  function handleArrivalDate(date: string) {
    sync(setArrivalDate(date))
  }

  // Core computed values — these drive PR / citizenship planning
  const daysInCanada = getDaysInCanada(presence)
  const streak = computeStreak(presence)
  const daysSinceArrival = getDaysSinceArrival(presence)
  const travelDays = getTravelDays(presence.travelLog)
  const progress = goal ? Math.min((daysInCanada / goal.days) * 100, 100) : 0
  const remaining = goal ? Math.max(goal.days - daysInCanada, 0) : 0

  const currentMissedDay = missedDays[0] ?? null

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6 sm:py-10">
      {/* Header */}
      <div className="mb-8">
        <p className="hidden md:block t-eyebrow text-navly-red">{t('tracker.title')}</p>
        <h1 className="hidden md:block mt-1 t-page-title">{t('tracker.trackPresence')}</h1>
        <p className="mt-2 text-muted-text">{t('tracker.subtitleFull')}</p>
      </div>

      {/* Streak + check-in */}
      <Card className="mb-6 rounded-2xl border-subtle bg-surface-card">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Flame className={cn('h-4 w-4', streak > 0 ? 'text-orange-500' : 'text-muted-text/50')} />
            <p className="text-sm font-semibold text-heading">{t('tracker.canadaStreak')}</p>
            {streak > 0 && (
              <span className="ml-auto text-2xl font-bold text-orange-500">{streak} day{streak !== 1 ? 's' : ''}</span>
            )}
          </div>
          {presence.longestStreak > 1 && (
            <p className="mb-3 text-xs text-muted-text/70">{t('tracker.personalBest')} {presence.longestStreak} days</p>
          )}
          {checkedIn ? (
            <div className="flex items-center gap-3 rounded-xl bg-green-50 border border-green-200 px-4 py-3">
              <CalendarCheck className="h-5 w-5 shrink-0 text-green-600" />
              <p className="text-sm font-semibold text-green-800">{t('tracker.checkedInConfirm')}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 rounded-xl border border-dashed border-subtle px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-text">{t('tracker.areYouHereToday')}</p>
              <Button onClick={handleCheckIn} size="sm" className="gap-1.5 bg-navly-red text-white hover:bg-navly-red/80 sm:shrink-0">
                <CalendarCheck className="h-4 w-4" />
                {t('tracker.yesImHere')}
              </Button>
            </div>
          )}
          <div className="mt-3 flex items-start gap-2 rounded-xl bg-surface-alt px-3 py-2">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-text/70" />
            <p className="text-xs text-muted-text/70">{t('tracker.streakNote')}</p>
          </div>
        </CardContent>
      </Card>

            {/* Primary stat — Days in Canada */}
      <Card className="mb-6 rounded-2xl border-2 border-navly-navy bg-navly-navy text-white">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-muted-text/50 uppercase tracking-wide">{t('tracker.title')}</p>
              <p className="mt-1 text-6xl font-bold">{daysInCanada}</p>
              <p className="mt-2 text-sm text-muted-text/50">
                {presence.arrivalDate
                  ? `${daysSinceArrival} days since arrival${travelDays > 0 ? ` − ${travelDays} days abroad` : ''}`
                  : 'Set your arrival date above to calculate'}
              </p>
            </div>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-surface-card/10">
              <CalendarCheck className="h-6 w-6 text-white" />
            </div>
          </div>
          {travelDays > 0 && (
            <div className="mt-4 rounded-xl bg-surface-card/10 px-4 py-2 text-xs text-muted-text/50">
              {presence.travelLog.length} trip{presence.travelLog.length !== 1 ? 's' : ''} logged &nbsp;·&nbsp; {travelDays} day{travelDays !== 1 ? 's' : ''} subtracted from your total
            </div>
          )}
        </CardContent>
      </Card>

      {/* Arrival date — this drives everything */}
      <Card className="mb-6 rounded-2xl border-subtle bg-surface-card">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="h-4 w-4 text-navly-red" />
            <p className="text-sm font-semibold text-heading">{t('tracker.arrivalDateLabel')}</p>
          </div>
          <Input
            type="date"
            value={presence.arrivalDate || ''}
            max={new Date().toISOString().slice(0, 10)}
            onChange={(e) => handleArrivalDate(e.target.value)}
            className="w-full max-w-xs rounded-xl border-subtle bg-surface-card text-sm text-heading focus-visible:ring-navly-red"
          />
          {!presence.arrivalDate && (
            <p className="mt-2 text-xs text-amber-600 font-semibold">
              {t('tracker.setArrivalDatePrompt')}
            </p>
          )}
          {presence.arrivalDate && (
            <p className="mt-2 text-xs text-muted-text/70">
              {daysSinceArrival} calendar days since arrival &nbsp;·&nbsp; {travelDays} day{travelDays !== 1 ? 's' : ''} abroad logged
            </p>
          )}
        </CardContent>
      </Card>

      {/* Goal progress */}
      {goal && daysInCanada > 0 && (
        <Card className="mb-6 rounded-2xl border-subtle bg-surface-card">
          <CardContent className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-navly-red" />
                <p className="text-sm font-semibold text-heading">{goal.label}</p>
              </div>
              <span className="text-sm font-bold text-navly-red">
                {daysInCanada} / {goal.days}
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-subtle">
              <div className="h-2 rounded-full bg-navly-red transition-all" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-2 text-xs text-muted-text">
              {remaining > 0 ? `${remaining} ${t('tracker.moreNeededSuffix')}` : t('tracker.reachedTarget')}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Missed day recovery — shown one day at a time, oldest first */}
      {currentMissedDay && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div className="flex-1">
              {missedDays.length > 1 && (
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-amber-600">
                  {missedDays.length} days to confirm
                </p>
              )}
              <p className="font-semibold text-amber-900">
                {t('tracker.wereYouInCanada')}{' '}
                {new Date(currentMissedDay + 'T12:00:00').toLocaleDateString('en-CA', {
                  weekday: 'long', month: 'long', day: 'numeric',
                })}?
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" onClick={() => handleConfirmDay(currentMissedDay)} className="bg-amber-600 text-white hover:bg-amber-700">
                  {t('tracker.yesWasInCanada')}
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleDeclineDay(currentMissedDay)} className="border-amber-300 text-amber-700 hover:bg-amber-100">
                  {t('tracker.noWasAway')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Travel log — always visible, critical for accuracy */}
      <Card className="rounded-2xl border-subtle bg-surface-card">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-1">
            <Plane className="h-4 w-4 text-navly-red" />
            <p className="text-sm font-semibold text-heading">
              {t('tracker.tripsOutsideCanada')}
              {presence.travelLog.length > 0 && (
                <span className="ml-2 rounded-full bg-navly-red/10 px-2 py-0.5 text-xs text-navly-red">
                  {presence.travelLog.length} trip{presence.travelLog.length !== 1 ? 's' : ''}
                </span>
              )}
            </p>
          </div>
          <p className="mb-5 text-xs text-muted-text">{t('tracker.everyTripSubtracted')}</p>

          {/* Existing trips */}
          {presence.travelLog.length > 0 ? (
            <div className="mb-5 flex flex-col gap-2">
              {presence.travelLog.map((entry) => (
                <TripRow key={entry.id} entry={entry} onRemove={handleRemoveTrip} stillAwayLabel={t('tracker.stillAway')} />
              ))}
            </div>
          ) : (
            <div className="mb-5 rounded-xl border border-dashed border-subtle p-4 text-center">
              <p className="text-sm text-muted-text/70">{t('tracker.noTripsYet')}</p>
              <p className="mt-1 text-xs text-muted-text/70">{t('tracker.logTripPromptDesc')}</p>
            </div>
          )}

          {/* Add new trip */}
          <div className="rounded-xl border border-subtle bg-surface-alt p-4">
            <p className="mb-3 t-eyebrow text-muted-text/70">{t('tracker.logTripHeader')}</p>
            <div className="grid grid-cols-1 gap-3 mb-3 sm:grid-cols-2">
              <div>
                <Label className="text-xs font-semibold text-muted-text">{t('tracker.travelFrom')}</Label>
                <Input
                  type="date"
                  value={newTrip.departureDate}
                  max={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => setNewTrip((t) => ({ ...t, departureDate: e.target.value }))}
                  className="mt-1 rounded-xl border-subtle bg-surface-card text-sm focus-visible:ring-navly-red"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold text-muted-text">{t('tracker.travelTo')} <span className="font-normal text-muted-text/70">{t('tracker.returnDateOptional')}</span></Label>
                <Input
                  type="date"
                  value={newTrip.returnDate}
                  min={newTrip.departureDate}
                  max={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => setNewTrip((t) => ({ ...t, returnDate: e.target.value }))}
                  className="mt-1 rounded-xl border-subtle bg-surface-card text-sm focus-visible:ring-navly-red"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 mb-3 sm:grid-cols-2">
              <div>
                <Label className="text-xs font-semibold text-muted-text">{t('tracker.travelCountry')}</Label>
                <Input
                  placeholder="e.g. United States"
                  value={newTrip.country}
                  onChange={(e) => setNewTrip((t) => ({ ...t, country: e.target.value }))}
                  className="mt-1 rounded-xl border-subtle bg-surface-card text-sm focus-visible:ring-navly-red"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold text-muted-text">{t('tracker.travelReason')} <span className="font-normal text-muted-text/70">{t('tracker.reasonOptional')}</span></Label>
                <Input
                  placeholder="e.g. Family visit"
                  value={newTrip.reason}
                  onChange={(e) => setNewTrip((t) => ({ ...t, reason: e.target.value }))}
                  className="mt-1 rounded-xl border-subtle bg-surface-card text-sm focus-visible:ring-navly-red"
                />
              </div>
            </div>
            <Button
              onClick={handleAddTrip}
              disabled={!newTrip.departureDate || !newTrip.country}
              size="sm"
              className="gap-2 bg-navly-navy text-white hover:bg-navly-navy/80 disabled:opacity-40"
            >
              <PlusCircle className="h-4 w-4" />
              {t('tracker.logTripBtn')}
            </Button>
          </div>
        </CardContent>
      </Card>

      <p className="mt-4 text-xs text-muted-text/70">{t('tracker.disclaimer')}</p>
    </div>
  )
}

function TripRow({ entry, onRemove, stillAwayLabel }: { entry: TravelEntry; onRemove: (id: string) => void; stillAwayLabel: string }) {
  const start = entry.departureDate
  const end = entry.returnDate || stillAwayLabel
  const days = entry.returnDate
    ? Math.max(0, Math.floor((new Date(entry.returnDate).getTime() - new Date(entry.departureDate).getTime()) / (1000 * 60 * 60 * 24)))
    : null

  return (
    <div className="flex items-center gap-3 rounded-xl border border-subtle bg-surface-card px-4 py-3">
      <Plane className="h-4 w-4 shrink-0 text-muted-text/70" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-heading">
          {entry.country}
          {entry.reason ? <span className="ml-1 font-normal text-muted-text">— {entry.reason}</span> : ''}
        </p>
        <p className="text-xs text-muted-text/70">
          {start} → {end}
          {days !== null ? ` (${days} day${days !== 1 ? 's' : ''})` : ' (still away)'}
        </p>
      </div>
      <button
        onClick={() => onRemove(entry.id)}
        className="shrink-0 rounded-lg p-1.5 text-muted-text/50 transition hover:bg-red-50 hover:text-red-500"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  )
}
