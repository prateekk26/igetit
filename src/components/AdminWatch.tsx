import { useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'

// /admin, AI tab (D72, D73, 11 Oct night): alerts on a failure or cost spike, search across runs, two runs side by
// side, the rubric scores of every chapter written, and the eval test set with "add a low score to the set".
const s = (ms: number) => (ms < 1000 ? `${ms} ms` : ms < 90000 ? `${(ms / 1000).toFixed(ms < 10000 ? 1 : 0)} s` : `${(ms / 60000).toFixed(1)} min`)
const inr = (n: number) => `₹${n.toLocaleString('en-IN', { maximumFractionDigits: n < 10 ? 2 : 0 })}`
const when = (t: number) => new Date(t).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

export function AdminAlerts() {
  const rows = useQuery(api.watch.open, {})
  const ack = useMutation(api.watch.ack)
  const open = (rows ?? []).filter((a) => !a.acked)
  if (!rows) return null
  return (
    <section className="adm-card adm-wide">
      <h2>Alerts</h2>
      <p className="note">Checked every 10 minutes: over 20% of readers' AI calls failing in an hour, or an hour costing over ₹300 and 3 times a typical hour. With ALERT_EMAIL set in the Convex env, each alert is also emailed.</p>
      {open.length === 0 ? <p className="note">Nothing open.</p> : (
        <ul className="adm-list">
          {open.map((a) => (
            <li key={a.id}><span><b>{a.kind === 'cost' ? 'Cost spike' : 'Failures'}</b> · {when(a.at)}<br />{a.message}</span>
              <button type="button" className="quiet" onClick={() => ack({ id: a.id as Id<'alerts'> })}>Seen</button></li>
          ))}
        </ul>
      )}
      {rows.length > open.length && <p className="note">{rows.length - open.length} earlier alert(s) seen.</p>}
    </section>
  )
}

export function AdminRuns() {
  const [text, setText] = useState('')
  const [days, setDays] = useState(30)
  const [picked, setPicked] = useState<string[]>([])
  const hits = useQuery(api.watch.search, text.trim().length >= 2 ? { text, days } : 'skip')
  const d = useQuery(api.watch.diff, picked.length === 2 ? { a: picked[0] as Id<'handbooks'>, b: picked[1] as Id<'handbooks'> } : 'skip')
  const toggle = (id: string) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id].slice(-2)))
  return (
    <section className="adm-card adm-wide">
      <h2>Find and compare runs</h2>
      <p className="note">Search handbooks by words in the topic, or paste a handbook id. Tick two to see their runs side by side, step by step.</p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <input className="input" style={{ flex: '1 1 220px' }} placeholder="Topic words or a handbook id" value={text} onChange={(e) => setText(e.target.value)} />
        <div className="adm-tabs" role="group" aria-label="Search window">
          {[7, 30, 0].map((n) => <button key={n} type="button" aria-pressed={days === n} onClick={() => setDays(n)}>{n ? `${n} days` : 'All'}</button>)}
        </div>
      </div>
      {hits && (hits.length === 0 ? <p className="note">No handbook matches.</p> : (
        <div className="adm-scroll"><table className="adm-table">
          <thead><tr><th></th><th>Topic</th><th>Started</th><th>Status</th><th>Calls</th><th>Failed</th><th>Time</th><th>₹</th></tr></thead>
          <tbody>{hits.map((h) => (
            <tr key={h.id}><td><input type="checkbox" aria-label={`Compare ${h.topic}`} checked={picked.includes(h.id)} onChange={() => toggle(h.id)} /></td>
              <td>{h.topic}<br /><small>{h.id}</small></td><td>{when(h.createdAt)}</td><td>{h.status}</td><td>{h.calls}</td><td>{h.failed ? <b>{h.failed}</b> : 0}</td><td>{s(h.ms)}</td><td>{inr(h.inr)}</td></tr>
          ))}</tbody>
        </table></div>
      ))}
      {picked.length === 2 && d && (
        <>
          <h3>Side by side</h3>
          <p className="note">A: {d.a.topic} ({when(d.a.createdAt)}) · B: {d.b.topic} ({when(d.b.createdAt)}). Each cell: model, time, tokens in/out, tries, ₹; failed calls in bold.</p>
          <div className="adm-scroll"><table className="adm-table">
            <thead><tr><th>Step</th><th>A</th><th>B</th></tr></thead>
            <tbody>{d.steps.map((r) => (
              <tr key={r.step}><td>{r.step}</td>{[r.a, r.b].map((c, i) => (
                <td key={i}>{c ? <>{c.models}<br />{s(c.ms)} · {c.tokensIn}/{c.tokensOut} · {c.tries} {c.tries === 1 ? 'try' : 'tries'} · {inr(c.inr)}{c.failed ? <> · <b>{c.failed} failed</b></> : null}</> : '—'}</td>
              ))}</tr>
            ))}</tbody>
          </table></div>
          {(d.a.scores.length > 0 || d.b.scores.length > 0) && <p className="note">Rubric scores: A {d.a.scores.map((x) => `ch${x.n} ${x.lever} ${x.level ?? '?'}`).join(', ') || 'none'} · B {d.b.scores.map((x) => `ch${x.n} ${x.lever} ${x.level ?? '?'}`).join(', ') || 'none'}</p>}
        </>
      )}
    </section>
  )
}

