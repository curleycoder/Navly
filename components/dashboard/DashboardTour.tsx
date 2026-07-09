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

    const timer = setTimeout(() => {
      const validSteps = allSteps.filter(step =>
        !step.element || document.querySelector(step.element as string) !== null
      )
      if (validSteps.length === 0) return

      const driverObj = driver({
        showProgress: true,
        animate: true,
        overlayColor: '#0B1F3A',
        overlayOpacity: 0.6,
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
    }, 800)

    return () => clearTimeout(timer)
  }, [])

  return null
}
