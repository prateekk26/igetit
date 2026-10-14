import { useEffect, useState } from 'react'
import ActionBar from '../components/ActionBar'
import Confetti from '../components/Confetti'
import TeachBack from '../components/TeachBack'
import ShelfStrip from '../components/ShelfStrip'
import { track } from '../lib/track'
import { autoOn, setAuto } from '../lib/pageVoice'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { subscribe, canInstall, install, isIOS, isStandalone } from '../lib/push'
import type { Id } from '../../convex/_generated/dataModel'
import Ooh, { GoArrow } from '../components/Ooh'

type Props = {
  onReplay?: () => void   // C9's "Play again": read this chapter again
  total?: number
  topic: string
  n: number
  passed: number[]
  outcomeLine: string
  nextTitle?: string
  nextHook?: string
  nextPicture?: string   // the next chapter's first picture, for the Up next card (7 Oct)
  sources?: { who: string; what: string; why?: string }[]
  signedIn: boolean
  tomorrowAt?: string
  onKeep: () => void
  onPickTime: (at: string) => Promise<void>
  onContinue: () => void
  onPricing: () => void
  stats?: { minutes: number; right: number; total: number } | null
  nextReady?: boolean
  nextFailed?: boolean   // the next chapter failed to write: the button says so and tries again (8 Oct)
  onNext?: () => void
  handbookId?: Id<'handbooks'>
  deviceToken?: string
  onRate?: (rating: 'too_easy' | 'just_right' | 'lost_me', note?: string) => Promise<void>
  whatsNext?: React.ReactNode
  learnMore?: React.ReactNode   // "I want to learn more" (13 Oct): shown after the last chapter
  starred?: boolean   // D100: rated on the star slide just now, so the last chapter's question isn't asked twice
  onShelf?: () => void   // the Shelf strip under the wall card (9 Oct, Prateek: make the Shelf findable)
  freeChapters?: number   // chapters a visitor reads without an account: membership.ts LIMITS.visitorChapters, read from the server (2 since 9 Oct, D26)
  priceLine?: string | null   // the early-bird price, as information on the wall, never a gate (Shaktimaan, 8 Oct)
  quick?: boolean   // D23 (9 Oct): a recipe or one-off task; read in one sitting, no wall, no reminder, no tomorrow
  isMember?: boolean   // members never get the membership pitch (UX review 9 Oct: the last chapter pitched it to paying members)
  nextWriting?: boolean   // the next chapter is being written right now: its button waits here instead of dropping the reader on the plan
}

// Reminder moments (7 Oct, Prateek: "more casual and witty"): a moment in the day, the clock underneath. Copy (agent).
const TIMES: { at: string; label: string }[] = [
  { at: '07:30', label: 'With the morning chai' },
  { at: '13:00', label: 'At lunch, one hand free' },
  { at: '19:00', label: 'On the ride home' },
  { at: '21:00', label: 'After dinner, before the scroll' },
  { at: '22:30', label: 'In bed, instead of reels' },
]
const momentOf = (t: string) => TIMES.find((x) => x.at === t)?.label.toLowerCase()

function pretty(t: string) {
  const [h, m] = t.split(':').map(Number)
  const ampm = h >= 12 ? 'pm' : 'am'
  const hh = ((h + 11) % 12) + 1
  return m ? `${hh}:${String(m).padStart(2, '0')}${ampm}` : `${hh}${ampm}`
}

