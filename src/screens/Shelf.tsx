import { useEffect, useMemo, useState } from 'react'
import { limitMessage } from '../lib/limits'
import { track } from '../lib/track'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import { SECTIONS, byShelfOrder, flagOf, sectionOrder } from '../../convex/shelfSections'
import { useOnline } from '../lib/online'

// The Shelf (C12, 14 Oct; Prateek: "follow the UI given and use our backend to populate the data"): the board's page, not
// the wooden shelves of 8 Oct. "‹ Your book" and "Surprise me" on top, "The Shelf", one line, a row of shelf pills, and
// the books two to a row: the cover, the title on a coloured plate, "N chapters · M min". The pills are our shelves:
// Loved most (the Spotlight's rule, then readers finishing chapter 1), Free (the free eleven and the owner's free ones,
// D65, D99), the subject shelves in the owner's order (D35, D98), the Awards (D34a), More. Same data (library.explore).
type Award = { title: string; line: string }
type Item = { kind: 'ready' | 'shared'; id?: Id<'library'>; key: string; free?: boolean; topic: string; goal?: string | null; outcome: string; mode: string | null; cover: string | null; hot: boolean; loved: boolean; pick?: boolean; week: number; starts?: number | null; passes?: number | null; spot?: number | null; award?: Award | null; section?: string | null; order?: number | null; chapters?: number | null; minutes?: number | null }
type Props = { onReady: (topic: string) => Promise<void>; onShared: (id: Id<'library'>) => Promise<void>; onBack: () => void; backLabel?: string; notice?: string | null; have?: Record<string, string> }

// The four plate colours of the board, by the book's name so a book keeps its colour.
const PLATES = ['indigo', 'coral', 'marigold', 'green']
const plate = (k: string) => { let h = 0; for (const c of k) h = (h * 17 + c.charCodeAt(0)) >>> 0; return PLATES[h % PLATES.length] }
const length = (i: Item) => (i.chapters ? `${i.chapters} ${i.chapters === 1 ? 'chapter' : 'chapters'}${i.minutes ? ` · ${i.minutes} min` : ''}` : '')

export default function Shelf({ onReady, onShared, onBack, backLabel = 'Your book', notice, have = {} }: Props) {
  const items = useQuery(api.library.explore, {}) as Item[] | undefined
  const layout = useQuery(api.shelf.layout, {})
  const order = useMemo(() => sectionOrder(layout?.shelves), [layout])
  const online = useOnline()
  useEffect(() => { track('shelf_view', undefined, 'shelf_view') }, [])   // D37: "shelf browsed" on /admin, once per visit

  const pills = useMemo(() => {
    if (!items || !layout) return []
    const out: { key: string; label: string; books: Item[] }[] = []
    const loved = [...items].sort((a, b) => (a.spot ?? 9) - (b.spot ?? 9) || (b.passes ?? 0) - (a.passes ?? 0) || (b.starts ?? 0) - (a.starts ?? 0))
    out.push({ key: 'loved', label: 'Loved most', books: loved })
    const free = items.filter((i) => i.free).sort(byShelfOrder)
    if (free.length) out.push({ key: 'free', label: 'Free', books: free })
    for (const k of order) {
      const s = SECTIONS.find((x) => x.key === k)
      const books = items.filter((i) => i.section === k).sort(byShelfOrder)
      if (s && books.length) out.push({ key: k, label: s.label, books })
    }
    const awards = items.filter((i) => i.award)
    if (awards.length) out.push({ key: 'awards', label: 'The Awards', books: awards })
    const more = items.filter((i) => !i.section || !order.includes(i.section))
    if (more.length) out.push({ key: 'more', label: 'More', books: more })
    return out
  }, [items, layout, order])
  const [at, setAt] = useState('loved')
  const shown = pills.find((p) => p.key === at) ?? pills[0]

  const [note, setNote] = useState<string | null>(null)
  const [opening, setOpening] = useState<string | null>(null)
  const [slow, setSlow] = useState(false)
  useEffect(() => { if (!opening) { setSlow(false); return } const t = setTimeout(() => setSlow(true), 12000); return () => clearTimeout(t) }, [opening])
  const open = (it: Item) => {
    if (opening) return
    setNote(null); setOpening(it.key)
    return (it.kind === 'shared' && it.id ? onShared(it.id) : onReady(it.topic)).catch((e) => { setOpening(null); setNote(limitMessage(e) ?? "Couldn't open that one. Check your connection and tap again.") })
  }
  const surprise = () => { const pool = shown?.books ?? items ?? []; if (pool.length) open(pool[Math.floor(Math.random() * pool.length)]) }
  const mine = (it: Item) => have[it.topic.trim().toLowerCase()]

  return (
    <div className={`c12${opening ? ' is-opening' : ''}`}>
      <header className="c12-top">
        <button type="button" className="c12-link" onClick={onBack}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m15 5-7 7 7 7" /></svg>{backLabel}
        </button>
        <button type="button" className="c12-link" onClick={surprise} disabled={!items?.length}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="4" /><circle cx="9" cy="9" r="1.2" fill="currentColor" /><circle cx="15" cy="15" r="1.2" fill="currentColor" /><circle cx="15" cy="9" r="1.2" fill="currentColor" /><circle cx="9" cy="15" r="1.2" fill="currentColor" /></svg>Surprise me
        </button>
      </header>
      <h1>The Shelf</h1>
      <p className="c12-lede">Little books other readers loved. Add one to your book.</p>
      {notice && <p className="note shelf-notice" role="status">{notice}</p>}
      {note && <p className="error" role="alert">{note}</p>}
      {slow && opening && <p className="note" role="status">Slow connection. Still opening; it keeps trying.</p>}
      {pills.length > 0 && (
        <nav className="c12-pills" aria-label="Shelves">
          {pills.map((p) => <button key={p.key} type="button" aria-pressed={p.key === shown?.key} onClick={() => setAt(p.key)}>{p.label}</button>)}
        </nav>
      )}
      {!items || !layout ? <p className="note" role="status">{online ? 'Dusting the shelves…' : "No connection. The Shelf opens when you're back online."}</p> : (
        <ul className="c12-grid" key={shown?.key}>
          {(shown?.books ?? []).map((it, k) => (
            <li key={it.key} style={{ animationDelay: `${Math.min(k, 8) * 60}ms` }}>
              <button type="button" className={`c12-book plate-${plate(it.key)}`} onClick={() => open(it)} aria-busy={opening === it.key || undefined}
                aria-label={`${it.topic}.${it.award ? ` ${it.award.title}.` : ''}${mine(it) ? ` ${mine(it)}.` : ''} ${length(it)}`}>
                <span className="c12-cover">
                  {it.cover ? <img src={it.cover} alt="" loading={k < 4 ? 'eager' : 'lazy'} /> : <span className="c12-blank" aria-hidden="true">{it.topic.slice(0, 1)}</span>}
                  {flagOf(it.topic) && <span className="book-flag" aria-hidden="true">{flagOf(it.topic)}</span>}
                </span>
                <span className="c12-plate">{opening === it.key ? 'Opening…' : it.topic}</span>
                <span className="c12-meta">{it.award && shown?.key === 'awards' ? it.award.title : mine(it) ?? length(it)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
