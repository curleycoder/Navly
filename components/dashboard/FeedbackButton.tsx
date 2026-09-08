'use client'

/**
 * Floating beta feedback button.
 *
 * Captures the moment a user is confused, instead of losing them silently.
 * Sits above the mobile BottomNav (h-16) and clears the iOS home indicator.
 * Remove (or flag off) once beta ends.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { CheckCircle2, Loader2, MessageSquarePlus, X } from 'lucide-react'

import { Textarea } from '@/components/ui/textarea'
import { track } from '@/lib/analytics'
import { cn } from '@/lib/utils'

type Category = 'bug' | 'confusing' | 'wrong_info' | 'idea' | 'other'

const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'bug',        label: 'Something broke' },
  { value: 'confusing',  label: 'Confusing' },
  { value: 'wrong_info', label: 'Info looks wrong' },
  { value: 'idea',       label: 'Idea' },
  { value: 'other',      label: 'Other' },
]

export function FeedbackButton() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [category, setCategory] = useState<Category>('confusing')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const close = useCallback(() => {
    setOpen(false)
    setError('')
    triggerRef.current?.focus()
  }, [])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, close])

  // Focus the textarea when the panel opens
  useEffect(() => {
    if (open && !sent) textareaRef.current?.focus()
  }, [open, sent])

  function handleOpen() {
    setOpen(true)
    setSent(false)
    setError('')
    track('feedback_opened')
  }

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    const trimmed = message.trim()
    if (trimmed.length < 3) {
      setError('Please write a little more.')
      return
    }

    setSending(true)
    setError('')

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, message: trimmed, page: pathname }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? 'Could not send. Please try again.')
        setSending(false)
        return
      }

      track('feedback_submitted', { feedback_category: category })
      setSent(true)
      setMessage('')
      setSending(false)
      // Auto-close after the confirmation has been seen
      setTimeout(() => setOpen(false), 1800)
    } catch {
      setError('Could not send. Check your connection and try again.')
      setSending(false)
    }
  }

  return (
    <>
      {/* Trigger — above BottomNav (h-16) on mobile, bottom-right on desktop */}
      {!open && (
        <button
          ref={triggerRef}
          type="button"
          onClick={handleOpen}
          aria-label="Send feedback"
          className="fixed right-4 bottom-20 z-40 flex items-center gap-2 rounded-full bg-navly-navy px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-navly-navy/90 md:right-6 md:bottom-6"
          style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
        >
          <MessageSquarePlus className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Feedback</span>
        </button>
      )}

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/30"
            onClick={close}
            aria-hidden="true"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-label="Send feedback"
            className="fixed right-4 bottom-20 z-50 w-[calc(100vw-2rem)] max-w-sm rounded-2xl border border-subtle bg-surface-card p-5 shadow-2xl md:right-6 md:bottom-6"
            style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-heading">Help us fix Navly</p>
                <p className="mt-0.5 text-xs text-muted-text">
                  Beta feedback goes straight to the developer.
                </p>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Close feedback"
                className="rounded-lg p-1 text-muted-text transition hover:bg-surface-alt hover:text-heading"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            {sent ? (
              <div className="py-8 text-center">
                <CheckCircle2 className="mx-auto h-8 w-8 text-green-500" aria-hidden="true" />
                <p className="mt-3 text-sm font-semibold text-heading">Thank you — got it</p>
                <p className="mt-1 text-xs text-muted-text">
                  This is exactly how Navly gets better.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-4">
                <div
                  className="flex flex-wrap gap-1.5"
                  role="radiogroup"
                  aria-label="Feedback type"
                >
                  {CATEGORIES.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      role="radio"
                      aria-checked={category === opt.value}
                      onClick={() => setCategory(opt.value)}
                      className={cn(
                        'rounded-full border px-2.5 py-1 text-xs font-semibold transition',
                        category === opt.value
                          ? 'border-navly-red bg-navly-red/5 text-navly-red'
                          : 'border-subtle bg-surface-alt text-muted-text hover:border-navly-red/40'
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                <Textarea
                  ref={textareaRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={4000}
                  rows={4}
                  placeholder="What happened, or what did you expect instead?"
                  className="mt-3 min-h-24 border-subtle bg-surface-alt"
                  aria-label="Your feedback"
                />

                {error && (
                  <p role="alert" className="mt-2 text-xs text-red-600">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={sending || message.trim().length < 3}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-navly-red px-4 py-2.5 text-sm font-bold text-white transition hover:bg-navly-red/90 disabled:opacity-40"
                >
                  {sending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                  {sending ? 'Sending…' : 'Send feedback'}
                </button>

                <p className="mt-2 text-center text-[11px] text-muted-text/70">
                  We record the page you are on. Do not include passport or ID numbers.
                </p>
              </form>
            )}
          </div>
        </>
      )}
    </>
  )
}
