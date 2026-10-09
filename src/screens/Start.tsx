import { useEffect, useRef, useState, type ReactNode } from 'react'
import ActionBar from '../components/ActionBar'
import { track } from '../lib/track'
import Rich from '../components/Rich'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { isMemberLimit, limitMessage } from '../lib/limits'
import { nameOf } from '../lib/name'

type Level = 'new' | 'some'
type Voice = 'friend' | 'straight' | 'stories'
type Props = {
  initialTopic?: string
  status: 'idle' | 'intent' | 'writing' | 'question' | 'failed' | 'declined'
  question?: string
  intents?: { question: string; goals: { label: string; mode: string }[] } | null
  onChooseIntent?: (goal?: string, mode?: string) => Promise<void>
  suggested?: { title: string; topic: string } | null
  onTakeSuggested?: () => Promise<void>
  error?: string
  onCreate: (topic: string, level: Level, voice: Voice) => Promise<void>
  onAnswer?: (answer: string) => Promise<void>
  onRetry?: () => Promise<void>
  examples: string[]
  // The landing sections, shown under the first screen to first-time visitors. pick('') just brings the box back.
  below?: (pick: (topic: string) => void) => ReactNode
  // While a plan is written: add the handbook the waiting story comes from, without leaving this one.
  onAddOther?: (topic: string) => Promise<void>
  pushback?: string
  suggestions?: string[]
  onPricing?: () => void
  // 8 Oct (UX review #4): on "Start another topic", ready topics open at once and Explore is one tap away.
  onPickReady?: (topic: string) => Promise<void>
  // D29 (9 Oct): the handbook got ready while a story was being read: say so above the story, never pull the story away.
  readyToOpen?: boolean
  onOpenReady?: () => void
  onEngaged?: () => void   // the reader swiped or asked for the next story: App then holds this screen until they tap
  onExplore?: () => void
  // The wait follows the real stage (UX review 9 Oct, #12: steps lit on 30 s and 100 s timers, and "Ready" showed before
  // chapter 1 existed). research: looking it up; plan: writing the plan; chapter: the plan is done, chapter 1 is on.
  phase?: 'research' | 'plan' | 'chapter' | null
  chapterOneReady?: boolean
  startedAt?: number   // when the writing started (the goal was picked), for "taking longer than usual"
  goal?: string | null
}

