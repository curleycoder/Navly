'use client'

import { useEffect } from 'react'
import { driver, type DriveStep } from 'driver.js'
import 'driver.js/dist/driver.css'

type PageTourProps = {
  tourKey: string
  steps: DriveStep[]
}

export function PageTour({ tourKey, steps }: PageTourProps) {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (localStorage.getItem(tourKey)) return

    const driverObj = driver({
      showProgress: true,
      animate: true,
      overlayColor: '#0B1F3A',
      overlayOpacity: 0.6,
      smoothScroll: true,
      allowClose: true,
      nextBtnText: 'Next →',
      prevBtnText: '← Back',
      doneBtnText: 'Got it',
      popoverClass: 'navly-tour-popover',
      steps,
      onDestroyed: () => {
        localStorage.setItem(tourKey, '1')
      },
    })

    const timer = setTimeout(() => driverObj.drive(), 600)
    return () => clearTimeout(timer)
  }, [tourKey, steps])

  return null
}
