'use client'

import { useEffect, useState } from 'react'
import { Flame, CalendarCheck, Target, Plane, PlusCircle, Trash2, MapPin, AlertTriangle, Info } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { loadProfile } from '@/lib/profile'
import { PlanGate } from '@/components/ui/PlanGate'
import {
  loadPresence,
  checkIn,
  checkInYesterday,
  isCheckedInToday,
  missedYesterday,
  setArrivalDate,
  addTravel,
  removeTravel,
  getTravelDays,
  getDaysInCanada,
  getDaysSinceArrival,
  getPresenceGoal,
  type PresenceData,
  type TravelEntry,
} from '@/lib/presence'
import { cn } from '@/lib/utils'

export default function DaysPage() {
  const [presence, setPresence] = useState<PresenceData>({
    totalDays: 0, streak: 0, longestStreak: 0, lastCheckIn: null,
    arrivalDate: null, travelLog: [],
  })
  const [goal, setGoal] = useState<{ days: number; label: string } | null>(null)
  const [checkedIn, setCheckedIn] = useState(false)
  const [newTrip, setNewTrip] = useState({ departureDate: '', returnDate: '', country: '', reason: '' })

  useEffect(() => {
    const profile = loadProfile()
    if (profile?.goal) setGoal(getPresenceGoal(profile.goal))
    const data = loadPresence()
    if (!data.arrivalDate && profile?.arrivalDate) {
      const updated = setArrivalDate(profile.arrivalDate)
      setPresence(updated)
    } else {
      setPresence(data)
    }
    setCheckedIn(isCheckedInToday(data))
  }, [])

  function handleCheckIn() {
    const updated = checkIn()
    setPresence(updated)
    setCheckedIn(true)
  }

  function handleConfirmYesterday() {
    const updated = checkInYesterday()
    setPresence(updated)
  }

  function handleDismissYesterday() {
    setPresence((p) => ({ ...p }))
    if (typeof window !== 'undefined') {
      localStorage.setItem('navly_last_absence_ack', new Date().toISOString().slice(0, 10))
    }
  }

  function handleAddTrip() {
    if (!newTrip.departureDate || !newTrip.country) return
    const updated = addTravel(newTrip)
    setPresence(updated)
    setNewTrip({ departureDate: '', returnDate: '', country: '', reason: '' })
  }

  function handleRemoveTrip(id: string) {
    const updated = removeTravel(id)
    setPresence(updated)
  }

  function handleArrivalDate(date: string) {
    const updated = setArrivalDate(date)
    setPresence(updated)
  }

  // Core computed values — these drive PR / citizenship planning
  const daysInCanada = getDaysInCanada(presence)
  const daysSinceArrival = getDaysSinceArrival(presence)
  const travelDays = getTravelDays(presence.travelLog)
  const progress = goal ? Math.min((daysInCanada / goal.days) * 100, 100) : 0
  const remaining = goal ? Math.max(goal.days - daysInCanada, 0) : 0

  const showMissedPrompt = missedYesterday(presence) &&
    typeof window !== 'undefined' &&
    localStorage.getItem('navly_last_absence_ack') !== new Date().toISOString().slice(0, 10)

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#D62828]">Days in Canada</p>
        <h1 className="mt-1 text-3xl font-bold text-[#0B1F3A]">Track your presence</h1>
        <p className="mt-2 text-slate-500">
          Your Days in Canada count is calculated automatically from your arrival date minus any days spent abroad.
          Log every trip to keep the number accurate.
        </p>
      </div>

      <PlanGate plan="tracker">

      {/* Streak + check-in */}
      <Card className="mb-6 rounded-2xl border-slate-200 bg-white">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Flame className={cn('h-4 w-4', presence.streak > 0 ? 'text-orange-500' : 'text-slate-300')} />
            <p className="text-sm font-semibold text-[#0B1F3A]">Daily check-in streak</p>
            {presence.streak > 0 && (
              <span className="ml-auto text-2xl font-bold text-orange-500">{presence.streak} day{presence.streak !== 1 ? 's' : ''}</span>
            )}
          </div>
          {presence.longestStreak > 1 && (
            <p className="mb-3 text-xs text-slate-400">Personal best: {presence.longestStreak} days</p>
          )}
          {checkedIn ? (
            <div className="flex items-center gap-3 rounded-xl bg-green-50 border border-green-200 px-4 py-3">
              <CalendarCheck className="h-5 w-5 text-green-600" />
              <p className="text-sm font-semibold text-green-800">Checked in for today — come back tomorrow.</p>
            </div>
          ) : (
            <div className="flex items-center justify-between rounded-xl border border-dashed border-slate-200 px-4 py-3">
              <p className="text-sm text-slate-600">Are you in Canada today?</p>
              <Button onClick={handleCheckIn} size="sm" className="gap-1.5 bg-[#D62828] text-white hover:bg-[#B91C1C]">
                <CalendarCheck className="h-4 w-4" />
                Yes, I'm here
              </Button>
            </div>
          )}
          <div className="mt-3 flex items-start gap-2 rounded-xl bg-slate-50 px-3 py-2">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
            <p className="text-xs text-slate-400">
              The streak is for your engagement. Your <strong>Days in Canada</strong> count above is calculated automatically from your arrival date — you don't need to check in every day to keep that accurate.
            </p>
          </div>
        </CardContent>
      </Card>

            {/* Primary stat — Days in Canada */}
      <Card className="mb-6 rounded-2xl border-2 border-[#0B1F3A] bg-[#0B1F3A] text-white">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Days in Canada</p>
              <p className="mt-1 text-6xl font-bold">{daysInCanada}</p>
              <p className="mt-2 text-sm text-slate-300">
                {presence.arrivalDate
                  ? `${daysSinceArrival} days since arrival${travelDays > 0 ? ` − ${travelDays} days abroad` : ''}`
                  : 'Set your arrival date above to calculate'}
              </p>
            </div>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/10">
              <CalendarCheck className="h-6 w-6 text-white" />
            </div>
          </div>
          {travelDays > 0 && (
            <div className="mt-4 rounded-xl bg-white/10 px-4 py-2 text-xs text-slate-300">
              {presence.travelLog.length} trip{presence.travelLog.length !== 1 ? 's' : ''} logged &nbsp;·&nbsp; {travelDays} day{travelDays !== 1 ? 's' : ''} subtracted from your total
            </div>
          )}
        </CardContent>
      </Card>

      {/* Arrival date — this drives everything */}
      <Card className="mb-6 rounded-2xl border-slate-200 bg-white">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="h-4 w-4 text-[#D62828]" />
            <p className="text-sm font-semibold text-[#0B1F3A]">Arrival date in Canada</p>
          </div>
          <Input
            type="date"
            value={presence.arrivalDate || ''}
            max={new Date().toISOString().slice(0, 10)}
            onChange={(e) => handleArrivalDate(e.target.value)}
            className="max-w-xs rounded-xl border-slate-200 bg-white text-sm text-[#0B1F3A] focus-visible:ring-[#D62828]"
          />
          {!presence.arrivalDate && (
            <p className="mt-2 text-xs text-amber-600 font-semibold">
              Set your arrival date to start tracking days in Canada.
            </p>
          )}
          {presence.arrivalDate && (
            <p className="mt-2 text-xs text-slate-400">
              {daysSinceArrival} calendar days since arrival &nbsp;·&nbsp; {travelDays} day{travelDays !== 1 ? 's' : ''} abroad logged
            </p>
          )}
        </CardContent>
      </Card>

      {/* Goal progress */}
      {goal && daysInCanada > 0 && (
        <Card className="mb-6 rounded-2xl border-slate-200 bg-white">
          <CardContent className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-[#D62828]" />
                <p className="text-sm font-semibold text-[#0B1F3A]">{goal.label}</p>
              </div>
              <span className="text-sm font-bold text-[#D62828]">
                {daysInCanada} / {goal.days}
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-100">
              <div className="h-2 rounded-full bg-[#D62828] transition-all" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-2 text-xs text-slate-500">
              {remaining > 0 ? `${remaining} more days in Canada needed` : 'You have reached your target!'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Missed check-in recovery */}
      {showMissedPrompt && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div className="flex-1">
              <p className="font-semibold text-amber-900">You missed yesterday's check-in</p>
              <p className="mt-1 text-sm text-amber-800">Were you physically in Canada yesterday?</p>
              <div className="mt-3 flex gap-3">
                <Button size="sm" onClick={handleConfirmYesterday} className="bg-amber-600 text-white hover:bg-amber-700">
                  Yes, I was in Canada
                </Button>
                <Button size="sm" variant="outline" onClick={handleDismissYesterday} className="border-amber-300 text-amber-700 hover:bg-amber-100">
                  No, I was away
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Travel log — always visible, critical for accuracy */}
      <Card className="rounded-2xl border-slate-200 bg-white">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-1">
            <Plane className="h-4 w-4 text-[#D62828]" />
            <p className="text-sm font-semibold text-[#0B1F3A]">
              Trips outside Canada
              {presence.travelLog.length > 0 && (
                <span className="ml-2 rounded-full bg-[#D62828]/10 px-2 py-0.5 text-xs text-[#D62828]">
                  {presence.travelLog.length} trip{presence.travelLog.length !== 1 ? 's' : ''}
                </span>
              )}
            </p>
          </div>
          <p className="mb-5 text-xs text-slate-500">
            Every trip you log is automatically subtracted from your Days in Canada count.
            This keeps your PR and citizenship calculations accurate.
          </p>

          {/* Existing trips */}
          {presence.travelLog.length > 0 ? (
            <div className="mb-5 flex flex-col gap-2">
              {presence.travelLog.map((entry) => (
                <TripRow key={entry.id} entry={entry} onRemove={handleRemoveTrip} />
              ))}
            </div>
          ) : (
            <div className="mb-5 rounded-xl border border-dashed border-slate-200 p-4 text-center">
              <p className="text-sm text-slate-400">No trips logged yet.</p>
              <p className="mt-1 text-xs text-slate-400">If you have left Canada since arriving, log those trips below.</p>
            </div>
          )}

          {/* Add new trip */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">Log a trip</p>
            <div className="grid grid-cols-1 gap-3 mb-3 sm:grid-cols-2">
              <div>
                <Label className="text-xs font-semibold text-slate-600">Departure date</Label>
                <Input
                  type="date"
                  value={newTrip.departureDate}
                  max={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => setNewTrip((t) => ({ ...t, departureDate: e.target.value }))}
                  className="mt-1 rounded-xl border-slate-200 bg-white text-sm focus-visible:ring-[#D62828]"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold text-slate-600">Return date <span className="font-normal text-slate-400">(leave blank if still away)</span></Label>
                <Input
                  type="date"
                  value={newTrip.returnDate}
                  min={newTrip.departureDate}
                  max={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => setNewTrip((t) => ({ ...t, returnDate: e.target.value }))}
                  className="mt-1 rounded-xl border-slate-200 bg-white text-sm focus-visible:ring-[#D62828]"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 mb-3 sm:grid-cols-2">
              <div>
                <Label className="text-xs font-semibold text-slate-600">Country visited</Label>
                <Input
                  placeholder="e.g. United States"
                  value={newTrip.country}
                  onChange={(e) => setNewTrip((t) => ({ ...t, country: e.target.value }))}
                  className="mt-1 rounded-xl border-slate-200 bg-white text-sm focus-visible:ring-[#D62828]"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold text-slate-600">Reason <span className="font-normal text-slate-400">(optional)</span></Label>
                <Input
                  placeholder="e.g. Family visit"
                  value={newTrip.reason}
                  onChange={(e) => setNewTrip((t) => ({ ...t, reason: e.target.value }))}
                  className="mt-1 rounded-xl border-slate-200 bg-white text-sm focus-visible:ring-[#D62828]"
                />
              </div>
            </div>
            <Button
              onClick={handleAddTrip}
              disabled={!newTrip.departureDate || !newTrip.country}
              size="sm"
              className="gap-2 bg-[#0B1F3A] text-white hover:bg-[#1f375a] disabled:opacity-40"
            >
              <PlusCircle className="h-4 w-4" />
              Log trip
            </Button>
          </div>
        </CardContent>
      </Card>

      <p className="mt-4 text-xs text-slate-400">
        This tracker is for personal planning only. Final physical presence calculations depend on official government rules and records.
      </p>
      </PlanGate>
    </div>
  )
}

function TripRow({ entry, onRemove }: { entry: TravelEntry; onRemove: (id: string) => void }) {
  const start = entry.departureDate
  const end = entry.returnDate || 'present'
  const days = entry.returnDate
    ? Math.max(0, Math.floor((new Date(entry.returnDate).getTime() - new Date(entry.departureDate).getTime()) / (1000 * 60 * 60 * 24)))
    : null

  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
      <div className="flex items-center gap-3">
        <Plane className="h-4 w-4 shrink-0 text-slate-400" />
        <div>
          <p className="text-sm font-semibold text-[#0B1F3A]">
            {entry.country}
            {entry.reason ? <span className="ml-1 font-normal text-slate-500">— {entry.reason}</span> : ''}
          </p>
          <p className="text-xs text-slate-400">
            {start} → {end}
            {days !== null ? ` (${days} day${days !== 1 ? 's' : ''})` : ' (still away)'}
          </p>
        </div>
      </div>
      <button
        onClick={() => onRemove(entry.id)}
        className="ml-3 rounded-lg p-1.5 text-slate-300 transition hover:bg-red-50 hover:text-red-500"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  )
}
