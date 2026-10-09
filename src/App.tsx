import { useEffect, useMemo, useRef, useState } from 'react'
import { useAction, useConvexAuth, useMutation, useQuery } from 'convex/react'
import { useAuthActions } from '@convex-dev/auth/react'
import { api } from '../convex/_generated/api'
import { deviceToken, freshDevice } from './lib/device'
import { track } from './lib/track'
import Start from './screens/Start'
import Plan from './screens/Plan'
import Chapter, { type AnswerResult, type Card } from './screens/Chapter'
import Done from './screens/Done'
import SignIn from './screens/SignIn'
import Tune from './screens/Tune'
import Compare from './screens/Compare'
import Library from './screens/Library'
import { PolicyLinks } from './screens/Policy'
import { isMemberLimit, limitCode, limitMessage } from './lib/limits'
import NextTopics from './components/NextTopics'
import Sheet from './components/Sheet'
import Pricing from './screens/Pricing'
import Landing from './screens/Landing'
import Shelf from './screens/Shelf'
import WhatsNext from './components/WhatsNext'
import SignupNudge from './components/SignupNudge'
import { ShelfButton } from './components/ShelfStrip'
import { nameOf, isId } from './lib/name'

type View = 'auto' | 'plan' | 'chapter' | 'done' | 'signin' | 'start-again' | 'tune' | 'compare' | 'library' | 'pricing' | 'explore'

