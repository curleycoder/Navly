import { supabase } from './supabase/client'

export interface ConsultantListing {
  id: string
  name: string
  business_name: string
  agency_code: string
  certification_type: string
  license_number: string
  city: string
  province: string
  languages: string[]
  services: string[]
  booking_link: string
  contact_email: string
  avatar_url: string
  sponsored: boolean
  verified: boolean
  active: boolean
}

export async function fetchConsultants(): Promise<ConsultantListing[]> {
  const { data, error } = await supabase
    .from('consultants')
    .select('*')
    .eq('active', true)
    .order('sponsored', { ascending: false })
    .order('name')

  if (error) {
    console.error('Failed to fetch consultants:', error)
    return []
  }

  return data as ConsultantListing[]
}

// ─── Promo codes (localStorage) ───────────────────────────────────────────────

const CLAIMED_CODES_KEY = 'navly_claimed_promo_codes'
type ClaimedCodesMap = Record<string, string>

export function getClaimedCodes(): ClaimedCodesMap {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(CLAIMED_CODES_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function claimPromoCode(consultantId: string, agencyCode: string, userInitial = 'A'): string {
  if (typeof window === 'undefined') return ''
  const codes = getClaimedCodes()
  if (codes[consultantId]) return codes[consultantId]
  const code = `${userInitial.toUpperCase()}-${agencyCode}-20`
  codes[consultantId] = code
  localStorage.setItem(CLAIMED_CODES_KEY, JSON.stringify(codes))
  return code
}
