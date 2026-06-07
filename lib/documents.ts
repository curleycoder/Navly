import { supabase } from './supabase/client'

export type DocCategory =
  | 'navly-report'
  | 'work-permit'
  | 'study-permit'
  | 'language-test'
  | 'eca'
  | 'degree'
  | 'offer-letter'
  | 'other'

export const DOC_CATEGORY_LABELS: Record<DocCategory, string> = {
  'navly-report':   'Navly Report',
  'work-permit':    'Work Permit',
  'study-permit':   'Study Permit',
  'language-test':  'Language Test',
  'eca':            'ECA',
  'degree':         'Degree / Diploma',
  'offer-letter':   'Job Offer Letter',
  'other':          'Other',
}

export interface UserDocument {
  id: string
  user_id: string
  name: string
  category: DocCategory
  file_path: string | null
  file_size: number | null
  file_type: string | null
  source: 'upload' | 'report'
  created_at: string
}

export async function listDocuments(userId: string): Promise<UserDocument[]> {
  const { data } = await supabase
    .from('documents')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  return (data ?? []) as UserDocument[]
}

export async function uploadDocument(
  userId: string,
  file: File,
  name: string,
  category: DocCategory,
): Promise<{ error?: string }> {
  const ext = file.name.split('.').pop() ?? 'bin'
  const path = `${userId}/${Date.now()}.${ext}`

  const { error: storageErr } = await supabase.storage
    .from('Documents')
    .upload(path, file)

  if (storageErr) return { error: storageErr.message }

  const { error: dbErr } = await supabase.from('documents').insert({
    user_id: userId,
    name,
    category,
    file_path: path,
    file_size: file.size,
    file_type: file.type,
    source: 'upload',
  })

  if (dbErr) {
    await supabase.storage.from('documents').remove([path])
    return { error: dbErr.message }
  }

  return {}
}

export async function deleteDocument(doc: UserDocument): Promise<void> {
  if (doc.file_path) {
    await supabase.storage.from('Documents').remove([doc.file_path])
  }
  await supabase.from('documents').delete().eq('id', doc.id)
}

export async function getDocumentUrl(path: string): Promise<string> {
  const { data } = await supabase.storage
    .from('Documents')
    .createSignedUrl(path, 3600)
  return data?.signedUrl ?? ''
}

/** Called after a report purchase activates — inserts a metadata record (no file). */
export async function addReportDocument(userId: string): Promise<void> {
  const { data } = await supabase
    .from('documents')
    .select('id')
    .eq('user_id', userId)
    .eq('source', 'report')
    .maybeSingle()

  if (data) return // already exists

  await supabase.from('documents').insert({
    user_id: userId,
    name: 'Navly Personalized Report',
    category: 'navly-report',
    file_path: null,
    file_size: null,
    file_type: null,
    source: 'report',
  })
}
