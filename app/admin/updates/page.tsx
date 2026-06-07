'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { NavlyLogo } from '@/components/ui/NavlyLogo'
import { Loader2, Check, Trash2, ExternalLink, RefreshCw } from 'lucide-react'

type Update = {
  id: string
  title: string
  summary: string
  url: string
  category: string
  impact_level: 'high' | 'medium' | 'low'
  affects: string[]
  published_at: string
  detected_at: string
  reviewed: boolean
}

const IMPACT_STYLES: Record<string, string> = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-subtle text-muted-text',
}

const CATEGORY_LABELS: Record<string, string> = {
  express_entry: 'Express Entry',
  pnp: 'PNP',
  study: 'Study',
  work: 'Work',
  family: 'Family',
  citizenship: 'Citizenship',
  pr: 'PR',
  visitor: 'Visitor',
  general: 'General',
}

const IMPACT_ORDER = { high: 0, medium: 1, low: 2 }

export default function AdminUpdatesPage() {
  const router = useRouter()
  const [updates, setUpdates] = useState<Update[]>([])
  const [loading, setLoading] = useState(true)
  const [showAll, setShowAll] = useState(false)
  const [acting, setActing] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.replace('/login'); return }
      load()
    }
    init()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router])

  useEffect(() => { load() }, [showAll]) // eslint-disable-line react-hooks/exhaustive-deps

  async function load() {
    setLoading(true)
    const res = await fetch(`/api/admin/updates${showAll ? '?all=1' : ''}`)
    if (res.status === 403) { router.replace('/dashboard'); return }
    const data: Update[] = await res.json()
    // Sort: high → medium → low, then newest first
    data.sort((a, b) =>
      (IMPACT_ORDER[a.impact_level] ?? 2) - (IMPACT_ORDER[b.impact_level] ?? 2) ||
      new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
    )
    setUpdates(data)
    setLoading(false)
  }

  async function act(id: string, action: 'approve' | 'dismiss') {
    setActing(id)
    await fetch('/api/admin/updates', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action }),
    })
    setActing(null)
    load()
  }

  const categories = ['all', ...Array.from(new Set(updates.map(u => u.category)))]
  const visible = filter === 'all' ? updates : updates.filter(u => u.category === filter)
  const pendingCount = updates.filter(u => !u.reviewed).length

  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b border-subtle bg-surface-card px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-3">
            <NavlyLogo size="sm" />
            <span className="rounded-full bg-navly-red/10 px-2.5 py-0.5 text-xs font-bold text-navly-red">Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/admin/consultants')} className="text-sm text-muted-text/70 hover:text-muted-text">Consultants</button>
            <button onClick={() => router.push('/dashboard')} className="text-sm text-muted-text/70 hover:text-muted-text">← Dashboard</button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-8">
        {/* Title + controls */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-heading">Immigration Updates</h1>
            {!showAll && pendingCount > 0 && (
              <p className="mt-0.5 text-sm text-muted-text">{pendingCount} pending review</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={load}
              className="flex items-center gap-1.5 rounded-xl border border-subtle bg-surface-card px-3 py-2 text-sm text-muted-text hover:bg-surface-alt"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </button>
            <button
              onClick={() => setShowAll(v => !v)}
              className="rounded-xl border border-subtle bg-surface-card px-3 py-2 text-sm text-muted-text hover:bg-surface-alt"
            >
              {showAll ? 'Pending only' : 'Show all'}
            </button>
          </div>
        </div>

        {/* Category filter */}
        <div className="mb-4 flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                filter === cat
                  ? 'bg-navly-navy text-white'
                  : 'bg-surface-card border border-subtle text-muted-text hover:bg-surface-alt'
              }`}
            >
              {CATEGORY_LABELS[cat] ?? cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-text/50" />
          </div>
        ) : visible.length === 0 ? (
          <div className="rounded-2xl border border-subtle bg-surface-card py-16 text-center text-muted-text/70">
            {showAll ? 'No updates yet. Run sync-sources to populate.' : 'All caught up — nothing pending review.'}
          </div>
        ) : (
          <div className="space-y-3">
            {visible.map(u => (
              <div
                key={u.id}
                className={`rounded-2xl border bg-surface-card p-5 transition-opacity ${u.reviewed ? 'opacity-60' : ''}`}
                style={{ borderColor: u.impact_level === 'high' ? '#fca5a5' : '#e2e8f0' }}
              >
                <div className="flex items-start gap-4">
                  <div className="min-w-0 flex-1">
                    {/* Badges */}
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${IMPACT_STYLES[u.impact_level]}`}>
                        {u.impact_level}
                      </span>
                      <span className="rounded-full bg-subtle px-2 py-0.5 text-[10px] font-semibold text-muted-text">
                        {CATEGORY_LABELS[u.category] ?? u.category}
                      </span>
                      {u.affects.map(a => (
                        <span key={a} className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] text-blue-600">{a}</span>
                      ))}
                      {u.reviewed && (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">Approved</span>
                      )}
                    </div>

                    {/* Title + link */}
                    <a
                      href={u.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-start gap-1 font-semibold text-heading hover:text-navly-red"
                    >
                      {u.title}
                      <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 opacity-0 group-hover:opacity-100" />
                    </a>

                    {/* Summary */}
                    {u.summary && (
                      <p className="mt-1 line-clamp-2 text-sm text-muted-text">{u.summary}</p>
                    )}

                    {/* Meta */}
                    <p className="mt-2 text-xs text-muted-text/70">
                      Published {new Date(u.published_at).toLocaleDateString('en-CA')} ·{' '}
                      Detected {new Date(u.detected_at).toLocaleDateString('en-CA')}
                    </p>
                  </div>

                  {/* Actions */}
                  {!u.reviewed && (
                    <div className="flex shrink-0 flex-col gap-2">
                      <button
                        onClick={() => act(u.id, 'approve')}
                        disabled={acting === u.id}
                        title="Approve"
                        className="flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                      >
                        {acting === u.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                        Approve
                      </button>
                      <button
                        onClick={() => act(u.id, 'dismiss')}
                        disabled={acting === u.id}
                        title="Dismiss"
                        className="flex items-center gap-1.5 rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50"
                      >
                        {acting === u.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                        Dismiss
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
