import { useEffect, useRef, useState } from 'react'
import AuthButtons, { type AuthLinks } from '../components/AuthButtons'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import Rich, { inline } from '../components/Rich'
import { track } from '../lib/track'
import { PolicyLinks } from '../components/PolicyLinks'
import { limitMessage } from '../lib/limits'
import { freeChaptersText, typedBoxText, type TypedAllowance } from '../lib/free'
import Ooh, { GoArrow, Wordmark } from '../components/Ooh'
import { useSnapPage } from '../lib/snap'

// The landing page, for first-time visitors (DESIGN.md, "The homepage, one story"). 14 Oct (Prateek: "people enter the
// landing page and end up quitting early. Too lazy, can't think of a topic straight away"; "If we don't impress here,
// we are done for"): one story in four parts, all on paper in theme C. (1) The ask: the question, the box and four
// ready topics to tap, pinned ones first and the rest at random, so /admin learns which topics get tapped. (2) The
// proof: three real chapter 1s to switch between and tap through. (3) How tonight goes, in three steps. (4) The ask
// again. The Shelf is in the sticky bar. Gone (they repeated the chips or said the free rule again): Top of the Shelf,
// the Shelf strip with the free row, the price band. Copy (agent) until Prateek rewrites it.

type Level = 'new' | 'some'
type Voice = 'friend' | 'straight' | 'stories'
type Props = { onCreate: (topic: string, level: Level, voice: Voice, chapter?: number) => Promise<void>; onExplore?: () => void; onBooks?: () => void; freeChapters?: number; allowance?: TypedAllowance | null; account?: AuthLinks; onSignOut?: (() => void) | null; onMember?: () => void; memberPrice?: number }

type Frame =
  | { kind: 'picture' | 'teach' | 'example' | 'mistake' | 'try'; title?: string; text: string; picture: string | null }
  | { kind: 'exercise'; prompt: string; options: { id: string; text: string }[]; answer: string; whyNot: Record<string, string> }
type DemoBook = { topic: string; label: string; title: string; frames: Frame[]; total: number; of: number; next: { title: string; hook: string } | null }

// Homepage motion (20 Oct, Prateek: "lets do 1,2,3,4"). Every piece checks these first: nothing moves for a phone set to
// reduce motion; the mouse-following eyes need a mouse; rotating chips need the wrapped chip rows (600 px and up).
const still = () => { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches } catch { return false } }
const mouse = () => { try { return window.matchMedia('(hover: hover) and (pointer: fine)').matches } catch { return false } }
const wrapped = () => { try { return window.matchMedia('(min-width: 600px)').matches } catch { return false } }
// The box's examples, typed and erased in turn (3). Copy (agent).
const EXAMPLES = ['why the Moon changes shape', 'asking for a raise', 'how compound interest works', 'why we put things off', 'making a perfect dosa', 'how vaccines train the body']

const shuffle = <T,>(xs: T[]) => { const a = [...xs]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] } return a }

