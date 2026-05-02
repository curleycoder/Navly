export type DocStatus = 'ready' | 'missing' | 'expiring'

export type Document = {
  id: string
  name: string
  status: DocStatus
  expiresAt?: string // ISO date string YYYY-MM-DD
}

const KEY = 'navly_documents'

// Default checklist — common Canadian immigration documents
const DEFAULT_DOCUMENTS: Document[] = [
  { id: 'passport', name: 'Passport', status: 'missing' },
  { id: 'birth-cert', name: 'Birth certificate', status: 'missing' },
  { id: 'status-doc', name: 'Current immigration status document (permit/visa)', status: 'missing' },
  { id: 'language-test', name: 'Language test results (IELTS / TEF)', status: 'missing' },
  { id: 'edu-credential', name: 'Educational credentials (diplomas / transcripts)', status: 'missing' },
  { id: 'employment-letter', name: 'Employment letter', status: 'missing' },
  { id: 'pay-stubs', name: 'Recent pay stubs (last 3 months)', status: 'missing' },
  { id: 'tax-returns', name: 'Tax returns (last 2 years)', status: 'missing' },
  { id: 'bank-statements', name: 'Bank statements (last 3 months)', status: 'missing' },
  { id: 'police-clearance', name: 'Police clearance certificate', status: 'missing' },
  { id: 'photos', name: 'Passport-sized photos', status: 'missing' },
  { id: 'medical-exam', name: 'Medical exam results', status: 'missing' },
]

export function loadDocuments(): Document[] {
  if (typeof window === 'undefined') return DEFAULT_DOCUMENTS
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Document[]) : DEFAULT_DOCUMENTS
  } catch {
    return DEFAULT_DOCUMENTS
  }
}

export function saveDocuments(docs: Document[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(KEY, JSON.stringify(docs))
}

export function docCounts(docs: Document[]) {
  return {
    ready: docs.filter((d) => d.status === 'ready').length,
    expiring: docs.filter((d) => d.status === 'expiring').length,
    missing: docs.filter((d) => d.status === 'missing').length,
    total: docs.length,
  }
}
