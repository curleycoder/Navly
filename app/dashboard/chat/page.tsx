'use client'

import { useEffect, useRef, useState } from 'react'
import { Send, Bot, User, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { loadProfile, statusLabels, goalLabels, type IntakeData } from '@/lib/profile'
import { calculateScore } from '@/lib/scoring'
import { MarkdownMessage } from '@/components/ui/MarkdownMessage'
import { usePlan, hasPlan } from '@/lib/subscription'
import { UpgradeModal } from '@/components/ui/UpgradeModal'
import { useLocale } from '@/lib/i18n'
import { PageTour } from '@/components/dashboard/PageTour'

type Message = {
  role: 'user' | 'assistant'
  content: string
}

const CHAT_KEY = 'navly_chat_history'

// ─── Suggestions ──────────────────────────────────────────────────────────────

function getSuggestions(profile: IntakeData | null): string[] {
  if (!profile) return [
    'What is Express Entry and how does it work?',
    'What is a PGWP and who qualifies?',
    'What is the difference between an RCIC and an immigration lawyer?',
    'What does CLB mean and why does it matter?',
  ]

  const { goal, status, locationStatus, plannedEntry } = profile

  if (locationStatus === 'outside') {
    if (plannedEntry === 'express-entry') return [
      'What is the Federal Skilled Worker program and who qualifies?',
      'How do I create an Express Entry profile from outside Canada?',
      'What is an ECA and which body should I use?',
      'How do Express Entry draws work and what score do I need?',
    ]
    if (plannedEntry === 'study-permit') return [
      'What is a DLI and why does it matter for my permit?',
      'How do I apply for a Canadian study permit?',
      'What is a PGWP and how does it lead to PR?',
      'Can I work while studying in Canada?',
    ]
    if (plannedEntry === 'work-permit') return [
      'What is an LMIA and how does it work?',
      'What are LMIA-exempt work permit categories?',
      'How do I find a Canadian employer willing to support a work permit?',
      'How does a work permit lead to permanent residence?',
    ]
    if (plannedEntry === 'family') return [
      'Who can sponsor a family member for Canadian PR?',
      'What income requirements does a sponsor need to meet?',
      'How long does spousal sponsorship take?',
      'What is an undertaking and what does it mean for my sponsor?',
    ]
    if (plannedEntry === 'visitor') return [
      'What is the difference between a visitor visa and an eTA?',
      'Can I extend my stay in Canada as a visitor?',
      'Can I apply for a work or study permit from inside Canada as a visitor?',
      'What does "maintained status" mean?',
    ]
    return [
      'What are the main pathways to Canadian permanent residence?',
      'What is Express Entry and how does it work?',
      'How do language scores affect my PR application?',
      'What is a Provincial Nominee Program?',
    ]
  }

  if (goal === 'pr') {
    const base = [
      'What is the difference between CEC, FSW, and FST in Express Entry?',
      'What CRS score do I need to receive an invitation to apply?',
      'How do Provincial Nominee Programs boost my CRS score?',
    ]
    if (status === 'work-permit') base.unshift('How do I qualify for Canadian Experience Class with my work permit?')
    else if (status === 'student') base.unshift('How does the PGWP-to-CEC pathway work for international students?')
    else if (status === 'visitor') base.unshift('Can I apply for PR from inside Canada as a visitor?')
    else if (status === 'refugee') base.unshift('What PR pathways are available to protected persons in Canada?')
    else if (status === 'out-of-status') base.unshift('What are my options if my permit has expired and I want to restore status?')
    else base.unshift('What is the Federal Skilled Worker program and who qualifies?')
    return base.slice(0, 4)
  }

  if (goal === 'work-permit') return [
    'How do I extend my work permit in Canada?',
    'What is the difference between an LMIA and an LMIA-exempt work permit?',
    'What happens if my work permit expires before my renewal is approved?',
    'Can I change employers while on an open work permit?',
  ]

  if (goal === 'study-permit') return [
    'How do I extend my study permit in Canada?',
    'What is a DLI and why does it matter for my permit?',
    'Can I work off-campus while studying in Canada?',
    'What is the PGWP and who qualifies for it?',
  ]

  if (goal === 'citizenship') return [
    'How many days do I need to be in Canada to qualify for citizenship?',
    'What documents do I need for a citizenship application?',
    'What is the citizenship knowledge test and how do I prepare?',
    'Can I hold dual citizenship in Canada?',
  ]

  if (goal === 'family') return [
    'Who qualifies as a sponsor for Canadian family sponsorship?',
    'How long does spousal sponsorship typically take?',
    'What income does a sponsor need to prove?',
    'Can a sponsored person work while their application is in process?',
  ]

  if (goal === 'compare') return [
    'What are the fastest pathways to Canadian permanent residence?',
    'How do Express Entry and Provincial Nominee Programs compare?',
    'What is the difference between a work permit and permanent residence?',
    'Which pathways do not require a job offer in Canada?',
  ]

  return [
    'What is Express Entry and how does it work?',
    'What is a PGWP and who qualifies?',
    'What is the difference between an RCIC and an immigration lawyer?',
    'What does CLB mean and why does it matter?',
  ]
}

// ─── What the AI knows ────────────────────────────────────────────────────────

function getProfileSummaryLines(profile: IntakeData): string[] {
  const lines: string[] = []
  if (profile.locationStatus) {
    lines.push(profile.locationStatus === 'inside' ? 'You are currently in Canada' : 'You are currently outside Canada')
  }
  if (profile.status && profile.locationStatus === 'inside') {
    lines.push(statusLabels[profile.status] ?? profile.status)
  }
  if (profile.goal) {
    lines.push(`Goal: ${goalLabels[profile.goal] ?? profile.goal}`)
  }
  if (profile.langTestType && profile.langTestType !== 'none' && profile.langReading) {
    const testNames: Record<string, string> = { 'ielts-general': 'IELTS General', celpip: 'CELPIP', pte: 'PTE Core', tef: 'TEF Canada', tcf: 'TCF Canada' }
    lines.push(`${testNames[profile.langTestType] ?? profile.langTestType} scores on file`)
  }
  try {
    const score = calculateScore(profile)
    if (score.hasEnoughData && score.crs) {
      lines.push(`Estimated CRS: ${score.crs.total} pts`)
    }
  } catch { /* ignore */ }
  return lines
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ChatPage() {
  const { t } = useLocale()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState<IntakeData | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const { plan } = usePlan()
  const isPaid = hasPlan(plan, 'tracker')

  // Load profile and persisted messages
  useEffect(() => {
    setProfile(loadProfile())
    try {
      const saved = localStorage.getItem(CHAT_KEY)
      if (saved) setMessages(JSON.parse(saved))
    } catch { /* ignore */ }
  }, [])

  // Auto-show upgrade modal for free users
  useEffect(() => {
    if (plan !== null && !isPaid) {
      setShowUpgradeModal(true)
    }
  }, [plan, isPaid])

  // Persist messages whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(CHAT_KEY, JSON.stringify(messages.slice(-30)))
    }
  }, [messages])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function clearChat() {
    setMessages([])
    localStorage.removeItem(CHAT_KEY)
    inputRef.current?.focus()
  }

  async function send(text?: string) {
    const content = (text ?? input).trim()
    if (!content || loading) return
    if (!isPaid) { setShowUpgradeModal(true); return }

    const userMessage: Message = { role: 'user', content }
    const next = [...messages, userMessage]
    setMessages(next)
    setInput('')
    setLoading(true)

    setMessages((m) => [...m, { role: 'assistant', content: '' }])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next, profile }),
      })

      if (!res.ok || !res.body) throw new Error('Request failed')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        setMessages((m) => {
          const copy = [...m]
          copy[copy.length - 1] = {
            role: 'assistant',
            content: copy[copy.length - 1].content + chunk,
          }
          return copy
        })
      }
    } catch {
      setMessages((m) => {
        const copy = [...m]
        copy[copy.length - 1] = {
          role: 'assistant',
          content: 'Something went wrong connecting to the assistant. Please try again.',
        }
        return copy
      })
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const profileLines = profile ? getProfileSummaryLines(profile) : []
  const suggestions = getSuggestions(profile)

  return (
    <>
    <PageTour
      tourKey="navly_tour_chat"
      steps={[
        {
          element: '[data-tour="chat-context"]',
          popover: {
            title: 'Tailored to your profile',
            description: 'The AI knows your status, scores, and work history. You don\'t need to explain your situation — just ask.',
            side: 'bottom', align: 'start',
          },
        },
        {
          element: '[data-tour="chat-input"]',
          popover: {
            title: 'Ask your question',
            description: 'Ask about CRS points, permit renewals, PGWP, PNP streams, or anything immigration-related. For legal advice, always speak to a certified consultant.',
            side: 'top', align: 'start',
          },
        },
      ]}
    />
    <div className="flex h-full flex-col">
      {/* Header — desktop only */}
      <div className="hidden md:flex items-center justify-between border-b border-subtle bg-surface-card px-6 py-4">
        <div>
          <p className="t-eyebrow text-navly-red">{t('nav.aiAssistant')}</p>
          <h1 className="mt-0.5 t-page-title">{t('chat.pageTitle')}</h1>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearChat}
            aria-label="Clear conversation"
            className="flex items-center gap-1.5 rounded-xl border border-subtle px-3 py-2 text-sm font-semibold text-muted-text transition hover:border-red-200 hover:bg-red-50 hover:text-red-500"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Educational notice + What AI knows — persistent strip */}
      <div data-tour="chat-context" className="border-b border-subtle/50 bg-surface-alt px-4 py-3 md:px-6">
        <div className="mb-2.5 rounded-xl border border-orange-200 bg-orange-50 px-3 py-2 text-xs text-orange-800">
          <span className="font-bold">{t('chat.educationalUse')}</span>{' '}
          {t('chat.educationalDesc')}
        </div>
        <div className="mb-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-text/70">
          <span>Rules last verified: June 2026</span>
          <span>Chat history is saved on this device only.</span>
        </div>
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            {profileLines.length > 0 ? (
              <>
                <p className="mb-1.5 t-eyebrow text-muted-text/70">{t('chat.whatIKnow')}</p>
                <div className="flex flex-wrap gap-1.5">
                  {profileLines.map((line) => (
                    <span key={line} className="rounded-full bg-navly-navy/5 px-2.5 py-1 text-xs font-semibold text-heading">
                      {line}
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-xs text-muted-text/70">{t('chat.completeProfile')}</p>
            )}
          </div>
          {/* Clear button — mobile only */}
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              aria-label="Clear conversation"
              className="md:hidden flex h-8 w-8 items-center justify-center rounded-xl border border-subtle text-muted-text transition hover:border-red-200 hover:bg-red-50 hover:text-red-500 shrink-0"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-6" role="log" aria-live="polite" aria-label="Conversation">
        <div className="mx-auto max-w-2xl">

          {/* Empty state */}
          {messages.length === 0 && (
            <div className="mb-4 animate-fade-in">
              {/* Suggested questions — 3, based on permit and situation */}
              <p className="mb-2 t-eyebrow text-muted-text">{t('chat.tryAsking')}</p>
              <div className="flex flex-col gap-2">
                {suggestions.slice(0, 3).map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-xl border border-subtle bg-surface-card p-3 text-left text-sm font-medium text-heading transition hover:border-navly-red/30 hover:bg-navly-red/5 hover:text-navly-red"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message thread */}
          <div className="flex flex-col gap-5">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn('flex gap-3', msg.role === 'user' && 'flex-row-reverse')}
              >
                {/* Avatar */}
                <div
                  aria-hidden="true"
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                    msg.role === 'user' ? 'bg-navly-navy' : 'bg-navly-red'
                  )}
                >
                  {msg.role === 'user'
                    ? <User className="h-4 w-4 text-white" />
                    : <Bot className="h-4 w-4 text-white" />}
                </div>

                {/* Bubble */}
                <div
                  className={cn(
                    'max-w-[82%] rounded-2xl px-4 py-3',
                    msg.role === 'user'
                      ? 'bg-navly-navy text-sm leading-7 text-white'
                      : 'border border-subtle bg-surface-card text-heading'
                  )}
                >
                  {msg.role === 'user' ? (
                    msg.content
                  ) : msg.content ? (
                    <MarkdownMessage content={msg.content} />
                  ) : (
                    /* Typing indicator */
                    <span className="inline-flex items-center gap-1 py-1" aria-label="Assistant is typing">
                      <span className="h-2 w-2 rounded-full bg-muted-text/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="h-2 w-2 rounded-full bg-muted-text/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="h-2 w-2 rounded-full bg-muted-text/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div data-tour="chat-input" className="border-t border-subtle bg-surface-card px-4 py-3 md:px-6 md:py-4">
        <div className="mx-auto max-w-2xl">
          {!isPaid ? (
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-navly-red/40 bg-navly-red/5 px-5 py-4 text-sm font-semibold text-navly-red transition hover:bg-navly-red/10"
            >
              <Send className="h-4 w-4" />
              {t('chat.upgradeToUnlock')}
            </button>
          ) : (
            <>
              <div className="flex gap-3">
                <Textarea
                  ref={inputRef}
                  placeholder={t('chat.placeholder')}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      send()
                    }
                  }}
                  rows={1}
                  aria-label="Your message"
                  className="min-h-0 resize-none rounded-xl border-subtle bg-surface-card px-4 py-3 text-sm text-heading placeholder:text-muted-text/70 focus-visible:ring-navly-red"
                />
                <Button
                  onClick={() => send()}
                  disabled={!input.trim() || loading}
                  aria-label="Send message"
                  className="gap-2 self-end bg-navly-red text-white hover:bg-navly-red/80 disabled:opacity-40"
                >
                  <Send className="h-4 w-4" aria-hidden="true" />
                  Send
                </Button>
              </div>
              <p className="mt-2 text-center text-xs text-muted-text/70">{t('chat.sendHint')}</p>
            </>
          )}
        </div>
      </div>
    </div>
    {showUpgradeModal && (
      <UpgradeModal onClose={() => setShowUpgradeModal(false)} />
    )}
    </>
  )
}
