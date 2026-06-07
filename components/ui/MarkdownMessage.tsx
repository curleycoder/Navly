import { cn } from '@/lib/utils'

/**
 * Lightweight markdown renderer for AI assistant responses.
 * Handles: headings, bold, italic, inline code, bullet lists,
 * numbered lists, blockquotes, horizontal rules, and paragraphs.
 * No external dependencies.
 */

type Token =
  | { type: 'heading'; level: 1 | 2 | 3; text: string }
  | { type: 'bullet'; items: string[] }
  | { type: 'ordered'; items: string[] }
  | { type: 'blockquote'; text: string }
  | { type: 'hr' }
  | { type: 'paragraph'; text: string }
  | { type: 'empty' }

function tokenize(raw: string): Token[] {
  const lines = raw.split('\n')
  const tokens: Token[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // Blank line
    if (line.trim() === '') {
      tokens.push({ type: 'empty' })
      i++
      continue
    }

    // Horizontal rule
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())) {
      tokens.push({ type: 'hr' })
      i++
      continue
    }

    // Heading
    const headingMatch = line.match(/^(#{1,3})\s+(.+)/)
    if (headingMatch) {
      const level = Math.min(headingMatch[1].length, 3) as 1 | 2 | 3
      tokens.push({ type: 'heading', level, text: headingMatch[2] })
      i++
      continue
    }

    // Blockquote
    if (line.startsWith('> ')) {
      tokens.push({ type: 'blockquote', text: line.slice(2) })
      i++
      continue
    }

    // Bullet list — collect consecutive bullet lines
    if (/^[-*•]\s/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^[-*•]\s/.test(lines[i])) {
        items.push(lines[i].replace(/^[-*•]\s/, ''))
        i++
      }
      tokens.push({ type: 'bullet', items })
      continue
    }

    // Ordered list
    if (/^\d+\.\s/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s/, ''))
        i++
      }
      tokens.push({ type: 'ordered', items })
      continue
    }

    // Paragraph (collect until blank line or block element)
    const paraLines: string[] = []
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !/^#{1,3}\s/.test(lines[i]) &&
      !/^[-*•]\s/.test(lines[i]) &&
      !/^\d+\.\s/.test(lines[i]) &&
      !/^(-{3,}|\*{3,}|_{3,})$/.test(lines[i].trim()) &&
      !lines[i].startsWith('> ')
    ) {
      paraLines.push(lines[i])
      i++
    }
    if (paraLines.length > 0) {
      tokens.push({ type: 'paragraph', text: paraLines.join(' ') })
    }
  }

  return tokens
}

/** Apply inline formatting: bold, italic, inline code */
function renderInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = []
  // Pattern: **bold**, *italic*, `code`
  const pattern = /(\*\*(.+?)\*\*|\*(.+?)\*|`([^`]+)`)/g
  let last = 0
  let match: RegExpExecArray | null

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) {
      parts.push(text.slice(last, match.index))
    }
    if (match[0].startsWith('**')) {
      parts.push(<strong key={match.index} className="font-semibold text-heading">{match[2]}</strong>)
    } else if (match[0].startsWith('*')) {
      parts.push(<em key={match.index}>{match[3]}</em>)
    } else if (match[0].startsWith('`')) {
      parts.push(
        <code key={match.index} className="rounded bg-subtle px-1 py-0.5 font-mono text-xs text-heading">
          {match[4]}
        </code>
      )
    }
    last = match.index + match[0].length
  }

  if (last < text.length) {
    parts.push(text.slice(last))
  }

  return parts.length > 0 ? parts : [text]
}

export function MarkdownMessage({ content, className }: { content: string; className?: string }) {
  const tokens = tokenize(content)

  return (
    <div className={cn('flex flex-col gap-2 text-sm leading-7', className)}>
      {tokens.map((token, i) => {
        switch (token.type) {
          case 'heading': {
            const Tag = token.level === 1 ? 'h2' : token.level === 2 ? 'h3' : 'h4'
            return (
              <Tag
                key={i}
                className={cn(
                  'font-bold text-heading',
                  token.level === 1 && 'text-base mt-1',
                  token.level === 2 && 'text-sm mt-1',
                  token.level === 3 && 'text-sm'
                )}
              >
                {renderInline(token.text)}
              </Tag>
            )
          }

          case 'bullet':
            return (
              <ul key={i} className="flex flex-col gap-1 pl-4">
                {token.items.map((item, j) => (
                  <li key={j} className="flex items-start gap-2">
                    <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-navly-red" aria-hidden="true" />
                    <span>{renderInline(item)}</span>
                  </li>
                ))}
              </ul>
            )

          case 'ordered':
            return (
              <ol key={i} className="flex flex-col gap-1 pl-4">
                {token.items.map((item, j) => (
                  <li key={j} className="flex items-start gap-2">
                    <span className="mt-0.5 shrink-0 font-semibold text-navly-red">{j + 1}.</span>
                    <span>{renderInline(item)}</span>
                  </li>
                ))}
              </ol>
            )

          case 'blockquote':
            return (
              <blockquote key={i} className="border-l-2 border-navly-red/40 pl-3 text-muted-text italic">
                {renderInline(token.text)}
              </blockquote>
            )

          case 'hr':
            return <hr key={i} className="border-subtle" />

          case 'empty':
            return null

          case 'paragraph':
          default:
            return <p key={i}>{renderInline(token.text)}</p>
        }
      })}
    </div>
  )
}
