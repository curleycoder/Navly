'use client'

import { useEffect } from 'react'
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'

const TOUR_KEY = 'navly_tour_seen'

export function DashboardTour() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (localStorage.getItem(TOUR_KEY)) return

    const driverObj = driver({
      showProgress: true,
      animate: true,
      overlayColor: '#0B1F3A',
      overlayOpacity: 0.6,
      smoothScroll: true,
      allowClose: true,
      nextBtnText: 'Next →',
      prevBtnText: '← Back',
      doneBtnText: 'Get started',
      popoverClass: 'navly-tour-popover',
      steps: [
        {
          element: '[data-tour="score"]',
          popover: {
            title: 'Your CRS Score',
            description: 'This is your estimated Express Entry score. Tap it any time to see your full breakdown and top PR pathways.',
            side: 'bottom',
            align: 'start',
          },
        },
        {
          element: '[data-tour="days"]',
          popover: {
            title: 'Canada Days Tracker',
            description: 'Track your days physically in Canada. Check in daily to build your presence log — important for PR and citizenship.',
            side: 'top',
            align: 'start',
          },
        },
        {
          element: '[data-tour="tasks"]',
          popover: {
            title: 'Your Next Task',
            description: 'Navly builds a personalized checklist based on your profile. Work through these to stay on track.',
            side: 'top',
            align: 'end',
          },
        },
        {
          element: '[data-tour="news"]',
          popover: {
            title: 'Immigration Updates',
            description: 'We track IRCC announcements and policy changes that could affect your pathway. Check here regularly.',
            side: 'top',
            align: 'start',
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
      ],
      onDestroyed: () => {
        localStorage.setItem(TOUR_KEY, '1')
      },
    })

    const timer = setTimeout(() => driverObj.drive(), 800)
    return () => clearTimeout(timer)
  }, [])

  return null
}
