'use client'

import { usePlan, hasPlan } from '@/lib/subscription'
import { UpgradeBanner } from './UpgradeBanner'

type RequiredPlan = 'report' | 'tracker'

/**
 * Renders children only when the user has the required plan.
 * Otherwise renders the UpgradeBanner (or a custom fallback).
 */
export function PlanGate({
  plan,
  children,
  fallback,
}: {
  plan: RequiredPlan
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  const { plan: userPlan, loading } = usePlan()

  if (loading) return null

  if (hasPlan(userPlan, plan)) return <>{children}</>

  return fallback !== undefined ? <>{fallback}</> : <UpgradeBanner plan={plan} />
}
