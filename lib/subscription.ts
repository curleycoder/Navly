'use client'

import { useEffect, useState } from 'react'
import { supabase } from './supabase/client'

export type Plan = 'tracker' | null

export function usePlan(): { plan: Plan; loading: boolean } {
  const [plan, setPlan] = useState<Plan>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data } = await supabase
        .from('subscriptions')
        .select('plan')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (data?.plan) setPlan(data.plan as Plan)
      setLoading(false)
    }
    load()
  }, [])

  return { plan, loading }
}

/** Check whether a user has an active tracker plan. */
export function hasPlan(userPlan: Plan, required: 'tracker'): boolean {
  return userPlan === 'tracker'
}
