'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    q: 'Is Navly affiliated with IRCC or the Canadian government?',
    a: 'No. Navly is an independent educational planning tool. We are not affiliated with IRCC, the Government of Canada, or any immigration authority. Always verify official requirements on canada.ca.',
  },
  {
    q: 'How is Navly different from an immigration consultant?',
    a: 'Navly organizes your information, estimates your CRS score, and shows possible pathways based on the data you enter. We do not give legal advice, review documents, or prepare applications. For advice on your specific situation, consult a licensed RCIC or immigration lawyer.',
  },
  {
    q: 'Do I need to upload any documents?',
    a: 'No. Navly never asks for passports, SIN numbers, birth certificates, bank statements, or any government documents. We only collect profile information you type in — things like your language scores, education level, and work history.',
  },
  {
    q: 'How accurate is the CRS score estimate?',
    a: "The estimate is based on the profile data you enter and the official CRS formula. It's a planning guide, not an official score. Your real CRS score is calculated by IRCC only when you submit an Express Entry profile.",
  },
  {
    q: 'What if my situation has complications — refusals, expired status, or a criminal record?',
    a: 'Navly will flag high-risk factors and recommend you speak with a licensed immigration consultant or lawyer before taking any action. We do not provide pathway estimates for situations that require legal review.',
  },
  {
    q: 'Is my personal data safe?',
    a: 'Navly collects only the profile information you enter. We do not collect government IDs, financial documents, or sensitive identity documents. Your data is stored securely and never sold to third parties. See our Privacy Policy for full details.',
  },
  {
    q: 'How often is Navly updated with new immigration rules?',
    a: 'We update the app when IRCC announces significant changes — such as CRS scoring rules, PGWP eligibility, Express Entry categories, and PNP streams. The last update date is shown on the homepage.',
  },
]

export function FAQAccordion() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <div className="space-y-2">
      {faqs.map((faq, i) => {
        const isOpen = open === i
        return (
          <div
            key={i}
            className={`rounded-xl border transition-colors duration-150 ${
              isOpen
                ? 'border-navly-red/25 bg-surface-alt'
                : 'border-subtle bg-surface-card'
            }`}
          >
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
            >
              <span className="text-sm font-semibold leading-snug text-heading">
                {faq.q}
              </span>
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors duration-150 ${
                  isOpen ? 'bg-navly-red' : 'bg-subtle'
                }`}
              >
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-white' : 'text-muted-text'
                  }`}
                  aria-hidden="true"
                />
              </span>
            </button>
            <div
              className={`grid transition-all duration-200 ease-in-out ${
                isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
              }`}
            >
              <div className="min-h-0 overflow-hidden">
                <p className="px-5 pb-5 text-sm leading-7 text-muted-text">
                  {faq.a}
                </p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