// The first screen, and the empty state of the whole product (DESIGN.md section 4, Start).
export default function Start({ initialTopic = '', status, question, intents, onChooseIntent, suggested, onTakeSuggested, onCreate, onAnswer, onRetry, examples, below, onAddOther, pushback, suggestions = [], onPricing, onPickReady, onExplore, readyToOpen, onOpenReady, onEngaged, phase, chapterOneReady, startedAt, goal }: Props) {
  const declined = status === 'declined'
  const [topic, setTopic] = useState(status === 'declined' ? '' : initialTopic)
  // A declined line never stays in the box: the reader starts fresh.
  useEffect(() => { if (status === 'declined') setTopic('') }, [status])
  useEffect(() => { if (status === 'writing') track('wait_view', undefined, 'wait_view:' + initialTopic) }, [status, initialTopic])
  const [level, setLevel] = useState<Level>('new')
  const [voice, setVoice] = useState<Voice>('friend')
  const [answer, setAnswer] = useState('')
  const [verySlow, setVerySlow] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  // One tap starts one thing (UX review 9 Oct: no busy state, so a double tap could start things twice).
  const [sending, setSending] = useState(false)
  const [memberLimit, setMemberLimit] = useState(false)
  const writing = status === 'writing'
  const levelRef = useRef<HTMLDivElement>(null)
  const [storySeed, setStorySeed] = useState(() => Math.floor(Math.random() * 1000))
  const story = useQuery(api.landing.waitStory, writing ? { seed: storySeed, exclude: (topic.trim() || initialTopic) || undefined } : 'skip') as WaitStory | null | undefined
  const [added, setAdded] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  // Smooth only when the phone allows motion (UX review 9 Oct: these two scrolls ignored "reduce motion").
  const glide = (): ScrollBehavior => (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth')
  const backToBox = () => { window.scrollTo({ top: 0, behavior: glide() }); setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 350) }
  const pick = (t: string) => { if (t) setTopic(t); setLocalError(null); backToBox() }

  // Measured on prod, 7 to 9 Oct, on Gemini Flash (D41): research about 42 s, the plan 25 s, chapter 1 24 s, its check 8 s;
  // about two minutes from the goal to chapter 1, three at the slowest tenth. Past four, it says so.
  // Past 15 minutes the write has died (actions stop at 10): "Start it again" appears (UX review 9 Oct: it waited for ever).
  const [stuck, setStuck] = useState(false)
  useEffect(() => {
    if (!writing) { setVerySlow(false); setStuck(false); return }
    const since = Date.now() - (startedAt ?? Date.now())
    const ts: number[] = []
    if (since >= 4 * 60 * 1000) setVerySlow(true); else ts.push(window.setTimeout(() => setVerySlow(true), 4 * 60 * 1000 - since))
    if (since >= 15 * 60 * 1000) setStuck(true); else ts.push(window.setTimeout(() => setStuck(true), 15 * 60 * 1000 - since))
    return () => ts.forEach((t) => clearTimeout(t))
  }, [writing, startedAt])

  const submit = async () => {
    setLocalError(null)
    if (topic.trim().length < 2) { setLocalError('A few words is enough. What is it?'); backToBox(); return }
    if (sending) return
    setMemberLimit(false); setSending(true)
    try { await onCreate(topic.trim(), level, voice) } catch (e: any) { setLocalError(friendly(e)); setMemberLimit(isMemberLimit(e)); setSending(false) }
  }
  const shown = nameOf(topic.trim() || initialTopic)   // the typed line is the name, first letter capitalised (D28)
  const stage = phase === 'chapter' || readyToOpen ? 3 : phase === 'plan' ? 2 : 1

  // While the plan is written: the topic and what's happening, not the form again (Shaktimaan, 6 Oct).
  if (writing) {
    return (
      <div className="plan-wait" role="status" aria-live="polite">
        {readyToOpen && chapterOneReady ? (
          <>
            <p className="plan-wait-kicker">Ready</p>
            <h1 className="plan-wait-topic">{shown}</h1>
            <p className="note">Chapter 1 is written and checked. Finish the story or go now; it waits.</p>
            <button type="button" className="btn wait-open" onClick={onOpenReady}>Open chapter 1 →</button>
          </>
        ) : (
          <>
            <p className="plan-wait-kicker">{readyToOpen ? 'Your plan is ready' : 'Writing your handbook'}</p>
            <h1 className="plan-wait-topic">{shown}</h1>
            <ol className="plan-wait-steps">
              <li className={stage > 1 ? 'on done' : 'on'}>{goal ? 'Looking it up on the web, with your goal in mind' : 'Looking it up on the web'}</li>
              <li className={stage > 2 ? 'on done' : stage === 2 ? 'on' : ''}>Planning the chapters: a quick run-through, or up to seven nights</li>
              <li className={stage === 3 ? 'on' : ''}>Writing chapter 1 and checking its facts</li>
            </ol>
            <p className="note">{stuck && !readyToOpen ? "This one stalled on our side. Start it again; it won't count twice." : verySlow ? 'Taking longer than usual. Still on it; you can leave, and it will be waiting in Your handbooks.' : readyToOpen ? 'Chapter 1 is being written and checked: about a minute. A button appears here when it is ready.' : 'About two minutes in all.'}</p>
            {stuck && !readyToOpen && onRetry && <button type="button" className="btn wait-open" disabled={sending} onClick={() => { setSending(true); onRetry().catch((e) => setLocalError(friendly(e))).finally(() => setSending(false)) }}>Start it again</button>}
            {stuck && localError && <p className="error" role="alert">{localError}</p>}
            {readyToOpen && <button type="button" className="quiet" onClick={onOpenReady}>See the plan now</button>}
            <div className="busybar" aria-hidden="true" />
          </>
        )}
        {story && (
          <section className="wait-story" aria-label="A story while you wait">
            <p className="wait-story-kicker">While you wait, a story from another handbook</p>
            <StoryCarousel key={`${story.key}:${story.title ?? ''}:${storySeed}`} story={story} onEngaged={onEngaged} />
            <p className="note wait-story-from">From <strong>{story.topic}</strong>{story.chapter ? `, ${story.chapter}` : ''}.</p>
            <div className="wait-story-actions">
              {added === story.topic ? <span className="wait-story-added">Added to Your handbooks.</span>
                : onAddOther && <button type="button" className="btn btn-ghost" onClick={async () => { try { await onAddOther(story.topic); setAdded(story.topic) } catch { /* the plan still comes; adding can wait */ } }}>Add this handbook</button>}
              <button type="button" className="quiet" onClick={() => { onEngaged?.(); setStorySeed((x) => x + 7) }}>Next story →</button>
            </div>
          </section>
        )}
      </div>
    )
  }

  // "What's it for?" (6 Oct): a goal in one tap shapes the whole handbook. Skipping is fine.
  if (status === 'intent') {
    const choose = (goal?: string, mode?: string) => { if (sending) return; setSending(true); track('submit', { via: goal ? 'goal' : 'skip' }); onChooseIntent?.(goal, mode).catch((e) => { setLocalError(friendly(e)); setSending(false) }) }
    return (
      <div className="intent">
        <p className="plan-wait-kicker">{shown}</p>
        <h1>{intents?.question ?? "What's it for?"}</h1>
        <p className="lede">Pick one and the handbook is built around it.</p>
        {/* D40: a ready handbook that may cover it is offered, never swapped in. Copy (agent). */}
        {suggested && onTakeSuggested && (
          <div className="intent-offer">
            <p><strong>Ready now: {suggested.title}.</strong> It may cover this, in seven chapters, free. Or pick a goal below for one written on “{shown}”.</p>
            <button type="button" className="btn btn-ghost" onClick={() => { track('submit', { via: 'suggested' }); onTakeSuggested().catch((e) => setLocalError(friendly(e))) }}>Open {suggested.title} instead</button>
          </div>
        )}
        <div className="intent-goals">
          {intents ? intents.goals.map((g) => (
            <button key={g.label} type="button" className="intent-goal" disabled={sending} onClick={() => choose(g.label, g.mode)}>{g.label}</button>
          )) : <p className="note intent-thinking" role="status">Thinking of three reasons people learn this… a few seconds. Or say it in your words below.</p>}
        </div>
        {/* The own-words box had no label and no button; only the keyboard's Go sent it (UX review 9 Oct). */}
        <form className="intent-own" onSubmit={(e) => { e.preventDefault(); if (answer.trim()) choose(answer.trim()) }}>
          <label htmlFor="intent-own" className="lp-visually-hidden">Or say what it's for, in your words</label>
          <input id="intent-own" className="input" placeholder="Or say it in your words" value={answer} onChange={(e) => setAnswer(e.target.value)} maxLength={120} enterKeyHint="go" disabled={sending} />
          <button type="submit" className="btn btn-ghost intent-own-go" disabled={sending || !answer.trim()}>Use this</button>
        </form>
        {localError && <p className="error" role="alert">{localError}</p>}
        <button type="button" className="quiet intent-skip" disabled={sending} onClick={() => choose()}>Skip, just teach me</button>
      </div>
    )
  }

  if (status === 'question' && question) {
    const sendAnswer = () => { if (sending || !answer.trim()) return; setSending(true); onAnswer?.(answer.trim()).catch((e) => { setLocalError(friendly(e)); setSending(false) }) }
    return (
      <>
        <h1>One question first.</h1>
        <p className="lede">{question}</p>
        <div className="field">
          <label htmlFor="answer">Your answer</label>
          <input id="answer" className="input" autoFocus value={answer} onChange={(e) => setAnswer(e.target.value)} enterKeyHint="go"
            onKeyDown={(e) => { if (e.key === 'Enter' && answer.trim()) sendAnswer() }} />
        </div>
        {localError && <p className="error" role="alert">{localError}</p>}
        <ActionBar>
          <button className="btn" disabled={!answer.trim() || sending} onClick={sendAnswer}>{sending ? 'Sending…' : "That's it"}</button>
        </ActionBar>
      </>
    )
  }

  return (
    <>
      {/* Prateek's words, DESIGN.md section 5 */}
      {declined && (
        <section className="declined" role="status">
          <p className="declined-kicker">Not this one</p>
          <p className="declined-line">{pushback ?? "That's not something I Get It will teach."}</p>
          {suggestions.length > 0 && (
            <>
              <p className="note">Something you might enjoy instead:</p>
              <div className="declined-suggestions">
                {suggestions.map((s) => <button key={s} type="button" className="chip" onClick={() => onCreate(s, level, voice).catch((e) => setLocalError(friendly(e)))}>{s}</button>)}
              </div>
            </>
          )}
          <p className="note">Or type something else below.</p>
        </section>
      )}
      <p className="for-line">For everything you saved and never got back to.</p>
      <h1>Seven nights from “I keep meaning to” to “I get it”.</h1>
      <p className="lede">Twenty minutes a day: a small step. 7 days: a small jump.</p>

      <div className="field">
        <label htmlFor="topic">What do you keep meaning to learn?</label>
        <input id="topic" ref={inputRef} className="input" type="text" autoComplete="off" enterKeyHint="done" maxLength={200} placeholder={examples.length ? `${examples.slice(0, 2).join(', ')}…` : 'Swimming'} value={topic}
          onChange={(e) => setTopic(e.target.value)} disabled={writing}
          // Enter only closes the keyboard and shows the level and voice; the button starts the writing.
          onKeyDown={(e) => { if (e.key === 'Enter') { e.currentTarget.blur(); levelRef.current?.scrollIntoView({ behavior: glide(), block: 'center' }) } }} />
        {topic.length >= 150 && <p className="note" aria-live="polite">{200 - topic.length} characters left. A few words is enough.</p>}
        {examples.length > 1 && !below && (
          <p className="note">{onPickReady ? 'Ready now, opens instantly: ' : "Tonight's ready handbooks: "}{examples.slice(0, 6).map((x, i) => (
            <span key={x}>{i > 0 && ' · '}<button type="button" className="quiet" style={{ padding: 0 }} onClick={() => { if (onPickReady) onPickReady(x).catch((e) => setLocalError(friendly(e))); else setTopic(x) }} disabled={writing}>{x}</button></span>
          ))}{onExplore && <> · <button type="button" className="quiet" style={{ padding: 0 }} onClick={onExplore}>The Shelf: every ready handbook →</button></>}</p>
        )}
      </div>

      <p className="sub" style={{ marginTop: 'var(--l)', marginBottom: 6 }}>How much do you know already?</p>
      <div className="chips" role="group" aria-label="Level" ref={levelRef}>
        <button type="button" className="chip" aria-pressed={level === 'new'} onClick={() => setLevel('new')} disabled={writing}>New to this</button>
        <button type="button" className="chip" aria-pressed={level === 'some'} onClick={() => setLevel('some')} disabled={writing}>Know some</button>
      </div>

      <p className="sub" style={{ marginTop: 'var(--l)', marginBottom: 6 }}>How should it talk to you?</p>
      <div className="chips" role="group" aria-label="Voice">
        <button type="button" className="chip" aria-pressed={voice === 'friend'} onClick={() => setVoice('friend')} disabled={writing}>Like a friend</button>
        <button type="button" className="chip" aria-pressed={voice === 'straight'} onClick={() => setVoice('straight')} disabled={writing}>Straight</button>
        <button type="button" className="chip" aria-pressed={voice === 'stories'} onClick={() => setVoice('stories')} disabled={writing}>Stories</button>
      </div>

      {(localError || (status === 'failed' && !declined && topic.trim() === initialTopic.trim())) && (
        <p className="error">{localError ?? "Couldn't write it just now. Your line is still here; try once more in a minute, or pick one of tonight's ready handbooks."}</p>
      )}
      {memberLimit && onPricing && <button type="button" className="btn btn-ghost" style={{ marginTop: 8 }} onClick={onPricing}>See what members get</button>}

      {below && !writing && below(pick)}

      <ActionBar busy={writing || sending} note={sending ? 'About two minutes: a look on the web first, then the plan, then chapter 1.' : undefined}>
        {status === 'failed' && onRetry && topic.trim() === initialTopic.trim() ? (
          <button className="btn" onClick={() => onRetry().catch((e) => setLocalError(friendly(e)))}>Try again</button>
        ) : (
          <button className="btn" onClick={submit} disabled={writing || sending}>{writing || sending ? 'Finding your way…' : 'Show me the way'}</button>
        )}
      </ActionBar>
    </>
  )
}