// The rung lights. Sign-in is asked only here, after the night is done.
export default function Done({ onReplay, nextFailed, total = 7, topic, n, passed, outcomeLine, nextTitle, nextHook, nextPicture: _nextPicture, sources: _sources, signedIn, tomorrowAt, onKeep, onPickTime, onContinue, onPricing, stats: _stats, nextReady, onNext, handbookId, deviceToken, onRate, whatsNext, learnMore, freeChapters = 2, priceLine, onShelf, quick = false, isMember = false, nextWriting = false, starred = false }: Props) {
  const [rated, setRated] = useState<string | null>(null)
  const [stay, setStay] = useState(false)
  const last = n >= total
  // The wall (Prateek, 8 Oct night, Shaktimaan's advice): a visitor's free chapters are read, so the next chapter opens
  // with a free account. The server refuses the chapter without one (membership.ts tryOpen); this screen only says so.
  const wall = !signedIn && !last && n >= freeChapters && !quick   // a quick handbook is one sitting (D23): no wall between its chapters
  useEffect(() => { if (wall) track('wall', { n }, `wall:${handbookId ?? ''}:${n}`) }, [wall, n, handbookId])
  // Auto-play carries on into the next chapter once it's open (15 Oct, Prateek: "It should span chapters as well"); it
  // stops here at the free-account wall, after the last chapter, or when tapped off.
  const [auto, setAutoState] = useState(autoOn)
  const carries = auto && !wall && !last && !!onNext && !nextFailed
  useEffect(() => { if (carries && nextReady) { const t = setTimeout(() => onNext?.(), 4000); return () => clearTimeout(t) } }, [carries, nextReady]) // eslint-disable-line react-hooks/exhaustive-deps
  // The last chapter of a handbook entered part-way (a post link to chapter 7) is not "seven chapters, done" (UX review 9 Oct).
  const left = Math.max(0, total - new Set([...passed, n]).size)
  // While the next chapter is still being written, its button waits here, busy, and turns live when it lands (UX review
  // 9 Oct: it dropped the reader on the handbook page to wait).
  const nextBtn = (label: string, ghost = false) => nextWriting && !nextReady && !nextFailed
    ? <button className="btn" disabled aria-busy="true">{`Writing chapter ${n + 1}… about a minute`}</button>
    : <button className={ghost ? 'btn btn-ghost' : 'btn c-go'} onClick={onNext}><span>{nextFailed ? `Chapter ${n + 1} didn't write. Try again` : label}</span>{!ghost && <GoArrow />}</button>
  return (
    <>
      <Confetti fire />
      {/* C9 (14 Oct, the C board "Chapter done"): Ooh lands on its "i" on a marigold band, then the topic, the line, and
          what was added to what they know. The rung bar stays under it, small. Copy (agent). */}
      <section className="c9-stage">
        <div className="c9-band">
          {onReplay && <button type="button" className="c9-band-btn" onClick={onReplay}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.4-5.7" /><path d="M4 4v4h4" /></svg>Play again</button>}
          <button type="button" className="c9-band-btn c9-close" onClick={onContinue} aria-label="Back to the handbook"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg></button>
        </div>
        <span className="c1-stem c9-stem" aria-hidden="true" />
        <Ooh face="happy" tone="cream" size={132} className="c9-ooh" idle />
      </section>
      <p className="c9-topic">{topic}</p>
      <h1 className="c9-h">{total === 1 ? <>Done,<br />and you got it!</> : <>Chapter {n},<br />and you got it!</>}</h1>
      {/* The proof of the night comes first (8 Oct night, critique): what they can now do, before any question is asked of them. */}
      {outcomeLine && (
        <>
          <h2 className="c9-label">Added to what you know</h2>
          <ul className="c9-known"><li><span className="c9-dot" aria-hidden="true" />{outcomeLine}</li></ul>
        </>
      )}
      {/* The wall, as one printed block right under the outcome: what chapter N+1 is, that it is free with an account, what the
          account costs them (an email and a code), and what they keep either way. The only button is the one in the action
          bar, within thumb reach; this card explains it. Copy (agent). */}
      {wall && nextTitle && (
        <section className="upnext" aria-label={`Chapter ${n + 1} is free with an account`}>
          {/* No picture here (second critique): it pushed the one sentence that reassures under the fixed button. */}
          <div className="upnext-body">
            <p className="upnext-kicker">Up next: {nextTitle}</p>
            <h2 className="upnext-title">Chapter {n + 1} is free with an account.</h2>
            {nextHook && <p className="upnext-hook">{nextHook}</p>}
            <p className="serif">Your email and a 6-digit code, no card. What you've read stays on this phone whatever you choose, and your place is kept on any phone or laptop.</p>
          </div>
        </section>
      )}
      {/* The price is information under the card, never inside the free one (55's review, 8 Oct night): a mixed signal otherwise. */}
      {wall && nextTitle && priceLine && <p className="note">Chapter {n + 1} costs nothing. {priceLine} <button type="button" className="quiet" style={{ padding: 0 }} onClick={onPricing}>See pricing</button></p>}
      {wall && onShelf && <ShelfStrip where="done" onOpen={onShelf} />}
      {/* C9 (15 Oct, the board): no rung bar, no cheer line and no pace question here; the band, the line, what was added,
          Say it back and the next chapter. D96's pace question waits for the one-time "About you" (Prateek to decide). */}
      {onRate && last && !starred && (
        <div className="rate" role="group" aria-label={`How was chapter ${n}?`}>
          <p className="rate-q">{rated ? 'Thanks, noted.' : `How was chapter ${n}? (optional)`}</p>
          {!rated && (
            <div className="rate-row">
              {([['too_easy', 'Too easy'], ['just_right', 'Just right'], ['lost_me', 'Lost me']] as const).map(([k, label]) => (
                <button key={k} type="button" className="chip" onClick={() => { setRated(k); track('feedback', { n, v: k }); onRate(k).catch(() => {}) }}>{label}</button>
              ))}
            </div>
          )}
        </div>
      )}
      {handbookId && deviceToken && <TeachBack handbookId={handbookId} n={n} deviceToken={deviceToken} />}
      {/* Up next (7 Oct, Prateek): the next chapter as a card worth tapping, with its own button. Behind the wall the card above says it instead. */}
      {/* Up next (7 Oct, Prateek; C9 14 Oct): one line over the main button says what's next; the button is in the bar. */}
      {carries && (
        <p className="c9-auto" role="status">
          <span>{nextReady ? `Auto-play: chapter ${n + 1} starts in a moment.` : `Auto-play: chapter ${n + 1} starts as soon as it's written.`}</span>
          <button type="button" className="quiet" onClick={() => { setAuto(false); setAutoState(false); track('autoplay', { v: 'off' }) }}>Stop</button>
        </p>
      )}
      {!last && nextTitle && !wall && (
        <p className="c9-next" aria-label={`Up next: chapter ${n + 1}`}>Next · chapter {n + 1}: {nextTitle}{!nextReady && !nextFailed && !quick && onNext ? ' · being written for you now, about a minute' : ''}</p>
      )}
      {last && <p className="lede" style={{ marginTop: 'var(--l)' }}>{left > 0 ? `That's the last chapter. ${left === 1 ? 'One earlier chapter is' : `${left} earlier chapters are`} still yours to read, on the handbook page.` : quick ? "That's all of it. Quick and done." : total === 7 ? "That's the whole handbook. Seven chapters, done." : `That's the whole handbook. ${total} chapters, done.`}</p>}
      {last && learnMore}
      {last && whatsNext}

      {last && !isMember && (
        <div className="nudge" style={{ marginTop: 'var(--l)' }}>
          <p className="nudge-lead">That's the summit.</p>
          <p className="serif">Want more? Members keep 3 topics of their own on the go, read up to 7 chapters a day, get 30 web-checked answers a month, and can save any handbook as a PDF.</p>
          <button type="button" className="btn btn-ghost nudge-btn" onClick={onPricing}>See what members get</button>
        </div>
      )}

      {!last && !wall && !quick && <Reminder n={n} tomorrowAt={tomorrowAt} onPickTime={onPickTime} handbookId={handbookId} deviceToken={deviceToken} />}

      {/* 8 Oct night: after the free chapters a visitor's one main action is the free account (the wall above); before
          them (UX review #15) it is the next chapter, with sign-in as a quiet line. Copy (agent). */}
      <ActionBar>
        {wall ? (
          <>
            <button className="btn c-go" onClick={() => { track('wall_tap', { n }); onKeep() }}><span>Make a free account</span><GoArrow /></button>
            <button type="button" className="quiet" onClick={onContinue}>Back to the handbook</button>
          </>
        ) : quick && !last && onNext ? (
          <>
            {/* A quick handbook is one sitting (D23): "Keep going" for everyone, before any account line (UX review 9 Oct). */}
            {nextBtn('Keep going')}
            <button type="button" className="quiet" onClick={onContinue}>Back to the handbook</button>
          </>
        ) : !signedIn && !stay && !last && n < freeChapters && onNext && nextTitle ? (
          <>
            {/* D26 (9 Oct, Prateek): the wall moved to after chapter 2; before it the main action is the next chapter, sign-in a quiet line. */}
            {nextBtn(`Start chapter ${n + 1}`)}
            <button type="button" className="quiet" onClick={onKeep}>Want it on every device? Make a free account</button>
          </>
        ) : !signedIn && !stay ? (
          <>
            <button className="btn" onClick={onKeep}>Keep this handbook</button>
            <button type="button" className="quiet" onClick={() => { setStay(true); if (!last) onNext?.() }}>{last ? 'Not now. It stays on this phone.' : `Not now, start chapter ${n + 1}`}</button>
          </>
        ) : (
          // Signed in: the next chapter is the main, filled button (UX review 9 Oct: it was an outline, like a second choice).
          last || !onNext ? <button className="btn" onClick={onContinue}>Back to the handbook</button> : (
            <>
              {nextBtn(`Start chapter ${n + 1}`)}
              <button type="button" className="quiet c9-tomorrow" onClick={onContinue}>Tomorrow, then</button>
            </>
          )
        )}
      </ActionBar>
    </>
  )
}

// "Remind me" (6 Oct): picks the time and, where the phone allows, sends a real notification then (web push).
// iPhones only allow it once the app is on the home screen, so the block says so there.
function Reminder({ n, tomorrowAt, onPickTime, handbookId, deviceToken }: { n: number; tomorrowAt?: string; onPickTime: (at: string) => Promise<void>; handbookId?: Id<'handbooks'>; deviceToken?: string }) {
  const publicKey = useQuery(api.push.publicKey, {})
  const save = useMutation(api.push.saveReminder)
  const [saving, setSaving] = useState<string | null>(null)
  const [note, setNote] = useState<string | null>(null)
  const [installable, setInstallable] = useState(canInstall())
  // "Deal. See you after dinner" only when a reminder will really come (UX review 9 Oct): granted notifications, or a
  // subscription made just now. Otherwise the time is only saved, and the heading says that.
  const [willRemind, setWillRemind] = useState(() => { try { return typeof Notification !== 'undefined' && Notification.permission === 'granted' } catch { return false } })
  const pick = async (t: string) => {
    setSaving(t); setNote(null)
    try {
      await onPickTime(t)
      if (!publicKey || !deviceToken) { setNote(`Saved: ${pretty(t)}. Reminders aren't available just now.`); return }
      const r = await subscribe(publicKey)
      if (r.ok) { await save({ deviceToken, at: t, tzOffsetMin: new Date().getTimezoneOffset(), handbookId, subscription: r.subscription }); track('feedback', { n, v: 'reminder' }); setWillRemind(true); setNote(`Done. This phone will remind you at ${pretty(t)}.`) }
      else {
        setWillRemind(false)
        setNote(r.why === 'ios-install' ? `Saved: ${pretty(t)}. For a reminder on iPhone, tap Share, then Add to Home Screen, and open I Get It from there.`
          : r.why === 'denied' ? `Saved: ${pretty(t)}. Notifications are off for this site, so no reminder. To turn them on, open this site's settings in your browser (the icon left of the address), allow notifications, then pick a time again.` : `Saved: ${pretty(t)}. This browser can't send reminders.`)
      }
    } catch { setNote("Couldn't save that. Try again.") }
    finally { setSaving(null) }
  }
  // Collapsed until tapped (UX review #39, 8 Oct): six reminder times on every Done screen pushed the next chapter down.
  const [open, setOpen] = useState(!!tomorrowAt)
  if (!open) {
    return (
      <section className="remind">
        <p className="note" style={{ marginTop: 'var(--l)' }}><button type="button" className="quiet" style={{ padding: 0 }} onClick={() => setOpen(true)}>Want a nudge for chapter {n + 1}? Pick a time</button></p>
      </section>
    )
  }
  return (
    <section className="remind">
      <h2 style={{ marginTop: 'var(--xl)' }}>{tomorrowAt ? (willRemind ? `Deal. See you ${momentOf(tomorrowAt) ?? `at ${pretty(tomorrowAt)}`}.` : `Saved: ${momentOf(tomorrowAt) ?? pretty(tomorrowAt)}.`) : `When do you have five minutes for chapter ${n + 1}?`}</h2>
      {!tomorrowAt && <p className="note" style={{ marginTop: 0 }}>Pick one. One nudge a day at that time, and none on days you've already read.</p>}
      <div className="moments">
        {TIMES.map((t) => (
          <button key={t.at} type="button" className="moment" aria-pressed={tomorrowAt === t.at} disabled={!!saving} onClick={() => pick(t.at)}>
            <span className="moment-label">{t.label}</span><span className="moment-time">{pretty(t.at)}</span>
          </button>
        ))}
      </div>
      {note && <p className="note" role="status">{note}</p>}
      {installable && !isStandalone() && (
        <button type="button" className="quiet" onClick={async () => { await install(); setInstallable(false) }}>Add I Get It to your home screen</button>
      )}
      {!installable && isIOS() && !isStandalone() && !note && <p className="note">Tip: on iPhone, tap Share, then Add to Home Screen, to keep I Get It next to your apps.</p>}
    </section>
  )
}
