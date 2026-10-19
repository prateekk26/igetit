import { useEffect, useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import { ByDay, How, PageBar, PER_PAGE, Seg } from './AdminUi'

// /admin, "AI pipeline" (8 Oct): every AI and media call behind a handbook, from the goal question to the last picture.
// Top line, each step (time, failures, retries, tokens, cost), each handbook with its call timeline and a link to its
// Langfuse trace, and the background jobs and tests kept apart from readers' handbooks.
const WINDOWS = [{ d: 1, label: 'Today' }, { d: 7, label: '7 days' }, { d: 30, label: '30 days' }]
const STEP: Record<string, string> = {
  match: 'Match with a ready book', intent: 'Goal question', research: 'Research', transcript: 'YouTube transcript', plan: 'Plan',
  chapter: 'Chapter', check: 'Fact check + picture scenes', versions: 'Quiz versions', scenes: 'Picture scenes (old path)', picture: 'Cover picture',
  photo: 'Wikimedia photo', library: 'Library check', teach: 'Teach it back', ask: 'Ask or object', repair: 'Rewrites and polish', audit: 'Audits',
}
const GROUP: Record<string, string> = { reader: "Readers' handbooks", maintenance: 'Background jobs', eval: 'Prompt and model tests' }
const s = (ms: number | null) => (ms === null ? '—' : ms < 1000 ? `${ms} ms` : ms < 90000 ? `${(ms / 1000).toFixed(ms < 10000 ? 1 : 0)} s` : `${(ms / 60000).toFixed(1)} min`)
const inr = (n: number | null) => (n === null ? '—' : `₹${n.toLocaleString('en-IN', { maximumFractionDigits: n < 10 ? 2 : 0 })}`)
const share = (x: number) => `${Math.round(x * 100)}%`
const k = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n))

// The Langfuse trace id is derived from the handbook id the same way convex/langfuse.ts does: sha256("trace:" + id).
// The project's traces page comes from the server (LANGFUSE_TRACES_URL in the Convex env); without it, no link.
function useTraceUrl(id: string, base: string | null) {
  const [url, setUrl] = useState<string | null>(null)
  useEffect(() => {
    let live = true
    if (!base) return
    crypto.subtle.digest('SHA-256', new TextEncoder().encode(`trace:${id}`))
      .then((b) => { if (live) setUrl(`${base.replace(/\/+$/, '')}/${[...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join('').slice(0, 32)}`) })
      .catch(() => {})
    return () => { live = false }
  }, [id, base])
  return url
}

