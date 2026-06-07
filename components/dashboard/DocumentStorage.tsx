'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  Upload, FileText, Trash2, Download, Plus, X, Loader2, Zap, ExternalLink,
} from 'lucide-react'
import {
  listDocuments, uploadDocument, deleteDocument, getDocumentUrl,
  DOC_CATEGORY_LABELS, UserDocument, DocCategory,
} from '@/lib/documents'
import { useLocale } from '@/lib/i18n'

const UPLOAD_CATEGORIES = (
  Object.entries(DOC_CATEGORY_LABELS) as [DocCategory, string][]
).filter(([k]) => k !== 'navly-report')

const MAX_SIZE = 10 * 1024 * 1024 // 10 MB

function fmtSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-CA', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}

export function DocumentStorage({ userId }: { userId: string }) {
  const { t } = useLocale()
  const [docs, setDocs] = useState<UserDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [name, setName] = useState('')
  const [category, setCategory] = useState<DocCategory>('other')
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    listDocuments(userId).then((d) => { setDocs(d); setLoading(false) })
  }, [userId])

  function resetForm() {
    setShowForm(false)
    setName('')
    setFile(null)
    setCategory('other')
    setError('')
  }

  async function handleUpload() {
    if (!file || !name.trim()) return
    if (file.size > MAX_SIZE) { setError(t('profile.fileSizeError')); return }
    setUploading(true)
    setError('')
    const { error: err } = await uploadDocument(userId, file, name.trim(), category)
    if (err) { setError(err); setUploading(false); return }
    const updated = await listDocuments(userId)
    setDocs(updated)
    resetForm()
    setUploading(false)
  }

  async function handleDelete(doc: UserDocument) {
    setDeletingId(doc.id)
    await deleteDocument(doc)
    setDocs((d) => d.filter((x) => x.id !== doc.id))
    setDeletingId(null)
  }

  async function handleDownload(doc: UserDocument) {
    if (!doc.file_path) return
    const url = await getDocumentUrl(doc.file_path)
    window.open(url, '_blank')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-5 w-5 animate-spin text-muted-text/40" />
      </div>
    )
  }

  return (
    <div>
      {/* ── Upload form ── */}
      {showForm ? (
        <div className="border-b border-subtle/50 px-4 py-4">
          <div className="mb-4 flex items-center justify-between">
            <p className="t-section-title">{t('profile.addDocument')}</p>
            <button
              onClick={resetForm}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-text/60 hover:bg-subtle hover:text-heading"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* File picker */}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className={`w-full rounded-xl border-2 border-dashed px-4 py-5 text-center transition ${
              file
                ? 'border-navly-navy/30 bg-navly-navy/5'
                : 'border-subtle hover:border-subtle/80'
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png,.heic,.doc,.docx"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (!f) return
                setFile(f)
                if (!name) setName(f.name.replace(/\.[^.]+$/, ''))
              }}
            />
            {file ? (
              <div className="flex items-center justify-center gap-2">
                <FileText className="h-4 w-4 shrink-0 text-navly-navy" />
                <span className="t-body truncate max-w-xs text-heading">{file.name}</span>
                <span className="t-caption shrink-0">({fmtSize(file.size)})</span>
              </div>
            ) : (
              <>
                <Upload className="mx-auto mb-2 h-5 w-5 text-muted-text/40" />
                <p className="t-body">{t('profile.clickToChoose')}</p>
                <p className="t-caption mt-0.5">{t('profile.fileTypes')}</p>
              </>
            )}
          </button>

          {/* Label */}
          <div className="mt-3">
            <label className="t-label mb-1 block">{t('profile.documentLabel')}</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('profile.labelPlaceholder')}
              className="w-full rounded-xl border border-subtle bg-surface-alt px-3 py-2 text-sm text-heading placeholder:text-muted-text/40 focus:outline-none focus:ring-2 focus:ring-navly-red"
            />
          </div>

          {/* Category */}
          {/* <div className="mt-3">
            <label className="t-label mb-1 block">Type</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as DocCategory)}
              className="w-full rounded-xl border border-subtle bg-surface-alt px-3 py-2 text-sm text-heading focus:outline-none focus:ring-2 focus:ring-navly-red"
            >
              {UPLOAD_CATEGORIES.map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div> */}

          {error && <p className="mt-2 t-caption text-red-500">{error}</p>}

          <button
            onClick={handleUpload}
            disabled={!file || !name.trim() || uploading}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-navly-navy px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-navly-navy/80 disabled:opacity-40"
          >
            {uploading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> {t('profile.uploading')}</>
            ) : (
              <>{t('profile.uploadBtn')}</>
            )}
          </button>

          <p className="mt-3 t-caption text-center">{t('profile.storedSecurely')}</p>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="flex w-full items-center gap-3 border-b border-subtle/50 px-4 py-3.5 text-left transition hover:bg-surface-alt"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navly-red/10">
            <Plus className="h-4 w-4 text-navly-red" />
          </div>
          <p className="t-section-title">Add document</p>
        </button>
      )}

      {/* ── Document list ── */}
      {docs.length === 0 ? (
        <div className="px-4 py-10 text-center">
          <FileText className="mx-auto mb-2 h-7 w-7 text-muted-text/25" />
          <p className="t-section-title">{t('profile.noDocuments')}</p>
          <p className="t-caption mt-1">{t('profile.noDocumentsDesc')}</p>
        </div>
      ) : (
        <ul className="divide-y divide-subtle/50">
          {docs.map((doc) => (
            <li key={doc.id} className="flex items-center gap-3 px-4 py-3">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                  doc.source === 'report' ? 'bg-navly-red/10' : 'bg-subtle'
                }`}
              >
                {doc.source === 'report' ? (
                  <Zap className="h-4 w-4 text-navly-red" />
                ) : (
                  <FileText className="h-4 w-4 text-muted-text/60" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate t-section-title">{doc.name}</p>
                <p className="t-caption">
                  {DOC_CATEGORY_LABELS[doc.category]}
                  {' · '}
                  {fmtDate(doc.created_at)}
                  {doc.file_size ? ` · ${fmtSize(doc.file_size)}` : ''}
                </p>
              </div>

              <div className="flex items-center gap-0.5">
                {doc.source === 'report' ? (
                  <Link
                    href="/dashboard/pr-tracker"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-text/60 transition hover:bg-subtle hover:text-heading"
                    aria-label="View report"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                ) : doc.file_path ? (
                  <button
                    onClick={() => handleDownload(doc)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-text/60 transition hover:bg-subtle hover:text-heading"
                    aria-label="Download"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                ) : null}

                <button
                  onClick={() => handleDelete(doc)}
                  disabled={deletingId === doc.id}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-text/60 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-40"
                  aria-label="Delete"
                >
                  {deletingId === doc.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
