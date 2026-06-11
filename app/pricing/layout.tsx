import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'Find your path to Canadian PR. Free eligibility check or PR Tracker at $14.99/month — full breakdown, daily tracking, and alerts in one plan.',
  openGraph: {
    title: 'Navly Pricing — Canadian PR Pathway Plans',
    description:
      'Start free to see where you stand. Upgrade to PR Tracker for the full score breakdown, daily presence tracking, and alerts — everything in one plan.',
  },
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
