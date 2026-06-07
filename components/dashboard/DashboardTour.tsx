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
          element: '[data-tour="nav-tracker"]',
          popover: {
            title: 'PR Tracker',
            description: 'See your full CRS breakdown by category, all pathway eligibility, and the exact improvements that would move your score. Open this any time from the bottom navigation.',
            side: 'top',
            align: 'center',
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
          element: '[data-tour="nav-tasks"]',
          popover: {
            title: 'Your Tasks',
            description: 'Navly builds a personalized checklist based on your profile — missing documents, score improvements, and key deadlines. Open Tasks any time from the bottom navigation.',
            side: 'top',
            align: 'center',
          },
        },
        {
          element: '[data-tour="nav-ai"]',
          popover: {
            title: 'AI Assistant',
            description: 'Ask anything about Canadian immigration — CRS scores, pathway options, PGWP rules, permit renewals, and more. Powered by AI and kept up to date with the latest IRCC rules.',
            side: 'top',
            align: 'center',
          },
        },
        {
          element: '[data-tour="news"]',
          popover: {
            title: 'Immigration Updates',
            description: 'We monitor IRCC announcements and policy changes that could affect your pathway. Check here regularly.',
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
        {
          element: '[data-tour="nav-profile"]',
          popover: {
            title: 'Your Profile & Documents',
            description: 'Update your immigration profile, upload and manage your documents, and adjust app settings — all from your Profile page.',
            side: 'top',
            align: 'center',
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
