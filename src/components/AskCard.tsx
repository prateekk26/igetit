import { useEffect, useRef, useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import { inline } from './Rich'
import { limitMessage } from '../lib/limits'
import Ooh from './Ooh'

type Props = { handbookId: Id<'handbooks'>; chapter: number; cardIndex: number; deviceToken: string; autoFocus?: boolean }

// The two-way street: ask or object about this page, answered from the card first, in the handbook's voice.
// C8 (the C board "Ask Ooh", 14 and 15 Oct): it lives on the page, never in a sheet, opened by Ooh in the chapter's header
// (never shown unasked). The thread sits under the page's words: "You asked", Ooh's answer in Ooh's voice colour, then
// where it came from ("From this page, no internet." or the links it checked) and "Keep it here", which leaves the answer
// on the page for next time. The box to ask sits at the bottom of the screen, where the page's buttons were. The server
// calls, the limits and the web check are the ones the sheet used. Copy (agent).
export function AskThread({ handbookId, chapter, cardIndex, deviceToken }: Omit<Props, 'autoFocus'>) {
  const rows = useQuery(api.handbooks.questionsFor, { handbookId, chapter, cardIndex, deviceToken }) ?? []
  const keep = useMutation(api.handbooks.keepAnswer)
  // A new question, or its answer landing, scrolls into view above the box (it sat under the box on a phone).
  const box = useRef<HTMLDivElement>(null)
  const last = rows.length ? `${rows.length}:${rows[rows.length - 1].status}` : ''
  useEffect(() => { if (last) box.current?.lastElementChild?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }) }, [last])
  if (!rows.length) return null
  return (
    <div className="ask c8" ref={box}>
      {rows.map((r) => (
        <div key={String(r._id)} className="ask-qa">
          <p className="ask-label">You asked</p>
          <p className="ask-q">{r.question}</p>
          {r.status === 'thinking' && <p className="ask-a"><Ooh face="making" size={26} /><span>Thinking, and checking the web if the page doesn't say…</span></p>}
          {r.status === 'failed' && <p className="error">Couldn't answer that one right now.</p>}
          {r.answer && <p className="ask-a"><Ooh size={26} /><span>{inline(r.answer)}</span></p>}
          {r.answer && (
            <p className="ask-foot">
              {r.sources && r.sources.length > 0
                ? <span className="ask-src">Where I looked: {r.sources.map((x, i) => <span key={x.url}>{i > 0 && ' · '}<a href={x.url} target="_blank" rel="noopener noreferrer nofollow">{x.title.length > 48 ? x.title.slice(0, 46) + '…' : x.title}</a></span>)}</span>
                : <span className="ask-src">From this page, no internet.</span>}
              <button type="button" className="ask-keep" aria-pressed={r.kept} onClick={() => keep({ questionId: r._id, kept: !r.kept, deviceToken }).catch(() => {})}>{r.kept ? 'Kept on this page' : 'Keep it here'}</button>
            </p>
          )}
        </div>
      ))}
    </div>
  )
}

export function AskBox({ handbookId, chapter, cardIndex, deviceToken, autoFocus }: Props) {
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const ask = useMutation(api.handbooks.ask)
  const send = async () => {
    const q = text.trim(); if (q.length < 3) return
    setBusy(true); setError(null)
    try { await ask({ handbookId, chapter, cardIndex, question: q, deviceToken }); setText('') }
    catch (e: any) { setError(limitMessage(e) ?? (String(e?.message ?? e).includes('busy') ? 'A few too many questions in a row. Give it a minute.' : "Couldn't send that. Try again.")) }
    finally { setBusy(false) }
  }
  return (
    <div className="ask c8 ask-box">
      {error ? <p className="error" role="alert">{error}</p> : <p className="ask-note">Ask about this page. If it doesn't say, I'll look it up and show you where.</p>}
      <form className="ask-row" onSubmit={(e) => { e.preventDefault(); send() }}>
        <input className="input" value={text} onChange={(e) => setText(e.target.value)} placeholder="Ask Ooh a question"
          disabled={busy} maxLength={500} aria-label="Ask Ooh about this page" enterKeyHint="send" autoFocus={autoFocus} />
        <button type="submit" className="ask-send" disabled={busy || text.trim().length < 3} aria-label="Send">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 19V5" /><path d="m6 11 6-6 6 6" /></svg>
        </button>
      </form>
    </div>
  )
}

// Thread and box together, for a place that has room for both in one column.
export default function AskCard(props: Props) {
  return <><AskThread {...props} /><AskBox {...props} /></>
}
