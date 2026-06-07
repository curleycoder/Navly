'use client'

import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { CA_PROVINCES } from '@/lib/geo'
import { OptionCard, ChevronDownIcon, selectClass } from '../shared'
import type { IntakeData } from '@/lib/profile'

const manitobaRelativeOptions = [
  { value: 'parent', label: 'Parent', desc: 'Mother or father who is a Canadian citizen or PR living in Manitoba' },
  { value: 'child', label: 'Son or daughter', desc: 'Adult child who is a Canadian citizen or PR living in Manitoba' },
  { value: 'grandparent', label: 'Grandparent', desc: 'Grandparent who is a Canadian citizen or PR living in Manitoba' },
  { value: 'sibling', label: 'Brother or sister', desc: 'Sibling who is a Canadian citizen or PR living in Manitoba' },
  { value: 'none', label: 'None of the above', desc: 'I do not have a qualifying relative in Manitoba' },
]

export function StepManitobaFamily({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <h1 className="text-3xl font-bold text-heading">Family connections in Manitoba</h1>
      <p className="mt-2 text-muted-text">Manitoba PNP has a Family Stream where having a close relative who is a Canadian citizen or permanent resident living in Manitoba can open a direct PR pathway.</p>
      <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
        <p className="text-sm text-blue-800">
          <span className="font-semibold">To qualify, your relative must: </span>
          be a Canadian citizen or permanent resident, have lived in Manitoba for at least 1 year, and be willing to support your application.
        </p>
      </div>
      <p className="mt-5 text-sm font-semibold text-heading">Do you have any of the following in Manitoba?</p>
      <div className="mt-3 flex flex-col gap-3">
        {manitobaRelativeOptions.map((opt) => (
          <OptionCard key={opt.value} label={opt.label} desc={opt.desc} selected={value === opt.value} onClick={() => onChange(opt.value)} />
        ))}
      </div>
    </div>
  )
}

const arrivalTimelineOptions = [
  { value: 'within-3-months', label: 'Within 3 months', desc: 'Moving soon — I need to act quickly' },
  { value: '3-6-months', label: '3–6 months', desc: 'Planning to arrive in the near future' },
  { value: '6-12-months', label: '6–12 months', desc: 'Still preparing — exploring options' },
  { value: '1-2-years', label: '1–2 years', desc: 'Early planning stage' },
  { value: 'not-sure', label: 'Not sure yet', desc: 'I want to understand my options first' },
]

export function StepProvince({ data, onChange }: {
  data: Pick<IntakeData, 'intendedProvince' | 'hasJobOffer' | 'locationStatus' | 'province' | 'status' | 'targetArrivalTimeline'>
  onChange: (fields: Partial<IntakeData>) => void
}) {
  const isInside = data.locationStatus === 'inside'
  const currentProvinceLabel = CA_PROVINCES.find(p => p.value === data.province)?.label ?? ''
  // Track move intent separately so the card stays selected while province picker is open
  const [wantsToMove, setWantsToMove] = useState(
    !!data.intendedProvince && data.intendedProvince !== data.province
  )

  // PR users skip canada-dates, so province may not be set yet — ask inline
  const needsProvincePicker = isInside && !data.province

  return (
    <div>
      <h1 className="text-3xl font-bold text-heading">
        {isInside ? 'Are you planning to stay or move for PR?' : 'Where and when do you plan to arrive?'}
      </h1>
      <p className="mt-2 text-muted-text">
        {isInside
          ? 'Your province determines PNP eligibility. Some streams require you to live and work in that province.'
          : 'Your target province and timeline help us show the most relevant pathways.'}
      </p>
      <div className="mt-6 flex flex-col gap-6">

        {needsProvincePicker && (
          <div className="flex flex-col gap-2">
            <Label htmlFor="curProv" className="text-sm font-semibold text-heading">Which province are you currently in?</Label>
            <div className="relative">
              <select id="curProv" value={data.province ?? ''} onChange={(e) => onChange({ province: e.target.value, intendedProvince: e.target.value })}
                className={cn(selectClass, !data.province && 'text-muted-text/70')}>
                <option value="" disabled>Select province or territory…</option>
                {CA_PROVINCES.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
              </select>
              <ChevronDownIcon />
            </div>
          </div>
        )}

        {!isInside && (
          <div className="flex flex-col gap-3">
            <Label className="text-sm font-semibold text-heading">When are you planning to arrive in Canada?</Label>
            {arrivalTimelineOptions.map((opt) => (
              <OptionCard key={opt.value} label={opt.label} desc={opt.desc} selected={data.targetArrivalTimeline === opt.value} onClick={() => onChange({ targetArrivalTimeline: opt.value })} />
            ))}
          </div>
        )}

        {isInside && !needsProvincePicker ? (
          <div className="flex flex-col gap-3">
            <Label className="text-sm font-semibold text-heading">Where are you planning to settle for PR?</Label>
            {[
              { value: data.province, label: `Stay in ${currentProvinceLabel}`, desc: "Apply through this province's PNP or CEC" },
              { value: '__move__', label: 'Move to a different province', desc: 'Some PNP streams require living in that province' },
            ].map((opt) => (
              <OptionCard
                key={opt.value}
                label={opt.label}
                desc={opt.desc}
                selected={opt.value === '__move__' ? wantsToMove : !wantsToMove && data.intendedProvince === data.province}
                onClick={() => {
                  if (opt.value === '__move__') {
                    setWantsToMove(true)
                    onChange({ intendedProvince: '' })
                  } else {
                    setWantsToMove(false)
                    onChange({ intendedProvince: data.province })
                  }
                }}
              />
            ))}
            {wantsToMove && (
              <div className="flex flex-col gap-2 mt-1">
                <Label htmlFor="intProv" className="text-sm font-semibold text-heading">Which province?</Label>
                <div className="relative">
                  <select id="intProv" value={data.intendedProvince}
                    onChange={(e) => onChange({ intendedProvince: e.target.value })}
                    className={cn(selectClass, !data.intendedProvince && 'text-muted-text/70')}>
                    <option value="" disabled>Select a province or territory…</option>
                    {CA_PROVINCES.filter(p => p.value !== data.province).map(({ value, label }) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                  <ChevronDownIcon />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <Label htmlFor="intProv" className="text-sm font-semibold text-heading">Intended province / territory</Label>
            <div className="relative">
              <select id="intProv" value={data.intendedProvince} onChange={(e) => onChange({ intendedProvince: e.target.value })}
                className={cn(selectClass, !data.intendedProvince && 'text-muted-text/70')}>
                <option value="" disabled>Select a province or territory…</option>
                <option value="Any">No preference — open to any province</option>
                {CA_PROVINCES.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
              </select>
              <ChevronDownIcon />
            </div>
          </div>
        )}

        {(data.intendedProvince === 'QC' || (isInside && data.province === 'QC' && !wantsToMove)) && (
          <div className="rounded-2xl border border-navly-navy/15 bg-navly-navy/5 p-4">
            <p className="text-sm font-semibold text-heading">Note on Quebec</p>
            <p className="mt-1 text-sm leading-6 text-muted-text">Quebec has its own selection system (Arrima / PSTQ). Express Entry and most PNP pathways do not apply. You must obtain a Quebec Selection Certificate (CSQ) first.</p>
          </div>
        )}
      </div>
    </div>
  )
}
