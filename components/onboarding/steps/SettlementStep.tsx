'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { getRequiredFunds, SETTLEMENT_FUNDS } from '@/lib/settlement-funds'
import type { IntakeData } from '@/lib/profile'

export function StepSettlement({ data, onChange }: {
  data: Pick<IntakeData, 'familySize' | 'settlementFunds'>
  onChange: (fields: Partial<IntakeData>) => void
}) {
  const familySize = parseInt(data.familySize) || 1
  const required = getRequiredFunds(familySize)
  return (
    <div>
      <h1 className="text-3xl font-bold text-[#0B1F3A]">Settlement funds</h1>
      <p className="mt-2 text-slate-500">
        Federal Skilled Worker requires proof of available funds. Canadian Experience Class and most PNP streams do not require this.
      </p>
      <p className="mt-1 text-xs text-slate-400">
        Amounts last verified: {SETTLEMENT_FUNDS.lastCheckedAt}. IRCC updates these annually —{' '}
        <a href={SETTLEMENT_FUNDS.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline">check the latest on IRCC</a>.
      </p>
      <div className="mt-8 flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <Label htmlFor="familySize" className="text-sm font-semibold text-[#0B1F3A]">
            Family size (including yourself)
            <span className="ml-1.5 block text-xs font-normal text-slate-500 mt-0.5">Count yourself, spouse (if coming), and all dependent children.</span>
          </Label>
          <Input id="familySize" type="number" min={1} max={20} placeholder="e.g. 2"
            value={data.familySize} onChange={(e) => onChange({ familySize: e.target.value })}
            className="max-w-xs rounded-xl border-slate-200 bg-white px-4 py-3 text-[#0B1F3A] placeholder:text-slate-400 focus-visible:ring-[#D62828]" />
          {data.familySize && (
            <p className="text-xs font-semibold text-[#D62828]">FSW minimum: ${required.toLocaleString()} CAD for a family of {familySize}</p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="settlementFunds" className="text-sm font-semibold text-[#0B1F3A]">
            Available settlement funds (CAD)
            <span className="ml-1.5 block text-xs font-normal text-slate-500 mt-0.5">Combined savings and liquid assets you can access. Do not include property.</span>
          </Label>
          <Input id="settlementFunds" type="number" min={0} placeholder="e.g. 20000"
            value={data.settlementFunds} onChange={(e) => onChange({ settlementFunds: e.target.value })}
            className="max-w-sm rounded-xl border-slate-200 bg-white px-4 py-3 text-[#0B1F3A] placeholder:text-slate-400 focus-visible:ring-[#D62828]" />
          {data.settlementFunds && data.familySize && (
            <p className={cn('text-xs font-semibold', parseFloat(data.settlementFunds) >= required ? 'text-green-700' : 'text-[#D62828]')}>
              {parseFloat(data.settlementFunds) >= required
                ? `Meets the FSW minimum of $${required.toLocaleString()}`
                : `Below the FSW minimum — this blocks FSW but not CEC or PNP`}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
