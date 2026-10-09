import { useState } from 'react'
import ActionBar from '../components/ActionBar'
import SignupNudge from '../components/SignupNudge'
import { nameOf, shortName } from '../lib/name'

type Row = { total?: number; _id: string; topic: string; status: string; passed: number; current: number; card?: number; started?: boolean; lastAt: number; outcome: string | null; typed?: boolean }
type Props = { rows: Row[]; signedIn: boolean; isMember?: boolean; freeChapters?: number; activeId?: string; onOpen: (id: string) => void; onContinue?: (id: string) => void; onNew: () => void; onSignIn: () => void; onPlans: () => void; onExplore: () => void; onRemove?: (id: string) => Promise<void> }

function ago(t: number) {
  const m = Math.round((Date.now() - t) / 60000)
  if (m < 60) return m <= 1 ? 'just now' : `${m} min ago`
  const h = Math.round(m / 60); if (h < 24) return `${h} h ago`
  const d = Math.round(h / 24); return d === 1 ? 'yesterday' : `${d} days ago`
}

// Every handbook in one place. Each keeps its own place; starting a new one never resets another.
// A write that hasn't finished in this long has died without being marked failed (UX review 9 Oct): say so, and opening
// it offers Try again (handbooks.retry takes it back).
const STUCK_MS = 15 * 60 * 1000

export default function Library({ rows, signedIn, isMember, freeChapters = 2, activeId, onOpen, onContinue, onNew, onSignIn, onPlans, onExplore, onRemove }: Props) {
  // Remove (D36, 9 Oct): two taps, the second names the handbook; never a browser dialog. Copy (agent).
  const [confirming, setConfirming] = useState<string | null>(null)
  const [removing, setRemoving] = useState<string | null>(null)
  // Newest first, and the one to continue is the one opened last (8 Oct night: a returning reader's one job is to carry
  // on; the main button says so, by name and chapter, instead of "The Shelf").
  const sorted = [...rows].sort((a, b) => Number(!!b.started) - Number(!!a.started) || b.lastAt - a.lastAt)
  // "Continue" is the handbook actually being read (UX review 9 Oct: it picked one only glanced at, over one mid-chapter):
  // read into first, then opened, then any ready one.
  const reading = (r: Row) => r.status === 'ready' && r.passed < (r.total ?? 7) && ((r.card ?? 0) > 0 || r.passed > 0)
  const latest = sorted.find(reading) ?? sorted.find((r) => r.started && r.status === 'ready' && r.passed < (r.total ?? 7)) ?? sorted.find((r) => r.status === 'ready') ?? sorted[0]
  // Each state in its own words (UX review 9 Oct, #20: "Being written…" showed for days on ones that failed or wait for
  // the reader). Copy (agent).
  const where = (r: Row) => {
    const total = r.total ?? 7
    if (r.status === 'intent') return 'Waiting for you to pick what it’s for'
    if (r.status === 'question') return 'Waiting for your answer to one question'
    if (r.status === 'failed') return 'Didn’t get written. Open it to try again.'
    if (r.status !== 'ready') return Date.now() - r.lastAt > STUCK_MS ? 'Stuck while writing. Open it to try again.' : 'Being written…'
    if (r.passed >= total) return total === 1 ? 'Done' : `All ${total} chapters done`
    if ((r.card ?? 0) > 0) return `Chapter ${r.current}, card ${(r.card ?? 0) + 1}: pick up here`
    return r.started ? `Next: chapter ${r.current}` : 'Not opened yet'
  }
  const go = latest && latest.status === 'ready' && latest.passed < (latest.total ?? 7)
  const needsAccount = !signedIn && !!latest && latest.current > freeChapters
  return (
    <>
      <h1>Your handbooks.</h1>
      <p className="lede">Each one remembers exactly where you stopped.</p>
      <ul className="shelf">
        {sorted.map((r) => (
          <li key={r._id}>
            {/* A book on its side (8 Oct, print shop): cloth spine, paper label, printed rungs. The open one is pressed. */}
            <button type="button" className={`shelf-card${r._id === activeId ? ' active' : ''}`} onClick={() => onOpen(r._id)}>
              <span className="shelf-spine" aria-hidden="true" />
              <span className="shelf-body">
                <span className="shelf-top"><span className="shelf-topic">{nameOf(r.topic)}</span><span className="shelf-when">{ago(r.lastAt)}</span></span>
                <span className="shelf-bar" aria-label={`${r.passed} of ${r.total ?? 7} chapters done`}>{Array.from({ length: r.total ?? 7 }, (_, k) => <span key={k} className={k < r.passed ? 'on' : ''} />)}</span>
                <span className="shelf-next">{where(r)}</span>
              </span>
            </button>
            {onRemove && (
              <div className="shelf-remove">
                {confirming === r._id ? (
                  <>
                    {/* A free reader's typed handbook still counts after removing it (a cost guard), so the confirm says so
                        (UX review 9 Oct). Changing an unread one's line is the way to swap it. Copy (agent). */}
                    <span className="note" role="status">Remove “{nameOf(r.topic)}” from Your handbooks? Add the same topic again and it comes back where you left off.{r.typed && !isMember ? ' It still counts as your one typed handbook.' : ''}</span>
                    <button type="button" className="quiet" disabled={removing === r._id} onClick={async () => { setRemoving(r._id); try { await onRemove(r._id) } finally { setRemoving(null); setConfirming(null) } }}>{removing === r._id ? 'Removing…' : 'Yes, remove'}</button>
                    <button type="button" className="quiet" onClick={() => setConfirming(null)}>Keep it</button>
                  </>
                ) : <button type="button" className="quiet" aria-label={`Remove ${nameOf(r.topic)}`} onClick={() => setConfirming(r._id)}>Remove</button>}
              </div>
            )}
          </li>
        ))}
      </ul>
      {/* The nudge is the short form here (8 Oct, print shop): the handbooks are the page, the account is a footnote. */}
      {!signedIn && rows.length > 0 && <SignupNudge onSignIn={onSignIn} context="library" compact freeChapters={freeChapters} />}
      <p style={{ marginTop: 'var(--l)' }}><button type="button" className="quiet" onClick={onPlans}>{isMember ? 'Your membership' : 'What’s free, and what members get'}</button></p>
      {/* 8 Oct (UX review #4): the way to other topics was only in the handbook menu, so readers looped here.
          8 Oct night: the main button continues the last handbook; The Shelf and a new topic are the quiet pair. */}
      <ActionBar>
        {/* Continue goes where it says (UX review 9 Oct): back into the chapter when they were mid-way within the last 12
            hours; after longer, the handbook page first, which says where they stopped. A chapter past the free ones
            says it needs the free account before the tap. */}
        {latest ? <button className="btn" onClick={() => (go && (latest.card ?? 0) > 0 && Date.now() - latest.lastAt < 12 * 3600 * 1000 && onContinue ? onContinue(latest._id) : onOpen(latest._id))}>{!go ? `Open ${shortName(nameOf(latest.topic))}` : `Continue ${shortName(nameOf(latest.topic))}: chapter ${latest.current}${needsAccount ? ' (free account)' : ''}`}</button>
          : <button className="btn" onClick={onExplore}>The Shelf</button>}
        {/* 9 Oct (Prateek: "Do we still need this shelf button here when we have already put it up top"): the Shelf link
            left the bar; the header's Shelf button (D21) is the one way there. The empty state keeps The Shelf as its main button. */}
        <span className="library-quiet">
          <button type="button" className="quiet" onClick={onNew}>Start another topic</button>
        </span>
      </ActionBar>
    </>
  )
}
