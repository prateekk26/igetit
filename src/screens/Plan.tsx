import { useEffect, useRef, useState } from 'react'
import ActionBar from '../components/ActionBar'
import { track } from '../lib/track'
import Ooh, { GoArrow } from '../components/Ooh'

type Chapter = { n: number; title: string; covers: string; outcome: string; hook?: string; minutes?: number }
// A month-long handbook (D65, 28 chapters) groups its path into weeks; only the reader's week opens by default.
type Week = { title: string; from: number; to: number }
type Props = {
  forWhom?: string   // typed handbooks: who it was written for (16 Oct)
  total?: number   // chapters in this handbook: 7, or 1 to 3 for a quick one (7 Oct)
  onOpenChapter?: (n: number) => void
  nextTopics?: React.ReactNode   // "Jump to next" topics in place of further reading (7 Oct)   // a finished chapter opens again on tap (7 Oct, Prateek); never uses the daily allowance
  topic: string
  bookId?: string   // for remembering which finished chapters this phone has already seen stamped (20 Oct)
  plan: { outcome7: string; horizon14?: string; horizon28?: string; picture?: { name: string; line: string }; chapters: Chapter[]; sources?: { who: string; what: string; why?: string }[]; pushback?: string | null; framing?: string | null; format?: string; weeks?: Week[] }
  passed: number[]
  current: number
  chapterReady: boolean
  chapterFailed: boolean
  chapterWait?: { since?: number; expectMs: number; floor?: number }   // the filling bar while the chapter is written (20 Oct)
  chapterError?: string
  // Today's reading allowance is used (membership.ts): what to tell the reader, and the way to membership.
  lockNote?: string | null
  lockHead?: string | null   // what the lock means, from the server's code (8 Oct): a daily limit, or just not open
  onPricing?: () => void
  onSignUp?: () => void   // a visitor past the free chapter: the free account is the next step, not money
  needsAccount?: boolean   // signed out and the current chapter is past the free one (8 Oct night): the button says so before the tap
  declined?: boolean   // they tapped Not now on the wall this session (9 Oct, 05's critique): one quiet line, not the same ask twice
  onShelf?: () => void   // The Shelf, shown under the quiet line when declined
  shelfStrip?: React.ReactNode   // the printed Shelf strip with the live count (9 Oct, D21), under the summit
  onStart: () => void
  onTapChapter?: (n: number) => void   // a path stop (Prateek, 9 Oct): finished ones open, the next starts, ones ahead preview
  onRetry: () => void
  onChangeLine: () => void
  canChangeLine?: boolean   // only a handbook this reader typed, before they've read it (UX review 9 Oct, #9)
  voiceNote?: string
  onTune: () => void
  onCompare?: () => void
  comparing?: boolean
  coverSvg?: string
  coverPicture?: string
  coverPending?: boolean
  caution?: string | null
  onLibrary?: () => void
  libraryCount?: number
  nextUp?: { kind: 'resume'; n: number; card: number; left: number } | { kind: 'next'; n: number } | null
  whatsNext?: React.ReactNode
  onBack?: () => void   // C3's own header: the back arrow goes to Tonight, or home on a first visit
  more?: React.ReactNode   // the handbook's own extras (what Ooh knows, print, start another), under the list
}