export default function Landing({ onCreate, onExplore, onBooks, freeChapters = 2, allowance, account, onSignOut, onMember, memberPrice }: Props) {
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
  useSnapPage('var(--home-bar-h, 60px)')   // its parts settle under the fixed bar (20 Oct)
  // (2) Ooh watches: its eyes follow the mouse, look at the box while typing and at a chip under the finger or mouse;
  // after 2.5 s with nothing to look at, its own idle glance comes back. Written straight to the drawing, no re-render.
  const stage = useRef<HTMLDivElement>(null)
  const [heroFace, setHeroFace] = useState<'curious' | 'again'>('curious')
  const lookTimer = useRef(0)
  const lookAt = (x: number, y: number) => {
    const svg = stage.current?.querySelector('.c1-ooh') as SVGSVGElement | null
    if (!svg || still()) return
    const r = svg.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height * 0.45
    const dx = x - cx, dy = y - cy, d = Math.hypot(dx, dy) || 1, k = Math.min(1, d / 260)
    svg.style.setProperty('--lx', `${((dx / d) * 3.2 * k).toFixed(2)}px`)
    svg.style.setProperty('--ly', `${((dy / d) * 2.6 * k).toFixed(2)}px`)
    svg.classList.add('looking')
    window.clearTimeout(lookTimer.current)
    lookTimer.current = window.setTimeout(() => svg.classList.remove('looking'), 2500)
  }
  const lookAtEl = (el: Element | null | undefined) => { if (!el) return; const r = el.getBoundingClientRect(); lookAt(r.left + r.width / 2, r.top + r.height / 2) }
  useEffect(() => {
    if (!mouse() || still()) return
    let raf = 0
    const on = (e: PointerEvent) => { if (raf) return; raf = requestAnimationFrame(() => { raf = 0; if (window.scrollY < window.innerHeight) lookAt(e.clientX, e.clientY) }) }
    window.addEventListener('pointermove', on, { passive: true })
    return () => { window.removeEventListener('pointermove', on); cancelAnimationFrame(raf); window.clearTimeout(lookTimer.current) }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  // (3) The example in the box types and erases itself until the box is used; written to the placeholder directly.
  const exAt = useRef(0)
  const [boxBusy, setBoxBusy] = useState(false)   // focused, or holding the reader's own words
  useEffect(() => {
    const el = heroInput.current
    if (!el || still() || boxBusy) return
    let alive = true
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
    const show = (t: string) => { if (alive && heroInput.current) heroInput.current.placeholder = 'e.g. ' + t }
    ;(async () => {
      show(EXAMPLES[exAt.current])
      await sleep(2600)
      while (alive) {
        const was = EXAMPLES[exAt.current]
        for (let k = was.length; k >= 0 && alive; k--) { show(was.slice(0, k)); await sleep(26) }
        exAt.current = (exAt.current + 1) % EXAMPLES.length
        const next = EXAMPLES[exAt.current]
        for (let k = 1; k <= next.length && alive; k++) { show(next.slice(0, k)); await sleep(62) }
        await sleep(2400)
      }
    })()
    return () => { alive = false; if (heroInput.current && heroInput.current.placeholder) heroInput.current.placeholder = 'e.g. ' + EXAMPLES[exAt.current] }
  }, [boxBusy])

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
  // (1) The chips arrive one after another once Ooh has landed. Where they wrap (600 px and up) one chip that isn't a pin
  // shrinks out every 5 s and another ready topic grows in, unless the reader is at the chips or the box. On a phone the
  // row gives one small nudge so it reads as scrollable.
  const [outAt, setOutAt] = useState<number | null>(null)
  const [swapped, setSwapped] = useState<Set<string>>(() => new Set())
  const hold = useRef(false)
  const chipsNow = useRef(chips); chipsNow.current = chips
  const busyNow = useRef(busy); busyNow.current = busy
  useEffect(() => {
    if (!c || !chips.length || still() || !wrapped()) return
    const pool = [...c.shelf.filter((x) => x.free), ...c.shelf.filter((x) => !x.free)].map((x) => x.topic)
    let turn = 0, t2 = 0
    const t = window.setInterval(() => {
      const cur = chipsNow.current
      if (hold.current || busyNow.current || document.hidden) return
      const slots = cur.map((x, i) => (c.pinned.includes(x) ? -1 : i)).filter((i) => i >= 0)
      const next = shuffle(pool.filter((p) => !cur.includes(p)))[0]
      if (!slots.length || !next) return
      const at = slots[turn++ % slots.length]
      setOutAt(at)
      t2 = window.setTimeout(() => { setChips((cs) => cs.map((x, i) => (i === at ? next : x))); setSwapped((sw) => new Set(sw).add(next)); setOutAt(null) }, 230)
    }, 5000)
    return () => { window.clearInterval(t); window.clearTimeout(t2) }
  }, [c, chips.length > 0]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const row = chipRow.current
    if (!row || !chips.length || still() || wrapped()) return
    let t2 = 0
    const t = window.setTimeout(() => {
      if (row.scrollWidth <= row.clientWidth + 4 || row.scrollLeft > 0) return
      row.scrollTo({ left: 56, behavior: 'smooth' })
      t2 = window.setTimeout(() => row.scrollTo({ left: 0, behavior: 'smooth' }), 650)
    }, 1900)
    return () => { window.clearTimeout(t); window.clearTimeout(t2) }
  }, [chips.length > 0]) // eslint-disable-line react-hooks/exhaustive-deps
  // (4) A tapped chip flies into the box and Ooh nods; then the book opens as before. Straight on under reduce motion.
  const fly = (btn: HTMLElement | null) => new Promise<void>((done) => {
    const box = heroInput.current
    if (!btn || !box || still() || !btn.animate) return done()
    const a = btn.getBoundingClientRect(), b = box.getBoundingClientRect()
    const ghost = document.createElement('span')
    ghost.className = 'c1-chip-ghost'
    ghost.textContent = btn.textContent
    Object.assign(ghost.style, { left: `${a.left}px`, top: `${a.top}px`, height: `${a.height}px` })
    document.body.appendChild(ghost)
    const dx = b.left + 18 - a.left, dy = b.top + (b.height - a.height) / 2 - a.top
    lookAtEl(box); setHeroFace('again')
    const anim = ghost.animate([
      { transform: 'none', opacity: 1 },
      { transform: `translate(${dx * 0.6}px, ${dy * 0.6 - 28}px) scale(1.06)`, opacity: 1, offset: 0.55 },
      { transform: `translate(${dx}px, ${dy}px)`, opacity: 0 },
    ], { duration: 460, easing: 'cubic-bezier(0.3, 0.7, 0.3, 1)' })
    anim.onfinish = () => { ghost.remove(); done() }
    anim.oncancel = () => { ghost.remove(); done() }
  })

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
  const pick = async (t: string, via: 'chip' | 'demo', from?: HTMLElement) => {
    track('submit', { via, topic: t })
    setError(null); setBusy(true); setPickedRow(t)
    // the box's typing example stops and clears, so the chip lands in an empty box
    setBoxBusy(true); if (heroInput.current) heroInput.current.placeholder = ''
    if (via === 'chip') await fly(from ?? null)
    setTopic(t)
    try { await onCreate(t, 'new', voice, via === 'demo' ? 2 : undefined) }
    catch { setError("Couldn't start it just now. Try once more in a minute."); setBusy(false); setPickedRow(null); setTopic(''); setBoxBusy(false); if (heroInput.current) heroInput.current.placeholder = 'e.g. ' + EXAMPLES[exAt.current]; toBox() }
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
      <input id={`lp-topic-${where}`} className="c1-input" ref={where === 'hero' ? heroInput : undefined} value={topic} onChange={(e) => { setTopic(e.target.value); track('box_type', undefined, 'box_type'); if (where === 'hero') lookAtEl(e.target) }} onFocus={(e) => { track('box_focus', undefined, 'box_focus'); if (where === 'hero') { setBoxBusy(true); hold.current = true; lookAtEl(e.target) } }} onBlur={(e) => { if (where === 'hero') { setBoxBusy(!!e.target.value); hold.current = false } }}
        placeholder="e.g. why the Moon changes shape" autoComplete="off" enterKeyHint="go" disabled={busy} maxLength={200} />
      {where === 'hero' && chips.length > 0 && (
        <div className="c1-chips" role="group" aria-label="Or open one that's ready" ref={chipRow} onPointerEnter={() => { hold.current = true }} onPointerLeave={() => { hold.current = document.activeElement === heroInput.current }}>
          {chips.map((t, i) => <button key={t} type="button" data-topic={t} className={[pickedRow === t ? 'is-opening' : '', outAt === i ? 'chip-out' : ''].filter(Boolean).join(' ') || undefined} style={{ animationDelay: swapped.has(t) ? '0ms' : `${900 + i * 80}ms` }} disabled={busy} onPointerEnter={(e) => lookAtEl(e.currentTarget)} onFocus={(e) => lookAtEl(e.currentTarget)} onClick={(e) => pick(t, 'chip', e.currentTarget)}>{pickedRow === t ? 'Opening…' : c?.chipNames?.[t] ?? t}</button>)}
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
          <AuthButtons links={account} onSignOut={onSignOut} />
        </span>
      </header>

      {/* 1. The ask (C1). Ooh is the dot of a tall "i" on the marigold stage; from 1024 the stage is the left half. */}
      <section className="lp-hero c1">
        <div className="c1-stage" aria-hidden="true" ref={stage}>
          <span className="c1-stem" />
          <Ooh face={heroFace} tone="cream" className="c1-ooh" size={132} idle />
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
          {/* 18 Oct (Prateek): from the typed-book limit, one tap to paying (sign-in first if needed). Copy (agent). */}
          {typedUsed && onMember && <button type="button" className="c1-member" onClick={onMember}>Become a member{memberPrice ? ` · ₹${memberPrice.toLocaleString('en-IN')} a month` : ''}</button>}
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
          <li><span className="c-n">1</span><div><h3>Say what you're wondering about.</h3><p>In your own words. In about a minute and a half you get a short book on it, written for you, and chapter 1 is ready.</p></div></li>
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
