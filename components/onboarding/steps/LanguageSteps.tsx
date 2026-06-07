'use client'

import { AlertTriangle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { OptionCard, LanguageScoreFields, langTestOptions, englishTestOptions, frenchTestOptions, educationOptions } from '../shared'
import type { IntakeData } from '@/lib/profile'

function getTestDateStatus(dateStr: string): { valid: boolean; label: string; warning: boolean } | null {
  if (!dateStr) return null
  const parsed = new Date(dateStr)
  if (isNaN(parsed.getTime())) return null
  const now = new Date()
  const expiryDate = new Date(parsed)
  expiryDate.setFullYear(expiryDate.getFullYear() + 2)
  if (parsed > now) return { valid: false, label: 'Date is in the future', warning: true }
  const daysUntilExpiry = Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (daysUntilExpiry <= 0) {
    const monthsOld = Math.round((now.getTime() - parsed.getTime()) / (1000 * 60 * 60 * 24 * 30.44))
    return { valid: false, label: `Score expired — taken ${monthsOld} months ago (max 24 months for Express Entry)`, warning: true }
  }
  if (daysUntilExpiry <= 30) return { valid: true, label: `Score expires in ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''}`, warning: true }
  const monthsLeft = Math.ceil(daysUntilExpiry / 30)
  return { valid: true, label: `Score valid — expires in approximately ${monthsLeft} month${monthsLeft !== 1 ? 's' : ''}`, warning: monthsLeft <= 4 }
}

export function StepSpouseLanguage({ data, onChange }: {
  data: Pick<IntakeData, 'spouseLangTestType' | 'spouseLangReading' | 'spouseLangWriting' | 'spouseLangListening' | 'spouseLangSpeaking' | 'spouseEducationLevel' | 'spouseCanadianWorkMonths'>
  onChange: (fields: Partial<IntakeData>) => void
}) {
  return (
    <div>
      <h1 className="text-3xl font-bold text-heading">Your spouse / partner's details</h1>
      <p className="mt-2 text-muted-text">When your spouse accompanies you, their language, education, and Canadian experience add up to 40 bonus CRS points.</p>
      <div className="mt-8 flex flex-col gap-8">
        <div className="flex flex-col gap-3">
          <Label className="text-sm font-semibold text-heading">
            Spouse's language test
            <span className="ml-1.5 block text-xs font-normal text-muted-text mt-0.5">Skip if no test taken — they will contribute 0 language points.</span>
          </Label>
          {langTestOptions.map((opt) => (
            <OptionCard key={opt.value} label={opt.label} desc={opt.desc}
              selected={data.spouseLangTestType === opt.value}
              onClick={() => onChange({ spouseLangTestType: opt.value, spouseLangReading: '', spouseLangWriting: '', spouseLangListening: '', spouseLangSpeaking: '' })}
            />
          ))}
          <OptionCard label="No test taken" desc="Spouse has not taken a language test" selected={data.spouseLangTestType === 'none'} onClick={() => onChange({ spouseLangTestType: 'none' })} />
        </div>

        {data.spouseLangTestType && data.spouseLangTestType !== 'none' && (
          <LanguageScoreFields
            testType={data.spouseLangTestType}
            values={{ r: data.spouseLangReading, w: data.spouseLangWriting, l: data.spouseLangListening, s: data.spouseLangSpeaking }}
            onChange={(k, v) => {
              const keyMap: Record<string, keyof IntakeData> = { r: 'spouseLangReading', w: 'spouseLangWriting', l: 'spouseLangListening', s: 'spouseLangSpeaking' }
              onChange({ [keyMap[k]]: v })
            }}
          />
        )}

        <div className="flex flex-col gap-3">
          <Label className="text-sm font-semibold text-heading">Spouse's highest education</Label>
          {educationOptions.map((opt) => (
            <OptionCard key={opt.value} label={opt.label} desc={opt.desc} selected={data.spouseEducationLevel === opt.value} onClick={() => onChange({ spouseEducationLevel: opt.value })} />
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="spouseCanWork" className="text-sm font-semibold text-heading">
            Spouse's skilled Canadian work experience (months)
            <span className="ml-1.5 block text-xs font-normal text-muted-text mt-0.5">TEER 0–3 only. Enter 0 if none.</span>
          </Label>
          <Input id="spouseCanWork" type="number" min={0} max={120} placeholder="e.g. 0"
            value={data.spouseCanadianWorkMonths} onChange={(e) => onChange({ spouseCanadianWorkMonths: e.target.value })}
            className="max-w-xs rounded-xl border-subtle bg-surface-card px-4 py-3 text-heading placeholder:text-muted-text/70 focus-visible:ring-navly-red" />
        </div>
      </div>
    </div>
  )
}

function TestDateField({ id, value, onChange }: { id: string; value: string; onChange: (v: string) => void }) {
  const status = getTestDateStatus(value)
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id} className="text-sm font-semibold text-heading">
        Exact test date
        <span className="ml-1.5 block text-xs font-normal text-muted-text mt-0.5">Test results must be less than 2 years old for Express Entry. Day precision tracks this exactly.</span>
      </Label>
      <Input id={id} type="date" value={value} onChange={(e) => onChange(e.target.value)}
        className="max-w-xs rounded-xl border-subtle bg-surface-card px-4 py-3 text-heading focus-visible:ring-navly-red" />
      {status && (
        <p className={`text-sm font-medium ${status.warning ? 'text-amber-600' : 'text-emerald-600'}`}>
          {status.label}
        </p>
      )}
    </div>
  )
}

export function StepLanguage({ data, onChange }: {
  data: Pick<IntakeData,
    | 'firstOfficialLanguage'
    | 'langTestType' | 'langTestDate' | 'langReading' | 'langWriting' | 'langListening' | 'langSpeaking'
    | 'lang2TestType' | 'lang2TestDate' | 'lang2Reading' | 'lang2Writing' | 'lang2Listening' | 'lang2Speaking'
  >
  onChange: (fields: Partial<IntakeData>) => void
}) {
  const isEnglishFirst = data.firstOfficialLanguage === 'english'
  const isFrenchFirst = data.firstOfficialLanguage === 'french'
  const hasFirstLang = isEnglishFirst || isFrenchFirst

  const firstTestOptions = isEnglishFirst ? englishTestOptions : isFrenchFirst ? frenchTestOptions : []
  const secondTestOptions = isEnglishFirst ? frenchTestOptions : isFrenchFirst ? englishTestOptions : []

  const showFirstScores = !!data.langTestType && !!{ 'ielts-general': 1, celpip: 1, pte: 1, tef: 1, tcf: 1 }[data.langTestType]
  const showSecondScores = !!data.lang2TestType && !!{ 'ielts-general': 1, celpip: 1, pte: 1, tef: 1, tcf: 1 }[data.lang2TestType]

  // French category: CLB 7+ in French qualifies for dedicated French category draws
  const hasFrenchScores = (isEnglishFirst && showSecondScores && (data.lang2TestType === 'tef' || data.lang2TestType === 'tcf'))
    || (isFrenchFirst && showFirstScores)

  return (
    <div>
      <h1 className="text-3xl font-bold text-heading">Language test results</h1>
      <p className="mt-2 text-muted-text">
        Language is the highest-value CRS factor. Accepted tests: IELTS General Training, CELPIP-General, PTE Core (English) and TEF Canada, TCF Canada (French). Results must be less than 2 years old.
      </p>
      <div className="mt-6 flex flex-col gap-8">

        {/* First official language */}
        <div className="flex flex-col gap-3">
          <Label className="text-sm font-semibold text-heading">
            First official language
            <span className="ml-1.5 block text-xs font-normal text-muted-text mt-0.5">The language you claim as your primary for CRS scoring. Most applicants claim English.</span>
          </Label>
          {[
            { value: 'english', label: 'English', desc: 'Claim English as my first official language' },
            { value: 'french', label: 'French', desc: 'Claim French as my first official language' },
          ].map((opt) => (
            <OptionCard key={opt.value} label={opt.label} desc={opt.desc}
              selected={data.firstOfficialLanguage === opt.value}
              onClick={() => onChange({
                firstOfficialLanguage: opt.value,
                langTestType: '', langTestDate: '', langReading: '', langWriting: '', langListening: '', langSpeaking: '',
                lang2TestType: '', lang2TestDate: '', lang2Reading: '', lang2Writing: '', lang2Listening: '', lang2Speaking: '',
              })}
            />
          ))}
        </div>

        {/* First language test */}
        {hasFirstLang && (
          <>
            <div className="flex flex-col gap-3">
              <Label className="text-sm font-semibold text-heading">
                {isEnglishFirst ? 'English test' : 'French test'}
              </Label>
              {firstTestOptions.map((opt) => (
                <OptionCard key={opt.value} label={opt.label} desc={opt.desc}
                  selected={data.langTestType === opt.value}
                  onClick={() => onChange({ langTestType: opt.value, langReading: '', langWriting: '', langListening: '', langSpeaking: '' })}
                />
              ))}
              <OptionCard label="No test taken yet" desc="I have not taken this test" selected={data.langTestType === 'none'}
                onClick={() => onChange({ langTestType: 'none', langTestDate: '', langReading: '', langWriting: '', langListening: '', langSpeaking: '' })} />
            </div>

            {data.langTestType === 'none' && (
              <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <p className="text-sm text-amber-800">
                  <span className="font-semibold">Language test required for most PR pathways.</span>{' '}
                  We will show you what score you need and which test to take. You can update your results later.
                </p>
              </div>
            )}

            {data.langTestType && data.langTestType !== 'none' && (
              <TestDateField id="langTestDate" value={data.langTestDate} onChange={(v) => onChange({ langTestDate: v })} />
            )}

            {showFirstScores && (
              <LanguageScoreFields
                testType={data.langTestType}
                values={{ r: data.langReading, w: data.langWriting, l: data.langListening, s: data.langSpeaking }}
                onChange={(k, v) => {
                  const keyMap: Record<string, keyof IntakeData> = { r: 'langReading', w: 'langWriting', l: 'langListening', s: 'langSpeaking' }
                  onChange({ [keyMap[k]]: v })
                }}
              />
            )}
          </>
        )}

        {/* Second official language */}
        {hasFirstLang && (
          <div className="rounded-2xl border border-subtle bg-surface-alt p-5">
            <p className="text-sm font-semibold text-heading">
              Second official language — optional
            </p>
            <p className="mt-1 text-sm text-muted-text">
              Adding a {isEnglishFirst ? 'French' : 'English'} test can add up to <span className="font-semibold">24 bonus CRS points</span> for bilingualism.
              {isEnglishFirst && ' French scores also open French category Express Entry draws.'}
            </p>
            <div className="mt-4 flex flex-col gap-4">
              <div className="flex flex-col gap-3">
                {secondTestOptions.map((opt) => (
                  <OptionCard key={opt.value} label={opt.label} desc={opt.desc}
                    selected={data.lang2TestType === opt.value}
                    onClick={() => onChange({ lang2TestType: opt.value, lang2TestDate: '', lang2Reading: '', lang2Writing: '', lang2Listening: '', lang2Speaking: '' })}
                  />
                ))}
                <OptionCard label="No second language test" desc="Skip — I will not claim a second official language"
                  selected={data.lang2TestType === 'none' || (!data.lang2TestType && hasFirstLang)}
                  onClick={() => onChange({ lang2TestType: 'none', lang2TestDate: '', lang2Reading: '', lang2Writing: '', lang2Listening: '', lang2Speaking: '' })} />
              </div>

              {data.lang2TestType && data.lang2TestType !== 'none' && (
                <TestDateField id="lang2TestDate" value={data.lang2TestDate} onChange={(v) => onChange({ lang2TestDate: v })} />
              )}

              {showSecondScores && (
                <LanguageScoreFields
                  testType={data.lang2TestType}
                  values={{ r: data.lang2Reading, w: data.lang2Writing, l: data.lang2Listening, s: data.lang2Speaking }}
                  onChange={(k, v) => {
                    const keyMap: Record<string, keyof IntakeData> = { r: 'lang2Reading', w: 'lang2Writing', l: 'lang2Listening', s: 'lang2Speaking' }
                    onChange({ [keyMap[k]]: v })
                  }}
                />
              )}
            </div>
          </div>
        )}

        {/* French category eligibility notice */}
        {hasFrenchScores && (
          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
            <p className="text-sm font-semibold text-blue-900">French category eligibility</p>
            <p className="mt-1 text-sm text-blue-800">
              If your French CLB is 7 or higher in all four skills, you may qualify for <span className="font-semibold">French category Express Entry draws</span>, which often have lower CRS cutoffs than general draws.
              A qualifying score also adds <span className="font-semibold">25–50 bonus CRS points</span> depending on your English level.
              Navly will calculate your French category score once you complete onboarding.
            </p>
          </div>
        )}

      </div>
    </div>
  )
}
