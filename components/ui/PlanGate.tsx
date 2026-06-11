'use client'

import { usePlan, hasPlan } from '@/lib/subscription'
import { UpgradeBanner } from './UpgradeBanner'

/**
 * Renders children only when the user has an active tracker plan.
 * Otherwise renders the UpgradeBanner (or a custom fallback).
 */
export function PlanGate({
  children,
  fallback,
}: {
  plan?: 'tracker'  // kept for call-site compatibility — always requires tracker
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  const { plan: userPlan, loading } = usePlan()

  if (loading) return null

  if (hasPlan(userPlan, 'tracker')) return <>{children}</>

  return fallback !== undefined ? <>{fallback}</> : <UpgradeBanner />
}
