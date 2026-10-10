import { useEffect, useState } from 'react'
import ActionBar from '../components/ActionBar'
import { track } from '../lib/track'

type Chapter = { n: number; title: string; covers: string; outcome: string; hook?: string }
// A month-long handbook (D65, 28 chapters) groups its path into weeks; only the reader's week opens by default.
type Week = { title: string; from: number; to: number }
type Props = {
  total?: number   // chapters in this handbook: 7, or 1 to 3 for a quick one (7 Oct)
  onOpenChapter?: (n: number) => void
  nextTopics?: React.ReactNode   // "Jump to next" topics in place of further reading (7 Oct)   // a finished chapter opens again on tap (7 Oct, Prateek); never uses the daily allowance
  topic: string
  plan: { outcome7: string; horizon14?: string; horizon28?: string; picture?: { name: string; line: string }; chapters: Chapter[]; sources?: { who: string; what: string; why?: string }[]; pushback?: string | null; framing?: string | null; format?: string; weeks?: Week[] }
  passed: number[]
  current: number
  chapterReady: boolean
  chapterFailed: boolean
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
}

// The handbook as a journey: a cover, then seven stops on a winding path, each with its hook as the teaser.
export default function Plan({ total = 7, onOpenChapter, nextTopics, topic, plan, passed, current, chapterReady, chapterFailed, chapterError: _chapterError, lockNote, lockHead, onPricing, onSignUp, needsAccount, declined, onShelf, onStart, onTapChapter, onRetry, onChangeLine, canChangeLine, voiceNote, onCompare, comparing, coverPicture, caution, nextUp, whatsNext }: Props) {
  useEffect(() => { track('plan_view', undefined, 'plan_view:' + topic) }, [topic])
  const first = passed.length === 0 && current === 1   // a reader who came in at chapter 2 from a post is on 2
  const upTitle = nextUp ? plan.chapters[nextUp.n - 1]?.title : null
  const upHook = nextUp ? plan.chapters[nextUp.n - 1]?.hook : null
  const resuming = nextUp?.kind === 'resume'
  // "Later, if you keep going: …" under "Later peaks:" read "Later peaks: Later, …" (UX review 9 Oct): the model's own
  // opener is dropped.
  const weekOf = (n: number) => plan.weeks?.findIndex((w) => n >= w.from && n <= w.to) ?? -1
  const [openWeeks, setOpenWeeks] = useState<Set<number>>(() => new Set([Math.max(0, weekOf(current))]))
  const toggleWeek = (i: number) => setOpenWeeks((s) => { const t = new Set(s); if (t.has(i)) t.delete(i); else t.add(i); return t })
  const later = (plan.horizon14 ?? '').replace(/^\s*later\b[\s,:]*(peaks?[\s,:]*)?(if you keep going[\s,:]*)?/i, '').trim()
  return (
    <>
      {nextUp && chapterReady && (
        <section className="nextup" aria-label="Up next">
          <p className="nextup-kicker">{resuming ? `You stopped at card ${nextUp.card} of chapter ${nextUp.n}` : 'Up next'}</p>
          <p className="nextup-title">{nextUp.kind === 'resume' ? `${nextUp.left} card${nextUp.left === 1 ? '' : 's'} left, about ${Math.max(2, nextUp.left * 2)} minutes.` : `Chapter ${nextUp.n}: ${upTitle ?? ''}`}</p>
          {nextUp.kind === 'next' && upHook && <p className="nextup-hook">{upHook}</p>}
          {/* One main action per screen (review #20; again 9 Oct: the card's own button and the bar's said the same thing in
              two ways): the bar holds it. After a "Not now" the card keeps a quiet line to the account. */}
          {declined && nextUp.kind === 'next' && (
            <>
              <button type="button" className="quiet" onClick={onSignUp ?? onStart}>Chapter {nextUp.n} opens with a free account. When you're ready.</button>
              {onShelf && <button type="button" className="quiet" onClick={onShelf}>The Shelf: every ready handbook</button>}
            </>
          )}
        </section>
      )}
      {passed.length >= total && whatsNext}
      <section className="roadmap-hero">
        <div className="roadmap-hero-top">
          <span className="roadmap-chip">Your handbook · {passed.length} of {total}</span>
        </div>
        <h1>{topic}</h1>
        {plan.pushback && <p className="roadmap-pushback">{plan.pushback}</p>}
        {/* A quick handbook (a recap, one recipe; 7 Oct) says so up top: no weeks of study for this one. */}
        {!plan.pushback && plan.framing && <p className="roadmap-pushback">{plan.framing}</p>}
        <p className="roadmap-outcome">{plan.outcome7}</p>
        {caution && <p className="roadmap-caution">Study aid, verify before you act.</p>}
        {coverPicture ? <div className="roadmap-pic"><img src={coverPicture} alt="" /></div>
          : null /* no picture yet: no box; it fades in when chapter 1's picture lands */}
        {plan.picture && <p className="roadmap-picture"><strong>The picture for the whole journey:</strong> {plan.picture.line}</p>}
      </section>

      {nextTopics ?? null}
      {voiceNote && <p className="note" style={{ marginBottom: 'var(--m)' }}>{voiceNote}</p>}

      <h2 className="path-title">The path</h2>
      <ol className="path">
        {plan.chapters.map((c, idx) => {
          const done = passed.includes(c.n)
          const now = c.n === current && !done
          const wk = weekOf(c.n), week = wk >= 0 ? plan.weeks![wk] : null
          const head = week && c.n === week.from ? (
            <li key={`w${wk}`} className="week-head">
              <button type="button" className="week-tap" aria-expanded={openWeeks.has(wk)} onClick={() => toggleWeek(wk)}>
                <span className="week-n">Week {wk + 1}</span>
                <span className="week-t">{week.title}</span>
                <span className="week-count">{plan.chapters.filter((x) => x.n >= week.from && x.n <= week.to && passed.includes(x.n)).length} of {week.to - week.from + 1} done {openWeeks.has(wk) ? '▾' : '›'}</span>
              </button>
            </li>
          ) : null
          if (week && !openWeeks.has(wk)) return head
          return [head,
            <li key={c.n} className={`stop ${done ? 'done' : now ? 'now' : 'ahead'} ${idx % 2 ? 'right' : 'left'}`}>
              <span className="node" aria-hidden="true">{done ? '✓' : ''}</span>{/* the card says "Chapter N"; a number here too read as "1 1" (7 Oct) */}
              {(() => {
                const skipped = !done && c.n < current   // a post link started past it (UX review 9 Oct): it still opens
                const ahead = !done && !now && !skipped
                const inner = (<>
                  <span className="stop-n">Chapter {c.n}{now && plan.format !== 'quick' && <span className="tag">{first ? 'Tonight' : 'Next'}</span>}{done && <span className="tag done">Done</span>}{ahead && <span className="tag later" aria-hidden="true">After chapter {c.n - 1}</span>}</span>
                  <span className="stop-t">{c.title}</span>
                  <span className="stop-hook">{c.hook || c.covers}</span>
                  {done && onOpenChapter && <span className="stop-again">Read it again ›</span>}
                  {skipped && <span className="stop-again">Read it ›</span>}
                  {ahead && onTapChapter && <span className="stop-again">Preview ›</span>}
                </>)
                // Every stop answers a tap (Prateek, 9 Oct: "the chapters in the path don't seem clickable"): finished and
                // skipped chapters open, the next one starts, chapters ahead show a preview; they open one at a time.
                if ((done || skipped) && onOpenChapter) return <button type="button" className="stop-card stop-tap" onClick={() => onOpenChapter(c.n)}>{inner}</button>
                if (now && chapterReady) return <button type="button" className="stop-card stop-tap" onClick={onStart}>{inner}</button>
                if (ahead && onTapChapter) return <button type="button" className="stop-card stop-tap" onClick={() => onTapChapter(c.n)} aria-label={`Chapter ${c.n}: ${c.title}. Opens after chapter ${c.n - 1}. Preview`}>{inner}</button>
                return <div className="stop-card">{inner}</div>
              })()}
            </li>]
        })}
        <li className="stop summit">
          <span className="node" aria-hidden="true">★</span>
          <div className="stop-card">
            <span className="stop-n">The summit</span>
            <span className="stop-t">You can do it</span>
            {total === 7 && later && <span className="stop-hook">Later peaks: {later}</span>}
          </div>
        </li>
      </ol>

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

      <ActionBar busy={!chapterReady && !chapterFailed} note={!chapterReady && !chapterFailed ? `Writing chapter ${current} and checking its facts… about two minutes.` : undefined}>
        {lockNote ? (
          <>
            <div className="lock-card">
              <p className="lock-card-head">{onSignUp ? `Chapter ${current} is free with an account` : lockHead ? `Chapter ${current} ${lockHead}` : `Chapter ${current} didn't open`}</p>
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
          declined && passed.length > 0 && onOpenChapter ? <button className="btn" onClick={() => onOpenChapter(passed[passed.length - 1])}>{`Read chapter ${passed[passed.length - 1]} again ▸`}</button>
          : <button className="btn" onClick={onStart} disabled={!chapterReady}>{passed.length >= total ? `Read chapter ${current} again ▸` : needsAccount ? `Start chapter ${current} (free account) ▸` : resuming ? `Continue chapter ${current} ▸` : `Start chapter ${current} ▸`}</button>
        )}
      </ActionBar>
    </>
  )
}
