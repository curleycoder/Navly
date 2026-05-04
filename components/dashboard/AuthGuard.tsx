'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { loadProfile } from '@/lib/profile'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const profile = loadProfile()
    if (!profile || !profile.locationStatus) {
      router.replace('/onboarding')
    } else {
      setReady(true)
    }
  }, [router])

  if (!ready) return null

  return <>{children}</>
}
