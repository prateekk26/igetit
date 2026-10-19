import { useEffect, useState, type ReactNode } from 'react'

// The /admin pieces in theme C (14 Oct, Prateek: "Improve the admin portal please. Very bad UX. Use the new UI"):
// a switch says on or off with a filled dot or a ring and its label, never by colour; the long explanations fold
// under "How this works" so the controls come first; a segmented row picks one of a few.

export function Switch({ on, onClick, children, disabled, label }: { on: boolean; onClick: () => void; children: ReactNode; disabled?: boolean; label?: string }) {
  return (
    <button type="button" className="adm-switch" aria-pressed={on} onClick={onClick} disabled={disabled} aria-label={label}>
      <span className="adm-dot" aria-hidden="true" />{children}
    </button>
  )
}

export function How({ children, label = 'How this works' }: { children: ReactNode; label?: string }) {
  return (
    <details className="adm-how">
      <summary>{label}</summary>
      <div className="adm-how-body">{children}</div>
    </details>
  )
}

export function Seg<T extends string | number>({ value, options, onChange, label }: { value: T; options: { v: T; label: string }[]; onChange: (v: T) => void; label: string }) {
  return (
    <div className="adm-seg" role="group" aria-label={label}>
      {options.map((o) => <button key={String(o.v)} type="button" aria-pressed={value === o.v} onClick={() => onChange(o.v)}>{o.label}</button>)}
    </div>
  )
}

// Pages (20 Oct, Prateek: "as days and activity increase, we need pagination"): 20 to a page, Newer / Older, the range
// shown. Paged keeps the whole list on screen and shows "21–40 of 312"; PageBar alone is for lists the server sends a
// page at a time, where a total would mean reading every row.
export const PER_PAGE = 20

export function PageBar({ page, hasOlder, onNewer, onOlder, range }: { page: number; hasOlder: boolean; onNewer: () => void; onOlder: () => void; range?: string }) {
  if (page === 0 && !hasOlder) return null
  return (
    <div className="adm-pager" role="group" aria-label="Pages">
      <button type="button" className="quiet" onClick={onNewer} disabled={page === 0}>← Newer</button>
      <span className="adm-sub">{range ?? `Page ${page + 1}`}</span>
      <button type="button" className="quiet" onClick={onOlder} disabled={!hasOlder}>Older →</button>
    </div>
  )
}

export function Paged<T>({ items, children, resetKey }: { items: T[]; children: (page: T[]) => ReactNode; resetKey?: unknown }) {
  const [page, setPage] = useState(0)
  useEffect(() => setPage(0), [resetKey])
  const last = Math.max(0, Math.ceil(items.length / PER_PAGE) - 1)
  const p = Math.min(page, last)
  const slice = items.slice(p * PER_PAGE, (p + 1) * PER_PAGE)
  const range = items.length ? `${p * PER_PAGE + 1}–${p * PER_PAGE + slice.length} of ${items.length}` : undefined
  return (
    <>
      {children(slice)}
      <PageBar page={p} hasOlder={p < last} onNewer={() => setPage(p - 1)} onOlder={() => setPage(p + 1)} range={range} />
    </>
  )
}

// A day heading in India time: Today, Yesterday, then "18 Oct".
const IST = 5.5 * 3600e3
const dayKey = (t: number) => new Date(t + IST).toISOString().slice(0, 10)
export function dayLabel(t: number) {
  const k = dayKey(t), today = dayKey(Date.now()), yest = dayKey(Date.now() - 86400e3)
  if (k === today) return 'Today'
  if (k === yest) return 'Yesterday'
  return new Date(t).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata' })
}
// Items in order, split under their day's heading.
export function ByDay<T>({ items, at, children }: { items: T[]; at: (x: T) => number; children: (x: T) => ReactNode }) {
  const groups: { label: string; xs: T[] }[] = []
  for (const x of items) { const label = dayLabel(at(x)); const g = groups[groups.length - 1]; if (g && g.label === label) g.xs.push(x); else groups.push({ label, xs: [x] }) }
  return <>{groups.map((g, i) => <div key={g.label + i}><h3 className="adm-day">{g.label}</h3><div className="adm-journeys">{g.xs.map(children)}</div></div>)}</>
}

// A section folded shut, its one-line summary on the heading (20 Oct, Prateek: "more organised"). Open or shut is
// remembered on this browser per section; it opens shut if storage is unavailable.
export function Fold({ id, title, summary, children }: { id: string; title: ReactNode; summary?: ReactNode; children: ReactNode }) {
  const key = `igi.adm.open.${id}`
  const [open, setOpen] = useState(() => { try { return localStorage.getItem(key) === '1' } catch { return false } })
  return (
    <section className="adm-card adm-wide">
      <details className="adm-sec" open={open} onToggle={(e) => { const o = (e.target as HTMLDetailsElement).open; setOpen(o); try { localStorage.setItem(key, o ? '1' : '0') } catch { /* private mode */ } }}>
        <summary><h2>{title}</h2>{summary ? <span className="adm-sub">{summary}</span> : null}</summary>
        {open && <div className="adm-sec-body">{children}</div>}
      </details>
    </section>
  )
}
