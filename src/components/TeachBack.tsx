import { useState, type ReactNode } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import { limitMessage } from '../lib/limits'

// Teach it back (optional): explain the chapter's idea in your own words, get a short reply.
// Never required; the rung never waits on it. Copy is (agent) until Prateek rewrites it.
// `after`: what comes next (the next chapter's button), shown under Ooh's answer once there is one (21 Oct).
export default function TeachBack({ handbookId, n, deviceToken, after }: { handbookId: Id<'handbooks'>; n: number; deviceToken: string; after?: ReactNode }) {
  const open = true   // C9 (14 Oct): "Say it back (optional)" is a box on the page, not a button that opens one
  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const reply = useQuery(api.handbooks.teachBackFor, open ? { handbookId, chapter: n, deviceToken } : 'skip')
  const send = useMutation(api.handbooks.teachBack)
  const thinking = reply?.status === 'thinking'

  const check = async () => { setError(null); try { await send({ handbookId, chapter: n, text, deviceToken }) } catch (e: any) { setError(limitMessage(e) ?? (String(e?.message ?? e).includes('busy') ? 'A few too many in a row. Try again in a bit.' : "Couldn't check that just now. Try again in a minute.")) } }
  return (
    <section className="teach c9-say" aria-label="Say it back">
      <label htmlFor="teach-text" className="c9-label">Wanna say it back? We're all ears.</label>
      <form className="ask-row c9-say-row" onSubmit={(e) => { e.preventDefault(); if (!thinking && text.trim().length >= 10) check() }}>
        <input id="teach-text" className="input" maxLength={600} value={text} onChange={(e) => setText(e.target.value)} disabled={thinking} placeholder="Tell a friend today's idea in a line" enterKeyHint="send" />
        <button type="submit" className="ask-send" disabled={thinking || text.trim().length < 10} aria-label={thinking ? 'Reading it' : 'Check what I wrote'}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 19V5" /><path d="m6 11 6-6 6 6" /></svg>
        </button>
      </form>
      {thinking && <p className="c9-say-note">Reading it…</p>}
      {error && <p className="error" role="alert">{error}</p>}
      {reply?.status === 'failed' && <p className="error" role="alert">Couldn't check that just now. Try again in a minute.</p>}
      {reply?.status === 'ready' && (
        <div role="status" className={`c9-say-reply v-${(reply.verdict ?? '').replace(/\s+/g, '-')}`}>
          <p><b>{reply.verdict === 'nailed' ? 'You nailed it!' : reply.verdict === 'close' ? 'Almost there!' : 'Good start!'}</b>{reply.got ? ` ${reply.got}` : ''}</p>
          {reply.missed && <p>Missing: {reply.missed}</p>}
          {reply.tip && <p>{reply.tip}</p>}
        </div>
      )}
      {reply?.status === 'ready' && after}
    </section>
  )
}
