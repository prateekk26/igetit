import { useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { shortName } from '../../convex/shortNames'
import { track } from '../lib/track'
import { inline } from '../components/Rich'
import Ooh from '../components/Ooh'

type Field = 'examplesFrom' | 'persona' | 'likes' | 'tone' | 'avoid'
type Props = { deviceToken: string; backLabel: string; onBack: () => void }

const LIKES = ['stories', 'pictures', 'numbers', 'humour', 'straight talk', 'step by step', 'examples from my work', 'history behind it']
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
const dot = (s: string) => (/[.!?]$/.test(s) ? s : `${s}.`)

// "From Sunday's question": the day a question was missed, in the reader's own week.
function dayOf(at: number) {
  const d = new Date(at), now = new Date()
  const days = Math.round((new Date(now.toDateString()).getTime() - new Date(d.toDateString()).getTime()) / 86400000)
  if (days <= 0) return "today's"
  if (days === 1) return "yesterday's"
  if (days < 7) return `${d.toLocaleDateString('en-IN', { weekday: 'long' })}'s`
  return `the ${d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}`
}

// C11 "What Ooh knows about you" (the board, 15 Oct): everything a chapter is written from, in plain sentences, each one
// changeable in place. About you (where examples come from, what each book is for), how you learn best (who teaches you,
// what helps, your own words, what to keep out), and what's tricky right now (the last questions missed and not yet got
// right). It replaces "Who teaches you, and how": the same profile, the same save, which rewrites unread chapters only.
// Copy (agent).
export default function Memory({ deviceToken, backLabel, onBack }: Props) {
  const data = useQuery(api.handbooks.aboutYou, { deviceToken })
  const save = useMutation(api.handbooks.saveProfile)
  const [editing, setEditing] = useState<Field | null>(null)
  const [draft, setDraft] = useState('')
  const [likes, setLikes] = useState<string[]>([])
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState<string | null>(null)
  const [answer, setAnswer] = useState<'yes' | 'no' | null>(null)
  const [forgetting, setForgetting] = useState(false)

  const p = data?.profile ?? { persona: '', tone: '', likes: [] as string[], examplesFrom: '', avoid: '' }
  const open = (f: Field) => { setNote(null); setEditing(f); if (f === 'likes') setLikes(p.likes); else setDraft((p as any)[f] ?? '') }
  const savedLine = (staled: number) => staled > 0 ? `Saved. ${staled} chapter${staled === 1 ? '' : 's'} you haven't opened yet will be written this way. Nothing you've read changes.` : 'Saved. Every new chapter is written this way.'
  const commit = async () => {
    if (!editing) return
    setBusy(true)
    try {
      const r = await save({ deviceToken, ...(editing === 'likes' ? { likes } : { [editing]: draft.trim() }) })
      track('memory', { v: `edit:${editing}` })
      setNote(savedLine(r.staled)); setEditing(null)
    } catch { setNote("Couldn't save that. Try again in a minute.") } finally { setBusy(false) }
  }
  const forget = async () => {
    setBusy(true)
    try { await save({ deviceToken, persona: '', tone: '', likes: [], examplesFrom: '', avoid: '' }); track('memory', { v: 'forget' }); setNote('Forgotten. Your books and what you know stay.'); setForgetting(false) }
    catch { setNote("Couldn't do that just now. Try again in a minute.") } finally { setBusy(false) }
  }

  const row = (f: Field, text: string | null, empty: string, sub?: string) => (
    <li key={f} className="c11-row">
      {editing === f ? (
        <form className="c11-edit" onSubmit={(e) => { e.preventDefault(); commit() }}>
          {f === 'likes' ? (
            <div className="c11-likes" role="group" aria-label="What helps you">
              {LIKES.map((x) => <button key={x} type="button" className="chip" aria-pressed={likes.includes(x)} onClick={() => setLikes((l) => (l.includes(x) ? l.filter((y) => y !== x) : [...l, x]))}>{x}</button>)}
            </div>
          ) : (
            <input className="input" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={empty} maxLength={160} autoFocus aria-label={empty} enterKeyHint="done" />
          )}
          <div className="c11-edit-row">
            <button type="submit" className="c11-save" disabled={busy}>{busy ? 'Saving…' : 'Save'}</button>
            <button type="button" className="quiet" onClick={() => setEditing(null)}>Cancel</button>
          </div>
        </form>
      ) : (
        <>
          <span className="c11-text">
            <span className={text ? '' : 'c11-empty'}>{text ?? empty}</span>
            {sub && <small>{sub}</small>}
          </span>
          <button type="button" className="c11-pen" onClick={() => open(f)} aria-label={text ? `Change: ${text}` : empty}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16v4z" /><path d="m13.5 6.5 4 4" /></svg>
          </button>
        </>
      )}
    </li>
  )

  return (
    <div className="c11">
      <header className="c3-top">
        <button type="button" className="c11-back" onClick={onBack}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m15 6-6 6 6 6" /></svg>{backLabel}</button>
      </header>
      <h1>What Ooh knows about you</h1>
      <p className="c3-says"><Ooh size={32} idle /><span>This is what I use to make your books. Change anything!</span></p>
      {data === undefined ? <p className="note">One moment…</p> : (
        <div className="c11-cols">
          <div>
            <h2 className="c11-h">About you</h2>
            <ul className="c11-list">
              {row('examplesFrom', p.examplesFrom ? `Your examples come from ${dot(p.examplesFrom)}` : null, 'Where should examples come from? Your work, a hobby…')}
              {data.books.filter((b) => b.goal).map((b) => (
                <li key={b.topic} className="c11-row"><span className="c11-text"><span>{dot(cap(b.goal!))}</span><small>Why you started {shortName(b.topic)}</small></span></li>
              ))}
            </ul>
            <h2 className="c11-h">How you learn best</h2>
            <ul className="c11-list">
              {row('persona', p.persona ? `You like being taught by ${dot(p.persona)}` : null, 'Who should teach you? A patient teacher, a sharp friend…')}
              {row('likes', p.likes.length ? `${cap(p.likes.join(', '))} help you most.` : null, 'What helps you? Stories, pictures, numbers…')}
              {row('tone', p.tone ? `“${p.tone}”` : null, 'Anything else, in your words', p.tone ? 'In your words' : undefined)}
              {row('avoid', p.avoid ? `Keep out: ${dot(p.avoid)}` : null, 'Anything to keep out? Sports examples, long paragraphs…')}
            </ul>
          </div>
          <div>
            <h2 className="c11-h">What's tricky right now</h2>
            {data.tricky.length ? (
              <ul className="c11-list">
                {data.tricky.map((t) => (
                  <li key={`${t.at}`} className="c11-row"><span className="c11-text"><span>{inline(t.prompt)}</span><small>From {dayOf(t.at)} question · {shortName(t.topic)}</small></span></li>
                ))}
              </ul>
            ) : <p className="c11-none">Nothing right now. When a question trips you up, it shows here, and a later chapter brings it back.</p>}
          </div>
        </div>
      )}
      {note && <p className="c11-note" role="status">{note}</p>}
      <div className="c11-foot">
        <div className="c11-ask">
          {forgetting ? (
            <>
              <p className="c11-ask-q"><Ooh size={32} /><span>Forget how you like to be taught? Your books and what you know stay.</span></p>
              <div className="c11-ask-row">
                <button type="button" className="c11-yes" onClick={forget} disabled={busy}>Forget it</button>
                <button type="button" className="c11-no" onClick={() => setForgetting(false)}>Keep it</button>
              </div>
            </>
          ) : answer ? (
            <p className="c11-ask-q"><Ooh size={32} face={answer === 'yes' ? 'happy' : 'curious'} /><span>{answer === 'yes' ? "Good. That's what I'll write from." : 'Tap the pencil next to anything that\'s off.'}</span></p>
          ) : (
            <>
              <p className="c11-ask-q"><Ooh size={32} /><span>Does this sound like you?</span></p>
              <div className="c11-ask-row">
                <button type="button" className="c11-yes" onClick={() => { setAnswer('yes'); track('memory', { v: 'yes' }) }}>Yes!</button>
                <button type="button" className="c11-no" onClick={() => { setAnswer('no'); track('memory', { v: 'no' }) }}>Not quite</button>
              </div>
            </>
          )}
        </div>
        {!forgetting && <button type="button" className="c11-forget" onClick={() => { setForgetting(true); setNote(null) }}>Forget all of it</button>}
      </div>
    </div>
  )
}
