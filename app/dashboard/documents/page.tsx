'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, AlertCircle, Clock, Plus, Trash2, FileText } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  loadDocuments,
  saveDocuments,
  docCounts,
  type Document,
  type DocStatus,
} from '@/lib/documents'
import { cn } from '@/lib/utils'
import { useToast } from '@/lib/useToast'
import { Toast } from '@/components/ui/Toast'

const statusConfig: Record<DocStatus, { label: string; icon: React.ElementType; classes: string; badge: string }> = {
  ready: {
    label: 'Ready',
    icon: CheckCircle2,
    classes: 'border-green-200 bg-green-50',
    badge: 'bg-green-100 text-green-700',
  },
  expiring: {
    label: 'Expiring soon',
    icon: Clock,
    classes: 'border-amber-200 bg-amber-50',
    badge: 'bg-amber-100 text-amber-700',
  },
  missing: {
    label: 'Missing',
    icon: AlertCircle,
    classes: 'border-slate-200 bg-white',
    badge: 'bg-slate-100 text-slate-600',
  },
}

const STATUS_CYCLE: DocStatus[] = ['missing', 'ready', 'expiring']

function nextStatus(current: DocStatus): DocStatus {
  const i = STATUS_CYCLE.indexOf(current)
  return STATUS_CYCLE[(i + 1) % STATUS_CYCLE.length]
}

export default function DocumentsPage() {
  const [docs, setDocs] = useState<Document[]>([])
  const [newName, setNewName] = useState('')
  const { message, showToast } = useToast()

  useEffect(() => {
    setDocs(loadDocuments())
  }, [])

  function update(updated: Document[]) {
    setDocs(updated)
    saveDocuments(updated)
  }

  function toggleStatus(id: string) {
    const doc = docs.find((d) => d.id === id)
    if (!doc) return
    const next = nextStatus(doc.status)
    update(docs.map((d) => (d.id === id ? { ...d, status: next } : d)))
    const labels: Record<string, string> = { ready: 'Marked ready', expiring: 'Marked expiring', missing: 'Marked missing' }
    showToast(labels[next])
  }

  function remove(id: string) {
    update(docs.filter((d) => d.id !== id))
    showToast('Document removed')
  }

  function addDoc() {
    const name = newName.trim()
    if (!name) return
    const newDoc: Document = {
      id: `custom-${Date.now()}`,
      name,
      status: 'missing',
    }
    update([...docs, newDoc])
    setNewName('')
    showToast('Document added')
  }

  const counts = docCounts(docs)
  const progress = counts.total > 0 ? Math.round((counts.ready / counts.total) * 100) : 0

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#D62828]">
          Documents
        </p>
        <h1 className="mt-1 text-3xl font-bold text-[#0B1F3A]">Document checklist</h1>
        <p className="mt-2 text-slate-500">
          Track which documents you have ready before your consultation.
        </p>
      </div>

      {/* Progress */}
      <Card className="mb-8 rounded-2xl border-slate-200 bg-white">
        <CardContent className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-[#0B1F3A]">
              {counts.ready} of {counts.total} ready
            </p>
            <span className="text-sm font-bold text-[#D62828]">{progress}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-100">
            <div
              className="h-2 rounded-full bg-[#D62828] transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-3 flex gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              {counts.ready} ready
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              {counts.expiring} expiring
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-slate-300" />
              {counts.missing} missing
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Empty state */}
      {docs.length === 0 && (
        <div className="mb-6 flex flex-col items-center rounded-2xl border-2 border-dashed border-slate-200 bg-white py-14 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
            <FileText className="h-5 w-5 text-slate-400" />
          </div>
          <p className="mt-4 font-semibold text-[#0B1F3A]">No documents yet</p>
          <p className="mt-1 max-w-xs text-sm text-slate-500">
            Add your first document below to start tracking what's ready, missing, or expiring.
          </p>
        </div>
      )}

      {/* Document list */}
      <div className="mb-6 flex flex-col gap-3">
        {docs.map((doc) => {
          const cfg = statusConfig[doc.status]
          const Icon = cfg.icon
          return (
            <div
              key={doc.id}
              className={cn(
                'flex items-center gap-4 rounded-2xl border p-4 transition-all',
                cfg.classes
              )}
            >
              <button
                onClick={() => toggleStatus(doc.id)}
                className="shrink-0 focus:outline-none"
                title="Click to cycle status"
              >
                <Icon
                  className={cn(
                    'h-5 w-5',
                    doc.status === 'ready' && 'text-green-600',
                    doc.status === 'expiring' && 'text-amber-500',
                    doc.status === 'missing' && 'text-slate-400'
                  )}
                />
              </button>

              <span className="flex-1 text-sm font-semibold text-[#0B1F3A]">{doc.name}</span>

              <span
                className={cn(
                  'hidden rounded-full px-2.5 py-0.5 text-xs font-semibold sm:inline-block',
                  cfg.badge
                )}
              >
                {cfg.label}
              </span>

              <button
                onClick={() => remove(doc.id)}
                className="ml-1 shrink-0 text-slate-300 transition hover:text-red-400 focus:outline-none"
                title="Remove"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )
        })}
      </div>

      {/* Add custom document */}
      <div className="flex gap-3">
        <Input
          placeholder="Add a document…"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addDoc()}
          className="rounded-xl border-slate-200 bg-white px-4 py-3 text-[#0B1F3A] placeholder:text-slate-400 focus-visible:ring-[#D62828]"
        />
        <Button
          onClick={addDoc}
          disabled={!newName.trim()}
          className="gap-2 bg-[#D62828] text-white hover:bg-[#B91C1C] disabled:opacity-40"
        >
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>

      <p className="mt-4 text-xs text-slate-400">
        Click the icon on any document to cycle its status: missing → ready → expiring.
      </p>

      <Toast message={message} />
    </div>
  )
}
