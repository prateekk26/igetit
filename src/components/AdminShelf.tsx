import { useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import type { FunctionReturnType } from 'convex/server'
import { api } from '../../convex/_generated/api'
import { SECTIONS, byShelfOrder, sectionOrder } from '../../convex/shelfSections'
import { How, Seg, Switch } from './AdminUi'

// /admin Shelf (14 Oct, Prateek: "Very bad UX. Use the new UI"): "Arrange the Shelf" (D98, D99) and "The Shelf" (D34)
// were two lists of the same books, 7,674 px and 483 controls tall, with the pin in a table column off the right edge.
// Now one list: a search and filters on top, then what the homepage shows right now (the same query the homepage
// reads), then the Shelf as readers see it, top to bottom, each book one card with every switch it has. Books taken off
// fold away at the bottom. The mutations are the ones the two old cards called; nothing on the server changed.

type Filter = 'all' | 'pinned' | 'free' | 'off' | 'shared'
const ago = (t: number) => { const m = Math.round((Date.now() - t) / 60000); return m < 1 ? 'just now' : m < 60 ? `${m} min ago` : `${Math.round(m / 60)} h ago` }

export default function AdminShelf() {
  const rows = useQuery(api.shelf.adminList, {})
  const layout = useQuery(api.shelf.layout, {})
  const home = useQuery(api.landing.content, {})
  const setBookOrder = useMutation(api.shelf.setBookOrder)
  const setShelfOrder = useMutation(api.shelf.setShelfOrder)
  const recount = useMutation(api.shelf.recountReadWeek)
  const setPick = useMutation(api.shelf.setPick)
  const [err, setErr] = useState<string | null>(null)
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [recounting, setRecounting] = useState(false)
  if (!rows || !layout) return <section className="adm-card adm-wide"><h2>Shelf</h2><p className="note">Loading…</p></section>
  type Row = (typeof rows)[number]
  const fail = (e: unknown) => setErr(String((e as Error)?.message ?? e).replace(/^.*Error: /, '').slice(0, 200))
  const order = sectionOrder(layout.shelves)
  const live = rows.filter((r) => r.on), off = rows.filter((r) => !r.on)
  const homeNo = new Map((home?.top ?? []).map((t, i) => [t.topic, i + 1]))
  const byTitle = new Map(rows.map((r) => [r.title, r]))

  // The Shelf as readers see it (ArrangeCard's rule): the free shelf first, the subject shelves in their order, then
  // "More"; books in the Spotlight or the Awards sit on neither, as on the real Shelf.
  const aside = live.filter((r) => r.spot || r.award)
  const left = new Set(live.filter((r) => !r.spot && !r.award).map((r) => r.id))
  const take = (pick: (r: Row) => boolean) => { const xs = live.filter((r) => left.has(r.id) && pick(r)).sort(byShelfOrder); xs.forEach((r) => left.delete(r.id)); return xs }
  const shelves = [
    { key: 'free', label: 'Free, every chapter', fixed: true, books: take((r) => !!r.free) },
    ...order.map((k) => ({ key: k, label: SECTIONS.find((x) => x.key === k)!.label, fixed: false, books: take((r) => r.section === k) })),
    { key: 'more', label: 'More (not sorted yet)', fixed: true, books: take(() => true) },
  ]
  const moveShelf = (k: string, d: -1 | 1) => { const i = order.indexOf(k), j = i + d; if (j < 0 || j >= order.length) return; const next = [...order]; [next[i], next[j]] = [next[j], next[i]]; setErr(null); setShelfOrder({ keys: next }).catch(fail) }
  const moveBook = (books: Row[], i: number, d: -1 | 1) => { const j = i + d; if (j < 0 || j >= books.length) return; const next = [...books]; [next[i], next[j]] = [next[j], next[i]]; setErr(null); setBookOrder({ ids: next.map((b) => b.id) }).catch(fail) }

  const words = q.trim().toLowerCase()
  const searching = words.length > 0 || filter !== 'all'
  const found = searching ? rows.filter((r) => (!words || `${r.title} ${r.goal ?? ''}`.toLowerCase().includes(words))
    && (filter === 'all' || (filter === 'pinned' && r.pick) || (filter === 'free' && r.free) || (filter === 'off' && !r.on) || (filter === 'shared' && r.kind === 'shared'))) : []
  const count = { pinned: rows.filter((r) => r.pick).length, free: rows.filter((r) => r.free).length, off: off.length, shared: rows.filter((r) => r.kind === 'shared').length }

  return (
    <section className="adm-card adm-wide adm-shelfdesk">
      <div className="adm-head">
        <h2>Shelf</h2>
        <span className="adm-sub">{live.length} on the Shelf · {off.length} taken off · {count.pinned} pinned</span>
      </div>
      <div className="adm-find">
        <input className="input" type="search" placeholder="Find a handbook" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Find a handbook" />
        <Seg label="Show" value={filter} onChange={setFilter} options={[
          { v: 'all', label: 'All' }, { v: 'pinned', label: `Pinned ${count.pinned}` }, { v: 'free', label: `Free ${count.free}` },
          { v: 'shared', label: `Readers' ${count.shared}` }, { v: 'off', label: `Taken off ${count.off}` },
        ]} />
      </div>
      <How>
        <p><b>Pin to top</b> puts a book first in the Shelf's Spotlight, and, if it's a ready handbook, first in "Top of the Shelf" on the homepage. The homepage shows up to 6: pins first, then books readers finished chapter 1 of (10 points each) or opened (1 each). It never fills a spot with a book nobody has read or pinned.</p>
        <p><b>Free</b> puts a ready handbook on the free shelf with no daily chapter limit (the sign-up after chapter 2 stays).</p>
        <p><b>On the Shelf</b> off hides a book from the Shelf, the homepage, the wait stories and What's next. Readers who have it keep it, and you can put it back. A readers' handbook taken off is also unpublished (its ?l= link stops).</p>
        <p><b>↑ ↓</b> move a shelf, or a book along its shelf (left to right on the Shelf). The shelf menu sends a book to another shelf. Books you never moved follow the ones you did, the most finished first.</p>
        <p>Under each book: copies (readers who have it), how many opened it in the last 7 days, how many finished chapter 1, and the average stars (how many ratings in brackets). Our own phones are left out.</p>
      </How>
      <p className="adm-status">Read this week: {layout.readWeekAt ? `counted ${ago(layout.readWeekAt)}` : 'not counted yet'}.{' '}
        <button type="button" className="quiet" disabled={recounting} onClick={() => { setRecounting(true); setErr(null); recount().catch(fail).finally(() => setTimeout(() => setRecounting(false), 4000)) }}>{recounting ? 'Counting…' : 'Recount now'}</button></p>
      {err && <p className="error" role="alert">{err}</p>}

      {searching ? (
        <div className="adm-group-block">
          <h3>{found.length} {found.length === 1 ? 'book' : 'books'}</h3>
          {found.length === 0 ? <p className="note">Nothing matches.</p> : <ol className="adm-bookcards">{found.map((r) => <Book key={r.id} r={r} order={order} home={homeNo.get(r.title)} onErr={fail} />)}</ol>}
        </div>
      ) : (
        <>
          <div className="adm-group-block adm-home">
            <h3>On the homepage now <small>Top of the Shelf · {home?.top.length ?? '…'} of 6</small></h3>
            {!home ? <p className="note">Loading…</p> : home.top.length === 0 ? <p className="note">Empty: pin a ready handbook to put one here.</p> : (
              <ol className="adm-homelist">{home.top.map((t, i) => {
                const r = byTitle.get(t.topic)
                return (
                  <li key={t.topic}>
                    <span className="adm-no">No. {i + 1}</span>
                    <span className="adm-home-t"><strong>{t.topic}</strong><small>{r?.pick ? 'Pinned by you' : `By readers · ${t.passes} finished chapter 1 · ${t.starts} opened`}</small></span>
                    {r && <Switch on={!!r.pick} onClick={() => { setErr(null); setPick({ id: r.id, pick: !r.pick }).catch(fail) }}>{r.pick ? 'Pinned' : 'Pin'}</Switch>}
                  </li>
                )
              })}</ol>
            )}
            {home && home.top.length < 6 && home.top.length > 0 && <p className="note">{6 - home.top.length} {6 - home.top.length === 1 ? 'spot' : 'spots'} empty. Pin a ready handbook below to fill one.</p>}
          </div>

          {aside.length > 0 && (
            <div className="adm-group-block">
              <h3>Spotlight and Awards <small>{aside.length} · shown above the shelves, not on one</small></h3>
              <ol className="adm-bookcards">{aside.map((r) => <Book key={r.id} r={r} order={order} home={homeNo.get(r.title)} onErr={fail} />)}</ol>
            </div>
          )}

          {shelves.map((sh) => sh.books.length === 0 && sh.fixed ? null : (
            <div key={sh.key} className="adm-group-block">
              <div className="adm-shelf-head">
                <h3>{sh.label} <small>{sh.books.length} {sh.books.length === 1 ? 'book' : 'books'}{sh.key === order[0] ? ' · next to the Spotlight' : ''}</small></h3>
                {!sh.fixed && <span className="adm-arrows">
                  <button type="button" className="adm-round" aria-label={`Move the ${sh.label} shelf up`} disabled={order.indexOf(sh.key) === 0} onClick={() => moveShelf(sh.key, -1)}>↑</button>
                  <button type="button" className="adm-round" aria-label={`Move the ${sh.label} shelf down`} disabled={order.indexOf(sh.key) === order.length - 1} onClick={() => moveShelf(sh.key, 1)}>↓</button>
                </span>}
              </div>
              {sh.books.length === 0 ? <p className="note">No books on this shelf.</p> : (
                <ol className="adm-bookcards">{sh.books.map((b, i) => (
                  <Book key={b.id} r={b} n={i + 1} order={order} home={homeNo.get(b.title)} onErr={fail} hideShelf={sh.key === 'free'}
                    move={{ up: i > 0 ? () => moveBook(sh.books, i, -1) : null, down: i < sh.books.length - 1 ? () => moveBook(sh.books, i, 1) : null }} />
                ))}</ol>
              )}
            </div>
          ))}

          {off.length > 0 && (
            <details className="adm-group-block adm-offlist">
              <summary><h3>Taken off the Shelf <small>{off.length}</small></h3></summary>
              <ol className="adm-bookcards">{off.map((r) => <Book key={r.id} r={r} order={order} onErr={fail} />)}</ol>
            </details>
          )}
        </>
      )}
    </section>
  )
}

type BookRow = NonNullable<FunctionReturnType<typeof api.shelf.adminList>>[number]

function Book({ r, n, order, home, onErr, move, hideShelf }: { r: BookRow; n?: number; order: string[]; home?: number; onErr: (e: unknown) => void; move?: { up: (() => void) | null; down: (() => void) | null }; hideShelf?: boolean }) {
  const setOn = useMutation(api.shelf.setOnShelf)
  const setPick = useMutation(api.shelf.setPick)
  const setFree = useMutation(api.shelf.setFree)
  const setAward = useMutation(api.shelf.setAward)
  const setSection = useMutation(api.shelf.setSection)
  const destroy = useMutation(api.library.destroy)
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(r.award?.title ?? '')
  const [line, setLine] = useState(r.award?.line ?? '')
  const [gone, setGone] = useState(false)
  const run = (p: Promise<unknown>) => { p.catch(onErr) }
  return (
    <li className={`adm-bookcard${r.on ? '' : ' is-off'}`}>
      <div className="adm-bookcard-top">
        {n !== undefined && <span className="adm-book-n">{n}</span>}
        <div className="adm-bookcard-t">
          <strong>{r.title}</strong>
          <span className="adm-tags">
            {home && <span className="adm-tag adm-tag-strong">Homepage No. {home}</span>}
            {r.spot && <span className="adm-tag">Spotlight No. {r.spot}</span>}
            {r.award && <span className="adm-tag">Award: {r.award.title}</span>}
            {r.kind === 'shared' && <span className="adm-tag">Readers'</span>}
            {r.mode && <span className="adm-tag">{r.mode}</span>}
            {!r.cover && <span className="adm-tag">No cover</span>}
          </span>
          <small className="adm-stats">{r.starts} {r.starts === 1 ? 'copy' : 'copies'} · {r.readWeek ?? '–'} read this week · {r.passes} finished ch 1 · {r.stars ? `★ ${r.stars.avg} (${r.stars.n})` : 'no stars yet'}{r.goal ? ` · for: ${r.goal}` : ''}</small>
          {r.offWhy && <small className="adm-stats">Taken off: {r.offWhy}</small>}
        </div>
        {move && <span className="adm-arrows">
          <button type="button" className="adm-round" aria-label={`Move ${r.title} up`} disabled={!move.up} onClick={() => move.up?.()}>↑</button>
          <button type="button" className="adm-round" aria-label={`Move ${r.title} down`} disabled={!move.down} onClick={() => move.down?.()}>↓</button>
        </span>}
      </div>
      <div className="adm-bookcard-acts">
        <Switch on={r.pick} onClick={() => run(setPick({ id: r.id, pick: !r.pick }))} label={`Pin ${r.title} to top`}>Pin to top</Switch>
        {r.kind === 'ready' && <Switch on={!!r.free} onClick={() => run(setFree({ id: r.id, free: !r.free }))} label={`Make ${r.title} free`}>Free</Switch>}
        <Switch on={r.on} onClick={() => run(setOn({ id: r.id, on: !r.on }))} label={`${r.title} on the Shelf`}>On the Shelf</Switch>
        {!hideShelf && r.on && (
          <select className="adm-select" value={r.section ?? ''} onChange={(e) => run(setSection({ id: r.id, section: e.target.value }))} aria-label={`Shelf for ${r.title}`}>
            <option value="" disabled>Shelf: not sorted</option>{order.map((k) => <option key={k} value={k}>Shelf: {SECTIONS.find((x) => x.key === k)!.label}</option>)}
          </select>
        )}
        <button type="button" className="quiet" onClick={() => { setTitle(r.award?.title ?? ''); setLine(r.award?.line ?? ''); setEditing((x) => !x) }}>{r.award ? 'Edit award' : 'Give award'}</button>
        {r.kind === 'shared' && r.libraryId && (gone
          ? <><span className="note">Delete the shared copy for good?</span><button type="button" className="quiet" onClick={() => { run(destroy({ id: r.libraryId as any })); setGone(false) }}>Yes, delete forever</button><button type="button" className="quiet" onClick={() => setGone(false)}>Keep</button></>
          : <button type="button" className="quiet" onClick={() => setGone(true)}>Delete forever</button>)}
      </div>
      {editing && (
        <form className="adm-form" onSubmit={(e) => { e.preventDefault(); if (title.trim() && line.trim()) { run(setAward({ id: r.id, award: { title, line } })); setEditing(false) } }}>
          <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Award title" maxLength={60} aria-label="Award title" />
          <input className="input" value={line} onChange={(e) => setLine(e.target.value)} placeholder="One citation line" maxLength={200} aria-label="Citation line" />
          <span>
            <button type="submit" className="btn">Save award</button>
            {r.award && <button type="button" className="quiet" onClick={() => { run(setAward({ id: r.id, award: null })); setEditing(false) }}>Remove award</button>}
            <button type="button" className="quiet" onClick={() => setEditing(false)}>Cancel</button>
          </span>
        </form>
      )}
    </li>
  )
}
