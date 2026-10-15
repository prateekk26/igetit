import { useEffect, useRef, useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import Rich, { inline } from '../components/Rich'
import { track } from '../lib/track'
import { PolicyLinks } from '../components/PolicyLinks'
import { limitMessage } from '../lib/limits'
import { freeChaptersText, typedBoxText, type TypedAllowance } from '../lib/free'
import Ooh, { GoArrow, Wordmark } from '../components/Ooh'

// The landing page, for first-time visitors (DESIGN.md, "The homepage, one story"). 14 Oct (Prateek: "people enter the
// landing page and end up quitting early. Too lazy, can't think of a topic straight away"; "If we don't impress here,
// we are done for"): one story in four parts, all on paper in theme C. (1) The ask: the question, the box and four
// ready topics to tap, pinned ones first and the rest at random, so /admin learns which topics get tapped. (2) The
// proof: three real chapter 1s to switch between and tap through. (3) How tonight goes, in three steps. (4) The ask
// again. The Shelf is in the sticky bar. Gone (they repeated the chips or said the free rule again): Top of the Shelf,
// the Shelf strip with the free row, the price band. Copy (agent) until Prateek rewrites it.

type Level = 'new' | 'some'
type Voice = 'friend' | 'straight' | 'stories'
type Props = { onCreate: (topic: string, level: Level, voice: Voice, chapter?: number) => Promise<void>; onExplore?: () => void; onBooks?: () => void; freeChapters?: number; allowance?: TypedAllowance | null }

type Frame =
  | { kind: 'picture' | 'teach' | 'example' | 'mistake' | 'try'; title?: string; text: string; picture: string | null }
  | { kind: 'exercise'; prompt: string; options: { id: string; text: string }[]; answer: string; whyNot: Record<string, string> }
type DemoBook = { topic: string; label: string; title: string; frames: Frame[]; total: number; of: number; next: { title: string; hook: string } | null }

const shuffle = <T,>(xs: T[]) => { const a = [...xs]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] } return a }