export default function AdminPipeline() {
  const [days, setDays] = useState(7)
  const d = useQuery(api.pipeline.dashboard, { days })
  if (!d || d.denied) return null
  const t = d.summary
  const groups = ['reader', 'maintenance', 'eval'].map((g) => ({ g, rows: d.steps.filter((x: any) => x.group === g) })).filter((x) => x.rows.length)
  return (
    <section className="adm-card adm-wide">
      <h2>AI pipeline</h2>
      <div className="adm-head-row">
        <p className="adm-status">Every AI and photo call behind a handbook.</p>
        <Seg label="Pipeline window" value={days} onChange={setDays} options={WINDOWS.map((w) => ({ v: w.d, label: w.label }))} />
      </div>
      <How>Time, tokens, retries, failures and estimated cost for each call. Prices are list prices at ₹94.90 a dollar (19 Oct); the providers' bills are the real numbers.</How>

      <ul className="adm-list">
        <li><span>Typed handbooks</span><b>{t.handbooks}</b></li>
        <li><span>Cost per handbook, typical / worst</span><b>{inr(t.inrPerHandbook.p50)} / {inr(t.inrPerHandbook.p95)}</b></li>
        <li><span>Goal picked to chapter 1 ready, typical / slow</span><b>{s(t.toChapter1.p50)} / {s(t.toChapter1.p95)}</b></li>
        <li><span>Time readers spend on the goal question (typical)</span><b>{s(t.pickGoal.p50)}</b></li>
        <li><span>Calls for readers · failed · retried</span><b>{t.calls} · {share(t.failedShare)} · {share(t.retriedShare)}</b></li>
        <li><span>Spent today (readers and background jobs)</span><b>{inr(t.inrToday)}</b></li>
        <li><span>Background jobs · prompt and model tests, this window</span><b>{inr(t.maintenanceInr)} · {inr(t.evalInr)}</b></li>
      </ul>
      {d.capped && <p className="note">Showing the latest 20,000 calls; pick a shorter window for the full picture.</p>}
      {!d.traces && <p className="note">Langfuse links need LANGFUSE_TRACES_URL in the Convex env (the project's traces page).</p>}

      {groups.map(({ g, rows }) => (
        <div key={g}>
          <h3>{GROUP[g]}: each step</h3>
          <div className="adm-scroll">
            <table className="adm-table">
              <thead><tr><th>Step</th><th>Model</th><th>Calls</th><th>Failed</th><th>Retried</th><th>p50</th><th>p95</th><th>p99</th><th>Tokens in / out</th><th>₹ a call</th><th>₹ total</th></tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={`${r.kind}-${r.model}`}>
                    <td>{STEP[r.kind] ?? r.kind}</td><td>{r.model}</td><td>{r.calls}</td>
                    <td>{r.failed ? <b>{r.failed}</b> : 0}</td><td>{r.retried}</td>
                    <td>{s(r.p50)}</td><td>{s(r.p95)}</td><td>{s(r.p99)}</td>
                    <td>{k(r.tokensIn)} / {k(r.tokensOut)}{r.cachedIn ? <small> ({k(r.cachedIn)} cached)</small> : null}</td>
                    <td>{inr(r.calls ? r.inr / r.calls : 0)}</td><td>{inr(r.inr)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      <h3>Each handbook</h3>
      <BookPages days={days} traces={d.traces} />
    </section>
  )
}

type Parts = { research: number | null; plan: number | null; chapter: number | null; check: number | null }
type J = { id: string; topic: string; createdAt: number; status: string; kind: string; goal: string | null; pickGoal: number | null; toPlan: number | null; toChapter1: number | null; parts?: Parts; calls: number; failed: number; retried: number; inr: number }
// The reader's wait for chapter 1, part by part (20 Oct): each step's own time, then the gaps between steps, so it adds up.
const partsLine = (h: J) => {
  const p = h.parts
  if (!p || h.toChapter1 === null) return ''
  const list: [string, number | null][] = [['research', p.research], ['plan', p.plan], ['writing', p.chapter], ['check', p.check]]
  const shown = list.filter(([, v]) => v !== null) as [string, number][]
  const gaps = h.toChapter1 - shown.reduce((t, [, v]) => t + v, 0)
  return ` (${[...shown.map(([k, v]) => `${k} ${s(v)}`), ...(gaps > 1000 ? [`between steps ${s(gaps)}`] : [])].join(' · ')})`
}
// The books, a page at a time from the server (20 Oct), under day headings; Newer goes back through the cursors seen.
// Search (topic words, best match first), kind and "failed only" narrow it; any change starts again at page 1.
const KINDS = [{ v: 'all', label: 'All' }, { v: 'typed', label: 'Typed' }, { v: 'ready', label: 'Shelf' }, { v: 'shared', label: 'Shared copies' }] as const
type Kind = (typeof KINDS)[number]['v']
function BookPages({ days, traces }: { days: number; traces: string | null }) {
  const [typing, setTyping] = useState('')
  const [q, setQ] = useState('')
  const [kind, setKind] = useState<Kind>('all')
  const [failedOnly, setFailedOnly] = useState(false)
  const [cursors, setCursors] = useState<(string | null)[]>([null])
  useEffect(() => { const t = setTimeout(() => setQ(typing.trim()), 400); return () => clearTimeout(t) }, [typing])
  useEffect(() => setCursors([null]), [days, q, kind, failedOnly])
  const page = cursors.length - 1
  const r = useQuery(api.pipeline.journeysPage, { days, paginationOpts: { numItems: PER_PAGE, cursor: cursors[page] }, ...(q ? { q } : {}), kind, failedOnly })
  return (
    <>
      <div className="adm-filters">
        <input className="input" type="search" placeholder="Search topics" aria-label="Search book topics" value={typing} onChange={(e) => setTyping(e.target.value)} />
        <Seg label="Kind of book" value={kind} onChange={setKind} options={KINDS.map((k) => ({ v: k.v, label: k.label }))} />
        <label className="adm-check"><input type="checkbox" checked={failedOnly} onChange={(e) => setFailedOnly(e.target.checked)} /> Failed only</label>
      </div>
      {q ? <p className="note">Best matches first, within this window.</p> : null}
      {r === undefined ? <p className="note">Loading…</p> : r === null ? null : !r.page.length && page === 0 ? <p className="note">No handbooks match.</p> : (
        <>
          {q ? <div className="adm-journeys">{(r.page as J[]).map((h) => <Journey key={h.id} h={h} traces={traces} />)}</div>
            : <ByDay items={r.page as J[]} at={(h) => h.createdAt}>{(h) => <Journey key={h.id} h={h} traces={traces} />}</ByDay>}
          <PageBar page={page} hasOlder={!r.isDone} onNewer={() => setCursors(cursors.slice(0, -1))} onOlder={() => setCursors([...cursors, r.continueCursor])} />
        </>
      )}
    </>
  )
}

function Journey({ h, traces }: { h: J; traces: string | null }) {
  const [open, setOpen] = useState(false)
  return (
    <details className="adm-j" onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}>
      <summary>
        <span className="adm-j-when">{new Date(h.createdAt).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Kolkata' })}</span>
        <span className="adm-j-tag">{h.kind}</span>
        <span className="adm-j-topic">{h.topic}</span>
        {/* 20 Oct (Prateek: "title and cost in one line"): the parts of the wait are in the opened row, not here */}
        <span className="adm-j-reason">{h.toChapter1 !== null ? `chapter 1 in ${s(h.toChapter1)} · ` : ''}{h.calls} call{h.calls === 1 ? '' : 's'}{h.failed ? ` · ${h.failed} failed` : ''} · {inr(h.inr)}</span>
      </summary>
      {open && <Timeline h={h} traces={traces} />}
    </details>
  )
}

function Timeline({ h, traces }: { h: J; traces: string | null }) {
  const rows = useQuery(api.pipeline.handbookCalls, { handbookId: h.id as Id<'handbooks'> })
  const trace = useTraceUrl(h.id, traces)
  return (
    <div style={{ padding: '8px 12px 12px' }}>
      <p className="note">
        {h.goal ? <>Goal: “{h.goal}” · </> : null}goal question {s(h.pickGoal)} · plan {s(h.toPlan)} after the goal · chapter 1 ready {s(h.toChapter1)} after the goal{partsLine(h)}
        {trace ? <> · <a href={trace} target="_blank" rel="noreferrer">Open in Langfuse</a></> : null}
      </p>
      {!rows ? <p className="note">Loading…</p> : (
        <div className="adm-scroll">
          <table className="adm-table">
            <thead><tr><th>Starts at</th><th>Step</th><th>Chapter</th><th>Model</th><th>Took</th><th>Tokens in / out</th><th>₹</th><th></th></tr></thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td>{s(r.startedAfter)}</td><td>{STEP[r.kind] ?? r.kind}</td><td>{r.chapter ?? ''}</td><td>{r.model}</td>
                  <td>{s(r.ms)}</td><td>{k(r.tokensIn)} / {k(r.tokensOut)}</td><td>{inr(r.inr)}</td>
                  <td>{r.ok ? (r.attempts > 1 ? `retried ×${r.attempts - 1}` : '') : <b>failed</b>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