// The handbook (14 Oct, the C boards "The plan" and "Tonight"): for a reader coming back, tonight's chapter on a marigold
// card with its own Start; then the picture, the title, Ooh's line (the outcome) and "What's in it", one numbered row a
// chapter, each answering a tap as the old path's stops did. A first visit has no card; the bar's button starts chapter 1.
export default function Plan({ total = 7, onOpenChapter, nextTopics, topic, forWhom, plan, passed, current, chapterReady, chapterFailed, chapterWait, chapterError: _chapterError, lockNote, lockHead, onPricing, onSignUp, needsAccount, declined, onShelf: _onShelf, onStart, onTapChapter, onRetry, onChangeLine, canChangeLine, voiceNote, onCompare, comparing, coverPicture, caution, nextUp, whatsNext, onBack, more, bookId }: Props) {
  useEffect(() => { track('plan_view', undefined, 'plan_view:' + topic) }, [topic])
  const first = passed.length === 0 && current === 1   // a reader who came in at chapter 2 from a post is on 2
  // Motion (20 Oct, Prateek's yes to the list): a new book's rows arrive one after another while chapter 1 is written
  // (item 1), as on the wait screen; a chapter finished since this phone last saw the page gets its tick stamped on (item
  // 5); when chapter 1 lands the bar fills the last stretch and the button pops (item 2). Remembered per phone only.
  const arriving = first && !chapterReady
  const seenKey = bookId ? `igetit.seenPassed.${bookId}` : null
  const [stamped] = useState<number[]>(() => {
    try { const seen = seenKey ? JSON.parse(localStorage.getItem(seenKey) ?? 'null') : null; return Array.isArray(seen) ? passed.filter((n) => !seen.includes(n)) : [] } catch { return [] }
  })
  useEffect(() => { try { if (seenKey) localStorage.setItem(seenKey, JSON.stringify(passed)) } catch { /* a convenience only */ } }, [seenKey, passed.join(',')]) // eslint-disable-line react-hooks/exhaustive-deps
  const wasReady = useRef(chapterReady)
  const [justReady, setJustReady] = useState(false)
  useEffect(() => { if (!wasReady.current && chapterReady) setJustReady(true); wasReady.current = chapterReady }, [chapterReady])
  const resuming = nextUp?.kind === 'resume'
  // "Later, if you keep going: …" under "Later peaks:" read "Later peaks: Later, …" (UX review 9 Oct): the model's own
  // opener is dropped.
  const weekOf = (n: number) => plan.weeks?.findIndex((w) => n >= w.from && n <= w.to) ?? -1
  const [openWeeks, setOpenWeeks] = useState<Set<number>>(() => new Set([Math.max(0, weekOf(current))]))
  const toggleWeek = (i: number) => setOpenWeeks((s) => { const t = new Set(s); if (t.has(i)) t.delete(i); else t.add(i); return t })
  const later = (plan.horizon14 ?? '').replace(/^\s*later\b[\s,:]*(peaks?[\s,:]*)?(if you keep going[\s,:]*)?/i, '').trim()
  const mins = (n: number) => plan.chapters[n - 1]?.minutes
  // Tonight's card holds the one main button when it can start the chapter; otherwise the bar below does (a lock, a
  // failed chapter, one still being written, or the account ask after a "Not now").
  // C3 (the board, 15 Oct): the plan reads as a letter, the same for a first visit and a reader coming back. Its own top
  // line: the back arrow, and the book's length on the right. Ooh's line ends on what's next and how long it takes.
  const totalMin = plan.chapters.reduce((a, c) => a + (c.minutes ?? 0), 0)
  const upN = nextUp?.n ?? current
  const tail = passed.length >= total ? ''
    : resuming ? ` You stopped partway through chapter ${upN}.`
    : first ? (mins(1) ? ` Tonight is chapter 1. It takes ${mins(1)} minutes.` : ' Tonight is chapter 1.')
    : mins(upN) ? ` Next is chapter ${upN}. It takes ${mins(upN)} minutes.` : ` Next is chapter ${upN}.`
  return (
    <>
      <header className="c3-top">
        {onBack ? <button type="button" className="c3-back" onClick={onBack} aria-label="Back"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 12H5" /><path d="m11 6-6 6 6 6" /></svg></button> : <span />}
        <span className="c3-meta">{total} chapter{total === 1 ? '' : 's'}{totalMin ? ` · about ${totalMin} min` : ''}</span>
      </header>
      {passed.length >= total && whatsNext}
      <div className="c3-page">
      {coverPicture && <img className="c3-pic" src={coverPicture} alt="" />}
      <div className="c3-side-col">
      <section className="c3">
        <h1>{topic}</h1>
        {forWhom && <p className="c3-for">{forWhom}</p>}
        {plan.pushback && <p className="c3-says"><Ooh size={28} /><span>{plan.pushback}</span></p>}
        {/* A quick handbook (a recap, one recipe; 7 Oct) says so up top: no weeks of study for this one. */}
        {!plan.pushback && plan.framing && <p className="c3-says"><Ooh size={28} /><span>{plan.framing}</span></p>}
        {/* A new book, first open (20 Oct): Ooh hops once, then idles; otherwise it glances as before */}
        <p className="c3-says"><Ooh face={first ? 'happy' : 'curious'} size={28} idle /><span>{plan.outcome7}{tail}</span></p>
        {caution && <p className="roadmap-caution c3-caution">Study aid, verify before you act.</p>}
      </section>

      {voiceNote && <p className="note" style={{ marginBottom: 'var(--m)' }}>{voiceNote}</p>}

      <h2 className="c3-h">What's in it {passed.length > 0 && <small>{passed.length} of {total} done</small>}</h2>
      <ol className="c3-list">
        {plan.chapters.map((c) => {
          const done = passed.includes(c.n)
          const now = c.n === current && !done
          const wk = weekOf(c.n), week = wk >= 0 ? plan.weeks![wk] : null
          const head = week && c.n === week.from ? (
            <li key={`w${wk}`} className="c3-week">
              <button type="button" aria-expanded={openWeeks.has(wk)} onClick={() => toggleWeek(wk)}>
                <span className="c3-week-n">Week {wk + 1}</span>
                <span className="c3-week-t">{week.title}</span>
                <span className="c3-week-c">{plan.chapters.filter((x) => x.n >= week.from && x.n <= week.to && passed.includes(x.n)).length} of {week.to - week.from + 1} {openWeeks.has(wk) ? '▾' : '›'}</span>
              </button>
            </li>
          ) : null
          if (week && !openWeeks.has(wk)) return head
          const skipped = !done && c.n < current   // a post link started past it (UX review 9 Oct): it still opens
          const ahead = !done && !now && !skipped
          const side = done ? 'Done' : now ? (plan.format !== 'quick' ? (first ? 'Tonight' : 'Next') : '') : skipped ? 'Read it' : c.minutes ? `${c.minutes} min` : ''
          const inner = (<>
            <span className="c3-n" aria-hidden="true">{done ? '✓' : c.n}</span>
            <span className="c3-t"><span className="lp-visually-hidden">Chapter {c.n}: </span>{c.title}</span>
            <span className="c3-side">{done && stamped.includes(c.n) && <Ooh face="happy" size={26} className="c3-pop" />}{side}</span>
          </>)
          const cls = `c3-row ${done ? 'done' : now ? 'now' : 'ahead'}${done && stamped.includes(c.n) ? ' stamp' : ''}`
          // Every row answers a tap (Prateek, 9 Oct: "the chapters in the path don't seem clickable"): finished and skipped
          // chapters open, the next one starts, chapters ahead show a preview; they open one at a time.
          return [head,
            <li key={c.n} style={arriving ? { ['--rise-delay' as any]: `${(c.n - 1) * 0.25}s` } : undefined}>
              {(done || skipped) && onOpenChapter ? <button type="button" className={cls} onClick={() => onOpenChapter(c.n)}>{inner}</button>
                : now && chapterReady ? <button type="button" className={cls} onClick={onStart}>{inner}</button>
                : ahead && onTapChapter ? <button type="button" className={cls} onClick={() => onTapChapter(c.n)} aria-label={`Chapter ${c.n}: ${c.title}. Opens after chapter ${c.n - 1}. Preview`}>{inner}</button>
                : <div className={cls}>{inner}</div>}
            </li>]
        })}
      </ol>
      {total === 7 && later && <p className="c3-later">Later, if you keep going: {later}</p>}
      {plan.picture && <p className="c3-picture">The picture for the whole way: {plan.picture.line}</p>}
      {nextTopics ?? null}
      {more}

      {/* Prateek, 9 Oct ("Do we really need all of these links before we ask the user to resume?"): the path, then the main
          button. The Shelf strip, "Who teaches you" and "Your handbooks" live in the side rail on a laptop and the ☰ menu on
          a phone, and the header's back link goes home. What stays here is for this handbook only. */}
      {(onCompare || canChangeLine) && (
        <div className="roadmap-links">
          {/* The three-writer comparison is testers-only (App.tsx: ?compare=1 once on this phone), so readers never see it. */}
          {onCompare && <button type="button" className="quiet" onClick={onCompare}>{comparing ? `Three writers are on chapter ${current}…` : `Testers: compare three writers on chapter ${current}`}</button>}
          {canChangeLine && <button type="button" className="quiet" onClick={onChangeLine}>Not what you meant? Change what you typed</button>}
        </div>
      )}

      </div>
      </div>
      <ActionBar busy={!chapterReady && !chapterFailed} wait={chapterWait} note={!chapterReady && !chapterFailed ? `Writing chapter ${current} and checking its facts… about a minute.` : undefined}>
        {lockNote ? (
          <>
            <div className="lock-card">
              <p className="lock-card-head">{onSignUp && <Ooh face="curious" size={30} />}{onSignUp ? `Chapter ${current} is free with an account` : lockHead ? `Chapter ${current} ${lockHead}` : `Chapter ${current} didn't open`}</p>
              <p className="lock-card-text">{lockNote}</p>
              {onSignUp && <p className="free-banner"><strong>Free.</strong> Just your email. No card, no spam, ever.</p>}
              {onSignUp ? <button className="btn" onClick={onSignUp}>Sign up free and keep reading</button>
                : onPricing && <button className="btn btn-ghost" onClick={onPricing}>See what members get</button>}
            </div>
          </>
        ) : chapterFailed ? (
          <>
            <p className="error" style={{ marginTop: 0 }}>Chapter {current} didn't come through. The plan is saved; try again.</p>
            <button className="btn" onClick={onRetry}>Try again</button>
          </>
        ) : (
          declined && passed.length > 0 && onOpenChapter ? <button className="btn c-go" onClick={() => onOpenChapter(passed[passed.length - 1])}><span>{`Read chapter ${passed[passed.length - 1]} again`}</span><GoArrow /></button>
          : <button className={`btn c-go${justReady ? ' ready-pop' : ''}`} onClick={onStart} disabled={!chapterReady}><span>{passed.length >= total ? `Read chapter ${current} again` : needsAccount ? `Start chapter ${current} (free account)` : resuming ? `Continue chapter ${current}` : `Start chapter ${current}`}</span><GoArrow /></button>
        )}
        {justReady && <div className="waitbar full" aria-hidden="true"><span /></div>}
      </ActionBar>
    </>
  )
}