export default function Landing({ onCreate, onExplore, onBooks, freeChapters = 2, allowance }: Props) {
  const freeText = freeChaptersText(freeChapters)   // D26: chapters 1 and 2 need no account; the number is the server's
  const c = useQuery(api.landing.content, {})
  const [topic, setTopic] = useState('')
  // Level and voice start as "new to this" and "like a friend" (14 Oct: the line that changed them, "New to this, talks
  // like a friend. Change", read as a riddle to a first-time visitor); Make it yours changes the voice later.
  const level: Level = 'new', voice: Voice = 'friend'
  const [busy, setBusy] = useState(false)
  const [pickedRow, setPickedRow] = useState<string | null>(null)
  const [slow, setSlow] = useState(false)
  useEffect(() => { if (!pickedRow) { setSlow(false); return } const t = setTimeout(() => setSlow(true), 12000); return () => clearTimeout(t) }, [pickedRow])
  const [error, setError] = useState<string | null>(null)
  const [demoAt, setDemoAt] = useState(0)
  const [scrolled, setScrolled] = useState(false)
  const heroInput = useRef<HTMLInputElement>(null)

  // The four chips: the owner's pins (up to 4), then free ready topics at random, drawn once per visit (14 Oct, Prateek: "keep
  // rotating them to discover the click rates on various topics until we find the 3/4 best ones").
  const [chips, setChips] = useState<string[]>([])
  useEffect(() => {
    if (!c || chips.length) return
    const pinned = c.pinned.slice(0, 4)
    // Free handbooks first (14 Oct, Prateek: "start with the handbooks that are free and without sign up in the chips
    // first"): no daily limit, so a tap never meets a wall before chapter 3; the rest of the Shelf only tops it up.
    const left = c.shelf.filter((s) => !pinned.includes(s.topic))
    setChips([...pinned, ...shuffle(left.filter((s) => s.free).map((s) => s.topic)), ...shuffle(left.filter((s) => !s.free).map((s) => s.topic))].slice(0, 4))
  }, [c, chips.length])
  // A chip counts as shown only once it is on screen (the row slides sideways, as the board draws it), so a chip off the
  // edge never drags its tap rate down.
  const chipRow = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const row = chipRow.current
    if (!row || !chips.length || !('IntersectionObserver' in window)) return
    const io = new IntersectionObserver((es) => es.forEach((e) => { const t = (e.target as HTMLElement).dataset.topic; if (e.isIntersecting && t) track('chips', { t1: t }, 'chip-seen:' + t) }), { threshold: 0.9 })
    row.querySelectorAll('button').forEach((b) => io.observe(b))
    return () => io.disconnect()
  }, [chips])

  // For the owner's /admin funnel: the page was seen, and how far down each visitor got. The bar turns solid once the
  // page leaves the top.
  useEffect(() => {
    track('land', undefined, 'land')
    // A section counts as reached once its top passes two thirds down the screen (sections that load later included).
    const check = () => document.querySelectorAll('.lp > section').forEach((el) => {
      if (el.getBoundingClientRect().top > window.innerHeight * 0.66) return
      const name = [...el.classList].find((c) => c.startsWith('lp-'))?.slice(3) ?? 'section'
      track('section', { section: name }, 'section:' + name)
    })
    let t = 0
    const onScroll = () => { setScrolled(window.scrollY > 24); if (!t) t = window.setTimeout(() => { t = 0; check() }, 250) }
    check()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { window.removeEventListener('scroll', onScroll); window.clearTimeout(t) }
  }, [])

  const toBox = () => {
    window.scrollTo({ top: 0, behavior: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
    setTimeout(() => heroInput.current?.focus({ preventScroll: true }), 400)
  }
  // A ready topic starts straight away: no typing, and it opens instantly (it's already written).
  const pick = async (t: string, via: 'chip' | 'demo') => {
    track('submit', { via, topic: t })
    setTopic(t); setError(null); setBusy(true); setPickedRow(t)
    try { await onCreate(t, 'new', voice, via === 'demo' ? 2 : undefined) }
    catch { setError("Couldn't start it just now. Try once more in a minute."); setBusy(false); setPickedRow(null); toBox() }
  }
  const go = async () => {
    setError(null)
    if (topic.trim().length < 2) { setError('A few words is enough. What is it?'); toBox(); return }
    track('submit', { via: 'box', len: topic.trim().length })
    setBusy(true)
    try { await onCreate(topic.trim(), level, voice) }
    catch (e: any) { setError(limitMessage(e) ?? (String(e?.message ?? e).includes('busy') ? 'Busy right now. Try again in a few minutes.' : "Couldn't start it just now. Your line is still here; try once more in a minute.")); setBusy(false) }
  }
  const openShelf = () => { if (!onExplore) return; track('submit', { via: 'explore_open' }); onExplore() }
  const typedUsed = !!allowance && !allowance.member && allowance.used >= allowance.limit
  const typedLine = typedBoxText(allowance)

  const box = (where: 'hero' | 'final') => (
    <form className={`lp-form lp-form-${where} c1-form`} onSubmit={(e) => { e.preventDefault(); go() }}>
      <label htmlFor={`lp-topic-${where}`} className="lp-visually-hidden">What have you been wondering about?</label>
      <input id={`lp-topic-${where}`} className="c1-input" ref={where === 'hero' ? heroInput : undefined} value={topic} onChange={(e) => { setTopic(e.target.value); track('box_type', undefined, 'box_type') }} onFocus={() => track('box_focus', undefined, 'box_focus')}
        placeholder="Why the Moon changes shape" autoComplete="off" enterKeyHint="go" disabled={busy} maxLength={200} />
      {where === 'hero' && chips.length > 0 && (
        <div className="c1-chips" role="group" aria-label="Or open one that's ready" ref={chipRow}>
          {chips.map((t) => <button key={t} type="button" data-topic={t} className={pickedRow === t ? 'is-opening' : undefined} disabled={busy} onClick={() => pick(t, 'chip')}>{pickedRow === t ? 'Opening…' : c?.chipNames?.[t] ?? t}</button>)}
        </div>
      )}
      <button type="submit" className="c1-go" disabled={busy}><span>{busy && !pickedRow ? 'Finding your way…' : 'Show me the way'}</span><GoArrow /></button>
      {error && <p className="lp-error" role="alert">{error}</p>}
      {where === 'hero' && slow && pickedRow && <p className="lp-fine" role="status">Slow connection. Still opening; it keeps trying.</p>}
    </form>
  )

  const demos = (c?.demos ?? []) as DemoBook[]
  const demo = demos[Math.min(demoAt, demos.length - 1)]

  return (
    <div className={`lp home${pickedRow ? ' lifting' : ''}`}>
      {/* The bar stays on screen (14 Oct, Prateek: "we are showing the shelf on the top (probably we need to make it sticky)"). */}
      <header className={`home-bar${scrolled ? ' is-scrolled' : ''}`}>
        {/* Already home: the logo goes to the top rather than reloading (a reload within 30 minutes reopens the last page). */}
        <a className="lp-mark" href="/" aria-label="I Get It, home" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}><Wordmark /></a>
        <span className="home-bar-links">
          {/* 15 Oct: a reader with books lands here after a break; their books are one tap away. Copy (agent). */}
          {onBooks && <button type="button" className="c1-shelf" onClick={onBooks}>Your books</button>}
          {onExplore && <button type="button" className="c1-shelf" onClick={openShelf}>The Shelf</button>}
        </span>
      </header>

      {/* 1. The ask (C1). Ooh is the dot of a tall "i" on the marigold stage; from 1024 the stage is the left half. */}
      <section className="lp-hero c1">
        <div className="c1-stage" aria-hidden="true">
          <span className="c1-stem" />
          <Ooh face="curious" tone="cream" className="c1-ooh" size={132} idle />
        </div>
        <div className="c1-copy">
          <div className="c1-main">
            <h1>What have you been wondering about?</h1>
            {box('hero')}
          </div>
          <p className="c1-says"><Ooh face="curious" size={28} /><span>Tell me in a line. I'll make you a little book, one short chapter a night.</span></p>
          {/* The rules are told when they matter (14 Oct, Prateek: "We can just let people know when the time comes"): the wall
              after chapter 2, and the typed-topic rule on Start another topic. Only a phone that has used its free typed
              topic hears it here, before it types again. */}
          {typedUsed && <p className="lp-fine c1-fine">{typedLine}</p>}
        </div>
      </section>

      {/* 2. The proof: real chapter 1s, the way readers get them. */}
      {demo && (
        <section className="lp-demo c-demo">
          <div className="c-demo-copy">
            <h2>Don't take our word for it. Take a page.</h2>
            <p className="c-lede">These are real first chapters, exactly as readers get them. Pick one and tap through. In five minutes you'll know something most people don't.</p>
            {demos.length > 1 && (
              <div className="c-demo-pick" role="group" aria-label="Pick a chapter">
                {demos.map((d, k) => <button key={d.topic} type="button" aria-pressed={k === demoAt} onClick={() => { setDemoAt(k); track('demo_tap', { topic: d.topic }) }}>{d.label}</button>)}
              </div>
            )}
          </div>
          <Demo key={demo.topic} book={demo} onOpen={() => pick(demo.topic, 'demo')} busy={busy} freeText={freeText} />
        </section>
      )}

      {/* 3. How tonight goes. */}
      <section className="lp-steps c-steps">
        <h2>Tonight, in five minutes.</h2>
        <ol>
          <li><span className="c-n">1</span><div><h3>Say what you're wondering about.</h3><p>In your own words. In about two minutes you get a short book on it, written for you, and chapter 1 is ready.</p></div></li>
          <li><span className="c-n">2</span><div><h3>Read chapter 1.</h3><p>One idea a page, with pictures. Stuck? Ask a question right on the page.</p></div></li>
          <li><span className="c-n">3</span><div><h3>Come back for chapter 2.</h3><p>It starts with two quick questions on chapter 1, so what you read stays with you.</p></div></li>
        </ol>
      </section>

      {/* 4. The ask again. */}
      <section className="lp-final c-final">
        <h2>So, what have you been wondering about?</h2>
        {box('final')}
        {onExplore && <button type="button" className="c-more" onClick={openShelf}>Or open one from the Shelf →</button>}
      </section>

      <footer className="lp-foot c-foot">
        <p>I Get It is built in public for the GrowthX Build Sprint, October 2026. <a href="/stats">See the live numbers</a> · <a href="/pricing">Pricing</a></p>
        <p><PolicyLinks /></p>
      </footer>
    </div>
  )
}

