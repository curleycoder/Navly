'use client'

import { useEffect } from 'react'
import { driver, type DriveStep } from 'driver.js'
import 'driver.js/dist/driver.css'

const TOUR_KEY = 'navly_tour_seen'

const STEPS: DriveStep[] = [
  {
    element: '[data-tour="score"]',
    popover: {
      title: 'Your CRS Score',
      description: 'This is your estimated Express Entry score. Tap to see your full breakdown and strongest PR pathways.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '[data-tour="days"]',
    popover: {
      title: 'Canada Days Tracker',
      description: 'Check in here every day you are in Canada. Your confirmed days count toward PR and citizenship requirements.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '[data-tour="tasks"]',
    popover: {
      title: 'Your Next Action',
      description: 'Navly builds a personalized to-do list based on your profile. Tap to see everything you need to do.',
      side: 'bottom',
      align: 'end',
    },
  },
  {
    element: '[data-tour="consultant"]',
    popover: {
      title: 'Talk to a Consultant',
      description: 'When you need professional advice, connect with a certified Canadian immigration consultant directly from here.',
      side: 'top',
      align: 'start',
    },
  },
]

export function DashboardTour() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Only show on mobile devices
    const ua = navigator.userAgent
    const isIOS = /iPhone|iPad|iPod/i.test(ua)
    const isAndroid = /Android/i.test(ua)
    if (!isIOS && !isAndroid && window.innerWidth >= 768) return

    if (localStorage.getItem(TOUR_KEY)) return

    const bookmarkInstruction = isIOS
      ? 'Tap the Share button at the bottom of Safari, then tap "Add to Home Screen" to use Navly like an app.'
      : 'Tap the browser menu (⋮) and select "Add to Home screen" to use Navly like an app.'

    const allSteps: DriveStep[] = [
      ...STEPS,
      {
        popover: {
          title: 'Save Navly to your phone',
          description: bookmarkInstruction,
          side: 'top',
          align: 'center',
        },
      },
    ]

    let cancelled = false

    // The dashboard's own cards (profile/presence from Supabase) load asynchronously,
    // and some — like "days" — only render once that resolves. A single fixed delay
    // raced that fetch: on a slow connection it fired before the cards existed, silently
    // dropping those steps, so which spots got highlighted varied run to run. Poll
    // instead, so the tour waits for whatever's actually going to render (capped so it
    // still starts even if a step's element genuinely never appears).
    const start = Date.now()
    const maxWaitMs = 5000
    const pollMs = 150

    function allTargetsSettled() {
      return STEPS.every(
        (step) => !step.element || document.querySelector(step.element as string) !== null
      )
    }

    function tryStart() {
      if (cancelled) return
      if (!allTargetsSettled() && Date.now() - start < maxWaitMs) {
        setTimeout(tryStart, pollMs)
        return
      }

      const validSteps = allSteps.filter(
        (step) => !step.element || document.querySelector(step.element as string) !== null
      )
      if (validSteps.length === 0) return

      const driverObj = driver({
        showProgress: true,
        animate: true,
        // Not navly-navy (#0B1F3A) — several highlighted cards (score, consultant CTA)
        // use that exact color as their own background, so the "spotlight" cut-out and
        // the dimmed overlay around it were the same color and barely visible. Pure
        // black contrasts against every card regardless of its own background.
        overlayColor: '#000000',
        overlayOpacity: 0.7,
        smoothScroll: true,
        allowClose: true,
        nextBtnText: 'Next',
        prevBtnText: 'Back',
        doneBtnText: 'Get started',
        popoverClass: 'navly-tour-popover',
        steps: validSteps,
        onDestroyed: () => {
          localStorage.setItem(TOUR_KEY, '1')
        },
      })

      driverObj.drive()
    }

    const initialTimer = setTimeout(tryStart, 400)

    return () => {
      cancelled = true
      clearTimeout(initialTimer)
    }
  }, [])

  return null
}
