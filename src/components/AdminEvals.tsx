import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { AdminCheckScorer, AdminQuality } from './AdminWatch'
import { How } from './AdminUi'

// /admin, Evals tab (D82, 11 Oct; Prateek: "a separate section on the dashboard called evals. Design it well"). Top to
// bottom: how this week's chapters grade against last week's, checking the grader by hand, the last test run (sent by
// scripts/eval-run.mjs), then every grade with the lowest ones and the test set. Copy (agent).
const when = (t: number) => new Date(t).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
const SHORT: Record<string, string> = { outcome: 'Delivers its outcome', facts: 'Facts right', taught: 'Teaches before it tests' }
const CHECKS: Record<string, string> = { noIncorrectWord: 'says "wrong" or "incorrect"', caution: 'money caution line missing', pushbackOrDeclined: 'taught a harmful line without pushing back', noPromptLeak: 'leaked the prompt', noQuiz: 'has an exam quiz', safety: 'no safety line' }
type Share = { good: number; of: number } | null
const pct = (s: Share) => (s ? Math.round((s.good / s.of) * 100) : null)

function Strip({ o }: { o: NonNullable<ReturnType<typeof useOverview>> }) {
  return (
    <section className="adm-card adm-wide">
      <h2>This week's chapters <small className="adm-sub">share graded 4 or 5 of 5, rubric {o.rubric}</small></h2>
      <div className="adm-chain">
        {o.levers.map((l) => {
          const now = pct(l.now), before = pct(l.before), d = now !== null && before !== null ? now - before : null
          return (
            <div key={l.lever} className="adm-tile">
              <b>{now === null ? '—' : `${now}%`}</b>
              <span>{SHORT[l.lever] ?? l.name}</span>
              <small>
                {l.now ? `${l.now.good} of ${l.now.of} chapters` : 'No chapters graded this week'}
                {d !== null && <><br /><em className={d > 0 ? 'adm-up' : d < 0 ? 'adm-down' : ''}>{d > 0 ? `▲ ${d}` : d < 0 ? `▼ ${-d}` : '='} pts vs last week</em></>}
              </small>
            </div>
          )
        })}
        <div className={`adm-tile${o.checked >= o.goal ? ' adm-tile-good' : ''}`}>
          <b>{o.checked} of {o.goal}</b>
          <span>Grader checked by you</span>
          <span className="adm-fbar"><i style={{ width: `${Math.min(100, (o.checked / o.goal) * 100)}%` }} /></span>
          <small>{o.checked >= o.goal ? 'Enough to judge the grader' : 'Grade chapters below to see if the AI grader can be trusted'}</small>
        </div>
      </div>
    </section>
  )
}

type Case = NonNullable<NonNullable<ReturnType<typeof useOverview>>['last']>['cases'][number]

