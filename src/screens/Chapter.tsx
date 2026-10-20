import { useEffect, useMemo, useRef, useState } from 'react'
import { useAction, useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { speak, stopSpeaking, useLocalVoice } from '../lib/speak'
import { autoOn, playUrl, readMs, setAuto, stopAudio } from '../lib/pageVoice'
import { track } from '../lib/track'
import Rich, { inline } from '../components/Rich'
import { AskBox, AskThread } from '../components/AskCard'
import { runningHead } from '../../convex/shortNames'
import DoIt, { type DoItCard } from '../components/DoIt'
import MoveFrame, { type MoveCard } from '../components/MoveFrame'
import StepsFrame, { type StepsCard } from '../components/StepsFrame'
import TryItFrame, { type TryItCard } from '../components/TryItFrame'
import type { Id } from '../../convex/_generated/dataModel'
import { useOnline } from '../lib/online'
import Ooh, { GoArrow } from '../components/Ooh'
import Figure from '../components/Figure'

export type Card =
  | { type: 'picture' | 'example' | 'mistake' | 'try' | 'teach'; title?: string; body: string }
  | { type: 'watch'; who: string; what: string; url: string; from?: string; minutes?: number; watchFor: string }
  | { type: 'exercise'; kind: 'guess' | 'apply' | 'recall'; prompt: string; options: { id: string; text: string }[] }
  | MoveCard
  | DoItCard
  | StepsCard
  | TryItCard

export type AnswerResult =
  | { correct: true; text: string; why: string | null; chapterPassed?: true; optionId?: string }
  | { correct: false; whyNot: string; reteach: string; reveal: { id: string; text: string } | null }

type Item = { chapter: number; cardIndex: number; card: Card; recall?: boolean }
type Tone = 'marigold' | 'green' | 'coral' | 'indigo' | 'ink' | 'cream'
type Frame = { item: Item; text?: string; part: number; parts: number; tone: Tone; cover?: boolean }

type Props = {
  total?: number
  topic: string
  n: number
  title: string
  cards: Card[]
  recall: Item[]
  passed: number[]
  passedExercises: string[]
  startAt: number
  startPart?: number
  onPosition: (cardIndex: number, part: number) => void
  onAnswer: (item: Item, optionId: string, attempt: number, auto?: boolean) => Promise<AnswerResult>
  onFinish: (stats: { minutes: number; right: number; total: number }) => Promise<void>
  // Body skills (8 Oct): logging a set on a "do it" card; the first set passes the chapter.
  onLog?: (item: Item, count: number, feel: 'easy' | 'right' | 'hard') => Promise<{ chapterPassed: boolean }>
  loggedSets?: number[]   // card indexes with a set logged already
  // The previous chapter's "In one breath" card, shown first as "Last time" (7 Oct, Prateek): a recap that opens the
  // chapter instead of a summary that ends it.
  lastTime?: Card | null
  // Readers on the easier level (missed something last chapter): the re-teach for what they missed, after "Last time".
  recapReteach?: string[]
  svg?: string
  pictures: Record<number, string>   // card index -> picture URL (a drawing, or a real photo), arriving after the chapter
  credits?: Record<number, { credit: string; source?: string }>   // real photos carry their licence credit
  alts?: Record<number, string>   // the scene each picture was drawn from, read out as its alt text
  caution?: string | null            // money / health / legal topics: the fixed study-aid line
  picturesPending?: boolean          // pictures are still being drawn: a quiet plate, never the rough drawing
  onExit: () => void
  handbookId: Id<'handbooks'>
  deviceToken: string
  // D100 (13 Oct, Prateek: 31 readers passed chapter 1 in 14 days, 12 opened chapter 2): after Finish, two slides before
  // the Done screen. "How was chapter N?" (stars, every chapter, "Don't show again" on this phone), then on chapters 1
  // and 2 the next chapter's picture, title and hook with a button straight into it. Without onAfter, Finish goes to Done.
  onStars?: (stars: number) => Promise<void>
  teaser?: { title: string; hook?: string; picture?: string; state: 'ready' | 'writing' | 'failed' | 'wall' } | null
  onAfter?: (go: 'done' | 'next', stats: { minutes: number; right: number; total: number; reread?: boolean }) => void
}

const NO_STARS = 'igi.noStars'
const starsOff = () => { try { return localStorage.getItem(NO_STARS) === '1' } catch { return false } }

// Only http(s) links from the known hosts reach the page; anything else is dropped.
function safeUrl(u: string): string {
  try { const x = new URL(u); if ((x.protocol === 'https:' || x.protocol === 'http:') && /(^|\.)(ted\.com|youtube\.com|youtu\.be|ocw\.mit\.edu|archive\.org|hbr\.org|duarte\.com|mattabrahams\.com|juliantreasure\.com)$/.test(x.hostname)) return x.toString() } catch {}
  return '#'
}

// One idea per frame: split a card into paragraphs, folding a very short one into the next.
function paragraphs(text: string | undefined): string[] {
  const out: string[] = []
  if (typeof text !== 'string') return ['']
  for (const p of text.split(/\n\n+/).map((s) => s.trim()).filter(Boolean)) {
    if (out.length && out[out.length - 1].split(/\s+/).length < 14) out[out.length - 1] += '\n\n' + p
    else out.push(p)
  }
  return out.length ? out : [text]
}

// 15 Oct (Prateek: "There were clear background colors in the last version which changed per slide… Right now it is just
// like notes app"): every page has a colour again, in theme C's inks. A teaching page takes the next colour in the cycle,
// never the same as the page before; a story is indigo, a mistake coral, a dare green, a question stays on paper (C7).
const TEACH_TONES: Tone[] = ['marigold', 'ink', 'green', 'cream', 'indigo', 'marigold', 'coral', 'cream']
const KICKER: Record<string, string> = { example: 'Story time', mistake: 'The mistake everyone makes', try: "Tonight's dare (optional)", guess: 'Quick guess', apply: 'Your call', recall: 'Lock it in' }

function sizeOf(text: string) {
  const w = text.split(/\s+/).length
  return w <= 26 ? 'xl' : w <= 60 ? 'lg' : 'md'
}

// The chapter as Stories: full-screen frames, one idea each, tap or swipe through.
// D38: for an exercise with no added line yet (an old copy the backfill did not reach): a short, true line, by the card's key so it does not flicker. Copy (agent).
// 15 Oct (Prateek: "Answering the question correctly isn't very encouraging and inspire a bit of sense of achievement"):
// a right answer lands as a marigold card with a big line, a burst from the option, Ooh's hop, the chapter's count of
// checks done and a streak. Copy (agent).
const WINS_FIRST = ['Nailed it!', 'Spot on!', "That's it!", 'Exactly right!', 'Sharp!']
const WINS_LATER = ['Got there!', "That's the one!", 'Yes, that one!']
const pick = (xs: string[], key: string) => { let h = 7; for (const ch of key) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return xs[h % xs.length] }
const CHEERS = ['Got it in one.', "That one's yours now.", 'No hint needed.', 'Clean. Next.', 'You saw it straight away.']
const cheer = (key: string) => { let h = 0; for (const c of key) h = (h * 31 + c.charCodeAt(0)) >>> 0; return CHEERS[h % CHEERS.length] }
export default function Chapter({ total = 7, topic, n, title, cards, recall, passed: _passed, passedExercises, startAt, startPart = 0, onPosition, onAnswer, onFinish, onLog, loggedSets = [], lastTime, recapReteach = [], pictures, credits = {}, alts = {}, caution, onExit, handbookId, deviceToken, onStars, teaser, onAfter }: Props) {
  // A chapter read again after it was passed goes straight to Done, as before: no second rating, no teaser.
  const [wasPassed] = useState(() => _passed.includes(n))
  const [after, setAfter] = useState<null | 'stars' | 'teaser'>(null)
  const [stars, setStars] = useState(0)
  const afterStats = useRef<{ minutes: number; right: number; total: number; reread?: boolean }>({ minutes: 1, right: 0, total: 0 })
  // 17 Oct: false once this screen is gone, so a finish or a voice part that lands late does nothing.
  const alive = useRef(true)
  const items: Item[] = useMemo(
    () => [
      ...(lastTime && !['exercise', 'watch', 'move', 'doit', 'steps', 'tryit'].includes(lastTime.type) ? [{ chapter: n - 1, cardIndex: -1, recall: true, card: { ...lastTime, title: 'Last time', body: dropNextLine((lastTime as any).body ?? '') } as Card }] : []),
      ...(recapReteach.length ? [{ chapter: n - 1, cardIndex: -2, recall: true, card: { type: 'teach', title: 'Before we go on', body: recapReteach.join('\n\n') } as Card }] : []),
      ...recall.map((r) => ({ ...r, recall: true })),
      ...cards.map((card, i) => ({ chapter: n, cardIndex: i, card })).filter((x) => !isBreath(x.card)),
    ],
    [cards, recall, n, lastTime, recapReteach],
  )

  const online = useOnline()
  // For the Done screen's line: minutes since this chapter was opened, and quizzes right on the first try.
  const openedAt = useRef(Date.now())
  const firstTries = useRef<Map<string, boolean>>(new Map())
  const streak = useRef(0)

  const frames: Frame[] = useMemo(() => {
    const out: Frame[] = []
    let t = 0
    for (const item of items) {
      const c = item.card
      if (c.type === 'exercise') { out.push({ item, part: 0, parts: 1, tone: 'cream' }); continue }
      if (c.type === 'watch') { out.push({ item, part: 0, parts: 1, tone: 'indigo' }); continue }
      if (c.type === 'move') { out.push({ item, part: 0, parts: 1, tone: 'cream' }); continue }
      if (c.type === 'doit') { out.push({ item, part: 0, parts: 1, tone: 'green' }); continue }
      if (c.type === 'steps') { out.push({ item, part: 0, parts: 1, tone: 'indigo' }); continue }
      if (c.type === 'tryit') { out.push({ item, part: 0, parts: 1, tone: 'cream' }); continue }
      // A card the screen can't show (8 Oct: a "poll" card from an old rewrite blanked the whole chapter) is skipped, never fatal.
      if (typeof (c as any).body !== 'string') continue
      const ps = paragraphs(c.body)
      ps.forEach((text, part) => {
        const cover = c.type === 'picture' && part === 0 && !item.recall
        let tone: Tone = cover ? 'indigo' : c.type === 'example' ? (part % 2 ? 'ink' : 'indigo') : c.type === 'mistake' ? 'coral' : c.type === 'try' ? 'green' : TEACH_TONES[t++ % TEACH_TONES.length]
        const prev = out[out.length - 1]?.tone
        if (tone === prev) tone = TEACH_TONES[t++ % TEACH_TONES.length] === prev ? TEACH_TONES[t++ % TEACH_TONES.length] : TEACH_TONES[(t - 1) % TEACH_TONES.length]
        out.push({ item, text, part, parts: ps.length, tone, cover })
      })
    }
    return out
  }, [items])

  const firstChapterFrame = frames.findIndex((f) => !f.item.recall)
  const [i, setI] = useState(() => {
    if (startAt <= 0) return 0
    const exact = frames.findIndex((f) => !f.item.recall && f.item.cardIndex === startAt && f.part === startPart)
    if (exact >= 0) return exact
    const at = frames.findIndex((f) => !f.item.recall && f.item.cardIndex === startAt)
    return at >= 0 ? at : Math.max(0, firstChapterFrame)
  })
  const frame = frames[Math.min(i, frames.length - 1)]
  const item = frame.item
  const key = `${item.chapter}:${item.cardIndex}`
  const isLast = i >= frames.length - 1
  // The next two frames' pictures are warmed as each frame lands (8 Oct night, critique: an empty plate with a hard shadow
  // mid-chapter is the opposite of a Reel that is "already there"). The browser caches them; no state, no layout.
  useEffect(() => {
    // On a slow or metered connection the warm-up would fight the picture on screen for the pipe: none on 2G or with
    // data saver on, one frame ahead on 3G, two otherwise.
    const c: any = (navigator as any).connection
    const ahead = c?.saveData || /2g/.test(c?.effectiveType ?? '') ? 0 : 1   // one frame ahead (9 Oct: two warmed every plate in the chapter on open)
    for (let k = i + 1; k <= i + ahead; k++) {
      const f = frames[k]
      if (!f || f.item.recall || f.part !== 0) continue
      const src = pictures[f.item.cardIndex]
      if (src) { const im = new Image(); im.src = src }
    }
  }, [i, frames, pictures])

  // exercise state, per frame
  const [attempt, setAttempt] = useState(1)
  const [picked, setPicked] = useState<string | null>(null)
  const [missed, setMissed] = useState<string[]>([])
  const [result, setResult] = useState<AnswerResult | null>(null)
  const [passedHere, setPassedHere] = useState<Set<string>>(() => new Set(passedExercises))
  const [passedChoice, setPassedChoice] = useState<Record<string, string>>({})
  const [sending, setSending] = useState(false)
  const [finishing, setFinishing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // C6 "Read it to me": the phone's own voice, if it has one; it stops when the page turns. C7 "I don't know yet":
  // the quiz's second explanation, fetched only once tapped.
  const voice = useLocalVoice()
  const [speaking, setSpeaking] = useState(false)
  const [unsure, setUnsure] = useState(false)
  // C8 Ask Ooh opens on the page only when the reader taps Ooh in the header (14 Oct, Prateek: "It is an assistant that
  // should be there if you need it and not nagging you on every screen"); it closes when the page turns.
  const [askOpen, setAskOpen] = useState(false)
  // C7 (15 Oct, the board): a first try at a chapter's check asks "How sure are you?" before the answer is sent. The
  // tapped option holds an ink ring until Sure or Not sure; warm-ups and second tries go straight through.
  const [pending, setPending] = useState<string | null>(null)
  const [sure, setSure] = useState<'sure' | 'notsure' | null>(null)
  const [autoAnswered, setAutoAnswered] = useState(false)   // auto-play filled this answer in: no praise for it
  const dialogRef = useRef<HTMLDivElement>(null)
  // Opened out of a row on the handbook page (D155): the row grew into the chapter, so the book-opening swing is skipped.
  const [grewIn] = useState(() => document.documentElement.dataset.vt === 'chap')
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null
    dialogRef.current?.focus({ preventScroll: true })
    // Closing the chapter puts focus on the handbook's main button, not the wordmark 18 Tabs away (UX review 9 Oct).
    return () => { const back = opener && document.contains(opener) ? opener : document.querySelector<HTMLElement>('.actionbar .btn') ?? document.querySelector<HTMLElement>('.wordmark-btn'); back?.focus({ preventScroll: true }) }
  }, [])

  const exercisePassed = item.card.type === 'exercise' && (item.recall ? result?.correct === true : passedHere.has(key))
  const [logged, setLogged] = useState<Set<number>>(() => new Set(loggedSets))
  const [, setLater] = useState<Set<number>>(() => new Set())   // D24: 'later' no longer gates anything; the setter keeps the server's open-set hint in step
  // A new frame keeps focus inside the chapter: after the answer sheet closed, focus fell to the page and the next Tab
  // reached the footer behind (UX review 9 Oct).
  useEffect(() => { const box = dialogRef.current; if (box && !box.contains(document.activeElement)) box.focus({ preventScroll: true }) }, [i])
  // D24 (9 Oct, Prateek: "let's not make the activities mandatory to exit the chapter"): only a quiz holds the arrow.
  // A do-it, try-it, steps or move card is an invitation; the arrow works from the moment the card shows.
  const canAdvance = item.card.type !== 'exercise' || exercisePassed
  const reset = () => { setAttempt(1); setPicked(null); setMissed([]); setResult(null); setError(null); setUnsure(false); setAskOpen(false); setPending(null); setSure(null); setAutoAnswered(false) }

  useEffect(() => { track('ch_open', { n }, `ch_open:${handbookId}:${n}`) }, [n, handbookId])
  useEffect(() => { if (!item.recall) track('card', { n, i: item.cardIndex }, `card:${handbookId}:${n}:${item.cardIndex}`) }, [n, handbookId, item.cardIndex, item.recall])
  useEffect(() => { if (!item.recall) onPosition(item.cardIndex, frame.part) }, [item.cardIndex, item.recall, frame.part]) // eslint-disable-line react-hooks/exhaustive-deps
  // Each frame is a page (8 Oct night, Prateek): it turns in from the right going forward and from the left going back.
  // A transform and an opacity only, about a third of a second, nothing that waits on the network.
  const dir = useRef<'fwd' | 'back'>('fwd')
  const next = () => { if (!canAdvance) return; if (isLast) { finish(); return } dir.current = 'fwd'; setI(i + 1); reset() }
  // Only × and Escape leave the chapter (review #18, 8 Oct): a tap on the left edge of the first frame used to exit silently.
  const back = () => { if (i > 0) { dir.current = 'back'; setI(i - 1); reset() } }

  const asksSure = item.card.type === 'exercise' && !item.recall && attempt === 1 && (item.card as any).kind !== 'poll' && !exercisePassed
  const tap = (optionId: string) => { if (asksSure && !result) { setPending(optionId); setUnsure(false) } else choose(optionId) }
  const answerSure = (v: 'sure' | 'notsure') => { if (!pending) return; setSure(v); track('sure', { n, i: item.cardIndex, v }); const o = pending; setPending(null); choose(o) }
  const choose = async (optionId: string, auto = false) => {
    if (item.card.type !== 'exercise' || sending || exercisePassed) return
    setSending(true); setPicked(optionId || null); setError(null)
    try {
      const r = await onAnswer(item, optionId, attempt, auto)
      if (auto && r.correct && r.optionId) { optionId = r.optionId; setPicked(r.optionId); setAutoAnswered(true) }
      if (!item.recall && !firstTries.current.has(key)) firstTries.current.set(key, !auto && attempt === 1 && r.correct)
      if (!auto && r.correct && attempt === 1) streak.current += 1; else if (!r.correct) streak.current = 0
      if (r.correct) { try { navigator.vibrate?.(35) } catch {} }
      setResult(r)
      if (r.correct) { if (!item.recall) { setPassedHere((s) => new Set(s).add(key)); setPassedChoice((m) => ({ ...m, [key]: optionId })) } }
      else setMissed((m) => [...m, optionId])
    } catch { setError("Couldn't save that answer. Check your connection and tap again.") }
    finally { setSending(false) }
  }
  const closeSheet = () => { if (!result) return; if (result.correct) { setResult(null); next(); return } setAttempt((a) => a + 1); setPicked(null); setResult(null) }

  const finish = async () => {
    setFinishing(true); setError(null)
    dialogRef.current?.querySelector('.story-end-ooh')?.classList.add('jump')   // Ooh hops as the button squishes (20 Oct, D155)
    const tries = [...firstTries.current.values()]
    const stats = { minutes: Math.max(1, Math.round((Date.now() - openedAt.current) / 60000)), right: tries.filter(Boolean).length, total: tries.length, reread: wasPassed }
    try {
      await onFinish(stats)
      if (!alive.current) return   // 17 Oct: closed while it saved; don't pull the reader back to Done
      if (onAfter) {
        afterStats.current = stats
        const first = wasPassed || auto ? null : onStars && !starsOff() ? 'stars' : teaser ? 'teaser' : null
        if (first) { track('after_view', { n, s: first }); setAfter(first) } else onAfter('done', stats)
      }
    } catch (e: any) {
      // A quiz still open (7 Oct: one was skipped by the recall bug): go straight to it instead of a dead end.
      const open = e?.data?.code === 'open-check' || e?.data?.code === 'open-set' ? frames.findIndex((f) => !f.item.recall && f.item.cardIndex === e.data.card) : -1
      if (open >= 0) { setI(open); reset(); setLater((s) => { const x = new Set(s); x.delete(e.data.card); return x }); setError(e?.data?.code === 'open-set' ? 'Log one set and the chapter counts.' : 'One quiz is still open. Answer it, then finish.') }
      else setError(String(e?.message ?? e).includes('Finish') ? 'One quiz is still open. Answer it, then finish.' : "Couldn't save that. Check your connection and tap again.")
    }
    finally { setFinishing(false) }
  }

  // keyboard: → / Enter / Space next, ← back, 1 2 3 answer, Esc closes
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      // Enter or Space on a focused button presses that button (UX review 9 Oct: they turned the page, so Tab + Enter
      // could not answer a quiz, open Ask or press ×). The arrows still turn pages from anywhere.
      if ((e.key === 'Enter' || e.key === ' ') && (e.target as HTMLElement)?.closest?.('button, a, label')) return
      if (after) { if (e.key === 'Escape') leave('done'); return }
      if (askOpen && e.key === 'Escape') { setAskOpen(false); return }
      if (result) { if (['Escape', 'Enter', 'ArrowRight', ' '].includes(e.key)) { e.preventDefault(); closeSheet() } return }
      if (e.key === 'ArrowLeft') { e.preventDefault(); back(); return }
      if (e.key === 'Escape') { onExit(); return }
      if (item.card.type === 'exercise' && !exercisePassed && ['1', '2', '3'].includes(e.key)) { const o = item.card.options[Number(e.key) - 1]; if (o && !missed.includes(o.id)) tap(o.id); return }
      if (['ArrowRight', 'Enter', ' '].includes(e.key)) { e.preventDefault(); next() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  // tap zones and swipe
  const touch = useRef<{ x: number; y: number } | null>(null)
  const onTap = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button, a, input, .no-tap')) return
    const r = e.currentTarget.getBoundingClientRect()
    if (e.clientX - r.left < r.width * 0.3) back(); else next()
  }
  const onTouchStart = (e: React.TouchEvent) => { touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY } }
  const onTouchEnd = (e: React.TouchEvent) => {
    const s = touch.current; touch.current = null; if (!s) return
    if ((e.target as HTMLElement).closest('input, .ask')) return   // C8: the ask box on the page is for typing, not turning
    const dx = e.changedTouches[0].clientX - s.x, dy = e.changedTouches[0].clientY - s.y
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) { if (dx < 0) next(); else back(); return }
    // Reels-style (DESIGN.md section 2): swipe up for the next frame, down to go back. A long frame scrolls first.
    if (Math.abs(dy) > 60 && Math.abs(dy) > Math.abs(dx)) {
      const body = (e.target as HTMLElement).closest('.story-body') as HTMLElement | null
      const atEnd = !body || body.scrollTop + body.clientHeight >= body.scrollHeight - 4
      const atTop = !body || body.scrollTop <= 4
      if (dy < 0 && atEnd) next(); else if (dy > 0 && atTop) back()
    }
  }

  // D100: the slides after Finish. Leaving them goes to Done ("Later", ×, Escape, a wall) or straight into the next chapter.
  const leave = (go: 'done' | 'next') => { track('after_go', { n, go }); onAfter?.(go, afterStats.current) }
  const toTeaser = () => { if (teaser) { track('after_view', { n, s: 'teaser' }); setAfter('teaser') } else leave('done') }
  const rate = (k: number) => { if (stars) return; setStars(k); track('stars', { n, v: k }); onStars?.(k).catch(() => {}); setTimeout(toTeaser, 600) }
  const checksTotal = cards.filter((x) => x.type === 'exercise').length
  const checksDone = [...passedHere].filter((k) => k.startsWith(`${n}:`)).length
  // Explainer figures (15 Oct): Sonnet's figure for a page replaces its painting; asked for when the chapter opens.
  const figures = (useQuery(api.figures.forChapter, { handbookId, n, deviceToken }) ?? {}) as Record<number, any>
  const ensureFigures = useMutation(api.figures.ensure)
  useEffect(() => { ensureFigures({ handbookId, n, deviceToken }).catch(() => {}) }, [handbookId, n]) // eslint-disable-line react-hooks/exhaustive-deps
  const kept = useQuery(api.handbooks.keptFor, { handbookId, chapter: n, deviceToken }) ?? []
  const reteach = useQuery(api.handbooks.reteachFor, unsure && item.card.type === 'exercise' ? { handbookId, chapter: item.chapter, cardIndex: item.cardIndex, recall: !!item.recall, deviceToken } : 'skip')
  // 17 Oct: every "Read it to me" press gets a number; turning the page, Stop or closing the chapter moves it on, and a
  // part still loading for an older number is never played. Before, only a page turn stopped it, so Stop and close let
  // the rest of the page play on (even on the handbook page).
  const run = useRef(0)
  useEffect(() => { run.current++; stopSpeaking(); stopAudio(); setSpeaking(false) }, [i])
  useEffect(() => () => { alive.current = false; run.current++; stopAudio() }, [])

  // 15 Oct: the page voice (Gemini speech, a warm female voice, cached per page) and auto-play. A page is read as its
  // own words: the headline, the paragraphs; a question, its options; an answer, the right option and why.
  const voicePage = useAction(api.voiceNode.page)
  const voicePlayed = useMutation(api.voice.played)   // play logging (19 Oct): which clips are ever heard
  const keyByUrl = useRef(new Map<string, string>())
  const iRef = useRef(i); iRef.current = i
  const audioCache = useRef(new Map<string, { p: Promise<string | null>; preload: boolean }>())
  const partsOf = (f?: Frame): string[] => {
    if (!f) return []
    const cc = f.item.card as any
    if (cc.type === 'exercise') return [cc.prompt, ...(cc.options ?? []).map((o: any) => o.text)]
    if (cc.type === 'watch') return [cc.who, cc.what, cc.watchFor].filter(Boolean)
    if (typeof cc.body !== 'string') return []
    const head = f.cover ? [title] : f.part === 0 && cc.title && !f.item.recall ? [cc.title] : []
    return [...head, ...(f.text ?? '').split(/\n\n+/)].map((x) => x.trim()).filter(Boolean)
  }
  // Two files per page (19 Oct, I2-22, Prateek: "do one clip per page", then "lets do second"): the first part (the
  // headline, or a question's prompt) on its own, so the voice starts in about 3 s, then the rest of the page in one
  // request. A page costs 2 of Gemini's 100 requests a day instead of one per paragraph. In one file the first page took
  // 13 to 18 s to start (dev), and Flash-Lite once read a headline and dropped the paragraph after it.
  // The rest goes in as few pieces as the server takes in one go (8 parts, 2,400 characters).
  // A preload the server turns away (its 50 a day are used) is forgotten, and a play asks again for real.
  const ask = (parts: string[], preload: boolean, ahead?: number) => voicePage({ handbookId, chapter: n, parts, deviceToken, preload, ...(preload && ahead !== undefined ? { ahead } : {}) })
    .then((r) => { if (!r.ok) return null; keyByUrl.current.set(r.url, r.key); return r.url }).catch(() => null)
  const piecesOf = (parts: string[]) => {
    if (!parts.length) return []
    const out: string[][] = [[parts[0]]]
    for (const p of parts.slice(1)) {
      const last = out[out.length - 1]
      if (out.length > 1 && last.length < 8 && [...last, p].join('\n\n').length <= 2400) last.push(p)
      else out.push([p])
    }
    return out
  }
  const audioFor = (parts: string[], preload = false, ahead?: number) => piecesOf(parts).map((piece) => {
    const key = piece.join('\n\n')
    const hit = audioCache.current.get(key)
    if (hit && (preload || !hit.preload)) return hit.p
    if (hit) { const p = hit.p.then((u) => u ?? ask(piece, false)); audioCache.current.set(key, { p, preload: false }); return p }
    const entry = { p: ask(piece, preload, ahead), preload }
    audioCache.current.set(key, entry)
    if (preload) entry.p.then((u) => { if (!u && audioCache.current.get(key) === entry) audioCache.current.delete(key) })
    return entry.p
  })
  // Preload (15 Oct, Prateek: "chapter 1 pre loaded for at least the first 5 slides … start loading the voice once a
  // chapter is starting"): this page and the next four are always being voiced, played or not, so play starts at once.
  // About ₹3 a chapter opened; a page voiced once is a cached file for every later reader. Capped on the server at 50 new
  // clips a day and 5 a minute across the app (convex/voice.ts), so plays keep the other half of Gemini's 100 a day.
  // 19 Oct (I2-22): this page first, the next four once it is ready. Asked all at once, the five were made side by side and
  // the page being read took about 10 s instead of 3 to 7 (dev, Git book, chapter 1).
  useEffect(() => {
    if (after) return
    Promise.all(audioFor(partsOf(frames[i]), true, 0)).finally(() => { for (let k = 1; k < 5; k++) audioFor(partsOf(frames[i + k]), true, k) })
  }, [i, frames, after]) // eslint-disable-line react-hooks/exhaustive-deps
  // Plays a page's parts in order; false if any part had no audio (the caller falls back), or it was stopped.
  const playParts = async (parts: string[], stopped: () => boolean) => {
    const files = audioFor(parts)
    for (const f of files) {
      const url = await f; if (stopped()) return true
      const key = url ? keyByUrl.current.get(url) : undefined
      if (!url || !(await playUrl(url, () => { if (key) voicePlayed({ key }).catch(() => {}) }))) return false
    }
    return true
  }
  const [auto, setAutoState] = useState(autoOn)
  const toggleAuto = () => { const on = !auto; setAuto(on); setAutoState(on); track('autoplay', { v: on ? 'on' : 'off' }); if (!on) { stopAudio(); setSpeaking(false) } }
  // Auto-play (Prateek: "auto scroll (quizes auto answered) … It should span chapters"): each page is read, then turns;
  // a question is read, waits a beat, fills in the right answer (stored as auto), reads why, and turns. The last page
  // finishes the chapter and Done carries on into the next one.
  useEffect(() => {
    if (!auto || after) return
    let off = false
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))
    const say = async (parts: string[]) => {
      if (!parts.length) return
      setSpeaking(true)
      if (!(await playParts(parts, () => off)) && !off) await wait(readMs(parts.join(' ')))
      if (!off) setSpeaking(false)
    }
    ;(async () => {
      const cc = item.card as any
      if (cc.type === 'exercise') {
        if (result?.correct) { await say([result.text, result.why ?? ''].filter(Boolean)); if (off) return; await wait(900); if (!off) closeSheet(); return }
        if (exercisePassed) { await wait(1500); if (!off) next(); return }
        if (result || sending) return
        await say(partsOf(frame)); if (off) return
        await wait(1800); if (!off) choose('', true)
        return
      }
      const parts = partsOf(frame)
      if (parts.length) await say(parts); else await wait(5000)
      if (off) return
      await wait(700)
      if (off) return
      if (isLast) finish(); else next()
    })()
    return () => { off = true; stopAudio() }
  }, [auto, i, result, after, exercisePassed]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => stopSpeaking(), [])
  if (after) {
    const t = teaser
    return (
      <div className="story" role="dialog" aria-modal="true" aria-label={after === 'stars' ? `How was chapter ${n}?` : `Up next: chapter ${n + 1}`} ref={dialogRef} tabIndex={-1}>
        <div className={`story-frame tone-${after === 'stars' ? 'cream' : 'ink'}`}>
          <div className="story-head">
            <span className="story-label">{after === 'stars' ? `Chapter ${n} of ${total} · done` : `Chapter ${n + 1} of ${total}`}</span>
            <span className="story-topic">{topic}</span>
            <button type="button" className="story-close" onClick={() => leave('done')} aria-label="Close">×</button>
          </div>
          <div className="story-body turn-fwd" key={after}>
            {after === 'stars' ? (
              <>
                {/* Copy (agent). */}
                <p className="story-kicker">One tap</p>
                <p className="story-q">How was chapter {n}?</p>
                <div className="after-stars" role="radiogroup" aria-label={`Stars for chapter ${n}`}>
                  {[1, 2, 3, 4, 5].map((k) => (
                    <button key={k} type="button" role="radio" aria-checked={stars === k} aria-label={`${k} star${k > 1 ? 's' : ''}`} className={k <= stars ? 'on' : ''} onClick={() => rate(k)}>★</button>
                  ))}
                </div>
                <p className="story-hint" aria-live="polite">{stars ? 'Thanks. Noted.' : '\u00a0'}</p>
                <div className="after-quiet">
                  <button type="button" className="quiet" onClick={toTeaser} disabled={!!stars}>Skip</button>
                  <button type="button" className="after-never" disabled={!!stars} onClick={() => { try { localStorage.setItem(NO_STARS, '1') } catch {} track('stars_off', { n }); toTeaser() }}>Don't show again</button>
                </div>
              </>
            ) : t ? (
              <>
                {t.picture && <div className="story-pic"><img src={t.picture} alt="" onLoad={(e) => e.currentTarget.parentElement?.classList.add('loaded')} ref={(el) => { if (el && el.complete && el.naturalWidth > 0) el.parentElement?.classList.add('loaded') }} /></div>}
                <p className="story-kicker">Up next</p>
                <h2 className="story-title">{t.title}</h2>
                {t.hook && <p className="story-text size-md">{inline(t.hook)}</p>}
                {t.state === 'writing'
                  ? <button type="button" className="story-finish" disabled aria-busy="true">Writing chapter {n + 1}… about a minute</button>
                  : <button type="button" className="story-finish" onClick={() => leave(t.state === 'ready' ? 'next' : 'done')}>Open chapter {n + 1} →</button>}
                <button type="button" className="quiet after-later" onClick={() => leave('done')}>Later</button>
              </>
            ) : null}
          </div>
        </div>
      </div>
    )
  }

  const c = item.card
  // A card's picture sits on its first frame only, so the words keep the screen on the frames after it.
  const fig = !item.recall && frame.part === 0 && !['exercise', 'watch', 'move', 'doit', 'steps', 'tryit'].includes(c.type) ? figures[item.cardIndex] : undefined
  const pic = !fig && !item.recall && frame.part === 0 && !['exercise', 'watch', 'move', 'doit', 'steps', 'tryit'].includes(c.type) ? pictures[item.cardIndex] : undefined
  const revealId = result && !result.correct && result.reveal ? result.reveal.id : null
  // C6 and C7 (14 Oct): the header says where you are in words, the page number sits by the close; the card bars stay
  // for screen readers only. The bottom says how many pages are left.
  // C5: the warm-up questions at a chapter's start count themselves ("Warm-up · 1 of 2"); the recap before them stays "Last time".
  const warm = frames.filter((f) => f.item.recall && f.item.card.type === 'exercise')
  const warmAt = warm.findIndex((f) => f === frame) + 1
  const nextIsWarmup = !!frames[i + 1]?.item.recall && frames[i + 1]?.item.card.type === 'exercise'
  const label = item.recall ? (c.type === 'exercise' ? `Warm-up · ${warmAt} of ${warm.length}` : `Last time · from chapter ${item.chapter}`) : c.type === 'exercise' ? `Chapter ${n} · Check` : `${runningHead(topic)} · Chapter ${n}`
  const pagesLeft = frames.length - 1 - i
  const readAloud = async () => {
    if (speaking) { run.current++; stopSpeaking(); stopAudio(); setSpeaking(false); return }
    setSpeaking(true)
    const mine = ++run.current
    if (await playParts(partsOf(frame), () => mine !== run.current)) { if (mine === run.current) setSpeaking(false); return }
    if (mine !== run.current) return   // stopped or closed while it loaded: no phone voice either
    if (!voice) { setSpeaking(false); return }   // no page voice and no phone voice: nothing to read with
    const parts = [...(dialogRef.current?.querySelectorAll('.story-body .story-title, .story-body .story-kicker, .story-body .story-text, .story-body .story-q, .story-body .story-big, .story-body .story-sub, .story-body .story-opt') ?? [])]
    const text = parts.map((el) => (el.classList.contains('story-opt') ? `${el.textContent?.trim()}.` : el.textContent?.trim())).filter(Boolean).join('\n')
    if (!text) return
    speak(text, voice, () => setSpeaking(false))
  }

  return (
    <div className="story" role="dialog" aria-modal="true" aria-label={`${title}, chapter ${n}, card ${i + 1} of ${frames.length}`} ref={dialogRef} tabIndex={-1}
      onKeyDown={(e) => {
        // Tab stays inside the chapter (9 Oct, accessibility review): the page behind is not reachable while it is open.
        if (e.key !== 'Tab' || !dialogRef.current) return
        const f = [...dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input, [tabindex]:not([tabindex="-1"])')].filter((el) => el.offsetParent !== null)
        if (!f.length) return
        const first = f[0], last = f[f.length - 1], active = document.activeElement as HTMLElement | null
        if (e.shiftKey && (active === first || !dialogRef.current.contains(active))) { e.preventDefault(); last.focus() }
        else if (!e.shiftKey && (active === last || !dialogRef.current.contains(active))) { e.preventDefault(); first.focus() }
      }}>
      <div className={`story-frame tone-${frame.tone}${grewIn ? ' vt-in' : ''}`} onClick={onTap} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <div className="story-bars" role="progressbar" aria-label="Cards in this chapter" aria-valuemin={1} aria-valuemax={frames.length} aria-valuenow={i + 1}>
          {frames.map((_, k) => <span key={k} className={k < i ? 'on' : k === i ? 'now' : ''} />)}
        </div>
        <div className="story-head">
          <span className="story-label">{label}</span>
          {!item.recall && c.type !== 'try' && c.type !== 'exercise' && (
            <button type="button" className="story-askbtn" aria-pressed={askOpen} aria-label={askOpen ? 'Close Ask Ooh' : 'Ask Ooh about this page'} onClick={() => setAskOpen((x) => !x)}>
              <Ooh size={30} /><span>{askOpen ? 'Close' : 'Ask'}</span>
            </button>
          )}
          {auto && <button type="button" className="story-autohead" onClick={toggleAuto} aria-label="Stop auto-play"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1.5" /><rect x="14" y="5" width="4" height="14" rx="1.5" /></svg>Auto</button>}
          <span className="story-folio" aria-hidden="true">{i + 1}</span>
          <button type="button" className="story-close" onClick={onExit} aria-label="Back to the handbook">×</button>
        </div>

        <div className={`story-body turn-${dir.current}${(pic || fig) && !askOpen ? ' has-pic' : ' no-pic'}`} key={i} aria-live="polite">
          {c.type === 'exercise' ? (
            <>
              {/* C7 (the board, 15 Oct): the question, a quiet gap, the options at the thumb, nothing timed. A tapped option
                  holds an ink ring until "How sure are you?" is answered; the answer then lands under the options, the
                  right one with a marigold dot and "That's it!", a miss keeping its ring and "Your pick". No red, no strike. */}
              <p className="story-q c7-q">{inline(c.prompt)}</p>
              <div className="c7-gap" aria-hidden="true" />
              <div className="story-options no-tap" role="group" aria-label="Pick one">
                {c.options.map((o) => {
                  const cls = ['story-opt']
                  const won = exercisePassed && (picked === o.id || (picked === null && passedChoice[key] === o.id))
                  if (won) cls.push('pass')
                  else if (missed.includes(o.id)) cls.push('missed')
                  if (revealId === o.id) cls.push('reveal')
                  if (pending === o.id) cls.push('picked')
                  const tag = won || revealId === o.id ? "That's it!" : missed.includes(o.id) ? 'Your pick' : ''
                  return (
                    <button key={o.id} type="button" className={cls.join(' ')} aria-pressed={pending === o.id} onClick={() => tap(o.id)} disabled={sending || exercisePassed || missed.includes(o.id)}>
                      <span className="k" aria-hidden="true" /><span className="t">{o.text}</span>{tag && <span className="story-tag">{tag}</span>}
                      {won && picked === o.id && !autoAnswered && <span className="c7-burst" aria-hidden="true">{Array.from({ length: 12 }, (_, b) => <i key={b} style={{ ['--a' as any]: `${b * 30}deg` }} />)}</span>}
                    </button>
                  )
                })}
                {!exercisePassed && (c as any).kind !== 'poll' && !unsure && (
                  <button type="button" className="story-opt story-dunno no-tap" onClick={() => { setUnsure(true); setPending(null); track('unsure', { n, i: item.cardIndex }) }} disabled={sending}><span className="k" aria-hidden="true" /><span className="t">I don't know yet</span></button>
                )}
              </div>
              {pending && !result && (
                <div className="c7-sure no-tap">
                  <p className="c7-sure-q"><Ooh size={26} /><span>How sure are you?</span></p>
                  <div className="c7-sure-row">
                    <button type="button" className="c7-sure-yes" onClick={() => answerSure('sure')} disabled={sending}>Sure</button>
                    <button type="button" className="c7-sure-no" onClick={() => answerSure('notsure')} disabled={sending}>Not sure</button>
                  </div>
                </div>
              )}
              {unsure && !result && (
                <div className="story-reveal no-tap" aria-live="polite">
                  <p className="verdict"><Ooh face="again" size={34} /><span>That's okay.</span></p>
                  <p className="serif">{reteach === undefined ? 'One moment…' : reteach ? inline(reteach) : 'Read the last page again, then pick the one that fits best.'}</p>
                </div>
              )}
              {result && (
                <div className={`story-reveal no-tap${result.correct && (item.card as any).kind !== 'poll' ? ' won' : ''}`} aria-live="polite" ref={(el) => el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })}>
          {result.correct ? (
            <>
              {(item.card as any).kind === 'poll' ? (
                <>
                  <p className="verdict pass">{result.chapterPassed ? `Here's what happened. Chapter ${n} done.` : "Here's what happened."}</p>
                  {result.why && <p className="serif">{inline(result.why)}</p>}
                </>
              ) : (
                <>
                  <p className="verdict pass c7-win"><Ooh face="happy" size={48} /><span>{autoAnswered ? "Here's the answer." : pick(attempt === 1 ? WINS_FIRST : WINS_LATER, key)}{result.chapterPassed && !autoAnswered ? ` Chapter ${n} passed.` : ''}</span></p>
                  <p className="c7-tally">
                    {!item.recall && checksTotal > 0 && <span>{checksDone} of {checksTotal} checks done</span>}
                    {streak.current >= 2 && !autoAnswered && <span className="c7-streak">{streak.current} in a row</span>}
                  </p>
                  {/* D38 (Prateek, 9 Oct: "Why just repeat my answer back to me?"): the option stays lit on the card; here is what it adds. */}
                  {(result.why || (attempt === 1 && !autoAnswered)) && <p className="serif">{result.why ? inline(result.why) : cheer(key)}</p>}
                  {item.recall && <p className="story-again"><span className="c9-dot" aria-hidden="true" />Got it again.</p>}
                </>
              )}
              {result.chapterPassed && !isLast ? (
                <>
                  <p className="serif">Your rung is lit. What's left is a bonus.</p>
                  <button className="btn c-go" onClick={() => { setResult(null); finish() }} disabled={finishing}><span>See your rung</span><GoArrow /></button>
                  <button type="button" className="quiet" onClick={closeSheet}>Read the bonus first</button>
                </>
              ) : <button className="btn c-go" onClick={closeSheet}><span>{isLast ? 'Finish' : nextIsWarmup ? 'Next question' : 'Turn the page'}</span><GoArrow /></button>}
            </>
          ) : (
            <>
              <p className="verdict"><Ooh face="again" size={34} /><span>{sure === 'sure' && attempt === 1 ? 'Not quite, and this one fools lots of people.' : 'Not quite.'}</span></p>
              <p className="serif">{inline(result.whyNot)}</p>
              {result.reteach && <p className="serif">{inline(result.reteach)}</p>}
              {result.reveal && <p className="serif">It's <strong>{result.reveal.text}</strong></p>}
              <button className="btn c-go" onClick={closeSheet}><span>{result.reveal ? 'Got it' : 'Try again'}</span><GoArrow /></button>
            </>
          )}
                </div>
              )}
              {!picked && !pending && !result && !unsure && !exercisePassed && !missed.length && <p className="c7-fresh">No timer. Take your time.</p>}
              {exercisePassed && !result && <p className="story-hint">{passedChoice[key] || item.recall ? 'Tap to keep going' : "You answered this one before. Tap to keep going."}</p>}
            </>
          ) : c.type === 'move' ? (
            <MoveFrame card={c} />
          ) : c.type === 'steps' ? (
            <StepsFrame card={c} />
          ) : c.type === 'tryit' ? (
            <TryItFrame card={c} done={logged.has(item.cardIndex)} onDone={async () => { if (!onLog) return; const r = await onLog(item, 1, 'right'); setLogged((s) => new Set(s).add(item.cardIndex)); if (r.chapterPassed) track('set_passed', { n }) }} />
          ) : c.type === 'doit' ? (
            <DoIt card={c} last={isLast} logged={logged.has(item.cardIndex)} onLater={() => { setLater((s) => new Set(s).add(item.cardIndex)); next() }}
              onLog={async (count, feel) => { if (!onLog) return; const r = await onLog(item, count, feel); setLogged((s) => new Set(s).add(item.cardIndex)); if (r.chapterPassed) track('set_passed', { n }) }} />
          ) : c.type === 'watch' ? (
            <>
              <p className="story-kicker">Watch · {c.minutes ? `${c.minutes} min` : 'a few minutes'}</p>
              <p className="story-big">{c.who}</p>
              <p className="story-sub">{c.what}{c.from ? ` · from ${c.from}` : ''}</p>
              {/* A link off the allow-list became "#", which opened a second copy of the app (UX review 9 Oct): no link then. */}
              {safeUrl(c.url) !== '#' ? <a className="story-watch no-tap" href={safeUrl(c.url)} target="_blank" rel="noopener noreferrer">Open the talk →</a>
                : <p className="story-sub">Search for it by name; the link couldn't be checked.</p>}
              <p className="story-text size-md" style={{ marginTop: 20 }}><strong>Watch for:</strong> {c.watchFor}</p>
            </>
          ) : (
            <>
              {frame.cover && <h1 className="story-title">{title}</h1>}
              {/* On the first frame of the chapter, whatever card it is (UX review 9 Oct: it showed only on a picture card). */}
              {i === firstChapterFrame && caution && <p className="story-caution">Study aid, verify before you act.</p>}
              {/* C6 (the board, 15 Oct): each page opens on its idea as a headline, then its picture, then the words. A story,
                  a mistake or a dare keeps its small label over the headline. With Ask open (C8) the picture steps aside. */}
              {!frame.cover && frame.part === 0 && KICKER[c.type] && <p className="story-kicker">{KICKER[c.type]}</p>}
              {!frame.cover && frame.part === 0 && c.title && !(item.recall && c.title === 'Last time') && <h2 className="story-idea">{inline(c.title)}</h2>}
              {fig && !askOpen && <Figure spec={fig} />}
              {pic && !askOpen ? <div className={`story-pic${credits[item.cardIndex] ? ' real' : ''}`}><img src={pic} alt={alts[item.cardIndex] ?? ''} onLoad={(e) => e.currentTarget.parentElement?.classList.add('loaded')} ref={(el) => { if (el && el.complete && el.naturalWidth > 0) el.parentElement?.classList.add('loaded') }} />{credits[item.cardIndex] && <a className="story-credit no-tap" href={credits[item.cardIndex].source || undefined} target="_blank" rel="noopener noreferrer">Photo: {credits[item.cardIndex].credit}</a>}</div>
                : null /* no picture yet, or none: no box at all; the picture fades in when it lands */}
              <Rich lively text={frame.text ?? ''} className={`story-text size-${frame.cover || pic || (!frame.cover && frame.part === 0 && c.title) ? (pic && !frame.cover && sizeOf(frame.text ?? '') === 'xl' ? 'lg' : 'md') : sizeOf(frame.text ?? '')}`} />
              {/* C8 "Keep it here": an answer the reader kept stays under its page's words. */}
              {!askOpen && !item.recall && frame.part === frame.parts - 1 && kept.filter((k) => k.cardIndex === item.cardIndex).map((k) => (
                <div key={String(k._id)} className="story-kept c8">
                  <p className="ask-label">You asked</p>
                  <p className="ask-q">{k.question}</p>
                  <p className="ask-a"><Ooh size={26} /><span>{inline(k.answer)}</span></p>
                </div>
              ))}
              {isLast && (
                <>{/* The last page (20 Oct): Ooh lands with smiling eyes above the button */}<span className="story-end-ooh" aria-hidden="true"><Ooh face="getit" size={48} /></span>
                <button type="button" className="story-finish no-tap" onClick={finish} disabled={finishing}>{finishing ? 'Saving…' : `Finish chapter ${n}`}</button></>
              )}
            </>
          )}
          {/* The last frame can be a quiz, a rep counter, a checklist or steps (UX review 9 Oct, #8: Pool swimming's ended on
              a counter with no way to finish but a swipe). Text cards carry their own Finish above. */}
          {isLast && canAdvance && !['picture', 'example', 'mistake', 'try', 'teach'].includes(c.type) && (
            <button type="button" className="story-finish no-tap" onClick={finish} disabled={finishing}>{finishing ? 'Saving…' : `Finish chapter ${n}`}</button>
          )}
          {error && <p className="story-error no-tap">{error}</p>}
          {askOpen && <div className="no-tap story-ask"><AskThread handbookId={handbookId} chapter={item.chapter} cardIndex={item.cardIndex} deviceToken={deviceToken} /></div>}
        </div>

        {/* Offline, a tapped answer or Finish waited 20+ s in silence (UX review 9 Oct, #18); they go through on reconnect. */}
        {!online && <p className="story-offline no-tap" role="status">Offline. What you do here saves when you're back online.</p>}
        {askOpen ? (
          <div className="story-tools story-askbar no-tap"><AskBox handbookId={handbookId} chapter={item.chapter} cardIndex={item.cardIndex} deviceToken={deviceToken} autoFocus /></div>
        ) : (c.type !== 'exercise' || (canAdvance && !result && !isLast)) && (
        <div className="story-tools no-tap">
          <div className="story-tools-left">
            {c.type !== 'exercise' && <span className="story-left">{pagesLeft === 0 ? 'Last page' : `${pagesLeft} ${pagesLeft === 1 ? 'page' : 'pages'} left`}</span>}
            {c.type !== 'exercise' && !auto && <button type="button" className="story-read" aria-pressed={speaking} onClick={readAloud}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z" /><path d="M16.5 8.5a5 5 0 0 1 0 7" /></svg>
              {speaking ? 'Stop reading' : 'Read it to me'}</button>}
            {c.type !== 'exercise' && <button type="button" className="story-auto" aria-pressed={auto} onClick={toggleAuto}>
              {auto ? <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1.5" /><rect x="14" y="5" width="4" height="14" rx="1.5" /></svg>
                : <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4.5v15l13-7.5z" /></svg>}
              {auto ? 'Auto-play on' : 'Auto-play'}</button>}
          </div>
          {/* A real button (UX review #17, 8 Oct): the move and do-it frames are full of things to tap, so "next" needs a target of its own; keyboard and screen readers get one too. */}
          {/* While an answer shows, its own button is the one way on (C7); a check shows no tools until it's passed. */}
          {result || !canAdvance || isLast ? null : (
            <div className="story-turns">
              {i > 0 && <button type="button" className="story-back" onClick={back} aria-label="Back a page"><span aria-hidden="true">←</span></button>}
              <button type="button" className="story-next" onClick={next}>Next <span aria-hidden="true">→</span></button>
            </div>
          )}   {/* the last frame has its own Finish button; one finisher (second critique). */}
        </div>
        )}
      </div>

    </div>
  )
}

// The closing "In one breath" card moves to the start of the next chapter as "Last time" (7 Oct).
function isBreath(c: Card) {
  return !['exercise', 'watch', 'move', 'doit', 'steps', 'tryit'].includes(c.type) && /^in one breath$/i.test(((c as any).title ?? '').trim())
}
// Its last line teased this chapter ("Next: ..."); as a recap it isn't needed.
function dropNextLine(body: string) {
  return body.replace(/\n*\s*Next:[^\n]*$/i, '').trim()
}
