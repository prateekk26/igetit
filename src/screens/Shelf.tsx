import { useEffect, useMemo, useRef, useState } from 'react'
import { limitMessage } from '../lib/limits'
import { track } from '../lib/track'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import { SECTIONS } from '../../convex/shelfSections'
import { useOnline } from '../lib/online'

// The Shelf (8 Oct, Prateek: "a section called The Shelf, always accessible, neatly organised visually as handbooks"):
// every ready and shared handbook as a cloth-bound book standing on a shelf, one shelf per kind. Each book appears
// once, on the first shelf it belongs to. Replaces the Explore list; same data (library.explore). Copy (agent).
// D34 (9 Oct, Prateek: "clean up the Shelf, keep only the best… a spotlight section to highlight 3 handbooks users like
// the best"): the Spotlight stand comes first, with the three the server ranks by readers finishing chapter 1 (spot 1 to
// 3). D34a ("funny award categories for the creative handbooks people are requesting"): the Awards row, the owner's
// award title and citation on reader-typed handbooks. A book in either row is not repeated on the shelves below.
type Award = { title: string; line: string }
type Item = { kind: 'ready' | 'shared'; id?: Id<'library'>; key: string; topic: string; goal?: string | null; outcome: string; mode: string | null; cover: string | null; hot: boolean; loved: boolean; pick?: boolean; week: number; finishedWeek?: number; trending?: boolean; addedAt?: number; starts?: number | null; passes?: number | null; spot?: number | null; award?: Award | null; section?: string | null }
// notice: why the reader landed here, e.g. a shared link that no longer opens (UX review 9 Oct). have: the handbooks
// already on this phone or account, by lowercased name, with how far they got.
type Props = { onReady: (topic: string) => Promise<void>; onShared: (id: Id<'library'>) => Promise<void>; onBack: () => void; notice?: string | null; have?: Record<string, string> }

// D35 (9 Oct, Prateek: "The categorization is horrible for the shelf"): one shelf per subject (convex/shelfSections.ts),
// in a fixed order; a book sits on the shelf the server sorted it onto (or the owner moved it to). The popularity
// shelves are gone: the Spotlight does that. Books with no shelf yet wait on "More".
const SHELVES: { key: string; label: string; note: string; pick: (i: Item) => boolean }[] = [
  ...SECTIONS.map((s) => ({ key: s.key, label: s.label, note: s.note, pick: (i: Item) => i.section === s.key })),
  { key: 'more', label: 'More', note: 'Not sorted yet.', pick: () => true },
]
// Within a shelf: the books readers finish most to the left, then the most opened, then the ones with a cover.
const byReaders = (a: Item, b: Item) => (b.passes ?? 0) - (a.passes ?? 0) || (b.starts ?? 0) - (a.starts ?? 0) || Number(!!b.cover) - Number(!!a.cover) || a.topic.localeCompare(b.topic)
// A deterministic lean per book, so the shelf looks lived-in but never moves.
const lean = (k: string) => { let h = 0; for (const c of k) h = (h * 31 + c.charCodeAt(0)) >>> 0; return ((h % 7) - 3) * 0.6 }
// The Spotlight's one honest line under each book: real counts, never a claim the numbers can't back. Copy (agent).
const stat = (i: Item) => {
  const p = i.passes ?? 0, s = i.starts ?? 0
  if (p >= 2) return `${p} readers finished chapter 1`
  if (s >= 3) return `${s} readers have opened it`
  return i.pick ? 'Picked for the Shelf' : 'Readers kept going'
}
const CLOTH = ['indigo', 'green', 'marigold', 'coral', 'ink']
const cloth = (k: string) => { let h = 0; for (const c of k) h = (h * 17 + c.charCodeAt(0)) >>> 0; return CLOTH[h % CLOTH.length] }

