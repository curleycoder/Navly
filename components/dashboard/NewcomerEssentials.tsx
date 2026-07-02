'use client'

import { useEffect, useState } from 'react'
import { ExternalLink, Building2, Smartphone, Home, ArrowLeftRight, BookOpen } from 'lucide-react'
import {
  fetchPartners,
  groupPartners,
  CATEGORY_LABELS,
  type PartnerCategory,
  type PartnerListing,
} from '@/lib/partners'

const CATEGORY_ICONS: Record<PartnerCategory, React.ElementType> = {
  banking:        Building2,
  phone:          Smartphone,
  housing:        Home,
  money_transfer: ArrowLeftRight,
  language:       BookOpen,
}

const AVATAR_COLORS = [
  'bg-blue-100 text-blue-700',
  'bg-violet-100 text-violet-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-cyan-100 text-cyan-700',
]

function avatarColor(name: string) {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]
}

function PartnerTile({ partner }: { partner: PartnerListing }) {
  const [imgError, setImgError] = useState(false)

  return (
    <a
      href={partner.cta_url}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className="group flex items-center gap-3 rounded-xl border border-subtle bg-surface-card p-3 transition hover:border-navly-navy/20 hover:shadow-sm"
    >
      {/* Logo */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-subtle bg-white">
        {partner.logo_url && !imgError ? (
          <img
            src={partner.logo_url}
            alt={partner.name}
            className="h-8 w-8 object-contain"
            onError={() => setImgError(true)}
          />
        ) : (
          <span className={`text-sm font-bold ${avatarColor(partner.name)}`}>
            {partner.name.charAt(0)}
          </span>
        )}
      </div>

      {/* Text */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-xs font-bold text-heading">{partner.name}</p>
          {partner.sponsored && (
            <span className="shrink-0 rounded-full bg-navly-red/8 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-navly-red/70">
              Partner
            </span>
          )}
        </div>
        <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-muted-text">{partner.headline}</p>
      </div>

      {/* CTA */}
      <div className="shrink-0">
        <span className="inline-flex items-center gap-1 rounded-lg border border-navly-navy/15 bg-navly-navy/5 px-2.5 py-1.5 text-xs font-semibold text-navly-navy transition group-hover:bg-navly-navy group-hover:text-white">
          {partner.cta_text}
          <ExternalLink className="h-3 w-3" aria-hidden="true" />
        </span>
      </div>
    </a>
  )
}

export function NewcomerEssentials({ province }: { province?: string | null }) {
  const [groups, setGroups] = useState<{ category: PartnerCategory; items: PartnerListing[] }[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetchPartners(province).then((partners) => {
      setGroups(groupPartners(partners))
      setLoaded(true)
    })
  }, [province])

  if (!loaded || groups.length === 0) return null

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-widest text-heading">Newcomer Essentials</p>
        <p className="text-[10px] font-medium text-muted-text/50">Sponsored</p>
      </div>

      <div className="flex flex-col gap-4">
        {groups.map(({ category, items }) => {
          const Icon = CATEGORY_ICONS[category]
          return (
            <div key={category}>
              <div className="mb-2 flex items-center gap-1.5">
                <Icon className="h-3.5 w-3.5 text-muted-text/70" aria-hidden="true" />
                <p className="text-xs font-semibold text-muted-text">{CATEGORY_LABELS[category]}</p>
              </div>
              <div className="flex flex-col gap-2">
                {items.map((p) => (
                  <PartnerTile key={p.id} partner={p} />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <p className="mt-3 text-[10px] leading-relaxed text-muted-text/50">
        These are partner links. Navly may earn a commission at no cost to you.
        Navly does not endorse specific financial or legal services.
      </p>
    </div>
  )
}
