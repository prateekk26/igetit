import { useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import { inline } from './Rich'
import { limitMessage } from '../lib/limits'
import Ooh from './Ooh'

type Props = { handbookId: Id<'handbooks'>; chapter: number; cardIndex: number; deviceToken: string }

// The two-way street: ask or object about this page, answered from the card first, in the handbook's voice.
// C8 (14 Oct, the C board "Ask Ooh"): it lives on the page, not in a sheet. Each question shows as "You asked", Ooh's
// answer under it in Ooh's voice colour, its sources under that; the box to ask sits at the end of the page. The
// server calls, the limits and the web check are the ones the sheet used. Copy (agent).
export default function AskCard({ handbookId, chapter, cardIndex, deviceToken }: Props) {
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [focused, setFocused] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const rows = useQuery(api.handbooks.questionsFor, { handbookId, chapter, cardIndex, deviceToken }) ?? []
  const ask = useMutation(api.handbooks.ask)

  const send = async () => {
    const q = text.trim(); if (q.length < 3) return
    setBusy(true); setError(null)
    try { await ask({ handbookId, chapter, cardIndex, question: q, deviceToken }); setText('') }
    catch (e: any) { setError(limitMessage(e) ?? (String(e?.message ?? e).includes('busy') ? 'A few too many questions in a row. Give it a minute.' : "Couldn't send that. Try again.")) }
    finally { setBusy(false) }
  }

  return (
    <div className="ask c8">
      {rows.map((r) => (
        <div key={String(r._id)} className="ask-qa">
          <p className="ask-label">You asked</p>
          <p className="ask-q">{r.question}</p>
          {r.status === 'thinking' && <p className="ask-a"><Ooh face="making" size={26} /><span>Thinking, and checking the web if the page doesn't say…</span></p>}
          {r.status === 'failed' && <p className="error">Couldn't answer that one right now.</p>}
          {r.answer && <p className="ask-a"><Ooh size={26} /><span>{inline(r.answer)}</span></p>}
          {r.sources && r.sources.length > 0 && (
            <p className="ask-src">Where I looked: {r.sources.map((x, i) => <span key={x.url}>{i > 0 && ' · '}<a href={x.url} target="_blank" rel="noopener noreferrer nofollow">{x.title.length > 48 ? x.title.slice(0, 46) + '…' : x.title}</a></span>)}</p>
          )}
        </div>
      ))}
      {(focused || text) && <p className="ask-note">Ask about this page, or tell me if you don't buy it. If the page doesn't say, I'll look it up and show you where.</p>}
      <form className="ask-row" onSubmit={(e) => { e.preventDefault(); send() }}>
        <input className="input" value={text} onChange={(e) => setText(e.target.value)} placeholder="Ask Ooh about this page"
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} disabled={busy} maxLength={500} aria-label="Ask Ooh about this page" enterKeyHint="send" />
        <button type="submit" className="ask-send" disabled={busy || text.trim().length < 3} aria-label="Send">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 19V5" /><path d="m6 11 6-6 6 6" /></svg>
        </button>
      </form>
      {error && <p className="error">{error}</p>}
    </div>
  )
}
