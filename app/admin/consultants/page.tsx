'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { type ConsultantListing } from '@/lib/consultants'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NavlyLogo } from '@/components/ui/NavlyLogo'
import { ShieldCheck, Star, Plus, Pencil, Trash2, X, Loader2, Check } from 'lucide-react'

const EMPTY: Omit<ConsultantListing, 'id'> = {
  name: '', business_name: '', agency_code: '', certification_type: 'RCIC',
  license_number: '', city: '', province: '', languages: [], services: [],
  booking_link: '', contact_email: '', avatar_url: '',
  sponsored: false, verified: false, active: true,
}

function arrayField(val: string): string[] {
  return val.split(',').map((s) => s.trim()).filter(Boolean)
}

function FormModal({
  initial, onSave, onClose,
}: {
  initial: Partial<ConsultantListing>
  onSave: (data: Partial<ConsultantListing>) => Promise<void>
  onClose: () => void
}) {
  const [form, setForm] = useState({ ...EMPTY, ...initial })
  const [langStr, setLangStr] = useState((initial.languages ?? []).join(', '))
  const [svcStr, setSvcStr] = useState((initial.services ?? []).join(', '))
  const [saving, setSaving] = useState(false)

  const set = (k: keyof typeof form, v: unknown) => setForm((f) => ({ ...f, [k]: v }))

  async function handleSave() {
    setSaving(true)
    await onSave({ ...form, languages: arrayField(langStr), services: arrayField(svcStr) })
    setSaving(false)
  }

  const field = (label: string, key: keyof typeof form, type = 'text') => (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs font-semibold text-slate-600">{label}</Label>
      <Input
        type={type}
        value={String(form[key] ?? '')}
        onChange={(e) => set(key, e.target.value)}
        className="rounded-lg border-slate-200 text-sm"
      />
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="font-bold text-[#0B1F3A]">{initial.id ? 'Edit consultant' : 'Add consultant'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X className="h-5 w-5" /></button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-6 py-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {field('Full name', 'name')}
            {field('Business name', 'business_name')}
            {field('Certification type', 'certification_type')}
            {field('License number', 'license_number')}
            {field('City', 'city')}
            {field('Province', 'province')}
            {field('Agency code (for promo)', 'agency_code')}
            {field('Booking link', 'booking_link', 'url')}
            {field('Contact email', 'contact_email', 'email')}
            {field('Avatar URL', 'avatar_url', 'url')}
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-semibold text-slate-600">Languages (comma-separated)</Label>
              <Input value={langStr} onChange={(e) => setLangStr(e.target.value)} className="rounded-lg border-slate-200 text-sm" placeholder="English, French, Hindi" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-semibold text-slate-600">Services (comma-separated)</Label>
              <Input value={svcStr} onChange={(e) => setSvcStr(e.target.value)} className="rounded-lg border-slate-200 text-sm" placeholder="Express Entry, PNP, Work Permits" />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-6">
            {(['sponsored', 'verified', 'active'] as const).map((key) => (
              <label key={key} className="flex cursor-pointer items-center gap-2">
                <input type="checkbox" checked={!!form[key]} onChange={(e) => set(key, e.target.checked)} className="h-4 w-4 accent-[#D62828]" />
                <span className="text-sm font-semibold capitalize text-slate-700">{key}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={!form.name || saving} className="gap-2 bg-[#D62828] text-white hover:bg-[#B91C1C]">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function AdminConsultantsPage() {
  const router = useRouter()
  const [consultants, setConsultants] = useState<ConsultantListing[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Partial<ConsultantListing> | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.replace('/login'); return }
      load()
    }
    init()
  }, [router])

  async function load() {
    setLoading(true)
    const res = await fetch('/api/admin/consultants')
    if (res.status === 403) { router.replace('/dashboard'); return }
    setConsultants(await res.json())
    setLoading(false)
  }

  async function handleSave(data: Partial<ConsultantListing>) {
    if (data.id) {
      await fetch('/api/admin/consultants', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    } else {
      await fetch('/api/admin/consultants', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    }
    setEditing(null)
    load()
  }

  async function handleDelete(id: string) {
    setDeleting(id)
    await fetch('/api/admin/consultants', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    setDeleting(null)
    load()
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-3">
            <NavlyLogo size="sm" />
            <span className="rounded-full bg-[#D62828]/10 px-2.5 py-0.5 text-xs font-bold text-[#D62828]">Admin</span>
          </div>
          <button onClick={() => router.push('/dashboard')} className="text-sm text-slate-400 hover:text-slate-700">← Dashboard</button>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#0B1F3A]">Consultants</h1>
          <Button onClick={() => setEditing({})} className="gap-2 bg-[#D62828] text-white hover:bg-[#B91C1C]">
            <Plus className="h-4 w-4" /> Add consultant
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-slate-300" /></div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-100 bg-slate-50">
                <tr>
                  {['Name', 'Type', 'Location', 'Status', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {consultants.length === 0 && (
                  <tr><td colSpan={5} className="py-12 text-center text-slate-400">No consultants yet. Add one above.</td></tr>
                )}
                {consultants.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-[#0B1F3A]">{c.name}</p>
                      <p className="text-xs text-slate-400">{c.business_name}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{c.certification_type}</td>
                    <td className="px-4 py-3 text-slate-600">{[c.city, c.province].filter(Boolean).join(', ') || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {c.verified && <span className="flex items-center gap-0.5 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700"><ShieldCheck className="h-3 w-3" /> Verified</span>}
                        {c.sponsored && <span className="flex items-center gap-0.5 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700"><Star className="h-3 w-3" /> Sponsored</span>}
                        {!c.active && <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-600">Inactive</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setEditing(c)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-[#0B1F3A]">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          disabled={deleting === c.id}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                        >
                          {deleting === c.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing !== null && (
        <FormModal
          initial={editing}
          onSave={handleSave}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  )
}
