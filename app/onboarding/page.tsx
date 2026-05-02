import { IntakeFlow } from '@/components/onboarding/IntakeFlow'

export const metadata = {
  title: 'Get started | Navly',
  description: 'Tell us about your immigration situation so we can help you get organized.',
}

export default function OnboardingPage() {
  return (
    <main className="bg-[#F8FAFC]">
      <IntakeFlow />
    </main>
  )
}
