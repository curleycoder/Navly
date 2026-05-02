'use client'

import { useEffect, useState } from 'react'
import { Flame, CalendarCheck, Target } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { loadProfile } from '@/lib/profile'
import {
  loadPresence,
  checkIn,
  isCheckedInToday,
  getPresenceGoal,
  type PresenceData,
} from '@/lib/presence'
import { cn } from '@/lib/utils'

export default function DaysPage() {
  const [presence, setPresence] = useState<PresenceData>({
    totalDays: 0,
    streak: 0,
    longestStreak: 0,
    lastCheckIn: null,
  })
  const [goal, setGoal] = useState<{ days: number; label: string } | null>(null)
  const [checkedIn, setCheckedIn] = useState(false)

  useEffect(() => {
    const profile = loadProfile()
    if (profile?.goal) setGoal(getPresenceGoal(profile.goal))
    const data = loadPresence()
    setPresence(data)
    setCheckedIn(isCheckedInToday(data))
  }, [])

  function handleCheckIn() {
    const updated = checkIn()
    setPresence(updated)
    setCheckedIn(true)
  }

  const progress = goal ? Math.min((presence.totalDays / goal.days) * 100, 100) : 0
  const remaining = goal ? Math.max(goal.days - presence.totalDays, 0) : 0

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#D62828]">Days in Canada</p>
        <h1 className="mt-1 text-3xl font-bold text-[#0B1F3A]">Track your presence</h1>
        <p className="mt-2 text-slate-500">
          Check in each day you are in Canada. Your streak and total count toward your immigration goal.
        </p>
      </div>

      {/* Streak + total */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <Card className="rounded-2xl border-slate-200 bg-white">
          <CardContent className="p-6 text-center">
            <Flame
              className={cn(
                'mx-auto mb-2 h-8 w-8',
                presence.streak > 0 ? 'text-orange-500' : 'text-slate-300'
              )}
            />
            <p className="text-5xl font-bold text-[#0B1F3A]">{presence.streak}</p>
            <p className="mt-1 text-sm text-slate-500">day streak</p>
            {presence.longestStreak > 1 && (
              <p className="mt-2 text-xs text-slate-400">Best: {presence.longestStreak} days</p>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200 bg-white">
          <CardContent className="p-6 text-center">
            <CalendarCheck className="mx-auto mb-2 h-8 w-8 text-[#0B1F3A]" />
            <p className="text-5xl font-bold text-[#0B1F3A]">{presence.totalDays}</p>
            <p className="mt-1 text-sm text-slate-500">total days logged</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress toward goal */}
      {goal && (
        <Card className="mb-6 rounded-2xl border-slate-200 bg-white">
          <CardContent className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-[#D62828]" />
                <p className="text-sm font-semibold text-[#0B1F3A]">{goal.label}</p>
              </div>
              <span className="text-sm font-bold text-[#D62828]">
                {presence.totalDays} / {goal.days}
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-100">
              <div
                className="h-2 rounded-full bg-[#D62828] transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-slate-500">
              {remaining > 0 ? `${remaining} more days to go` : 'You have reached your target days!'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Check in */}
      <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-8 text-center">
        {checkedIn ? (
          <>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
              <CalendarCheck className="h-7 w-7 text-green-600" />
            </div>
            <p className="mt-4 text-lg font-bold text-[#0B1F3A]">Checked in for today</p>
            <p className="mt-1 text-sm text-slate-500">Come back tomorrow to keep your streak going.</p>
          </>
        ) : (
          <>
            <Flame className="mx-auto h-10 w-10 text-orange-400" />
            <p className="mt-3 text-lg font-bold text-[#0B1F3A]">Are you in Canada today?</p>
            <p className="mt-1 text-sm text-slate-500">
              Tap below to log today and{presence.streak > 0 ? ' grow' : ' start'} your streak.
            </p>
            <Button
              onClick={handleCheckIn}
              className="mt-5 gap-2 bg-[#D62828] text-white hover:bg-[#B91C1C]"
            >
              <CalendarCheck className="h-4 w-4" />
              Check in today
            </Button>
          </>
        )}
      </div>

      <p className="mt-4 text-xs text-slate-400">
        Each check-in counts as one day in Canada. Missing a day resets your streak but does not remove total days.
      </p>
    </div>
  )
}
