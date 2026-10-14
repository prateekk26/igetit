import type { ReactNode } from 'react'

// Renders the small markdown subset the chapter prompt allows: **bold**, *italic*, paragraphs on blank lines.
export function inline(text: string): ReactNode[] {
  const out: ReactNode[] = []
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*)/g
  let last = 0, m: RegExpExecArray | null, k = 0
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index))
    const tok = m[0]
    if (tok.startsWith('**')) out.push(<strong key={k++}>{tok.slice(2, -2)}</strong>)
    else out.push(<em key={k++}>{tok.slice(1, -1)}</em>)
    last = m.index + tok.length
  }
  if (last < text.length) out.push(text.slice(last))
  return out
}

// 15 Oct (Prateek: "Use fonts, bold/italics/underlines and other things to make slides more interesting"): on a page,
// plain text also gets a little type of its own. Money, percentages and numbers with a unit stand out in the page's
// accent colour; a phrase in quotation marks gets a hand-drawn underline. **bold** stays the marker, *italic* the serif.
const POP = /(“[^”]{2,60}”|"[^"]{2,60}"|[₹$€£]\s?\d[\d,]*(?:\.\d+)?(?:\s?(?:lakh|crore|million|billion|k|cr))?|\d[\d,]*(?:\.\d+)?\s?(?:%|per cent|percent|x\b|times\b|minutes?\b|hours?\b|days?\b|weeks?\b|months?\b|years?\b|km\b|kg\b))/g
function pop(node: ReactNode, key: string): ReactNode {
  if (typeof node !== 'string') return node
  const out: ReactNode[] = []
  let last = 0, m: RegExpExecArray | null, k = 0
  POP.lastIndex = 0
  while ((m = POP.exec(node))) {
    if (m.index > last) out.push(node.slice(last, m.index))
    const t = m[0]
    out.push(/^[“"]/.test(t) ? <span key={`${key}q${k++}`} className="rt-quote">{t}</span> : <b key={`${key}n${k++}`} className="rt-num">{t}</b>)
    last = m.index + t.length
  }
  if (!out.length) return node
  if (last < node.length) out.push(node.slice(last))
  return out
}

export default function Rich({ text, className, lively }: { text: string; className?: string; lively?: boolean }) {
  return (
    <div className={className}>
      {text.split(/\n\n+/).map((p, i) => <p key={i}>{lively ? inline(p).map((n, j) => pop(n, `${i}-${j}`)) : inline(p)}</p>)}
    </div>
  )
}
