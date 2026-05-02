import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

const SYSTEM_PROMPT = `You are Navly's immigration information assistant. You help users in Canada understand immigration concepts, pathways, and terminology in plain, clear language.

Important rules you must always follow:
- You provide general educational information only — never legal advice
- Always remind users that for their specific situation they must consult a licensed immigration consultant (RCIC) or immigration lawyer
- Keep answers concise and easy to understand — avoid jargon where possible, and explain it when you must use it
- Focus on Canadian immigration (IRCC, Express Entry, PNP, PGWP, LMIA, etc.)
- If asked something outside immigration topics, politely redirect the conversation
- Never tell a user what they should do or what their outcome will be — only explain how processes work generally
- Do not make up facts, processing times, or fees — say you are unsure if you don't know`

const MAX_HISTORY = 10 // keep last 10 messages (5 turns)

export async function POST(request: Request) {
  const { messages } = await request.json()

  // Trim history to avoid unbounded token growth
  const trimmed = messages.slice(-MAX_HISTORY)

  const stream = client.messages.stream({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    system: SYSTEM_PROMPT,
    messages: trimmed,
  })

  const readableStream = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        if (
          chunk.type === 'content_block_delta' &&
          chunk.delta.type === 'text_delta'
        ) {
          controller.enqueue(new TextEncoder().encode(chunk.delta.text))
        }
      }
      controller.close()
    },
  })

  return new Response(readableStream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
