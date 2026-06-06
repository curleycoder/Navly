import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'Find your path to Canadian PR. Free eligibility check, Readiness Report for $29, or PR Tracker at $14.99/month.',
  openGraph: {
    title: 'Navly Pricing — Canadian PR Pathway Plans',
    description:
      'Not sure where you stand? Start free. Need clarity? Get your Readiness Report. Already in the process? Let Navly track it for you.',
  },
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
