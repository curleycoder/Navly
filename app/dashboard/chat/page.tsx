'use client'

import { useEffect, useRef, useState } from 'react'
import { Send, Bot, User, Trash2, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { loadProfile, statusLabels, goalLabels, type IntakeData } from '@/lib/profile'
import { calculateScore } from '@/lib/scoring'
import { MarkdownMessage } from '@/components/ui/MarkdownMessage'

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

// ─── Topics the assistant can help with ───────────────────────────────────────

const TOPICS = [
  { label: 'Express Entry & CRS', desc: 'How draws work, score breakdown, pool strategy' },
  { label: 'Provincial Nominees', desc: 'PNP streams, expressions of interest, nomination' },
  { label: 'Language & CLB', desc: 'IELTS, CELPIP, TEF conversions, score impact' },
  { label: 'Work permits', desc: 'LMIA, LMIA-exempt, extensions, employer changes' },
  { label: 'Study permits & PGWP', desc: 'DLI, off-campus work, PGWP eligibility' },
  { label: 'Family sponsorship', desc: 'Spousal, parent, eligibility, timelines' },
  { label: 'Status & renewals', desc: 'Maintained status, restoration, bridging permits' },
  { label: 'Citizenship', desc: 'Physical presence, knowledge test, dual citizenship' },
]

// ─── Component ────────────────────────────────────────────────────────────────

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState<IntakeData | null>(null)
  const [showTopics, setShowTopics] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Load profile and persisted messages
  useEffect(() => {
    setProfile(loadProfile())
    try {
      const saved = localStorage.getItem(CHAT_KEY)
      if (saved) setMessages(JSON.parse(saved))
    } catch { /* ignore */ }
  }, [])

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
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[#D62828]">AI Assistant</p>
          <h1 className="mt-0.5 text-xl font-bold text-[#0B1F3A]">Ask an immigration question</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTopics((v) => !v)}
            aria-pressed={showTopics}
            aria-label="What can I ask?"
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-500 transition hover:border-[#0B1F3A]/30 hover:bg-slate-50 hover:text-[#0B1F3A]"
          >
            <Info className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">What can I ask?</span>
          </button>
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              aria-label="Clear conversation"
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Topic guide panel */}
      {showTopics && (
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-4" role="region" aria-label="Topics the assistant can help with">
          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">Topics I can help with</p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {TOPICS.map((t) => (
              <div key={t.label} className="rounded-xl bg-white border border-slate-200 px-3 py-2.5">
                <p className="text-xs font-bold text-[#0B1F3A]">{t.label}</p>
                <p className="mt-0.5 text-xs text-slate-500">{t.desc}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-400">
            I provide general immigration information only — not legal advice. Always consult a licensed RCIC or immigration lawyer for your specific situation.
          </p>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6" role="log" aria-live="polite" aria-label="Conversation">
        <div className="mx-auto max-w-2xl">

          {/* Empty state */}
          {messages.length === 0 && (
            <div className="mb-6 animate-fade-in">
              {/* Legal notice */}
              <div className="mb-5 rounded-2xl border border-[#0B1F3A]/15 bg-[#0B1F3A]/5 px-4 py-3 text-sm text-slate-600">
                <span className="font-semibold text-[#0B1F3A]">Educational use only. </span>
                General immigration information — not legal advice. Consult a licensed RCIC or lawyer for your specific case.
              </div>

              {/* What I know about you */}
              {profileLines.length > 0 && (
                <div className="mb-5 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">I know about your profile</p>
                  <div className="flex flex-wrap gap-2">
                    {profileLines.map((line) => (
                      <span key={line} className="rounded-full bg-[#0B1F3A]/5 px-3 py-1 text-xs font-semibold text-[#0B1F3A]">
                        {line}
                      </span>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-slate-400">Ask me anything about your situation — I'll give context-aware answers.</p>
                </div>
              )}

              {/* Suggested questions */}
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Try asking</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-xl border border-slate-200 bg-white p-3 text-left text-sm font-medium text-[#0B1F3A] transition hover:border-[#D62828]/30 hover:bg-[#D62828]/5 hover:text-[#D62828]"
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
                    msg.role === 'user' ? 'bg-[#0B1F3A]' : 'bg-[#D62828]'
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
                      ? 'bg-[#0B1F3A] text-sm leading-7 text-white'
                      : 'border border-slate-200 bg-white text-[#0B1F3A]'
                  )}
                >
                  {msg.role === 'user' ? (
                    msg.content
                  ) : msg.content ? (
                    <MarkdownMessage content={msg.content} />
                  ) : (
                    /* Typing indicator */
                    <span className="inline-flex items-center gap-1 py-1" aria-label="Assistant is typing">
                      <span className="h-2 w-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="h-2 w-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="h-2 w-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '300ms' }} />
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
      <div className="border-t border-slate-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-2xl gap-3">
          <Textarea
            ref={inputRef}
            placeholder="Ask an immigration question…"
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
            className="min-h-0 resize-none rounded-xl border-slate-200 bg-white px-4 py-3 text-sm text-[#0B1F3A] placeholder:text-slate-400 focus-visible:ring-[#D62828]"
          />
          <Button
            onClick={() => send()}
            disabled={!input.trim() || loading}
            aria-label="Send message"
            className="gap-2 self-end bg-[#D62828] text-white hover:bg-[#B91C1C] disabled:opacity-40"
          >
            <Send className="h-4 w-4" aria-hidden="true" />
            Send
          </Button>
        </div>
        <p className="mx-auto mt-2 max-w-2xl text-center text-xs text-slate-400">
          Enter to send · Shift+Enter for new line · Conversation saved automatically
        </p>
      </div>
    </div>
  )
}
