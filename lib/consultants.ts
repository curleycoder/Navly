export interface ConsultantListing {
  id: string;
  name: string;
  businessName: string;
  agencyCode: string;
  certificationType: string;
  licenseNumber: string;
  location: string;
  languages: string[];
  services: string[];
  bookingLink: string;
  sponsored: boolean;
  verified: boolean;
  avatarUrl: string;
}

export const mockConsultants: ConsultantListing[] = [
  {
    id: 'c1',
    name: 'Sarah Jenkins',
    businessName: 'Jenkins Immigration Group',
    agencyCode: 'JENK',
    certificationType: 'RCIC',
    licenseNumber: 'R512345',
    location: 'Toronto, ON',
    languages: ['English', 'French', 'Spanish'],
    services: ['Express Entry', 'Study Permits', 'Family Sponsorship'],
    bookingLink: '#',
    sponsored: true,
    verified: true,
    avatarUrl: 'https://i.pravatar.cc/150?u=sarah'
  },
  {
    id: 'c2',
    name: 'David Chen',
    businessName: 'Pacific Gate Immigration',
    agencyCode: 'PAC',
    certificationType: 'Immigration Lawyer',
    licenseNumber: 'LSO-40192',
    location: 'Vancouver, BC',
    languages: ['English', 'Mandarin'],
    services: ['PNP', 'Business Immigration', 'LMIA'],
    bookingLink: '#',
    sponsored: false,
    verified: true,
    avatarUrl: 'https://i.pravatar.cc/150?u=david'
  },
  {
    id: 'c3',
    name: 'Amira Patel',
    businessName: 'Patel Visa Services',
    agencyCode: 'PVS',
    certificationType: 'RCIC',
    licenseNumber: 'R588721',
    location: 'Calgary, AB',
    languages: ['English', 'Hindi', 'Gujarati'],
    services: ['Express Entry', 'Work Permits'],
    bookingLink: '#',
    sponsored: false,
    verified: true,
    avatarUrl: 'https://i.pravatar.cc/150?u=amira'
  }
];

const CLAIMED_CODES_KEY = 'navly_claimed_promo_codes';

type ClaimedCodesMap = Record<string, string>;

export function getClaimedCodes(): ClaimedCodesMap {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(CLAIMED_CODES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

// Generates and saves a promo code. 
// Uses user initial (or default 'A' for Applicant), agency code, and '20'.
export function claimPromoCode(consultantId: string, agencyCode: string, userInitial: string = 'A'): string {
  if (typeof window === 'undefined') return '';
  const codes = getClaimedCodes();
  
  if (codes[consultantId]) {
    return codes[consultantId];
  }

  const code = `${userInitial.toUpperCase()}-${agencyCode}-20`;
  codes[consultantId] = code;
  localStorage.setItem(CLAIMED_CODES_KEY, JSON.stringify(codes));
  return code;
}
