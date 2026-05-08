import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'Simple, transparent pricing for Navly — Canadian PR pathway planning. Free eligibility check, full report for $29, or monthly tracker at $14/month.',
  openGraph: {
    title: 'Navly Pricing — Canadian PR Pathway Plans',
    description:
      'Free eligibility check, one-time full report, or monthly tracker. Understand your CRS score and PR pathway at the right level for you.',
  },
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