// One real chapter 1, its first six pages, as the chapter screen draws them (C6, C7). Its frame, body, picture and
// tools have their own names: the chapter's full-screen rules (the 600 px column, the open book) must not reach it.: the topic and chapter up top with
// the page number, a page you tap or turn with the round buttons, and at the end a way into that handbook.
const KICKER: Record<string, string> = { example: 'Story time', mistake: 'The mistake everyone makes', exercise: 'Quick guess' }
function Demo({ book, onOpen, busy, freeText }: { book: DemoBook; onOpen: () => void; busy: boolean; freeText: string }) {
  const { topic, title, frames } = book
  const [i, setI] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)
  const end = i >= frames.length
  const f = frames[i]
  const step = (d: number) => { setPicked(null); setI((x) => Math.max(0, Math.min(frames.length, x + d))); track('demo_tap', undefined, 'demo_tap') }
  const onTap = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button, a')) return
    const r = e.currentTarget.getBoundingClientRect()
    step(e.clientX - r.left < r.width * 0.3 ? -1 : 1)
  }
  return (
    <div className="c-demo-page">
      <div className="demo-frame" onClick={onTap} role="group" aria-label={`A real chapter 1: ${topic}. Page ${Math.min(i + 1, frames.length)} of ${frames.length}`}>
        <div className="demo-head"><span className="story-label">{topic} · Chapter 1</span></div>
        <div className="demo-body" key={i}>
          {end ? (
            <>
              <p className="story-kicker">That was chapter 1 of {book.of}</p>
              {book.next ? (
                <>
                  <p className="story-big">Chapter 2: {book.next.title}</p>
                  {book.next.hook && <p className="story-text size-md">{inline(book.next.hook)}</p>}
                </>
              ) : <p className="story-big">That's the whole of chapter 1.</p>}
              <p className="c-demo-free">{freeText} of this one are free, no sign-up. Yours can be about anything you type, in this style, with its own pictures.</p>
              <button type="button" className="btn c-go" onClick={onOpen} disabled={busy}><span>{book.next ? 'Keep reading this one' : 'Open this one'}</span><GoArrow /></button>
            </>
          ) : f.kind === 'exercise' ? (
            <>
              <p className="story-kicker">{KICKER.exercise}</p>
              <p className="story-q">{inline(f.prompt)}</p>
              <div className="story-options">
                {f.options.map((o, k) => (
                  <button key={o.id} type="button" className={`story-opt${picked === o.id ? (o.id === f.answer ? ' pass' : ' missed') : ''}`}
                    onClick={() => setPicked(o.id)} disabled={picked === f.answer}>
                    <span className="k" aria-hidden="true">{k + 1}</span><span>{o.text}</span>
                  </button>
                ))}
              </div>
              {picked && <p className="story-unsure"><Ooh size={26} /><span>{picked === f.answer ? "That's it. Turn the page." : inline(f.whyNot[picked] ?? 'Not quite. Try another.')}</span></p>}
            </>
          ) : (
            <>
              {i === 0 && <h3 className="story-title">{title}</h3>}
              {f.picture && <div className="demo-pic"><img src={f.picture} alt="" loading="lazy" onLoad={(e) => e.currentTarget.parentElement?.classList.add('loaded')} ref={(el) => { if (el && el.complete && el.naturalWidth > 0) el.parentElement?.classList.add('loaded') }} /></div>}
              {i > 0 && KICKER[f.kind] && <p className="story-kicker">{KICKER[f.kind]}</p>}
              <Rich text={f.text} className="story-text size-md" />
            </>
          )}
        </div>
        <div className="demo-tools">
          <div className="story-tools-left"><span className="story-left">{end ? '' : `Page ${i + 1} of ${frames.length}`}</span></div>
          <div className="story-turns">
            {i > 0 && <button type="button" className="story-back" onClick={() => step(-1)} aria-label="Back a page"><span aria-hidden="true">←</span></button>}
            {!end && <button type="button" className="story-next" onClick={() => step(1)}>Next <span aria-hidden="true">→</span></button>}
          </div>
        </div>
      </div>
    </div>
  )
}
