'use client'

import { useEffect, useRef, useState } from 'react'
import { Send, AlertTriangle, Bot, User, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

type Message = {
  role: 'user' | 'assistant'
  content: string
}

const SUGGESTIONS = [
  'What is Express Entry?',
  'What is a PGWP and who qualifies?',
  'What documents do I need for a PR application?',
  'What is the difference between RCIC and an immigration lawyer?',
]

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send(text?: string) {
    const content = (text ?? input).trim()
    if (!content || loading) return

    const userMessage: Message = { role: 'user', content }
    const next = [...messages, userMessage]
    setMessages(next)
    setInput('')
    setLoading(true)

    // Add empty assistant message to stream into
    setMessages((m) => [...m, { role: 'assistant', content: '' }])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
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
          content: 'Something went wrong. Please try again.',
        }
        return copy
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[#D62828]">
            AI Assistant
          </p>
          <h1 className="mt-0.5 text-2xl font-bold text-[#0B1F3A]">Ask an immigration question</h1>
        </div>
        {messages.length > 0 && (
          <button
            onClick={() => setMessages([])}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500"
            title="Clear conversation"
          >
            <Trash2 className="h-4 w-4" />
            Clear
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto max-w-2xl">
          {messages.length === 0 && (
            <div className="mb-8">
              <div className="mb-6 flex gap-3 rounded-2xl border border-[#0B1F3A]/15 bg-[#0B1F3A]/5 p-4">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#0B1F3A]" />
                <p className="text-sm leading-6 text-slate-600">
                  <span className="font-semibold text-[#0B1F3A]">Educational use only. </span>
                  Navly's assistant provides general immigration information, not legal advice.
                  Always consult a licensed RCIC or immigration lawyer for your specific situation.
                </p>
              </div>

              <p className="mb-3 text-sm font-semibold text-slate-500">Try asking:</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-xl border border-slate-200 bg-white p-3 text-left text-sm font-semibold text-[#0B1F3A] transition hover:border-[#D62828]/30 hover:bg-[#D62828]/5 hover:text-[#D62828]"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-5">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn('flex gap-3', msg.role === 'user' && 'flex-row-reverse')}
              >
                <div
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                    msg.role === 'user' ? 'bg-[#0B1F3A]' : 'bg-[#D62828]'
                  )}
                >
                  {msg.role === 'user' ? (
                    <User className="h-4 w-4 text-white" />
                  ) : (
                    <Bot className="h-4 w-4 text-white" />
                  )}
                </div>

                <div
                  className={cn(
                    'max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-7',
                    msg.role === 'user'
                      ? 'bg-[#0B1F3A] text-white'
                      : 'border border-slate-200 bg-white text-[#0B1F3A]'
                  )}
                >
                  {msg.content || (
                    <span className="inline-flex gap-1">
                      <span className="animate-bounce">·</span>
                      <span className="animate-bounce [animation-delay:0.15s]">·</span>
                      <span className="animate-bounce [animation-delay:0.3s]">·</span>
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
            className="min-h-0 resize-none rounded-xl border-slate-200 bg-white px-4 py-3 text-sm text-[#0B1F3A] placeholder:text-slate-400 focus-visible:ring-[#D62828]"
          />
          <Button
            onClick={() => send()}
            disabled={!input.trim() || loading}
            className="gap-2 self-end bg-[#D62828] text-white hover:bg-[#B91C1C] disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
            Send
          </Button>
        </div>
        <p className="mx-auto mt-2 max-w-2xl text-center text-xs text-slate-400">
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}