export default function App() {
  const token = useMemo(() => deviceToken(), [])
  const { isAuthenticated } = useConvexAuth()
  const { signOut } = useAuthActions()
  // A saved id that isn't a real one (a hand-edited or damaged value) crashed every page until the site data was cleared
  // (UX review 9 Oct, #19): it is ignored instead.
  const [pinned, setPinned] = useState<string | null>(() => { try { const s = localStorage.getItem('igetit.active'); return isId(s) ? s : null } catch { return null } })
  const pin = (id: string | null) => { setPinned(id); try { if (id) localStorage.setItem('igetit.active', id); else localStorage.removeItem('igetit.active') } catch {} }
  const data = useQuery(api.handbooks.current, pinned ? { deviceToken: token, handbookId: pinned as any } : { deviceToken: token })
  const lib = useQuery(api.handbooks.library, { deviceToken: token })
  const plansData = useQuery(api.pricing.plans, { deviceToken: token })
  const ms = useQuery(api.membership.status, { deviceToken: token })
  const isMember = !!ms?.member
  // Chapters a visitor reads before the free account (D26, 9 Oct: 2). The server enforces it (membership.ts tryOpen); the
  // screens only read it, so the number lives in one place.
  const freeChapters: number = (ms as any)?.limits?.visitorChapters ?? 2
  const lockPrice = useMutation(api.pricing.lockPrice)
  const payOrder = useAction(api.payments.order)
  const payConfirm = useAction(api.payments.confirm)
  const [afterSignIn, setAfterSignIn] = useState<View>('done')
  // The early-bird price, said once on the wall after chapter 1 as information (Shaktimaan, 8 Oct); true for our model:
  // a free account opens every chapter of every ready handbook, and paying buys more handbooks of your own.
  const openTier = (plansData as any)?.tiers?.find((t: any) => t.open) ?? (plansData as any)?.tiers?.slice(-1)[0]
  const priceLine = openTier ? `Paying is only for more handbooks of your own: from ₹${Number(openTier.month).toLocaleString('en-IN')} a month early-bird, paid once, nothing auto-renews.` : null
  const [flash, setFlash] = useState<string | null>(null)
  const readyTopics = useQuery(api.handbooks.cachedTopics, {})
  const examples = readyTopics ?? []
  const create = useMutation(api.handbooks.create)
  const answerQuestion = useMutation(api.handbooks.answerQuestion)
  const retry = useMutation(api.handbooks.retry)
  const setPosition = useMutation(api.handbooks.setPosition)
  const recordAnswer = useMutation(api.handbooks.recordAnswer)
  const finishChapter = useMutation(api.handbooks.finishChapter)
  const rateChapter = useMutation(api.handbooks.rateChapter)
  const chooseIntent = useMutation(api.handbooks.chooseIntent)
  const startFromLibrary = useMutation(api.library.start)
  const setTomorrow = useMutation(api.handbooks.setTomorrow)
  const attachToMe = useMutation(api.handbooks.attachToMe)
  const saveProfile = useMutation(api.handbooks.saveProfile)
  const removeHandbook = useMutation(api.handbooks.remove)
  const takeSuggested = useMutation(api.handbooks.takeSuggested)
  const refreshIfStale = useMutation(api.handbooks.refreshIfStale)
  const compareModels = useMutation(api.handbooks.compareModels)
  const voteModel = useMutation(api.handbooks.voteModel)
  const syncFromCache = useMutation(api.handbooks.syncFromCache)
  const profile = useQuery(api.handbooks.myProfile, { deviceToken: token })

  // /pricing (8 Oct night) and /shelf (UX review 9 Oct: the Shelf could not be linked to from a post) are real addresses.
  const [view, setView] = useState<View>(() => { const p = window.location.pathname.replace(/\/+$/, ''); return p === '/pricing' ? 'pricing' : p === '/shelf' ? 'explore' : 'auto' })
  // The phone's Back button (9 Oct, 55's phone review): one Back used to leave the site from inside a chapter. Each
  // screen change pushes a history entry; Back restores the previous screen; a chapter closes to the handbook.
  const poppingRef = useRef(false)
  const hasHbRef = useRef(false)   // whether a handbook is open, for the Back handler above (set each render below)
  useEffect(() => {
    if (poppingRef.current) { poppingRef.current = false; return }
    if (window.history.state?.view === view) return
    // Pricing and the Shelf carry their own address, so a reload or a shared link lands there; every other screen is /.
    // (Arriving at /pricing used to keep that address for the whole visit, so any reload reopened Pricing.)
    const want = view === 'pricing' ? '/pricing' : view === 'explore' ? '/shelf' : '/'
    const here = window.location.pathname.replace(/\/+$/, '') || '/'
    const url = here !== want ? want + window.location.search : undefined
    if (window.history.state?.view === undefined) window.history.replaceState({ view }, '', url)
    else window.history.pushState({ view }, '', url)
  }, [view])
  useEffect(() => {
    // Back out of a chapter lands on the handbook, never back inside the chapter: the entry before it is often 'auto'
    // (the landing), and 'auto' would resolve to the chapter again mid-read (9 Oct, dev check).
    const onPop = (e: PopStateEvent) => { poppingRef.current = true; const v = e.state?.view as View | undefined; setView(v === 'chapter' || ((v === 'auto' || !v) && hasHbRef.current) ? 'plan' : v ?? 'auto') }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])
  const [doneN, setDoneN] = useState<number | null>(null)
  // The chapter on screen stays on screen when its last quiz passes it and the server moves the reader on (6 Oct).
  const [readingN, setReadingN] = useState<number | null>(null)
  const [doneStats, setDoneStats] = useState<{ minutes: number; right: number; total: number } | null>(null)
  const [draftTopic, setDraftTopic] = useState('')
  // The writer comparison is for testers only: open the app once with ?compare=1 and this phone remembers it.
  const [tester] = useState(() => {
    try {
      if (new URLSearchParams(window.location.search).get('compare') === '1') localStorage.setItem('igetit.tester', '1')
      return localStorage.getItem('igetit.tester') === '1'
    } catch { return false }
  })

  const hb = data?.handbook ?? null
  const progress = hb?.progress ?? null
  const currentN = progress?.currentChapter ?? 1
  const passed = progress?.chaptersPassed ?? []
  hasHbRef.current = !!hb
  const total: number = (hb as any)?.total ?? 7   // 7, or 1 to 3 for a quick handbook (7 Oct)
  // The typed line is the name everywhere (D28, 9 Oct, Prateek: "Public speaking advanced level" was showing as the
  // model's own "Advanced Rhetoric and Persuasion"). First letter capitalised for display, nothing else changed.
  const name: string = nameOf(hb?.topic)
  const chapter = hb?.chapters.find((c) => c.n === (readingN ?? currentN))
  // "Remember this?" quizzes open a chapter only when the chapter before it was read: a post link that lands on chapter 2
  // (chapter 1 unread) and a one-chapter recipe passed by its checklist got quizzes on things never read (UX review 9 Oct).
  const wantRecall = !!hb && currentN > 1 && passed.includes(currentN - 1) && progress?.currentCard === 0
  const recallLive = useQuery(api.handbooks.recallFor, wantRecall && hb ? { handbookId: hb._id, deviceToken: token } : 'skip')
  // Keep each chapter's quizzes once loaded, by chapter. The query stops when the reader leaves card 0, and it moves on
  // when the last quiz passes the chapter; dropping them mid-chapter shifted every frame (7 Oct; again 9 Oct, frames
  // skipped after the last quiz).
  const [recallKept, setRecallKept] = useState<Record<string, any[]>>({})
  useEffect(() => { if (hb && recallLive?.length) { const k = `${hb._id}:${currentN}`; setRecallKept((m) => (m[k] ? m : { ...m, [k]: recallLive })) } }, [recallLive]) // eslint-disable-line react-hooks/exhaustive-deps
  const recallFor = (n: number): any[] => (hb ? recallKept[`${hb._id}:${n}`] : undefined) ?? (n === currentN && wantRecall ? recallLive ?? [] : [])
  // A chapter not opened yet comes without its cards ("locked", membership.ts). Entering it asks the server to open
  // it, which uses today's reading allowance; if there's none left, the handbook screen says when it opens.
  const openChapter = useMutation(api.handbooks.openChapter)
  const logSet = useMutation(api.handbooks.logSet)
  const [lock, setLock] = useState<{ key: string; note: string; code: string | null } | null>(null)
  // When a chapter won't open, go straight to what unblocks it (7 Oct, Prateek): the 3 free chapters are used, so the
  // free account; today's chapters are used, so membership (a free account has the same 3 a day). A member at 7 a day
  // just sees the note.
  const [signinReason, setSigninReason] = useState<string | null>(null)
  const [pricingNotice, setPricingNotice] = useState<string | null>(null)
  // 8 Oct (UX review #9): Explore goes back to the screen it was opened from, never into the middle of a chapter.
  const [exploreFrom, setExploreFrom] = useState<View>('auto')
  // A book tapped on the Shelf stays lifted on the Shelf while its handbook loads (8 Oct night, Prateek's animation):
  // the splash would tear the Shelf down, so the Shelf keeps rendering until the handbook query answers.
  const [hold, setHold] = useState<'explore' | 'landing' | 'library' | null>(null)
  // D29 (9 Oct): a reader mid-story on the wait screen is not pulled away when the handbook is ready; a button appears above
  // the story instead. Set when they swipe or ask for the next story; cleared when they tap through or the handbook changes.
  const [waitHold, setWaitHold] = useState(false)
  // Declined the wall tonight (second critique): the plan then offers chapter 1 again and the Shelf, not the same ask twice.
  const [wallDeclined, setWallDeclined] = useState(() => { try { return sessionStorage.getItem('igetit.wall-declined') === '1' } catch { return false } })
  const declineWall = () => { setWallDeclined(true); try { sessionStorage.setItem('igetit.wall-declined', '1') } catch {} }
  const goExplore = () => { setExploreFrom(view === 'auto' || view === 'explore' ? (hb ? 'plan' : 'auto') : view); setView('explore') }
  // Declared before any early return (UX review 9 Oct, #1): Your handbooks returns early, and its "Make a free account"
  // called this before it existed, which threw and did nothing.
  const signIn = (back: View) => { setAfterSignIn(back); setView('signin') }
  // Pricing goes back to where it was opened from, never always to the handbook page (UX review 9 Oct).
  const [pricingFrom, setPricingFrom] = useState<View>('auto')
  const goPricing = () => { if (view !== 'pricing') setPricingFrom(view); setView('pricing') }
  // Month or year survives the sign-in, and the payment sheet opens right after it, as the sign-in screen promises.
  const [payPlan, setPayPlan] = useState<'month' | 'year'>('month')
  const [payAfterSignIn, setPayAfterSignIn] = useState(false)
  // A chapter ahead on the path opens a short preview (Prateek, 9 Oct: "the chapters in the path don't seem clickable").
  const [previewN, setPreviewN] = useState<number | null>(null)
  // A shared link that no longer opens says so on the Shelf instead of landing there silently.
  const [shelfNotice, setShelfNotice] = useState<string | null>(null)
  // "Not what you meant? Change what you typed" replaces the unread handbook it came from (a typo used to cost a free
  // reader their one typed handbook: UX review 9 Oct, #9). "Start another topic" never replaces anything.
  const [replacing, setReplacing] = useState<string | null>(null)
  const startAnother = () => { setReplacing(null); setDraftTopic(''); setView('start-again') }
  const routeLock = (code: string | null, note: string) => {
    if (code === 'signup-more') { setSigninReason(`To open chapter ${chapter?.n ?? currentN} of ${name || 'this handbook'}. Everything you've read stays on this phone whatever you choose.`); setAfterSignIn('chapter'); setView('signin'); return true }   // the same words as the wall (8 Oct night); `note` is kept for the plan's lock card
    if (code === 'daily-free') { setPricingNotice(note); goPricing(); return true }
    return false
  }
  const chapterLocked = chapter?.status === 'ready' && !!(chapter as any).locked
  // Signing up opens what a visitor couldn't, once the handbook is attached to the account (signedIn), so the key
  // includes it and the open is tried again then.
  const lockKey = hb && chapter ? `${hb._id}:${chapter.n}:${(hb as any).signedIn ? 'in' : 'out'}` : ''
  const wantsChapter = view === 'chapter' || (view === 'auto' && (progress?.currentCard ?? 0) > 0)
  useEffect(() => {
    if (!wantsChapter || !chapterLocked || !hb || !chapter || lock?.key === lockKey) return
    openChapter({ handbookId: hb._id, n: chapter.n, deviceToken: token })
      .catch((e) => { const code = limitCode(e), note = limitMessage(e) ?? "Couldn't open this chapter just now. Try again in a minute."; setLock({ key: lockKey, code, note }); routeLock(code, note) })
  }, [wantsChapter, chapterLocked, lockKey]) // eslint-disable-line react-hooks/exhaustive-deps

  // First time in a handbook (7 Oct: 11 of 30 readers saw their plan and never opened chapter 1): go straight into
  // chapter 1 when it's ready; the plan is one tap away (the chapter's close button). Once per handbook per visit, and
  // only on the way in: a typed topic whose chapter 1 is still being written shows the plan, as before.
  const autoEntered = useRef<string | null>(null)
  const ch1Status = hb?.chapters.find((c) => c.n === 1)?.status
  // "Holdable": a fresh handbook about to open chapter 1 by itself. The Shelf or the landing page stays up, with the
  // lifted book, through the load and this one render, so the reader never sees the splash or a flash of the plan.
  // (view 'chapter' with no cards yet is the half-second while chapter 1's cards are fetched; the plan would flash there.)
  // The chapter a sign-in would open: from the wall (doneN + 1) or from the plan's lock (the chapter on screen).
  const lockedN = doneN && doneN < total ? doneN + 1 : afterSignIn === 'chapter' ? (chapter?.n ?? currentN) : null
  const holdable = hb?.status === 'ready' && ch1Status === 'ready' && passed.length === 0 && (progress?.currentCard ?? 0) === 0 && (view === 'auto' || (view === 'chapter' && !(chapter?.status === 'ready' && Array.isArray(chapter.cards))))
  useEffect(() => { if (hold && hb && view !== 'explore' && view !== 'library' && !holdable) setHold(null) }, [hold, hb, view, holdable])
  useEffect(() => { setWaitHold(false) }, [hb?._id])
  useEffect(() => {
    if (!hb || hb.status !== 'ready' || autoEntered.current === hb._id || view !== 'auto') return
    const fresh = passed.length === 0 && currentN === 1 && (progress?.currentCard ?? 0) === 0
    if (!fresh) { autoEntered.current = hb._id; return }   // not a first open: never enter by itself
    if (ch1Status !== 'ready') return                        // still being written: try again when it is (9 Oct, 55's review)
    autoEntered.current = hb._id; setReadingN(1); setView('chapter')
  }, [hb?._id, hb?.status, ch1Status, view]) // eslint-disable-line react-hooks/exhaustive-deps

  // A link from a post (?t=public-speaking&ch=2, 7 Oct) opens that ready topic straight away, at that chapter,
  // so a reader who just read chapter 1 on Instagram doesn't land on the landing page. Ready topics only: a link
  // never starts a paid generation. A topic already on this phone opens where they left off.
  // A link to one shared handbook (?l=<library id>, D25, 9 Oct, Prateek: "everything right now"): same start as a tap
  // on the Shelf (api.library.start), straight into chapter 1 with the book lifting, no landing page. A handbook already
  // on this phone opens where it was. A bad or unpublished id lands on the Shelf, with nothing to apologise for.
  const [deepLink, setDeepLink] = useState<{ t: string; ch: number; l?: undefined } | { l: string; t?: undefined; ch?: undefined } | null>(() => {
    const q = new URLSearchParams(window.location.search)
    const t = q.get('t'), ch = Number(q.get('ch') ?? 1), l = q.get('l')
    if (l && /^[a-z0-9]{20,40}$/.test(l)) return { l }
    return t ? { t: t.toLowerCase(), ch: Number.isInteger(ch) && ch >= 1 && ch <= 7 ? ch : 1 } : null
  })
  // The book to lift while a ?l= link opens: its title and cover from the Shelf's own list (one query, only on a link).
  const linkShelf = useQuery(api.library.explore, deepLink?.l ? {} : 'skip') as { kind: string; id?: string; key: string; topic: string; cover: string | null }[] | undefined
  const linkBook = deepLink?.l ? linkShelf?.find((x) => x.kind === 'shared' && x.id === deepLink.l) ?? null : null
  // Coming back (8 Oct, Prateek: "stop opening up the handbooks the first thing when a user comes back"): a reader who
  // already has handbooks lands on Your handbooks, one tap from where they left off, never inside a chapter. A first
  // visit still goes straight into chapter 1, and a post link still opens its topic.
  const landed = useRef(false)
  useEffect(() => {
    if (landed.current || lib === undefined || deepLink) return
    landed.current = true
    // A brand-new phone has nothing to come back to: its first handbook is the one it just picked, so never send it to the shelf.
    // A reload inside a session (the pinned handbook touched in the last 30 minutes) reopens where they were (the same
    // frame); the shelf is for coming back after a real break (9 Oct, 55's phone review).
    const pinnedRow = (lib.handbooks ?? []).find((h: any) => String(h._id) === pinned)
    const recent = !!pinnedRow && Date.now() - (pinnedRow as any).lastAt < 30 * 60 * 1000
    if (!freshDevice && !recent && (lib.handbooks?.length ?? 0) > 0 && view === 'auto') { autoEntered.current = hb?._id ?? null; setView('library') }
  }, [lib]) // eslint-disable-line react-hooks/exhaustive-deps
  const linkStarted = useRef(false)
  useEffect(() => {
    if (!deepLink || linkStarted.current) return
    if (deepLink.l) {
      linkStarted.current = true
      landed.current = true   // a link arrival never bounces to Your handbooks
      ;(async () => {
        const r = await startFromLibrary({ libraryId: deepLink.l as any, deviceToken: token })
        track('submit', { via: 'link-shared', topic: deepLink.l })
        pin(String(r.handbookId)); setView('auto')
      })().catch(() => { setShelfNotice("That shared handbook isn't on the Shelf any more. Here's everything that is."); setView('explore') }).finally(() => setDeepLink(null))
      return
    }
    if (readyTopics === undefined) return
    linkStarted.current = true
    const ch = deepLink.ch ?? 1
    const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    const topic = readyTopics.find((x) => slug(x) === deepLink.t)
    const finish = () => setDeepLink(null)
    if (!topic) { finish(); return }
    ;(async () => {
      const r = await create({ topic, level: 'new', voice: 'friend', deviceToken: token })
      if (!r.existing && ch > 1) await setPosition({ handbookId: r.handbookId, chapter: ch, cardIndex: 0, deviceToken: token })
      track('submit', { via: 'link', topic: topic.slice(0, 60) })
      pin(String(r.handbookId))
      if (!r.existing && ch > 1) { setReadingN(ch); setView('chapter') } else setView('auto')
    })().catch(() => {}).finally(finish)
  }, [deepLink, readyTopics]) // eslint-disable-line react-hooks/exhaustive-deps

  // After sign-in, the anonymous night attaches to the person.
  // Merge runs only once the sign-in has reached the server (calling it straight after signIn races the new token).
  // What to do once the attach has finished (8 Oct night): the wall used to open chapter 2 the instant sign-in
  // resolved, before the handbook belonged to the account, so the server refused it and the sign-in screen came back.
  const attachedRef = useRef(false)
  const afterAttachRef = useRef<(() => void) | null>(null)
  // Returns a promise so the sign-in screen can keep saying "Signing you in…" until the chapter actually opens.
  const afterSignedIn = (go: () => void) => new Promise<void>((done) => {
    const run = () => { go(); done() }
    if (attachedRef.current) { run(); return }
    afterAttachRef.current = run
    window.setTimeout(() => { if (afterAttachRef.current === run) { afterAttachRef.current = null; run() } }, 8000)   // never strand them
  })
  useEffect(() => {
    if (!isAuthenticated) { attachedRef.current = false; return }
    attachToMe({ deviceToken: token })
      .finally(() => { attachedRef.current = true; const go = afterAttachRef.current; afterAttachRef.current = null; go?.() })
      .then((r) => { if (r && (r.attached > 0 || r.hidden > 0)) setFlash(`Signed in. ${r.attached} handbook${r.attached === 1 ? '' : 's'} from this device ${r.attached === 1 ? 'is' : 'are'} now in your account, with your settings.${r.hidden ? ' A topic you had on another device too now shows once, the copy with more progress.' : ''}`) })
      .catch(() => {})
  }, [isAuthenticated, attachToMe, token])
  useEffect(() => { window.scrollTo({ top: 0 }) }, [view, hb?._id])
  useEffect(() => { if (view !== 'auto' && view !== 'plan') setFlash(null) }, [view])
  useEffect(() => { if (view !== 'chapter') setReadingN(null) }, [view])
  // Pick up newer cached chapters for anything not started yet (the cache improves over the sprint).
  useEffect(() => { if (hb?._id && hb.status === 'ready') syncFromCache({ handbookId: hb._id, deviceToken: token }).catch(() => {}) }, [hb?._id, hb?.status, syncFromCache, token])

  // The Shelf marks the handbooks this reader already has, and how far they got (UX review 9 Oct). Copy (agent).
  const haveMap: Record<string, string> = {}
  for (const r of (lib?.handbooks ?? []) as any[]) {
    const k = String(r.topic ?? '').trim().toLowerCase()
    if (!k || haveMap[k]) continue
    haveMap[k] = r.passed >= (r.total ?? 7) ? 'You finished it' : r.passed > 0 || (r.card ?? 0) > 0 ? `You're on chapter ${r.current}` : 'In your handbooks'
  }
  // Explore: ready topics and the ones other readers started (6 Oct).
  if (view === 'explore' || (hold === 'explore' && (data === undefined || holdable))) {
    return (
      <Shell hideShelf>
        <Shelf onBack={() => { setShelfNotice(null); setView(exploreFrom) }} notice={shelfNotice} have={haveMap}
          onReady={async (topic) => { setHold('explore'); const r = await create({ topic, level: 'new', voice: 'friend', deviceToken: token }); pin(String(r.handbookId)); setView('auto') }}
          onShared={async (id) => { setHold('explore'); const r = await startFromLibrary({ libraryId: id, deviceToken: token }); pin(String(r.handbookId)); setView('auto') }} />
      </Shell>
    )
  }

  // A first-time visitor's pick stays on the landing page, with the card lifted, until its handbook is ready (8 Oct night).
  if ((hold === 'landing' || (freshDevice && !pinned && view === 'auto')) && !deepLink && (data === undefined || holdable))    return <Landing freeChapters={freeChapters} allowance={ms ? { member: !!ms.member, used: ms.typed.used, limit: ms.typed.limit, superAdmin: !!ms.superAdmin } : null} onExplore={() => setView('explore')} onCreate={async (topic, level, voice) => { setHold('landing'); setDraftTopic(topic); const r = await create({ topic, level, voice, deviceToken: token }); pin(String(r.handbookId)); setFlash((r as any).restored ? 'Brought back from the ones you removed, where you left off.' : r.existing ? 'You already have this handbook, so we opened it where you left off. Each topic lives in one handbook.' : null); setView('auto') }} />
  const libRows = lib?.handbooks ?? []
  // Your handbooks stays up while a tapped handbook loads (no splash), like the Shelf.
  if (view === 'library' || (hold === 'library' && data === undefined)) {
    return (
      <Shell back={hb ? { label: 'Handbook', onClick: () => setView('plan') } : undefined}>
        <Library rows={libRows as any} signedIn={!!lib?.signedIn} isMember={isMember} freeChapters={freeChapters} activeId={hb?._id} onOpen={(id) => { setHold('library'); pin(id); setDoneN(null); setView('plan') }}
          onContinue={(id) => { setHold('library'); pin(id); setDoneN(null); setReadingN(null); setView('chapter') }}
          onRemove={async (id) => { await removeHandbook({ handbookId: id as any, deviceToken: token }); if (pinned === id) { pin(null); setDoneN(null) } }}
          onNew={startAnother} onSignIn={() => signIn('library')} onPlans={goPricing} onExplore={goExplore} />
      </Shell>
    )
  }
  if (deepLink?.l) return <LinkOpening book={linkBook} />
  if (data === undefined || deepLink) return <Shell><div className="splash">Opening your handbook…</div></Shell>

  // Open a topic by name: a ready one opens at once; a typed one is written. Past the free typed-topic limit, the
  // payment page opens with the reason (7 Oct, Prateek: a signed-up reader's next step is membership).
  const openTopic = async (t: string) => {
    try { const r = await create({ topic: t, level: 'new', voice: 'friend', deviceToken: token }); pin(String(r.handbookId)); setDoneN(null); setView('auto') }
    catch (e) { if (isMemberLimit(e)) { setPricingNotice(limitMessage(e)); goPricing() } else throw e }
  }
  // Home is your shelf when you have handbooks; a first-time visitor's home is the landing page.
  goHome = () => { setDoneN(null); if (libRows.length) setView('library'); else { setView('auto'); window.scrollTo({ top: 0 }) } }
  goShelf = () => { setDoneN(null); goExplore() }
  const backFromPricing = () => {
    setPricingNotice(null); setPayAfterSignIn(false)
    setView(['auto', 'pricing', 'signin'].includes(pricingFrom) || (pricingFrom === 'done' && !doneN) ? (hb ? 'plan' : 'library') : pricingFrom)
  }
  const signInToPay = () => { setPayAfterSignIn(true); setSigninReason('Sign in first; the payment sheet opens right after. Nothing is charged until you approve it there.'); signIn('pricing') }

  // Library and pricing can be reached from anywhere, with or without a current handbook.
  if (view === 'pricing') {
    return (
      <Shell back={{ label: 'Back', onClick: backFromPricing }}>
        <Pricing notice={pricingNotice} plans={plansData as any} fromDone={doneN === total} plan={payPlan} onPlan={setPayPlan} autoPay={payAfterSignIn && isAuthenticated} onAutoPay={() => setPayAfterSignIn(false)} onLock={async () => lockPrice({ deviceToken: token, handbookId: hb?._id })} onOrder={(plan) => payOrder({ plan })} onConfirm={(r) => payConfirm({ orderId: r.razorpay_order_id, paymentId: r.razorpay_payment_id, signature: r.razorpay_signature })} onBack={backFromPricing} onSignIn={signInToPay} />
      </Shell>
    )
  }


  // A first-time visitor (nothing on this phone): the landing page, which has its own box.
  // Sign-in with no handbook yet (UX review #46, 8 Oct): "Sign in to pay" from Pricing used to fall into the Start screen.
  if (!hb && view === 'signin') {
    return (
      <Shell back={{ label: 'Back', onClick: () => { if (afterSignIn === 'pricing') setPayAfterSignIn(false); setView(afterSignIn) } }}>
        <SignIn reason={signinReason} heading={afterSignIn === 'pricing' ? 'Sign in, then pay.' : undefined} onDone={async () => afterSignedIn(() => { setSigninReason(null); setView(afterSignIn === 'done' ? 'library' : afterSignIn) })} onBack={() => { setSigninReason(null); if (afterSignIn === 'pricing') setPayAfterSignIn(false); if (afterSignIn === 'done') { declineWall(); setDoneN(null); setView('plan') } else setView(afterSignIn) }} />
      </Shell>
    )
  }
  if (!hb && view !== 'start-again' && libRows.length === 0 && lib !== undefined) {
    return <Landing freeChapters={freeChapters} allowance={ms ? { member: !!ms.member, used: ms.typed.used, limit: ms.typed.limit, superAdmin: !!ms.superAdmin } : null} onExplore={() => setView('explore')} onCreate={async (topic, level, voice) => { setHold('landing'); setDraftTopic(topic); const r = await create({ topic, level, voice, deviceToken: token }); pin(String(r.handbookId)); setFlash((r as any).restored ? 'Brought back from the ones you removed, where you left off.' : r.existing ? 'You already have this handbook, so we opened it where you left off. Each topic lives in one handbook.' : null); setView('auto') }} />
  }

  // No handbook yet, or the person wants a different line: the first screen.
  const waitHeld = waitHold && !!hb && hb.status === 'ready' && passed.length === 0 && (view === 'auto' || view === 'chapter')
  // A handbook waiting for its goal used to catch "Sign in to pay" too and show the goal question (UX review 9 Oct).
  if (!hb || (view !== 'signin' && (view === 'start-again' || (hb.status as string) === 'intent' || hb.status === 'planning' || waitHeld || hb.status === 'question' || hb.status === 'failed' || (hb.status as string) === 'declined'))) {
    const status = !hb || view === 'start-again' ? 'idle' : (hb.status as string) === 'intent' ? 'intent' : hb.status === 'planning' || waitHeld ? 'writing' : hb.status === 'question' ? 'question' : (hb.status as string) === 'declined' ? 'declined' : 'failed'
    // 8 Oct (UX review #5, #7): the box starts empty, and a reader with handbooks can always go back to them. Only when
    // there is another handbook to go back to: a first visitor's new handbook is the only one (UX review 9 Oct).
    const others = libRows.some((r: any) => String(r._id) !== String(hb?._id ?? ''))
    // "Change what you typed" can be taken back: the handbook it came from is one tap away (UX review 9 Oct).
    const backToBooks = view === 'start-again' && replacing && hb?.status === 'ready' ? { label: 'Handbook', onClick: () => { setReplacing(null); setView('plan') } }
      : others && (view === 'start-again' || ['failed', 'declined', 'writing', 'question', 'intent'].includes(status)) ? { label: 'Your handbooks', onClick: () => setView('library') } : undefined
    return (
      <Shell back={backToBooks}>
        {view === 'start-again' && libRows.length > 0 && !lib?.signedIn && <SignupNudge onSignIn={() => signIn('start-again')} context="second-topic" compact freeChapters={freeChapters} />}
        <Start
          chapterOneReady={ch1Status === 'ready'}
          phase={(hb as any)?.phase ?? (hb?.status === 'ready' ? 'chapter' : null)}
          startedAt={(hb as any)?.startedAt}
          goal={(hb as any)?.goal ?? null}
          onPricing={goPricing}
          onPickReady={view === 'start-again' ? openTopic : undefined}
          onExplore={goExplore}
          key={hb?._id ?? 'new'}
          initialTopic={view === 'start-again' ? draftTopic : (hb?.topic ?? '')}
          status={status as any}
          question={hb?.question}
          intents={(hb as any)?.intents ?? null}
          suggested={(hb as any)?.suggested ?? null}
          onTakeSuggested={async () => { if (hb) await takeSuggested({ handbookId: hb._id, deviceToken: token }) }}
          onChooseIntent={async (goal, mode) => { if (hb) await chooseIntent({ handbookId: hb._id, goal, mode, deviceToken: token }) }}
          error={hb?.error}
          examples={examples}
          allowance={ms ? { member: !!ms.member, used: ms.typed.used, limit: ms.typed.limit, superAdmin: !!ms.superAdmin } : null}
          replacingName={view === 'start-again' && replacing ? nameOf(libRows.find((r: any) => String(r._id) === String(replacing))?.topic ?? hb?.topic ?? '') || null : null}
          onCreate={async (topic, level, voice) => { setDraftTopic(topic); let r; try { r = await create({ topic, level, voice, deviceToken: token, ...(view === 'start-again' && replacing ? { replaceId: replacing } : {}) } as any) } catch (e) { if (isMemberLimit(e)) { setPricingNotice(limitMessage(e)); goPricing(); return } throw e } pin(String(r.handbookId)); setFlash((r as any).restored ? 'Brought back from the ones you removed, where you left off.' : r.existing ? 'You already have this handbook, so we opened it where you left off. Each topic lives in one handbook.' : null); setView('auto') }}
          onAnswer={async (answer) => { if (hb) await answerQuestion({ handbookId: hb._id, answer, deviceToken: token }) }}
          onRetry={async () => { if (hb) await retry({ handbookId: hb._id, deviceToken: token }) }}   /* Start shows its own error */
          onAddOther={async (topic) => { await create({ topic, level: 'new', voice: 'friend', deviceToken: token }) }}
          readyToOpen={waitHeld}
          onOpenReady={() => setWaitHold(false)}
          onEngaged={() => setWaitHold(true)}
          pushback={(hb as any)?.pushback ?? undefined}
          suggestions={(hb as any)?.suggestions ?? []}
        />
      </Shell>
    )
  }

  const plan = hb.plan as any
  const toPlan = { label: 'Handbook', onClick: () => { setDoneN(null); setView('plan') } }
  const chapterReady = chapter?.status === 'ready' && (Array.isArray(chapter.cards) || chapterLocked)
  const lockNote = lock && lock.key === lockKey && chapterLocked ? lock.note : null
  // A write that died without being marked failed shows as failed after 15 minutes, so Try again appears (UX review 9 Oct).
  const chapterStuck = chapter?.status === 'writing' && Date.now() - Number((chapter as any).writingSince ?? Date.now()) > 15 * 60 * 1000
  const chapterFailed = chapter?.status === 'failed' || chapterStuck
  // The one way into the current chapter, from the plan's button, a path stop, the side list or a preview.
  const startCurrent = () => { setDoneN(null); if (lock && !lock.code && lock.key === lockKey) { setLock(null); setFlash('Trying to open it again…'); setView('plan'); return } if (lockNote && lock && routeLock(lock.code, lock.note)) return; if ((chapter as any)?.stale) { refreshIfStale({ handbookId: hb._id, n: currentN, deviceToken: token }).catch(() => {}); setView('plan'); return } setView(chapterReady ? 'chapter' : 'plan') }
  // A chapter in the list or on the path (Prateek, 9 Oct: "the chapters in the path don't seem clickable"): finished ones
  // and ones a post link skipped open to read; the current one starts; chapters ahead open a preview, one at a time.
  const tapChapter = (n: number) => {
    if (passed.includes(n) || n < currentN) { setDoneN(null); setReadingN(n); setView('chapter'); return }
    if (n === currentN) { startCurrent(); return }
    setPreviewN(n)
  }
  const rail = plan ? (
    <>
      <p className="rail-topic">{name}</p>
      <p className="rail-sub">{passed.length} of {total} chapters done</p>
      <ol>
        {plan.chapters?.map((c: any) => (
          <li key={c.n} className={passed.includes(c.n) ? 'done' : c.n === currentN ? 'now' : ''}>
            <button type="button" className="rail-ch" onClick={() => tapChapter(c.n)} aria-current={!passed.includes(c.n) && c.n === currentN ? 'step' : undefined} aria-label={`Chapter ${c.n}: ${c.title}${passed.includes(c.n) ? ', done, read it again' : c.n === currentN ? ', next' : ', a preview'}`}>
              <span className="n" aria-hidden="true">{passed.includes(c.n) ? '✓' : c.n}</span>
              <span className="t">{c.title}{!passed.includes(c.n) && c.n === currentN && <span className="rail-now">{passed.length === 0 ? 'Start here' : 'Up next'}</span>}</span>
            </button>
          </li>
        ))}
      </ol>
      <div className="rail-links">
        <button type="button" className="quiet" onClick={() => { setDoneN(null); setView('plan') }}>The handbook</button>
        <button type="button" className="quiet" onClick={() => setView('library')}>Your handbooks{libRows.length > 1 ? ` (${libRows.length})` : ''}</button>
        <button type="button" className="quiet" onClick={() => setView('tune')}>Who teaches you, and how</button>
        <button type="button" className="quiet" onClick={goPricing}>Pricing</button>
        {isMember ? <a className="quiet" href={`/print?h=${hb._id}`} target="_blank" rel="noopener">Print or save as PDF</a> : <button type="button" className="quiet" onClick={goPricing}>Print or save as PDF (members)</button>}
        <button type="button" className="quiet" onClick={startAnother}>Start another topic</button>
        <button type="button" className="quiet" onClick={goExplore}>The Shelf</button>
      </div>
    </>
  ) : undefined
  // The preview of a chapter ahead: what it holds, and why it isn't open yet. Copy (agent).
  const pv = previewN ? plan?.chapters?.[previewN - 1] : null
  const previewSheet = pv && previewN ? (
    <Sheet onClose={() => setPreviewN(null)} label={`Chapter ${previewN}: ${pv.title}`}>
      <p className="preview-kicker">Chapter {previewN} of {total}</p>
      <p className="verdict">{pv.title}</p>
      {pv.hook && <p className="serif">{pv.hook}</p>}
      {pv.outcome && <p className="serif"><strong>By the end:</strong> {pv.outcome}</p>}
      <p className="note">Opens after chapter {previewN - 1}. Chapters open one at a time, so each one builds on the last.</p>
      {chapterReady && !passed.includes(currentN) && currentN < previewN
        ? <button className="btn" onClick={() => { setPreviewN(null); startCurrent() }}>{`Start chapter ${currentN}`}</button>
        : <button className="btn btn-ghost" onClick={() => setPreviewN(null)}>Close</button>}
    </Sheet>
  ) : null

  // Which screen, when nothing has been chosen on this visit.
  const resolved: View = view === 'chapter' && lockNote ? 'plan' : view !== 'auto' ? view
    : passed.length >= total ? 'plan'
    : (progress?.currentCard ?? 0) > 0 ? 'chapter'
    : 'plan'

  if (resolved === 'tune') {
    return (
      <Shell rail={rail} back={toPlan}>
        <Tune initial={profile ?? null} onSave={async (p) => saveProfile({ deviceToken: token, ...p })} onBack={() => setView('plan')} signedIn={isAuthenticated} onSignIn={() => signIn('tune')} />
        {previewSheet}
      </Shell>
    )
  }

  if (resolved === 'compare' && chapter?.variants?.length) {
    return (
      <Shell rail={rail} back={toPlan}>
        <Compare topic={name} n={chapter.n} variants={chapter.variants as any}
          onVote={async (key) => { await voteModel({ handbookId: hb._id, n: chapter.n, key, deviceToken: token }); setView('plan') }}
          onBack={() => setView('plan')} />
      </Shell>
    )
  }

  if (resolved === 'signin') {
    return (
      // No chapter list beside a one-box form, and no ☰ (UX review 9 Oct).
      <Shell back={{ label: 'Back', onClick: () => { if (afterSignIn === 'pricing') setPayAfterSignIn(false); setView(afterSignIn) } }}>
        {/* "Want it on every device?" after a free chapter is not the wall: the next chapter is free either way, so the
            heading must not say it needs an account (UX review 9 Oct, #5). Copy (agent). */}
        <SignIn reason={signinReason} heading={afterSignIn === 'pricing' ? 'Sign in, then pay.' : afterSignIn === 'done' && lockedN && lockedN <= freeChapters ? 'Keep your place on every device.' : signinReason && lockedN ? `Chapter ${lockedN} is free with an account.` : undefined} backLabel={afterSignIn === 'done' ? 'Not now, back to the handbook' : undefined} onDone={async () => afterSignedIn(() => {
          setSigninReason(null)
          // From the wall after a chapter (8 Oct night): straight on to the next chapter, which the account now opens
          // (only once the handbook is attached to the account; see afterSignedIn).
          if (afterSignIn === 'done' && doneN && doneN < total) { const next = chapterReady && chapter?.n === doneN + 1; setDoneN(null); setView(next ? 'chapter' : 'plan'); return }
          setView(afterSignIn === 'done' && !doneN ? 'plan' : afterSignIn)
        })} onBack={() => { setSigninReason(null); if (afterSignIn === 'pricing') setPayAfterSignIn(false); if (afterSignIn === 'done') { if (lockedN && lockedN > freeChapters) declineWall(); setDoneN(null); setView('plan') } else setView(afterSignIn) }} />
      </Shell>
    )
  }

  if (resolved === 'done' && doneN) {
    const ch = hb.chapters.find((c) => c.n === doneN)
    return (
      <Shell onSignOut={isAuthenticated ? signOut : undefined} rail={rail} back={toPlan}>
        <Done onShelf={goExplore}
          quick={(plan as any)?.format === 'quick'}   // 9 Oct (plan v8): a course can have fewer than 7 chapters
          total={total}
          nextPicture={firstPicture((hb.chapters.find((c) => c.n === (doneN ?? 0) + 1) as any)?.pictures)}
          topic={name}
          n={doneN}
          passed={passed}
          outcomeLine={ch?.outcomeLine ?? plan?.chapters?.[doneN - 1]?.outcome ?? ''}
          nextTitle={plan?.chapters?.[doneN]?.title}
          nextHook={plan?.chapters?.[doneN]?.hook}
          sources={plan?.sources}
          signedIn={isAuthenticated}
          tomorrowAt={progress?.tomorrowAt}
          onKeep={() => { if (doneN && doneN < total) setSigninReason(doneN + 1 > freeChapters ? `To open chapter ${doneN + 1} of ${name}. Everything you've read stays on this phone whatever you choose.` : `Keep ${name} and your place on every phone and laptop. Chapter ${doneN + 1} is free either way.`); signIn('done') }}
          freeChapters={freeChapters}
          priceLine={priceLine}
          isMember={isMember}
          onPricing={goPricing}
          onPickTime={async (at) => { await setTomorrow({ handbookId: hb._id, at, deviceToken: token }) }}
          onContinue={() => { setDoneN(null); setView('plan') }}
          stats={doneStats}
          handbookId={hb._id}
          deviceToken={token}
          adapts={hb.source === 'live' && !(hb as any).fromLibrary}
          whatsNext={<WhatsNext topic={name} deviceToken={token} onReady={async (t) => { const r = await create({ topic: t, level: 'new', voice: 'friend', deviceToken: token }); pin(String(r.handbookId)); setDoneN(null); setView('auto') }} onShared={async (id) => { const r = await startFromLibrary({ libraryId: id, deviceToken: token }); pin(String(r.handbookId)); setDoneN(null); setView('auto') }} />}
          onRate={async (rating) => { await rateChapter({ handbookId: hb._id, n: doneN, rating, deviceToken: token }) }}
          nextReady={chapterReady && chapter?.n === doneN + 1}
          nextWriting={hb.chapters.find((c) => c.n === doneN + 1)?.status === 'writing'}
          nextFailed={!!chapterFailed && chapter?.n === doneN + 1}
          onNext={() => { setDoneN(null); if (chapterFailed && chapter?.n === doneN + 1) { retry({ handbookId: hb._id, deviceToken: token }).catch(() => {}); setView('plan'); return } if (lockNote && lock && routeLock(lock.code, lock.note)) return; setView(chapterReady ? 'chapter' : 'plan') }}
        />
        {previewSheet}
      </Shell>
    )
  }

  if (resolved === 'chapter' && chapter && chapterReady && !chapterLocked) {
    return (
      <Shell onSignOut={isAuthenticated ? signOut : undefined} rail={rail}>
        <Chapter
          total={total}
          recapReteach={(chapter as any).recapReteach ?? []}
          lastTime={((hb.chapters.find((c) => c.n === chapter.n - 1)?.cards ?? []) as any[]).find((c) => c.type !== 'exercise' && /^in one breath$/i.test((c.title ?? '').trim())) ?? null}
          key={`${hb._id}-${chapter.n}`}
          topic={name}
          n={chapter.n}
          title={chapter.title ?? plan?.chapters?.[chapter.n - 1]?.title ?? `Chapter ${chapter.n}`}
          cards={chapter.cards as Card[]}
          recall={recallFor(chapter.n) as any}
          passed={passed}
          passedExercises={progress?.passedExercises ?? []}
          // The bookmark belongs to the current chapter; an earlier one opened from the path starts at its first frame.
          startAt={chapter.n === currentN ? progress?.currentCard ?? 0 : 0}
          startPart={chapter.n === currentN ? (progress as any)?.currentPart ?? 0 : 0}
          onPosition={(cardIndex, part) => { setReadingN(chapter.n); setView('chapter'); setPosition({ handbookId: hb._id, chapter: chapter.n, cardIndex, part, deviceToken: token }).catch(() => {}) }}
          onAnswer={async (item, optionId, attempt) => { setReadingN(chapter.n); setView('chapter'); return (await recordAnswer({ handbookId: hb._id, chapter: item.chapter, cardIndex: item.cardIndex, optionId, attempt, recall: !!item.recall, deviceToken: token })) as AnswerResult }}
          onFinish={async (stats) => { await finishChapter({ handbookId: hb._id, n: chapter.n, deviceToken: token }); setDoneStats(stats); setDoneN(chapter.n); setView('done') }}
          onLog={async (item, count, feel) => { setReadingN(chapter.n); setView('chapter'); return logSet({ handbookId: hb._id, chapter: item.chapter, cardIndex: item.cardIndex, count, feel, deviceToken: token }) }}
          loggedSets={(hb as any).loggedSets?.[String(chapter.n)] ?? []}
          svg={(chapter as any).svg}
          pictures={(chapter as any).pictures ?? {}}
          credits={(chapter as any).credits ?? {}}
          alts={(chapter as any).alts ?? {}}
          caution={(hb as any).caution ?? null}
          picturesPending={!!(chapter as any).picturesPending}
          onExit={() => setView('plan')}
          handbookId={hb._id}
          deviceToken={token}
        />
      </Shell>
    )
  }

  return (
    // The handbook page had no way back (Prateek, 9 Oct: "the back button seems conspicuously missing"): it goes to Your handbooks.
    <Shell onSignOut={isAuthenticated ? signOut : undefined} rail={rail} back={libRows.length > 0 ? { label: 'Your handbooks', onClick: () => setView('library') } : undefined}>
      {/* "Not now" on the wall only quiets the ask when the next chapter really needs an account (UX review 9 Oct, #4):
          before, one "Not now" made every handbook's free chapter 2 say it needed one. */}
      <Plan needsAccount={!isAuthenticated && currentN > freeChapters} {...({ declined: wallDeclined && !isAuthenticated && currentN > freeChapters, onShelf: goExplore } as any)}
        total={total}
        nextTopics={<NextTopics topic={name} deviceToken={token} extra={(plan as any)?.next ?? []} onReady={(t) => { openTopic(t).catch((e) => setFlash(limitMessage(e) ?? "Couldn't open that one. Check your connection and tap again.")) }} onTyped={(t) => { openTopic(t).catch((e) => setFlash(limitMessage(e) ?? "Couldn't open that one. Check your connection and tap again.")) }} onShared={async (id) => { const r = await startFromLibrary({ libraryId: id, deviceToken: token }); pin(String(r.handbookId)); setView('auto') }} />}
        onOpenChapter={(n) => { setReadingN(n); setDoneN(null); setView('chapter') }}
        topic={name}
        plan={plan}
        passed={passed}
        current={currentN}
        chapterReady={!!chapterReady}
        chapterFailed={!!chapterFailed} chapterError={(hb.chapters.find((c) => c.n === currentN) as any)?.error}
        lockNote={lockNote} lockHead={lock?.code?.startsWith('daily') ? 'opens after midnight, India time' : null} onPricing={goPricing} onSignUp={lock?.code === 'signup-more' ? () => signIn('chapter') : undefined}
        voiceNote={flash ? flash : (chapter as any)?.stale ? `Chapter ${currentN} gets rewritten for you first, from your last rating or how you asked to be taught. Tap start; about two minutes, fact-checked.` : hb.source === 'cache' && (hb as any).voice && (hb as any).voice !== 'friend' ? `This one was written in the friendly voice ahead of time. Your "${(hb as any).voice}" choice applies to handbooks written fresh.` : undefined}
        onStart={startCurrent}
        onTapChapter={tapChapter}
        canChangeLine={hb.source === 'live' && !(hb as any).fromLibrary && passed.length === 0 && (progress?.currentCard ?? 0) === 0}
        onTune={() => setView('tune')}
        onCompare={!tester ? undefined : () => { if (chapter?.variants?.length) { setView('compare'); return } compareModels({ handbookId: hb._id, n: currentN, deviceToken: token }).then(() => setView('compare')).catch(() => {}) }}
        comparing={!!chapter?.variants?.length && chapter.variants.some((v: any) => v.status === 'writing')}
        coverSvg={(hb.chapters.find((c) => c.n === 1) as any)?.svg}
        coverPicture={firstPicture((hb.chapters.find((c) => c.n === 1) as any)?.pictures)}
        coverPending={!!(hb.chapters.find((c) => c.n === 1) as any)?.picturesPending}
        caution={(hb as any).caution ?? null}
        onLibrary={() => setView('library')}
        libraryCount={libRows.length}
        nextUp={passed.length >= total ? null : (progress?.currentCard ?? 0) > 0 && !passed.includes(currentN) && chapter?.cards
          ? { kind: 'resume', n: currentN, card: (progress?.currentCard ?? 0) + 1, left: Math.max(1, chapter.cards.length - (progress?.currentCard ?? 0)) }
          : passed.length > 0 && !passed.includes(currentN) ? { kind: 'next', n: currentN } : null}
        whatsNext={<WhatsNext topic={name} deviceToken={token} onReady={async (t) => { const r = await create({ topic: t, level: 'new', voice: 'friend', deviceToken: token }); pin(String(r.handbookId)); setView('auto') }} onShared={async (id) => { const r = await startFromLibrary({ libraryId: id, deviceToken: token }); pin(String(r.handbookId)); setView('auto') }} />}
        onRetry={() => { setFlash(null); retry({ handbookId: hb._id, deviceToken: token }).catch((e) => setFlash(limitMessage(e) ?? "Couldn't start it again just now. Try in a minute.")) }}
        onChangeLine={() => { setReplacing(String(hb._id)); setDraftTopic(hb.topic); setView('start-again') }}
      />
      {previewSheet}
    </Shell>
  )
}