export default function Shelf({ onReady, onShared, onBack, notice, have = {} }: Props) {
  const items = useQuery(api.library.explore, {}) as Item[] | undefined
  const online = useOnline()
  // On a phone each shelf is one row that scrolls sideways; on a wide screen a shelf holds as many books as fit, and a
  // long shelf becomes several shelves, each with its own plank. Counted from the page's own width (UX review 9 Oct: at
  // 640 to 899 px four books overhung the plank, and at 640 the page slid sideways).
  const pageRef = useRef<HTMLDivElement>(null)
  const [perRow, setPerRow] = useState(0)
  useEffect(() => {
    const el = pageRef.current
    if (!el) return
    const f = () => setPerRow(window.innerWidth >= 640 ? Math.max(2, Math.min(4, Math.floor((el.clientWidth + 2) / 146))) : 0)   // a book is 132 px plus a 14 px gap; the row has 12 px of padding
    f()
    const ro = new ResizeObserver(f)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const rowsOf = (books: Item[]) => (perRow ? Array.from({ length: Math.ceil(books.length / perRow) }, (_, r) => books.slice(r * perRow, (r + 1) * perRow)) : [books])
  const spots = useMemo(() => (items ?? []).filter((i) => i.spot).sort((a, b) => (a.spot ?? 9) - (b.spot ?? 9)), [items])
  const awards = useMemo(() => (items ?? []).filter((i) => i.award && !i.spot), [items])
  const shelves = useMemo(() => {
    if (!items) return []
    const left = new Set(items.filter((i) => !i.spot && !i.award).map((i) => i.key))
    return SHELVES.map((s) => {
      const books = items.filter((i) => left.has(i.key) && s.pick(i)).sort(byReaders)
      for (const b of books) left.delete(b.key)
      return { ...s, books }
    }).filter((s) => s.books.length > 0)
  }, [items])
  useEffect(() => { track('shelf_view', undefined, 'shelf_view') }, [])   // D37: "shelf browsed" on /admin, once per visit
  const [note, setNote] = useState<string | null>(null)
  // The tapped book lifts off the shelf and turns to face the reader while its handbook opens (8 Oct night, Prateek):
  // a CSS transform only, so it costs nothing on a slow connection; it holds "lifted" until the chapter arrives, and
  // settles back if the open fails.
  const [lifting, setLifting] = useState<string | null>(null)
  // On a slow connection the lifted book would breathe forever with no word: after 12 s it says so (8 Oct night).
  const [slow, setSlow] = useState(false)
  useEffect(() => { if (!lifting) { setSlow(false); return } const t = setTimeout(() => setSlow(true), 12000); return () => clearTimeout(t) }, [lifting])
  const open = (it: Item) => {
    setNote(null); setLifting(it.key)
    return (it.kind === 'shared' && it.id ? onShared(it.id) : onReady(it.topic)).catch((e) => { setLifting(null); setNote(limitMessage(e) ?? "Couldn't open that one. Check your connection and tap again.") })
  }
  const surprise = () => { const pool = items ?? []; if (pool.length) open(pool[Math.floor(Math.random() * pool.length)]) }
  // The jump chips scroll in place. They were #links, and the app's Back handler read the jump as Back and closed the
  // Shelf (UX review 9 Oct, #2).
  const jump = (id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    const still = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    el.scrollIntoView({ behavior: still ? 'auto' : 'smooth', block: 'start' })
  }
  const mine = (it: Item) => have[it.topic.trim().toLowerCase()]

  return (
    <div ref={pageRef} className={`shelf-page${lifting ? ' lifting' : ''}`}>
      <button type="button" className="quiet" onClick={onBack}>← Back</button>
      <h1>The Shelf.</h1>
      {/* "no sign-in" was only true for the free chapters, and was said to members too (UX review 9 Oct). Copy (agent). */}
      <p className="lede">Every handbook here opens at once. Pick one up.</p>
      {notice && <p className="note shelf-notice" role="status">{notice}</p>}
      {note && <p className="error" role="alert">{note}</p>}
      {slow && lifting && <p className="note" role="status">Slow connection. Still opening; it keeps trying.</p>}
      {/* The jump row comes first, so its first chips are not for sections already scrolled past (UX review 9 Oct). */}
      <div className="shelf-tools">
        <button type="button" className="chip" onClick={surprise}>Surprise me</button>
        {spots.length > 0 && <button type="button" className="chip" onClick={() => jump('shelf-spotlight')}>Spotlight</button>}
        {awards.length > 0 && <button type="button" className="chip" onClick={() => jump('shelf-awards')}>The Awards</button>}
        {shelves.map((s) => <button type="button" key={s.key} className="chip" onClick={() => jump(`shelf-${s.key}`)}>{s.label}</button>)}
      </div>
      {spots.length > 0 && (
        <section id="shelf-spotlight" className="spot" aria-label="Spotlight">
          <div className="spot-head">
            <span className="spot-label">Spotlight</span>
            <h2>The three handbooks readers finish most.</h2>
          </div>
          <ol className="spot-list">
            {spots.map((it, i) => (
              <li key={it.key} className={lifting === it.key ? 'lifting' : undefined}>
                <button type="button" className="spot-card" onClick={() => { if (!lifting) open(it) }} aria-label={`Spotlight ${i + 1}: ${it.topic}. ${it.outcome}`} aria-busy={lifting === it.key || undefined}>
                  {lifting === it.key && <span className="lp-visually-hidden" role="status">Opening…</span>}
                  <span className="spot-no" aria-hidden="true">No. {i + 1}</span>
                  <span className="spot-plate">{it.cover ? <img src={it.cover} alt="" loading={i === 0 ? 'eager' : 'lazy'} /> : <span className="spot-plate-blank">{it.topic.slice(0, 1)}</span>}</span>
                  <span className="spot-title">{it.topic}</span>
                  {it.goal && <span className="spot-goal">for: {it.goal}</span>}
                  {it.outcome && <span className="spot-outcome">{it.outcome}</span>}
                  <span className="spot-stat">{stat(it)}</span>
                  {mine(it) && <span className="spot-mine">{mine(it)}</span>}
                  <span className="spot-go">Open it →</span>
                </button>
              </li>
            ))}
          </ol>
        </section>
      )}
      {awards.length > 0 && (
        <section id="shelf-awards" className="awards" aria-label="The Awards">
          <div className="shelf-head"><h2>The Awards</h2><p className="note">Handed out for what readers typed. Every one opens.</p></div>
          <ul className="award-list">
            {awards.map((it) => (
              <li key={it.key} className={lifting === it.key ? 'lifting' : undefined}>
                <button type="button" className="award-card" onClick={() => { if (!lifting) open(it) }} aria-label={`${it.award!.title}: ${it.topic}. ${it.award!.line}`} aria-busy={lifting === it.key || undefined}>
                  {lifting === it.key && <span className="lp-visually-hidden" role="status">Opening…</span>}
                  <span className="award-rosette" aria-hidden="true"><span>★</span></span>
                  <span className="award-title">{it.award!.title}</span>
                  <span className="award-to">goes to</span>
                  <span className="award-topic">“{it.topic}”</span>
                  <span className="award-line">{it.award!.line}</span>
                  <span className="award-go">Open it →</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
      {!items ? <p className="note" role="status">{online ? 'Dusting the shelves…' : "No connection. The Shelf opens when you're back online."}</p> : shelves.map((s) => (
        <section key={s.key} id={`shelf-${s.key}`} className="shelf-sec" aria-label={s.label}>
          <div className="shelf-head"><h2>{s.label}</h2>{s.note && <p className="note">{s.note}</p>}</div>
          {rowsOf(s.books).map((row, r) => (
            <div key={r} className="shelf-row">
              <ul className="shelf-books">
                {row.map((it) => (
                  <li key={it.key} className={lifting === it.key ? 'lifting' : lifting ? 'resting' : undefined} style={{ ['--lean' as any]: `${lean(it.key)}deg` }}>
                    <button type="button" className={`book cloth-${cloth(it.key)}`} onClick={() => { if (!lifting) open(it) }} aria-label={`${it.topic}.${mine(it) ? ` ${mine(it)}.` : ''} ${it.outcome}`} aria-busy={lifting === it.key || undefined}>
                      {lifting === it.key && <span className="lp-visually-hidden" role="status">Opening…</span>}
                      <span className="book-spine" aria-hidden="true" />
                      <span className="book-cover">
                        {it.cover ? <img src={it.cover} alt="" loading="lazy" /> : <span className="book-cover-blank">{it.topic.slice(0, 1)}</span>}
                      </span>
                      {/* The goal line was cut to "for: Understa…" on a 90 px plate (UX review 9 Oct); the title is the name. */}
                      <span className="book-plate"><span className="book-title">{it.topic}</span>{mine(it) && <span className="book-mine">{mine(it)}</span>}</span>
                      {/* "Finished" read as "you finished it" (UX review 9 Oct): the ribbon means most readers finish chapter 1. */}
                      {(it.hot || it.loved || it.pick) && <span className="book-ribbon">{it.hot ? 'Hot' : it.loved ? 'Most finished' : 'Our pick'}</span>}
                    </button>
                  </li>
                ))}
              </ul>
              <div className="shelf-plank" aria-hidden="true" />
            </div>
          ))}
        </section>
      ))}
    </div>
  )
}
