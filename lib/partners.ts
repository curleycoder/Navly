import { supabase } from './supabase/client'

export type PartnerCategory = 'banking' | 'phone' | 'housing' | 'money_transfer' | 'language'

export interface PartnerListing {
  id: string
  category: PartnerCategory
  name: string
  headline: string
  logo_url: string | null
  cta_text: string
  cta_url: string
  provinces: string[]
  sponsored: boolean
  active: boolean
  display_order: number
}

export const CATEGORY_LABELS: Record<PartnerCategory, string> = {
  banking:        'Banking',
  phone:          'Phone Plans',
  housing:        'Housing',
  money_transfer: 'Money Transfers',
  language:       'Language',
}

// Display order for category sections
export const CATEGORY_ORDER: PartnerCategory[] = [
  'banking', 'phone', 'money_transfer', 'housing', 'language',
]

export async function fetchPartners(province?: string | null): Promise<PartnerListing[]> {
  const { data, error } = await supabase
    .from('partner_listings')
    .select('*')
    .eq('active', true)
    .order('display_order')

  if (error || !data) return []

  // Filter: show if provinces is empty (show everywhere) or contains the user's province
  return (data as PartnerListing[]).filter(
    (p) => !p.provinces?.length || (province && p.provinces.includes(province))
  )
}

/** Group a flat list of partners by category, max 2 per category. */
export function groupPartners(
  partners: PartnerListing[]
): { category: PartnerCategory; items: PartnerListing[] }[] {
  const map = new Map<PartnerCategory, PartnerListing[]>()

  for (const p of partners) {
    const cat = p.category as PartnerCategory
    if (!map.has(cat)) map.set(cat, [])
    const group = map.get(cat)!
    if (group.length < 2) group.push(p)
  }

  return CATEGORY_ORDER
    .filter((cat) => map.has(cat))
    .map((cat) => ({ category: cat, items: map.get(cat)! }))
}