// The beat: "**Richard fired.** Out of the corner…" → ["Richard fired.", "Out of the corner…"]; null when the frame has none.
const beatOf = (f: string): [string, string] | null => {
  const m = f.match(/^\s*\*\*([^*\n]{2,40})\*\*\s*/)
  if (!m || m[1].trim().split(/\s+/).length > 4) return null
  return [m[1].trim(), f.slice(m[0].length)]
}
type WaitStory = { topic: string; key: string; title: string | null; frames: string[]; text: string; source: string | null; chapter: string; picture: string | null; count: number }

// The story as pages (D29, 9 Oct, Prateek): one frame at a time, swiped or stepped with the arrows, dots underneath. The
// picture sits on the first frame and the source line on the last. Native scroll-snap does the swiping, so a slow phone
// has nothing to animate; under reduced motion the arrows jump instead of sliding. A one-frame story (today's) is one page.
function StoryCarousel({ story, onEngaged }: { story: WaitStory; onEngaged?: () => void }) {
  const frames = story.frames.length ? story.frames : [story.text]
  const [i, setI] = useState(0)
  const [picReady, setPicReady] = useState(false)
  const trackRef = useRef<HTMLDivElement>(null)
  const reduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  const go = (n: number) => {
    const k = Math.max(0, Math.min(frames.length - 1, n))
    const el = trackRef.current; if (!el) return
    el.scrollTo({ left: k * el.clientWidth, behavior: reduced ? 'auto' : 'smooth' })
    setI(k); if (k > 0) onEngaged?.()
  }
  const onScroll = () => { const el = trackRef.current; if (!el) return; const k = Math.round(el.scrollLeft / Math.max(1, el.clientWidth)); if (k !== i) { setI(k); if (k > 0) onEngaged?.() } }
  return (
    <div className="wait-carousel">
      <div className="wait-track" ref={trackRef} onScroll={onScroll} tabIndex={0} aria-roledescription="carousel" aria-label={`${story.title ?? story.topic}: ${frames.length} page${frames.length === 1 ? '' : 's'}`}
        onKeyDown={(e) => { if (e.key === 'ArrowRight') { e.preventDefault(); go(i + 1) } if (e.key === 'ArrowLeft') { e.preventDefault(); go(i - 1) } }}>
        {frames.map((f, k) => (
          <article className="wait-frame" key={k} aria-label={`Page ${k + 1} of ${frames.length}`} aria-hidden={k !== i}>
            {k === 0 && story.picture && <div className={`story-pic${picReady ? ' loaded' : ''}`} style={picReady ? undefined : { display: 'none' }}><img src={story.picture} alt="" onLoad={() => setPicReady(true)} ref={(el) => { if (el && el.complete && el.naturalWidth > 0) setPicReady(true) }} /></div>}
            {k === 0 && story.title && <p className="wait-story-title">{story.title}</p>}
            {/* D29d: a frame that opens with a bold beat of 2 to 4 words shows it as the printed caption a storyteller puts on screen. */}
            {beatOf(f) ? <><span className="wait-beat">{beatOf(f)![0]}</span><Rich text={beatOf(f)![1]} className="serif wait-story-text" /></> : <Rich text={f} className="serif wait-story-text" />}
            {k === frames.length - 1 && story.source && <p className="note wait-story-source">{story.source}</p>}
          </article>
        ))}
      </div>
      {frames.length > 1 && (
        <div className="wait-nav">
          <button type="button" className="wait-arrow" onClick={() => go(i - 1)} disabled={i === 0} aria-label="Previous page">‹</button>
          <div className="wait-dots" role="tablist" aria-label="Pages">
            {frames.map((_, k) => <button key={k} type="button" role="tab" aria-selected={k === i} aria-label={`Page ${k + 1}`} className={k === i ? 'on' : ''} onClick={() => go(k)} />)}
          </div>
          <button type="button" className="wait-arrow" onClick={() => go(i + 1)} disabled={i === frames.length - 1} aria-label="Next page">›</button>
        </div>
      )}
    </div>
  )
}

function friendly(e: any): string {
  const limit = limitMessage(e)
  if (limit) return limit
  const m = String(e?.message ?? e)
  if (m.includes('busy')) return "Busy right now. Try again in a few minutes."
  if (m.includes('few words')) return 'A few words is enough. What is it?'
  return "Couldn't write it just now. Your line is still here; try once more in a minute."
}
