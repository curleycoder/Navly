'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { loadProfile, loadProfileFromSupabase, saveProfileToSupabase } from '@/lib/profile'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    async function check() {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        router.replace('/login')
        return
      }

      // Try Supabase first (authoritative source)
      const dbProfile = await loadProfileFromSupabase(session.user.id)

      if (!dbProfile) {
        // First login after signup — push local profile to DB
        const localProfile = loadProfile()
        if (localProfile?.locationStatus) {
          await saveProfileToSupabase(session.user.id, localProfile)
        }
        // No profile anywhere — let the user into the dashboard; pages show
        // their own "Complete profile" CTA pointing at /dashboard/profile.
        setReady(true)
        return
      }

      setReady(true)
    }

    check()
  }, [router])

  if (!ready) return null

  return <>{children}</>
}