export function AdminQuality() {
  const [days, setDays] = useState(7)
  const q = useQuery(api.rubric.dashboard, { days })
  const cases = useQuery(api.evalCases.forAdmin, {})
  const add = useMutation(api.evalCases.addFromScore)
  const remove = useMutation(api.evalCases.remove)
  const [added, setAdded] = useState<Record<string, string>>({})
  if (!q) return null
  return (
    <section className="adm-card adm-wide">
      <h2>Chapter quality (rubric {q.rubric})</h2>
      <p className="note">Every chapter written is scored after it is saved, one lever per call, levels 1 (worst) to 5 (best), with the line that decided it (convex/rubric.ts; docs/evals). {q.scored} scores in this window{q.cantTell ? `, ${q.cantTell} "can't tell"` : ''}.</p>
      <div className="adm-tabs" role="group" aria-label="Quality window" style={{ margin: '4px 0 12px' }}>
        {[1, 7, 30].map((n) => <button key={n} type="button" aria-pressed={days === n} onClick={() => setDays(n)}>{n === 1 ? 'Today' : `${n} days`}</button>)}
      </div>
      <div className="adm-scroll"><table className="adm-table">
        <thead><tr><th>Lever</th><th>L1</th><th>L2</th><th>L3</th><th>L4</th><th>L5</th></tr></thead>
        <tbody>{q.levers.map((l) => <tr key={l.lever}><td>{l.name}</td>{l.counts.map((c, i) => <td key={i}>{i < 2 && c ? <b>{c}</b> : c}</td>)}</tr>)}</tbody>
      </table></div>
      <h3>Lowest scores</h3>
      {q.low.length === 0 ? <p className="note">No chapter scored 1 or 2 in this window.</p> : (
        <ul className="adm-list">{q.low.map((r) => {
          const k = `${r.handbookId}-${r.n}-${r.lever}`
          return (
            <li key={k}><span><b>L{r.level}</b> {r.lever} · {r.topic}, chapter {r.n}<br /><small>"{r.quote}" · {r.why}</small></span>
              {added[k] ? <small>{added[k]}</small> : <button type="button" className="quiet" onClick={async () => { const x = await add({ handbookId: r.handbookId as Id<'handbooks'>, n: r.n, lever: r.lever }); setAdded((a) => ({ ...a, [k]: x.existed ? 'Already in the set' : 'Added to the test set' })) }}>Add to test set</button>}</li>
          )
        })}</ul>
      )}
      <h3>Test set: cases from live</h3>
      <p className="note">The fixed cases live in evals/cases.json; these come from the button above. Both run with npm run eval:gate before a prompt or model change ships.</p>
      {!cases || cases.length === 0 ? <p className="note">None yet.</p> : (
        <ul className="adm-list">{cases.map((c) => (
          <li key={c.id}><span>{c.name} · {c.list === 'fix' ? 'fix next' : 'must keep working'}<br /><small>{c.topic} · expects {Object.entries(c.expect ?? {}).map(([l, v]) => `${l} ≥ ${v}`).join(', ')}</small></span>
            <button type="button" className="quiet" onClick={() => remove({ id: c.id as Id<'evalCases'> })}>Remove</button></li>
        ))}</ul>
      )}
    </section>
  )
}

