import { useState } from 'react'
import { track } from '../lib/track'

// "I want to learn more" (Prateek, 13 Oct): on the last chapter's Done screen, the advanced version of this handbook,
// two of the plan's own next topics, or the reader's own words. Free, one per finished handbook (handbooks.learnMore).
// Same look as the "What's it for?" options (Start.tsx). Copy (agent).
type Pick = 'advanced' | 'next' | 'typed'
type Props = {
  topic: string
  next: string[]
  usedId: string | null
  onPick: (pick: Pick, topic?: string) => Promise<void>
  onOpen: (id: string) => void
  errorText: (e: unknown) => string
}

export default function LearnMore({ topic, next, usedId, onPick, onOpen, errorText }: Props) {
  const [own, setOwn] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const go = async (pick: Pick, t?: string) => {
    setSending(true); setError(null); track('learn_more', { pick })
    try { await onPick(pick, t) } catch (e) { setError(errorText(e)); setSending(false) }
  }
  if (usedId) return (
    <section className="learn-more" aria-label="Your next handbook">
      <h2>Your next handbook is started.</h2>
      <button type="button" className="btn btn-ghost" onClick={() => onOpen(usedId)}>Open it</button>
    </section>
  )
  return (
    <section className="learn-more" aria-label="I want to learn more">
      <h2>I want to learn more</h2>
      <p className="note">Pick what's next. Free for finishing this one.</p>
      <div className="intent-goals">
        <button type="button" className="intent-goal" disabled={sending} onClick={() => go('advanced')}>
          {topic}, advanced<span className="learn-more-sub">Goes past everything you just read</span>
        </button>
        {next.slice(0, 2).map((t) => (
          <button key={t} type="button" className="intent-goal" disabled={sending} onClick={() => go('next', t)}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>
        ))}
      </div>
      <form className="intent-own" onSubmit={(e) => { e.preventDefault(); if (own.trim()) go('typed', own.trim()) }}>
        <label htmlFor="learn-more-own" className="lp-visually-hidden">Or type what you want next</label>
        <input id="learn-more-own" className="input" placeholder="Or type what you want next" value={own} onChange={(e) => setOwn(e.target.value)} maxLength={200} enterKeyHint="go" disabled={sending} />
        <button type="submit" className="btn btn-ghost intent-own-go" disabled={sending || !own.trim()}>Start</button>
      </form>
      {sending && <p className="note" role="status">Starting it…</p>}
      {error && <p className="error" role="alert">{error}</p>}
    </section>
  )
}
