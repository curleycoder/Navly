'use client'

import { useEffect, useState } from 'react'
import { fetchConsultants, getClaimedCodes, claimPromoCode, type ConsultantListing } from '@/lib/consultants'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ShieldCheck, MapPin, Globe, Briefcase, ExternalLink, Star, Loader2 } from 'lucide-react'

export default function ConsultantsPage() {
  const [consultants, setConsultants] = useState<ConsultantListing[]>([])
  const [loading, setLoading] = useState(true)
  const [claimed, setClaimed] = useState<Record<string, string>>({})
  const [claiming, setClaiming] = useState<string | null>(null)
  const [initial, setInitial] = useState('')

  useEffect(() => {
    setClaimed(getClaimedCodes())
    fetchConsultants().then((data) => {
      setConsultants(data)
      setLoading(false)
    })
  }, [])

  function handleClaim(consultant: ConsultantListing) {
    const letter = initial.trim() ? initial.trim()[0] : 'A'
    const code = claimPromoCode(consultant.id, consultant.agency_code, letter)
    setClaimed((prev) => ({ ...prev, [consultant.id]: code }))
    setClaiming(null)
    setInitial('')
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10">
      <div className="mb-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#D62828]">Partner Network</p>
        <h1 className="mt-1 text-3xl font-bold text-[#0B1F3A]">Find a Certified Consultant</h1>
        <p className="mt-2 max-w-2xl text-slate-500">
          Navly partners with certified RCICs and immigration lawyers. Browse the directory and claim your exclusive 20% discount code.
        </p>
        <p className="mt-2 text-xs text-slate-400">
          Consultants are independent professionals. Navly does not provide immigration consulting services.
        </p>
      </div>

      {loading ? (
        <div className="mt-16 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
        </div>
      ) : consultants.length === 0 ? (
        <div className="mt-16 text-center">
          <p className="text-slate-400">No consultants listed yet. Check back soon.</p>
        </div>
      ) : (
        <div className="mt-8 flex flex-col gap-6">
          {consultants.map((c) => (
            <Card
              key={c.id}
              className={`rounded-2xl border ${c.sponsored ? 'border-emerald-200 bg-emerald-50/50' : 'border-slate-200 bg-white'}`}
            >
              <CardContent className="p-6">
                {c.sponsored && (
                  <span className="mb-3 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-800">
                    <Star className="h-3 w-3" /> Sponsored
                  </span>
                )}
                <div className="flex flex-col gap-6 md:flex-row">
                  {c.avatar_url ? (
                    <img
                      src={c.avatar_url}
                      alt={c.name}
                      className="h-20 w-20 rounded-full border border-slate-200 object-cover"
                    />
                  ) : (
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#0B1F3A] text-2xl font-bold text-white">
                      {c.name.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-[#0B1F3A]">{c.name}</h2>
                      {c.verified && <ShieldCheck className="h-5 w-5 text-emerald-600" />}
                    </div>
                    <p className="mb-4 text-sm font-semibold text-slate-600">{c.business_name}</p>

                    <div className="grid grid-cols-1 gap-x-4 gap-y-3 text-sm text-slate-600 sm:grid-cols-2">
                      <div className="flex items-start gap-2">
                        <Briefcase className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                        <span>
                          {c.certification_type}
                          {c.license_number && (
                            <span className="text-slate-400"> ({c.license_number})</span>
                          )}
                        </span>
                      </div>
                      {(c.city || c.province) && (
                        <div className="flex items-start gap-2">
                          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                          <span>{[c.city, c.province].filter(Boolean).join(', ')}</span>
                        </div>
                      )}
                      {c.languages?.length > 0 && (
                        <div className="flex items-start gap-2">
                          <Globe className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                          <span>{c.languages.join(', ')}</span>
                        </div>
                      )}
                    </div>

                    {c.services?.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {c.services.map((s) => (
                          <span
                            key={s}
                            className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex shrink-0 flex-col items-stretch justify-center gap-3 mt-4 md:mt-0 md:w-56 md:border-l md:border-slate-200 md:pl-6">
                    {claimed[c.id] ? (
                      <div className="flex w-full flex-col items-stretch gap-2 text-center">
                        <span className="text-xs font-bold uppercase text-emerald-700">Your Promo Code:</span>
                        <div className="select-all rounded-lg bg-slate-800 px-3 py-2.5 font-mono text-sm font-bold tracking-wider text-white">
                          {claimed[c.id]}
                        </div>
                        {c.booking_link && (
                          <a
                            href={c.booking_link}
                            target="_blank"
                            rel="noreferrer"
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0B1F3A] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1f375a]"
                          >
                            Book Now <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    ) : claiming === c.id ? (
                      <div className="flex w-full flex-col gap-2">
                        <span className="text-xs font-semibold text-slate-500">Enter your first initial (e.g. J)</span>
                        <Input
                          maxLength={1}
                          placeholder="Your initial"
                          value={initial}
                          onChange={(e) => setInitial(e.target.value)}
                          className="rounded-xl border-slate-200 text-center text-lg font-bold uppercase"
                        />
                        <div className="flex gap-2">
                          <Button onClick={() => handleClaim(c)} className="flex-1 bg-[#D62828] text-white hover:bg-[#B91C1C]">
                            Get Code
                          </Button>
                          <Button variant="outline" onClick={() => { setClaiming(null); setInitial('') }} className="flex-1">
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex w-full flex-col items-stretch gap-2 text-center">
                        <span className="text-xs font-semibold text-slate-500">Consultation discount</span>
                        <Button onClick={() => setClaiming(c.id)} className="w-full bg-[#D62828] text-white hover:bg-[#B91C1C]">
                          Get 20% Off Code
                        </Button>
                        {c.booking_link && (
                          <a
                            href={c.booking_link}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-center gap-1 text-xs font-semibold text-slate-500 hover:text-[#0B1F3A]"
                          >
                            Visit website <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