// The wordmark takes you home (7 Oct, Prateek): App sets this on every render; there is one App.
let goHome: (() => void) | null = null
let goShelf: (() => void) | null = null

// A ?l= link's first second (D25): the one book, lifted off its plank the way a Shelf tap lifts it, while the handbook
// is copied to this phone. No landing page, no splash. The cover comes from the Shelf's list when it has answered.
const CLOTHS = ['indigo', 'green', 'marigold', 'coral', 'ink']
function LinkOpening({ book }: { book: { key: string; topic: string; cover: string | null } | null }) {
  let h = 0; for (const c of book?.key ?? 'x') h = (h * 17 + c.charCodeAt(0)) >>> 0
  return (
    <div className="shelf-page lifting link-opening" aria-busy="true">
      <p className="lp-visually-hidden" role="status">Opening your handbook…</p>
      <div className="shelf-row">
        <ul className="shelf-books">
          <li className="lifting">
            <span className={`book cloth-${CLOTHS[h % CLOTHS.length]}`} aria-hidden="true">
              <span className="book-spine" />
              {book?.cover && <span className="book-cover"><img src={book.cover} alt="" /></span>}
              <span className="book-plate"><span className="book-title">{book?.topic ?? 'Your handbook'}</span></span>
            </span>
          </li>
        </ul>
        <div className="shelf-plank" aria-hidden="true" />
      </div>
    </div>
  )
}

