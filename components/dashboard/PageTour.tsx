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

    // Only show on mobile devices
    const ua = navigator.userAgent
    const isIOS = /iPhone|iPad|iPod/i.test(ua)
    const isAndroid = /Android/i.test(ua)
    if (!isIOS && !isAndroid && window.innerWidth >= 768) return

    if (localStorage.getItem(tourKey)) return

    let cancelled = false

    // Page data often loads asynchronously, so a target's element may not exist yet
    // when this effect first runs. Poll instead of firing on a fixed delay — without
    // this, driver.js would try to highlight an element that isn't there, producing a
    // broken-looking step with no spotlight (capped so the tour still starts even if a
    // step's element genuinely never appears).
    const start = Date.now()
    const maxWaitMs = 5000
    const pollMs = 150

    function allTargetsSettled() {
      return steps.every(
        (step) => !step.element || document.querySelector(step.element as string) !== null
      )
    }

    function tryStart() {
      if (cancelled) return
      if (!allTargetsSettled() && Date.now() - start < maxWaitMs) {
        setTimeout(tryStart, pollMs)
        return
      }

      const validSteps = steps.filter(
        (step) => !step.element || document.querySelector(step.element as string) !== null
      )
      if (validSteps.length === 0) return

      const driverObj = driver({
        showProgress: true,
        animate: true,
        // Not navly-navy (#0B1F3A) — some highlighted cards (e.g. pr-improvements) use
        // that exact color as their own background, so the overlay barely showed against
        // them. Pure black contrasts against every card regardless of its own background.
        overlayColor: '#000000',
        overlayOpacity: 0.7,
        smoothScroll: true,
        allowClose: true,
        nextBtnText: 'Next',
        prevBtnText: 'Back',
        doneBtnText: 'Got it',
        popoverClass: 'navly-tour-popover',
        steps: validSteps,
        onDestroyed: () => {
          localStorage.setItem(tourKey, '1')
        },
      })

      driverObj.drive()
    }

    const initialTimer = setTimeout(tryStart, 400)

    return () => {
      cancelled = true
      clearTimeout(initialTimer)
    }
  }, [tourKey, steps])

  return null
}