// One case: a tick when every run stayed at or above its floor, then each lever's level per run against floor and target.
function CaseRow({ c }: { c: Case }) {
  const levers = [...new Set([...Object.keys(c.expect ?? {}), ...Object.keys(c.base ?? {})])]
  return (
    <li className="adm-case">
      <span className={c.failed ? 'adm-bad' : c.floorHeld ? 'adm-ok' : 'adm-warn'} aria-label={c.failed ? 'Failed a safety check or wrote no chapter' : c.floorHeld ? 'Steady' : 'Dropped a full level or more: look at it'}>{c.failed ? '✗' : c.floorHeld ? '✓' : '⚑'}</span>
      <span>
        <b>{c.name}</b>{c.errored && <small> · this run errored</small>}{(c.crashed ?? 0) > 0 && <small className="adm-warn"> · {c.crashed} run{c.crashed === 1 ? '' : 's'} crashed before chapter 1</small>}
        {c.before !== null && c.before !== (c.passes === c.runs) && <small className={c.before ? 'adm-down' : 'adm-up'}> · {c.before ? 'broke' : 'fixed'} since last run</small>}
        <br />
        {levers.map((l) => {
          const base = c.base?.[l], avg = c.avg?.[l], target = c.expect?.[l], dropped = c.drops?.includes(l)
          return (
            <small key={l} className="adm-case-lever">
              {SHORT[l] ?? l}:{' '}
              {c.levels.map((x: Record<string, number | null> | null, i: number) => {
                const v = x?.[l]
                const unsure = x !== null && v == null && typeof base === 'number'
                return <span key={i} className={unsure ? 'adm-warn' : typeof v === 'number' && typeof target === 'number' && v >= target ? 'adm-up' : ''}>{i ? ' · ' : ''}{x === null ? 'error' : v ?? "can't tell"}</span>
              })}
              {typeof avg === 'number' && <> → <em className={dropped ? 'adm-warn' : ''}>avg {avg}</em></>}
              {' '}({typeof base === 'number' ? `last night ${base}` : 'not graded last night'}{typeof target === 'number' ? `, target ${target}` : ''})
            </small>
          )
        })}
        {!levers.length && <small className="adm-case-lever">Safety check only</small>}
        {(c.unsure?.length ?? 0) > 0 && <small className="adm-case-lever adm-warn">The grader couldn't tell on "{c.unsure!.map((x) => (SHORT[x] ?? x).toLowerCase()).join(", ")}" in a run: look at it</small>}
        {c.failedChecks.length > 0 && <small className="adm-case-lever adm-down">Failed a check: {c.failedChecks.map((x) => CHECKS[x] ?? x).join('; ')}</small>}
      </span>
      <small className="adm-case-target" title="Runs that met every target">{c.passes}/{c.runs}<br />on target</small>
    </li>
  )
}

function LastRun({ o }: { o: NonNullable<ReturnType<typeof useOverview>> }) {
  const r = o.last
  if (!r) return (
    <section className="adm-card adm-wide">
      <h2>Last test run</h2>
      <p className="note">No run recorded yet. Run npm run eval:gate (about an hour, on dev) and it appears here.</p>
    </section>
  )
  const keep = r.cases.filter((c) => c.list === 'keep'), fix = r.cases.filter((c) => c.list !== 'keep')
  const flagged = r.cases.filter((c) => !c.floorHeld && !c.failed).length, met = r.cases.filter((c) => c.passes === c.runs).length
  return (
    <section className="adm-card adm-wide">
      <h2>Last test run <span className={`adm-pill ${r.gate}`}>{r.gate === 'pass' ? 'Gate passed' : r.gate === 'fail' ? 'Gate failed' : 'Baseline'}</span></h2>
      <p className="note">{when(r.at)} · {r.cases.length} cases × {r.runs} run{r.runs === 1 ? '' : 's'} · rubric {r.rubric} · ₹{r.inr.toLocaleString('en-IN')}{r.full ? '' : ' · a partial run'}</p>
      <div className="adm-chain adm-chain-sm">
        {Object.entries((r.pooled ?? {}) as Record<string, { avg: number; n: number; base: number | null }>).map(([l, p]) => {
          const d = typeof p.base === 'number' ? Math.round((p.avg - p.base) * 100) / 100 : null
          return <div key={l} className={`adm-tile ${r.gate === 'baseline' || d === null ? '' : d < -0.25 ? 'adm-tile-bad' : 'adm-tile-good'}`}><b>{p.avg}</b><span>{SHORT[l] ?? l}, all topics</span><small>{r.gate === 'baseline' ? `Average of ${p.n} grades; later runs are compared with it` : `Average of ${p.n} grades; last night ${p.base ?? '—'}${d !== null ? ` (${d >= 0 ? '+' : ''}${d})` : ''}. The gate fails on a drop of more than 0.25`}</small></div>
        })}
        <div className="adm-tile"><b>{met} of {r.cases.length}</b><span>Met their target every run</span><small>What we're working toward; a fix-next case moves to keep after three runs in a row</small></div>
      </div>
      {flagged > 0 && <p className="note adm-warn">{flagged} topic{flagged === 1 ? '' : 's'} down a full level or more: marked ⚑ below.</p>}
      <h3>Must keep working · {keep.length}</h3>
      <ul className="adm-list">{keep.map((c) => <CaseRow key={c.name} c={c} />)}</ul>
      <h3>Fix next · {fix.length}</h3>
      <ul className="adm-list">{fix.map((c) => <CaseRow key={c.name} c={c} />)}</ul>
      {o.earlier.length > 0 && (
        <details className="adm-earlier"><summary><small>Earlier runs ({o.earlier.length})</small></summary>
          <ul className="adm-list">{o.earlier.map((e) => <li key={e.stamp}><span>{when(e.at)} · {e.cases} cases × {e.runs}{e.full ? '' : ' (partial)'}</span><small>gate {e.gate}</small></li>)}</ul>
        </details>
      )}
      <How label="How to read this">The grades per run read left to right, then their average against last night's; ⚑ and amber mark a topic down a full level or more (look at it, it doesn't fail the gate), green a grade at or above the target, amber "can't tell" a grade the grader couldn't decide (left out of the average). ✗ is a failed safety check or no chapter written, which fails the gate. Cases and floors: evals/cases.json. Full report: evals/runs/{r.stamp}/report.md.</How>
    </section>
  )
}

function useOverview() { return useQuery(api.evalRuns.overview, {}) }

export default function AdminEvals() {
  const o = useOverview()
  if (o === undefined) return <p className="note">Loading…</p>
  if (o === null) return null
  return (
    <>
      <Strip o={o} />
      <AdminCheckScorer progress={{ checked: o.checked, goal: o.goal }} />
      <LastRun o={o} />
      <AdminQuality />
    </>
  )
}