function Shell({ children, onSignOut, rail, back, hideShelf }: { children: React.ReactNode; onSignOut?: () => Promise<void> | void; rail?: React.ReactNode; back?: { label: string; onClick: () => void }; hideShelf?: boolean }) {
  // The member mark (7 Oct): paying should show, on every screen.
  const member = useQuery(api.membership.status, { deviceToken: deviceToken() })?.member
  // On a phone the side menu is hidden, so ☰ opens the same menu as a sheet (7 Oct, Prateek).
  const [menu, setMenu] = useState(false)
  return (
    <div className="shell">
      <header className="top">
        <button type="button" className="wordmark wordmark-btn" onClick={() => goHome?.()} aria-label="I Get It, home">I Get It{member && <span className="member-mark">Member</span>}<small>Twenty minutes at a time.</small></button>
        {/* The Shelf (8 Oct, Prateek): always one tap away, on every screen. */}
        {!hideShelf && <ShelfButton onOpen={() => goShelf?.()} />}
        <span className="top-actions">
          {back && <button type="button" className="back-link" onClick={back.onClick}>← <span className="bl-long">{back.label}</span><span className="bl-short">Back</span></button>}
          {onSignOut && <button type="button" className="quiet hide-phone" onClick={() => onSignOut()}>Sign out</button>}
          {rail && <button type="button" className="menu-btn" aria-label="Menu" aria-expanded={menu} onClick={() => setMenu(true)}>☰</button>}
        </span>
      </header>
      {menu && rail && (
        <Sheet onClose={() => setMenu(false)} label="Menu">
          <nav className="menu-sheet" onClick={(e) => { if ((e.target as HTMLElement).closest('button, a')) setMenu(false) }}>
            {rail}
            {onSignOut && <button type="button" className="quiet" onClick={() => onSignOut()}>Sign out</button>}
          </nav>
        </Sheet>
      )}
      {rail && <aside className="rail">{rail}</aside>}
      <main>{children}</main>
      <footer className="foot"><p><PolicyLinks /></p><p>Built in public for GrowthX Build Sprint, October 2026.</p></footer>
    </div>
  )
}

// The cover shows chapter 1's first Runway picture; the model's freehand drawing only until it arrives.
function firstPicture(pictures?: Record<string, string>): string | undefined {
  const keys = Object.keys(pictures ?? {}).map(Number).sort((a, b) => a - b)
  return keys.length ? pictures![String(keys[0])] : undefined
}