// Check the scorer (D75): one chapter the scorer graded, the owner's own level per lever and a one-line note first; the
// scorer's levels show only after saving. The agreement table counts how many of the owner's worst-scored chapters the
// scorer also scored worst (Advanced evals: "look hardest at the bad ones").
export function AdminCheckScorer() {
  const [skip, setSkip] = useState<string[]>([])
  const next = useQuery(api.rubric.reviewNext, { skip })
  const agree = useQuery(api.rubric.agreement, {})
  const save = useMutation(api.rubric.saveHuman)
  const [levels, setLevels] = useState<Record<string, number | null>>({})
  const [note, setNote] = useState('')
  const [shown, setShown] = useState<{ key: string; scorer: { lever: string; level: number | null; quote: string; why: string }[] } | null>(null)
  if (!next) return null
  const reset = () => { setLevels({}); setNote(''); setShown(null) }
  return (
    <section className="adm-card adm-wide">
      <h2>Check the scorer</h2>
      <p className="note">Score a chapter yourself before you see what the scorer said. 30 chapters, a mix of good and bad, tell you how far to trust it, above all on the bad ones.</p>
      {agree && agree.chapters > 0 && (
        <div className="adm-scroll"><table className="adm-table">
          <thead><tr><th>Lever</th><th>Scored by both</th><th>Same level</th><th>Within 1</th><th>Your worst (L1-2) it also caught</th></tr></thead>
          <tbody>{agree.levers.map((l) => <tr key={l.lever}><td>{l.name}</td><td>{l.both}</td><td>{l.same}</td><td>{l.within1}</td><td>{l.bad ? <b>{l.badCaught} of {l.bad}</b> : '—'}</td></tr>)}</tbody>
        </table></div>
      )}
      {'done' in next ? <p className="note">Every scored chapter has your levels. New ones arrive as readers' chapters are written.</p> : (
        <>
          <h3>{next.topic} · chapter {next.n}: {next.title}</h3>
          <p className="note">You reviewed {next.reviewedSoFar} so far. The plan's outcome: "{next.outcome}"</p>
          <ol className="adm-list" style={{ listStyle: 'decimal', paddingLeft: 20 }}>
            {next.cards.map((c, i) => (
              <li key={i} style={{ display: 'block' }}><small>{c.type}{c.title ? ` · ${c.title}` : ''}</small><br />
                {c.body && <span style={{ whiteSpace: 'pre-wrap' }}>{c.body}</span>}
                {c.prompt && <><b>{c.prompt}</b><br />{(c.options ?? []).map((o: { id: string; text: string }) => <span key={o.id}>{o.id}) {o.text}{c.answer === o.id ? ' ✓' : ''}<br /></span>)}</>}
              </li>
            ))}
          </ol>
          {next.levers.map((l) => (
            <div key={l.lever} style={{ margin: '10px 0' }}>
              <b>{l.name}</b>
              <div className="adm-tabs" role="group" aria-label={l.name} style={{ marginTop: 6 }}>
                {[1, 2, 3, 4, 5].map((n) => <button key={n} type="button" aria-pressed={levels[l.lever] === n} onClick={() => setLevels((x) => ({ ...x, [l.lever]: n }))}>L{n}</button>)}
                <button type="button" aria-pressed={levels[l.lever] === null} onClick={() => setLevels((x) => ({ ...x, [l.lever]: null }))}>n/a</button>
              </div>
              <details><summary><small>The levels</small></summary><small>{l.levels.map((t) => <span key={t}>{t}<br /></span>)}</small></details>
            </div>
          ))}
          <input className="input" placeholder="One line: the first thing that went wrong (or 'fine')" value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} />
          {!shown ? (
            <button type="button" className="btn" style={{ marginTop: 12 }} disabled={next.levers.some((l) => !(l.lever in levels))}
              onClick={async () => { const scorer = await save({ handbookId: next.handbookId as Id<'handbooks'>, n: next.n, levels, note: note.trim() || undefined }); setShown({ key: next.key, scorer }) }}>Save, then show the scorer's</button>
          ) : (
            <>
              <ul className="adm-list">{shown.scorer.map((s) => <li key={s.lever}><span><b>{s.lever}</b>: scorer L{s.level ?? '?'}, you {levels[s.lever] === null ? 'n/a' : `L${levels[s.lever]}`}<br /><small>"{s.quote}" · {s.why}</small></span></li>)}</ul>
              <button type="button" className="btn" onClick={reset}>Next chapter</button>
            </>
          )}
          {!shown && <button type="button" className="quiet" onClick={() => { setSkip((x) => [...x, next.key]); reset() }}>Skip this one</button>}
        </>
      )}
    </section>
  )
}
