'use client'

import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { OptionCard, ChevronDownIcon, selectClass } from '../shared'
import { CA_PROVINCES } from '@/lib/geo'
import type { IntakeData } from '@/lib/profile'

function ProvinceSelect({ id, value, onChange, placeholder = 'Select a province or territory…' }: {
  id: string; value: string; onChange: (v: string) => void; placeholder?: string
}) {
  return (
    <div className="relative">
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)}
        className={cn(selectClass, !value && 'text-muted-text/70')}>
        <option value="" disabled>{placeholder}</option>
        <option value="none">Not in Canada</option>
        {CA_PROVINCES.map(({ value: v, label }) => <option key={v} value={v}>{label}</option>)}
      </select>
      <ChevronDownIcon />
    </div>
  )
}

const ATLANTIC_PROVINCES = new Set(['NS', 'NB', 'PE', 'NL'])

export function StepPNP({ data, onChange }: {
  data: Pick<IntakeData,
    | 'intendedProvince' | 'locationStatus' | 'status' | 'province'
    | 'hasJobOffer' | 'hasDesignatedEmployerOffer' | 'noc' | 'teerLevel' | 'wage' | 'isPermanentNonSeasonal'
    | 'canadianEducation' | 'frenchTestType'
    | 'pnpJobOfferProvince' | 'pnpEducationProvince' | 'pnpRelativesProvince'
    | 'employerSupportsPNP' | 'workExpInTargetProvince' | 'studiedInTargetProvince'
    | 'ruralCommunityInterest'
  >
  onChange: (fields: Partial<IntakeData>) => void
}) {
  const targetLabel = CA_PROVINCES.find(p => p.value === data.intendedProvince)?.label
    ?? (data.intendedProvince === 'Any' ? 'your target province' : data.intendedProvince)

  const isAtlantic = ATLANTIC_PROVINCES.has((data.intendedProvince || '').toUpperCase().slice(0, 2))
  const isInside = data.locationStatus === 'inside'
  const isWorker = isInside && data.status === 'work-permit'
  const hasCanadianEd = data.canadianEducation === 'yes'
  const hasFrench = !!data.frenchTestType && data.frenchTestType !== 'none'
  const isSkilled = ['0', '1', '2', '3'].includes(data.teerLevel)

  return (
    <div>
      <h1 className="text-3xl font-bold text-heading">Provincial ties</h1>
      <p className="mt-2 text-muted-text">
        PNP eligibility depends heavily on your connection to a province — not just which one you want to live in.
        Job offer, work experience, education, and family ties all affect which streams you qualify for.
      </p>
      <div className="mt-8 flex flex-col gap-8">

        {/* Job offer province */}
        {data.hasJobOffer === 'yes' && (
          <div className="flex flex-col gap-2">
            <Label htmlFor="pnpJobProv" className="text-sm font-semibold text-heading">
              Province of your job offer
              <span className="ml-1.5 block text-xs font-normal text-muted-text mt-0.5">Most PNP employer streams require the job to be in that province.</span>
            </Label>
            <ProvinceSelect id="pnpJobProv" value={data.pnpJobOfferProvince} onChange={(v) => onChange({ pnpJobOfferProvince: v })} placeholder="Select province of job offer…" />
          </div>
        )}

        {/* Work experience in target province */}
        <div className="flex flex-col gap-3">
          <Label className="text-sm font-semibold text-heading">
            Do you have paid work experience in {targetLabel}?
            <span className="ml-1.5 block text-xs font-normal text-muted-text mt-0.5">
              {isWorker
                ? 'Work experience in the province strengthens most employer and occupation streams.'
                : 'Many PNP streams give priority or exclusive access to people already working in the province.'}
            </span>
          </Label>
          {[
            { value: 'yes', label: 'Yes', desc: 'I have worked in this province' },
            { value: 'no', label: 'No', desc: 'I have no work history in this province' },
          ].map((opt) => (
            <OptionCard key={opt.value} label={opt.label} desc={opt.desc}
              selected={data.workExpInTargetProvince === opt.value}
              onClick={() => onChange({ workExpInTargetProvince: opt.value })} />
          ))}
        </div>

        {/* Employer support */}
        {isSkilled && (
          <div className="flex flex-col gap-3">
            <Label className="text-sm font-semibold text-heading">
              Is a Canadian employer willing to support your PNP application?
              <span className="ml-1.5 block text-xs font-normal text-muted-text mt-0.5">Employer-supported streams (e.g. BC PNP Skills Immigration, SINP Employer Job Offer) require a valid offer and employer who will submit a supporting letter.</span>
            </Label>
            {[
              { value: 'yes', label: 'Yes', desc: 'An employer is ready to support my application' },
              { value: 'unsure', label: 'Not confirmed yet', desc: 'I have a potential offer but no commitment' },
              { value: 'no', label: 'No', desc: 'No employer support available' },
            ].map((opt) => (
              <OptionCard key={opt.value} label={opt.label} desc={opt.desc}
                selected={data.employerSupportsPNP === opt.value}
                onClick={() => onChange({ employerSupportsPNP: opt.value })} />
            ))}
          </div>
        )}

        {/* AIP designated employer — only relevant for Atlantic provinces */}
        {data.hasJobOffer === 'yes' && isAtlantic && (
          <div className="flex flex-col gap-3">
            <Label className="text-sm font-semibold text-heading">
              Is your job offer from an AIP-designated employer?
              <span className="ml-1.5 block text-xs font-normal text-muted-text mt-0.5">
                The Atlantic Immigration Program only accepts offers from employers specifically designated by the government. A regular job offer is not enough.
              </span>
            </Label>
            {[
              { value: 'yes', label: 'Yes — the employer is AIP-designated', desc: '' },
              { value: 'unsure', label: "I'm not sure", desc: 'You can verify at canada.ca/aip-employers' },
              { value: 'no', label: 'No — not an AIP-designated employer', desc: 'This blocks the AIP pathway' },
            ].map((opt) => (
              <OptionCard key={opt.value} label={opt.label} desc={opt.desc}
                selected={data.hasDesignatedEmployerOffer === opt.value}
                onClick={() => onChange({ hasDesignatedEmployerOffer: opt.value })} />
            ))}
          </div>
        )}

        {/* Job permanence */}
        {data.hasJobOffer === 'yes' && (
          <div className="flex flex-col gap-3">
            <Label className="text-sm font-semibold text-heading">
              Is the job offer for a permanent, non-seasonal position?
              <span className="ml-1.5 block text-xs font-normal text-muted-text mt-0.5">Nearly all PNP employer streams require the position to be full-time, permanent, and non-seasonal.</span>
            </Label>
            {[
              { value: 'yes', label: 'Yes — permanent and non-seasonal', desc: '' },
              { value: 'no', label: 'No — seasonal, contract, or temporary', desc: '' },
            ].map((opt) => (
              <OptionCard key={opt.value} label={opt.label} desc={opt.desc}
                selected={data.isPermanentNonSeasonal === opt.value}
                onClick={() => onChange({ isPermanentNonSeasonal: opt.value })} />
            ))}
          </div>
        )}

        {/* Education in province */}
        {hasCanadianEd && (
          <>
            <div className="flex flex-col gap-3">
              <Label className="text-sm font-semibold text-heading">
                Did you study in {targetLabel}?
                <span className="ml-1.5 block text-xs font-normal text-muted-text mt-0.5">Graduates of schools in a province often qualify for international graduate or post-secondary streams.</span>
              </Label>
              {[
                { value: 'yes', label: 'Yes', desc: 'I studied in this province' },
                { value: 'no', label: 'No', desc: 'I studied in a different province' },
              ].map((opt) => (
                <OptionCard key={opt.value} label={opt.label} desc={opt.desc}
                  selected={data.studiedInTargetProvince === opt.value}
                  onClick={() => onChange({ studiedInTargetProvince: opt.value })} />
              ))}
            </div>
            {data.studiedInTargetProvince === 'no' && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="pnpEdProv" className="text-sm font-semibold text-heading">
                  Which province did you study in?
                </Label>
                <ProvinceSelect id="pnpEdProv" value={data.pnpEducationProvince} onChange={(v) => onChange({ pnpEducationProvince: v })} placeholder="Select province of study…" />
              </div>
            )}
          </>
        )}

        {/* Relatives in province */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="pnpRelProv" className="text-sm font-semibold text-heading">
            Do you have close relatives in any Canadian province?
            <span className="ml-1.5 block text-xs font-normal text-muted-text mt-0.5">Family connections may qualify you for family stream pathways (e.g. Manitoba PNP Family, SINP Family) or add adaptability points.</span>
          </Label>
          <ProvinceSelect id="pnpRelProv" value={data.pnpRelativesProvince} onChange={(v) => onChange({ pnpRelativesProvince: v })} placeholder="Select province of relatives…" />
        </div>

        {/* French ability */}
        <div className="rounded-2xl border border-subtle bg-surface-alt p-4">
          <p className="text-sm font-semibold text-heading">French language ability</p>
          <p className="mt-1 text-sm text-muted-text">
            {hasFrench
              ? 'You have entered French test scores. This may open French-language PNP streams in New Brunswick, Ontario, Manitoba, and other provinces.'
              : 'You have not entered French test scores. French ability can open additional PNP streams in several provinces, including Ontario (OINP Francophone) and New Brunswick. You can add a French test result in your language section.'}
          </p>
        </div>

        {/* Rural/community interest */}
        <div className="flex flex-col gap-3">
          <Label className="text-sm font-semibold text-heading">
            Are you open to settling in a rural or smaller community?
            <span className="ml-1.5 block text-xs font-normal text-muted-text mt-0.5">Programs like the Rural and Northern Immigration Pilot (RNIP) and Atlantic Immigration Program (AIP) target smaller communities and may have lower competition than major city streams.</span>
          </Label>
          {[
            { value: 'yes', label: 'Yes — open to rural or small communities', desc: 'I am willing to settle outside major cities' },
            { value: 'no', label: 'No — I want to settle in a major city', desc: 'e.g. Toronto, Vancouver, Calgary, Montreal' },
          ].map((opt) => (
            <OptionCard key={opt.value} label={opt.label} desc={opt.desc}
              selected={data.ruralCommunityInterest === opt.value}
              onClick={() => onChange({ ruralCommunityInterest: opt.value })} />
          ))}
        </div>

      </div>
    </div>
  )
}
