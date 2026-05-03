'use client'

import { useEffect, useState } from 'react'
import { mockConsultants, getClaimedCodes, claimPromoCode, type ConsultantListing } from '@/lib/consultants'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ShieldCheck, MapPin, Globe, Briefcase, ExternalLink, Star } from 'lucide-react'

export default function ConsultantsPage() {
  const [claimed, setClaimed] = useState<Record<string, string>>({})

  useEffect(() => {
    setClaimed(getClaimedCodes())
  }, [])

  const handleClaim = (consultant: ConsultantListing) => {
    const userInput = window.prompt("To generate your unique code, please enter your first initial (e.g. 'J'):")
    if (userInput === null) return; // User cancelled
    
    // Make sure we have at least 'A' if they just pressed enter
    const initial = userInput.trim() ? userInput.trim() : 'A'
    const code = claimPromoCode(consultant.id, consultant.agencyCode, initial)
    
    setClaimed(prev => ({ ...prev, [consultant.id]: code }))
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10 animate-fade-in">
      <div className="mb-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#D62828]">
          Partner Network
        </p>
        <h1 className="mt-1 text-3xl font-bold text-[#0B1F3A]">Find a Certified Consultant</h1>
        <p className="mt-2 text-slate-500 max-w-2xl">
          Navly partners with certified RCICs and immigration lawyers. Browse the directory, find a professional that fits your needs, and claim your exclusive one-time 20% discount code.
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-6">
        {mockConsultants.map((c) => (
           <Card key={c.id} className={`rounded-2xl border ${c.sponsored ? 'border-emerald-200 bg-emerald-50/50' : 'border-slate-200 bg-white'}`}>
              <CardContent className="p-6">
                 {c.sponsored && (
                   <span className="mb-3 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-800">
                     <Star className="h-3 w-3" /> Sponsored
                   </span>
                 )}
                 <div className="flex flex-col md:flex-row gap-6">
                    <img src={c.avatarUrl} alt={c.name} className="h-20 w-20 rounded-full border border-slate-200 object-cover" />
                    <div className="flex-1">
                       <div className="flex items-center gap-2">
                          <h2 className="text-xl font-bold text-[#0B1F3A]">{c.name}</h2>
                          {c.verified && <ShieldCheck className="h-5 w-5 text-emerald-600" />}
                       </div>
                       <p className="text-sm font-semibold text-slate-600 mb-4">{c.businessName}</p>
                       
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 text-sm text-slate-600">
                          <div className="flex items-start gap-2">
                             <Briefcase className="h-4 w-4 shrink-0 mt-0.5 text-slate-400" />
                             <span>{c.certificationType} <span className="text-slate-400">({c.licenseNumber})</span></span>
                          </div>
                          <div className="flex items-start gap-2">
                             <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-slate-400" />
                             <span>{c.location}</span>
                          </div>
                          <div className="flex items-start gap-2">
                             <Globe className="h-4 w-4 shrink-0 mt-0.5 text-slate-400" />
                             <span>{c.languages.join(', ')}</span>
                          </div>
                       </div>
                       
                       <div className="mt-4 flex flex-wrap gap-2">
                         {c.services.map(s => (
                           <span key={s} className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                             {s}
                           </span>
                         ))}
                       </div>
                    </div>
                    
                    <div className="flex shrink-0 flex-col items-stretch md:items-center justify-center gap-3 md:border-l md:border-slate-200 md:pl-6 mt-4 md:mt-0 md:w-56">
                       {claimed[c.id] ? (
                         <div className="flex w-full flex-col items-stretch text-center gap-2">
                           <span className="text-xs font-bold uppercase text-emerald-700">Your Promo Code:</span>
                           <div className="rounded-lg bg-slate-800 text-white font-mono font-bold py-2.5 px-3 tracking-wider text-sm select-all">
                             {claimed[c.id]}
                           </div>
                           <Button asChild className="w-full bg-[#0B1F3A] hover:bg-[#1f375a]">
                             <a href={c.bookingLink} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2">
                               Book Now <ExternalLink className="h-4 w-4" />
                             </a>
                           </Button>
                         </div>
                       ) : (
                         <div className="flex w-full flex-col items-stretch text-center gap-2">
                            <span className="text-xs font-semibold text-slate-500">Consultation discount</span>
                            <Button onClick={() => handleClaim(c)} className="w-full bg-[#D62828] text-white hover:bg-[#B91C1C]">
                              Get 20% Off Code
                            </Button>
                         </div>
                       )}
                    </div>
                 </div>
              </CardContent>
           </Card>
        ))}
      </div>
    </div>
  )
}
