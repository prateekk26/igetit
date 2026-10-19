import { useState } from 'react'
import AdminPipeline from '../components/AdminPipeline'
import AdminReview from '../components/AdminReview'
import { AdminAlerts, AdminRuns } from '../components/AdminWatch'
import AdminEvals from '../components/AdminEvals'
import AdminShelf from '../components/AdminShelf'
import { ByDay, How, Paged, Seg } from '../components/AdminUi'
import { Wordmark } from '../components/Ooh'
import './admin.css'
import { deviceToken } from '../lib/device'
import { useConvexAuth, useMutation, useQuery } from 'convex/react'
import { useAuthActions } from '@convex-dev/auth/react'
import { api } from '../../convex/_generated/api'

// The owner's dashboard at /admin: where visitors drop off, from landing to sign-up. The server checks the owner
// (STATS_OWNER_EMAILS); anyone else gets the sign-in box and nothing else.
// D39 (Prateek, 9 Oct: "we need to have some scroll bars in different sections or create tabs"): one tab at a time,
// remembered in the address (#shelf), so a reload lands on the same one.
const TABS = [{ k: 'matters', label: 'What matters' }, { k: 'shelf', label: 'Shelf and review' }, { k: 'trending', label: 'Trending and rewrites' }, { k: 'payments', label: 'Payments' }, { k: 'ai', label: 'AI and cost' }, { k: 'evals', label: 'Evals' }, { k: 'people', label: 'People and funnel' }]
// The time window only changes the numbers on these two tabs (14 Oct: it sat over every tab and did nothing on five).
const WINDOWED = new Set(['matters', 'people'])
const WINDOWS = [{ v: 1, label: 'Today' }, { v: 7, label: '7 days' }, { v: 30, label: '30 days' }, { v: 0, label: 'All time' }]
const SECTION_NAMES: Record<string, string> = { hero: 'Top (box)', saved: '"You saved the reel"', steps: 'How tonight works', demo: 'Demo chapter', path: 'Seven nights', shelf: 'Ready tonight shelf', best: 'Top handbooks carousel', offer: 'Price', final: 'Box again (bottom)' }
const pct = (n: number, of: number) => (of ? Math.round((n / of) * 100) : 0)
const time = (t: number) => new Date(t).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
const secs = (s: number | null) => (s === null ? '—' : s < 90 ? `${s}s` : `${Math.round(s / 60)} min`)

export default function Admin() {
  const [days, setDays] = useState(1)
  const [tab, setTab] = useState(() => (TABS.some((t) => t.k === window.location.hash.slice(1)) ? window.location.hash.slice(1) : 'matters'))
  const go = (k: string) => { setTab(k); try { window.history.replaceState(null, '', '#' + k) } catch {} }
  // The sign-in token loads a moment after the page (9 Oct, Prateek: "if I'm visiting the page while being signed in, it should
  // recognise it"): until it has, the owner query is not asked, so a signed-in owner never sees the sign-in form flash.
  const { isLoading } = useConvexAuth()
  const d = useQuery(api.admin.dashboard, isLoading ? 'skip' : { days })
  // What waits for the owner, as a count on its tab: typed handbooks to review, AI alerts not yet seen.
  const owner = !!d && !d.denied
  const queue = useQuery(api.library.reviewQueue, owner ? {} : 'skip')
  const alerts = useQuery(api.watch.open, owner ? {} : 'skip')
  const waiting: Record<string, number> = { shelf: (queue ?? []).filter((r) => r.review === 'pending').length, ai: (alerts ?? []).filter((a) => !a.acked).length }

  return (
    <div className="adm">
      <header className="adm-top">
        <a href="/" className="wordmark adm-mark" aria-label="I Get It, home"><Wordmark /> <span className="adm-mark-tag">admin</span></a>
        {owner && WINDOWED.has(tab) && <Seg label="Numbers for" value={days} onChange={setDays} options={WINDOWS} />}
      </header>

      {d === undefined ? <p className="note">Loading…</p> : d.denied ? <OwnerSignIn signedIn={d.signedIn} /> : (
        <>
          <nav className="adm-nav" aria-label="Sections">{TABS.map((t) => (
            <button key={t.k} type="button" aria-pressed={tab === t.k} onClick={() => go(t.k)}>
              {t.label}{waiting[t.k] ? <span className="adm-badge" aria-label={`${waiting[t.k]} waiting`}>{waiting[t.k]}</span> : null}
            </button>
          ))}</nav>

          {WINDOWED.has(tab) && <p className="adm-status">Updated live. Your own phones and accounts are left out. {d.trackingSince ? `Landing steps (marked •) are counted from ${time(d.trackingSince)}, when page tracking began.` : 'Landing steps (marked •) start counting from the next visit.'}</p>}

          {/* D37 (Prateek, 9 Oct): the page opens on the metrics that matter, in the order they cause each other. D39: every
              other section is a tab, and each has its actions (approve, reject, delete forever, build, rewrite, move). */}
          {tab === 'matters' && <><Metrics days={days} sources={d.sources} /><MineCard /></>}
          {tab === 'shelf' && <><AdminReview /><AdminShelf /></>}
          {tab === 'trending' && <><TrendingCard /><ExperimentsCard /></>}
          {tab === 'payments' && <PaymentsCard />}
          {/* AI and cost together (8 Oct, Tanisha): what every step takes and costs, by handbook, then spend by day. */}
          {tab === 'ai' && <><AdminAlerts /><ProviderSwitch /><AdminPipeline /><AdminRuns /><CostsCard /></>}
          {/* D82 (Prateek, 11 Oct): everything that judges chapter quality has its own tab. */}
          {tab === 'evals' && <AdminEvals />}

          {tab === 'people' && <>
          <PeopleCard rows={d.recent as any} />
          <section className="adm-card adm-wide">
            <h2>Funnel</h2>
            <div className="adm-funnel">
              {d.funnel.map((f, i) => {
                const base = d.funnel[0].n
                const prev = i > 0 ? d.funnel[i - 1] : null
                const of = f.tracked ? (f as any).of as number : base
                const drop = prev && !f.tracked && !prev.tracked ? prev.n - f.n : null
                return (
                  <div key={f.step} className="adm-frow">
                    <span className="adm-flabel">{f.step}{f.tracked ? ' •' : ''}</span>
                    <span className="adm-fbar"><i style={{ width: `${pct(f.n, of)}%` }} /></span>
                    <span className="adm-fn"><b>{f.n}</b> <small>{pct(f.n, of)}%{f.tracked ? ` of ${of}` : ''}</small></span>
                    <span className="adm-fdrop">{drop ? `−${drop}` : ''}</span>
                  </div>
                )
              })}
            </div>
          </section>

          <div className="adm-grid">
            <section className="adm-card">
              <h2>How far down the landing page</h2>
              {d.sections.map((s) => (
                <div key={s.section} className="adm-frow small">
                  <span className="adm-flabel">{SECTION_NAMES[s.section] ?? s.section}</span>
                  <span className="adm-fbar"><i style={{ width: `${pct(s.n, s.of)}%` }} /></span>
                  <span className="adm-fn"><b>{s.n}</b> <small>{pct(s.n, s.of)}%</small></span>
                </div>
              ))}
            </section>

            <section className="adm-card">
              <h2>How handbooks get started</h2>
              {d.via.length === 0 ? <p className="note">None yet in this window.</p> : (
                <ul className="adm-list">{d.via.map((v) => <li key={v.via}><span>{v.via === 'box' ? 'Typed in the box' : v.via === 'chip' ? 'Tapped a topic under the box' : v.via === 'demo' ? 'Read the rest of a demo chapter' : v.via === 'row' ? 'Tapped the row under the box' : v.via === 'top' ? 'Tapped the top handbooks carousel' : v.via === 'shelf' ? 'Tapped the shelf lower down' : v.via}</span><b>{v.n}</b></li>)}</ul>
              )}
              {d.tapped.length > 0 && <><h3>Ready topics tapped</h3><ul className="adm-list">{d.tapped.map((t) => <li key={t.topic}><span>{t.topic}</span><b>{t.n}</b></li>)}</ul></>}
            </section>

            <section className="adm-card">
              <h2>Waits</h2>
              <ul className="adm-list">
                <li><span>Typed topic → plan on screen (median)</span><b>{secs(d.waits.planLive)}</b></li>
                <li><span>Ready topic → plan on screen (median)</span><b>{secs(d.waits.planReady)}</b></li>
                <li><span>Plan on screen → chapter 1 opened (median)</span><b>{secs(d.waits.toCh1)}</b></li>
                <li><span>Typed a topic, never opened chapter 1</span><b>{d.waits.leftWhileWriting}</b></li>
              </ul>
            </section>

          </div>

          <section className="adm-card adm-wide">
            <h2>By source</h2>
            <table className="adm-table">
              <thead><tr><th>Source</th><th>Visitors</th><th>Started</th><th>Opened ch 1</th><th>Passed ch 1</th><th>Signed up</th></tr></thead>
              <tbody>{d.sources.map((s) => <tr key={s.source}><td>{s.source}</td><td>{s.visitors}</td><td>{s.started} <small>{pct(s.started, s.visitors)}%</small></td><td>{s.opened}</td><td>{s.passed} <small>{pct(s.passed, s.visitors)}%</small></td><td>{s.signedUp}</td></tr>)}</tbody>
            </table>
          </section>

          <section className="adm-card adm-wide">
            <h2>Topics</h2>
            <Paged items={d.topics} resetKey={days}>{(page) => (
              <table className="adm-table">
                <thead><tr><th>Topic</th><th></th><th>Started</th><th>Opened ch 1</th><th>Passed ch 1</th></tr></thead>
                <tbody>{page.map((t) => <tr key={t.topic}><td>{t.topic}</td><td><small>{t.ready ? 'ready' : 'typed'}</small></td><td>{t.started}</td><td>{t.opened}</td><td>{t.passed}</td></tr>)}</tbody>
              </table>
            )}</Paged>
          </section>

          <div className="adm-grid">
            <section className="adm-card">
              <h2>Why people stop</h2>
              <p className="adm-status">Each visitor's most likely reason, from what they did last.</p>
              <ul className="adm-list">{d.reasons.map((r) => <li key={r.reason}><span>{r.reason}</span><b>{r.n}</b></li>)}</ul>
            </section>
            <section className="adm-card">
              <h2>Devices</h2>
              <ul className="adm-list">{d.devices.map((x) => <li key={x.device}><span>{x.device === 'unknown' ? 'Unknown (before tracking)' : x.device}</span><b>{x.n}</b></li>)}</ul>
            </section>
          </div>

          <section className="adm-card adm-wide">
            <h2>Each person's path</h2>
            <p className="adm-status">Newest first, up to 300 visitors in this window. Tap one to see everything they did, in order.</p>
            <Paged items={d.recent} resetKey={days}>{(page) => (
            <ByDay items={page} at={(r) => r.first}>{(r) => (
                <details key={r.visitor + r.first} className="adm-j">
                  <summary>
                    <span className="adm-j-when">{time(r.first)}</span>
                    <span className="adm-j-tag">{r.source}</span>
                    <span className="adm-j-tag">{r.device ?? '?'}</span>
                    <span className="adm-j-tag">{secs(r.spentS)}</span>
                    <span className="adm-j-topic">{r.topic ?? ''}</span>
                    <span className="adm-j-reason">{r.reason}</span>
                  </summary>
                  <ol className="adm-j-steps">
                    {r.timeline.length === 0 ? <li><span>—</span>No page activity recorded.</li> : r.timeline.map((x, k) => <li key={k}><span>{x.t < 0 ? '' : `+${secs(x.t)}`}</span>{x.what}</li>)}
                  </ol>
                </details>
              )}</ByDay>
            )}</Paged>
          </section>

          <section className="adm-card adm-wide">
            <h2>By day</h2>
            <table className="adm-table">
              <thead><tr><th>Day</th><th>New visitors</th><th>Handbooks started</th><th>Passed ch 1</th></tr></thead>
              <tbody>{d.days.slice().reverse().map((x) => <tr key={x.day}><td>{x.day}</td><td>{x.visitors}</td><td>{x.started}</td><td>{x.passed}</td></tr>)}</tbody>
            </table>
          </section>
          </>}
        </>
      )}
    </div>
  )
}

const inr = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN')
const day = (s: string | null) => (s ? new Date(s).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '')
function Tile({ big, label, sub, tone }: { big: string | number; label: string; sub?: string; tone?: 'good' | 'bad' }) {
  return <div className={`adm-tile${tone ? ` adm-tile-${tone}` : ''}`}><b>{big}</b><span>{label}</span>{sub && <small>{sub}</small>}</div>
}
// D37: the metrics that matter, in the order they cause each other (Prateek, 9 Oct: "Revenue which is influenced by sign
// ups which is influenced by handbooks created which is influenced by visits… retention… cost"). Window from the tabs;
// "all time" in small under each. The fixed costs are the owner's own rows; the calculator adds them to the model bills.
function Metrics({ days, sources }: { days: number; sources: { source: string; visitors: number; started: number; opened: number; passed: number; signedUp: number }[] }) {
  const m = useQuery(api.admin.metrics, { days })
  const save = useMutation(api.admin.saveFixedCost)
  const remove = useMutation(api.admin.removeFixedCost)
  const [form, setForm] = useState<{ id?: string; name: string; amount: string; kind: 'monthly' | 'once'; from: string; to: string; note: string } | null>(null)
  const [err, setErr] = useState<string | null>(null)
  if (!m) return <section className="adm-card adm-wide"><h2>What matters</h2><p className="note">Loading…</p></section>
  const c = m.chain, b = m.back, $ = m.money
  const label = days === 0 ? 'all time' : days === 1 ? 'today' : `last ${days} days`
  const p = (n: number, of: number) => (of ? `${pct(n, of)}%` : '—')
  const submit = async () => {
    if (!form) return
    setErr(null)
    try { await save({ id: form.id as any, name: form.name, amount: Number(form.amount), kind: form.kind, from: form.from, to: form.to || undefined, note: form.note || undefined }); setForm(null) }
    catch (e: any) { setErr(String(e?.message ?? e).replace(/^.*Error: /, '').slice(0, 120)) }
  }
  return (
    <section className="adm-card adm-wide adm-metrics">
      <h2>What matters <small>({label})</small></h2>
      <h3>The chain: each one feeds the next</h3>
      <div className="adm-chain">
        <Tile big={c.visitors} label="Visits" sub={`people; all time ${c.all.visitors}`} />
        <Tile big={c.started} label="Handbooks started" sub={`${p(c.starters, c.visitors)} of visitors started one · ${c.typed} typed; all time ${c.all.started}`} />
        <Tile big={c.signups} label="Sign-ups" sub={`${p(c.signups, c.starters)} of people who started; all time ${c.all.signups}`} />
        <Tile big={inr(c.revenue)} label="Revenue" sub={`${c.payers} paid, ${p(c.payers, c.signups)} of sign-ups; all time ${inr(c.all.revenue)}`} tone={c.revenue > 0 ? 'good' : undefined} />
      </div>
      <h3>Coming back</h3>
      <div className="adm-chain">
        <Tile big={b.repeat} label="Repeat visits" sub={`people seen on 2 or more days; all time ${b.repeatAll}`} />
        <Tile big={b.passesSince ? b.passed : b.passedAll} label="Chapters completed" sub={b.passesSince ? `counted from ${time(b.passesSince)}; all time ${b.passedAll}` : `all time; by-window counting starts with the next pass`} />
        <Tile big={b.shelf} label="Shelf browsed" sub={b.shelfSince ? `people who opened the Shelf; counted from ${time(b.shelfSince)}` : 'counted from the next Shelf open'} />
      </div>
      <h3>Money</h3>
      <div className="adm-chain">
        <Tile big={inr($.revenue)} label="Revenue" sub={`all time ${inr($.revenueAll)}`} />
        <Tile big={inr($.variable)} label="Model cost (variable)" sub={`all time ${inr($.variableAll)}${$.costSince ? ` since ${day($.costSince)}` : ''}`} />
        <Tile big={inr($.fixedToDate)} label="Fixed cost to date" sub={`${inr($.fixedMonthly)} a month right now`} />
        <Tile big={inr($.invested)} label="Invested till now" sub="fixed to date + model cost all time" />
        <Tile big={inr($.net)} label="Net" sub="revenue all time − invested" tone={$.net >= 0 ? 'good' : 'bad'} />
        <Tile big={inr($.perDay)} label="Burn a day" sub="fixed ÷ 30 + model cost, last 7 days ÷ 7" />
      </div>
      <h3>By channel</h3>
      <How>Where each person first came from (utm_source, else the referring site), for this window. Revenue by channel needs a payment to carry its source; none has yet.</How>
      <div className="adm-scroll"><table className="adm-table">
        <thead><tr><th>Channel</th><th>Visitors</th><th>Started</th><th>Opened ch 1</th><th>Passed ch 1</th><th>Signed up</th></tr></thead>
        <tbody>{sources.length === 0 ? <tr><td colSpan={6}><small>No visits in this window.</small></td></tr> : sources.map((s) => <tr key={s.source}><td>{s.source}</td><td>{s.visitors}</td><td>{s.started} <small>{p(s.started, s.visitors)}</small></td><td>{s.opened}</td><td>{s.passed} <small>{p(s.passed, s.started)}</small></td><td>{s.signedUp}</td></tr>)}</tbody>
      </table></div>
      <h3>Fixed costs <button type="button" className="quiet" onClick={() => setForm({ name: '', amount: '', kind: 'monthly', from: new Date().toISOString().slice(0, 10), to: '', note: '' })}>Add a cost</button></h3>
      {m.fixed.length === 0 && !form && <p className="note">Nothing entered yet. Add what you pay for: Claude Code, Convex, the domain, Runway credits, anything with a bill. Monthly ones count from their start date to today; one-offs count once.</p>}
      {m.fixed.length > 0 && (
        <div className="adm-scroll"><table className="adm-table">
          <thead><tr><th>Name</th><th>Amount</th><th>Kind</th><th>From</th><th>To</th><th>Note</th><th>So far</th><th></th></tr></thead>
          <tbody>{m.fixed.map((f) => (
            <tr key={f.id}>
              <td>{f.name}</td><td>{inr(f.amount)}</td><td>{f.kind === 'monthly' ? 'a month' : 'one-off'}</td><td>{f.from}</td><td>{f.to ?? ''}</td><td><small>{f.note ?? ''}</small></td><td><b>{inr(f.soFar)}</b></td>
              <td><button type="button" className="quiet" onClick={() => setForm({ id: f.id, name: f.name, amount: String(f.amount), kind: f.kind as any, from: f.from, to: f.to ?? '', note: f.note ?? '' })}>Edit</button> <button type="button" className="quiet" onClick={() => remove({ id: f.id as any })}>Remove</button></td>
            </tr>
          ))}</tbody>
        </table></div>
      )}
      {form && (
        <form className="adm-form" onSubmit={(e) => { e.preventDefault(); submit() }}>
          <input className="input" placeholder="Name (Claude Code, Convex…)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={60} />
          <input className="input" type="number" min={0} step={1} placeholder="Rupees" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          <select className="adm-select" value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value as any })} aria-label="How often"><option value="monthly">a month</option><option value="once">one-off</option></select>
          <input className="input" type="date" value={form.from} onChange={(e) => setForm({ ...form, from: e.target.value })} aria-label="From" />
          <input className="input" type="date" value={form.to} onChange={(e) => setForm({ ...form, to: e.target.value })} aria-label="To (optional)" />
          <input className="input" placeholder="Note (optional)" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} maxLength={120} />
          <span><button className="btn" type="submit">Save</button> <button type="button" className="quiet" onClick={() => { setForm(null); setErr(null) }}>Cancel</button></span>
          {err && <p className="error">{err}</p>}
        </form>
      )}
    </section>
  )
}

// Owner sign-in by emailed code (11 Oct: the old email-and-password form here could never open /admin for an owner
// without a password, such as Tanisha, and only a code-verified email passes ownerUser since the 8 Oct audit).
// Same Convex Auth "email-otp" provider as the reader's sign-in; once signed in, the dashboard query re-runs by itself.
function OwnerSignIn({ signedIn }: { signedIn: boolean }) {
  const { signIn, signOut } = useAuthActions()
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  if (signedIn) return (
    <section className="adm-card"><h2>Owner only</h2><p className="note">This account isn't on the owner list.</p>
      <button type="button" className="quiet" onClick={() => signOut()}>Sign out and use another account</button></section>
  )
  const send = async () => {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) { setError('Check the email: it needs an @ and a dot.'); return }
    setBusy(true); setError(null)
    try { await signIn('email-otp', { email: email.trim() }); setStep('code'); setCode('') }
    catch (e: any) { setError(String(e?.message ?? e).includes('too many') ? "That's a few codes in a row. Wait a few minutes, then try again." : "Couldn't send the code just now. Try again in a minute.") }
    finally { setBusy(false) }
  }
  const check = async () => {
    setBusy(true); setError(null)
    try { await signIn('email-otp', { email: email.trim(), code: code.trim() }) }
    catch { setCode(''); setError("That code didn't work. A code works for 10 minutes and only the newest one counts.") }
    finally { setBusy(false) }
  }
  return (
    <section className="adm-card" style={{ maxWidth: 420 }}>
      <h2>Owner only</h2>
      {step === 'email' ? (
        <form onSubmit={(e) => { e.preventDefault(); send() }}>
          <p className="note">Sign in with an owner email. We email you a 6-digit code; no password.</p>
          <input className="input" type="email" placeholder="Email" value={email} onChange={(e) => { setEmail(e.target.value); setError(null) }} autoComplete="email" style={{ marginTop: 12 }} />
          {error && <p className="error">{error}</p>}
          <button className="btn" type="submit" disabled={busy} style={{ marginTop: 14 }}>{busy ? 'One moment…' : 'Email me a code'}</button>
        </form>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); check() }}>
          <p className="note">The code is on its way to {email.trim()}. It works for 10 minutes.</p>
          <input className="input" inputMode="numeric" autoComplete="one-time-code" placeholder="6-digit code" value={code} onChange={(e) => { setCode(e.target.value.replace(/\D/g, '').slice(0, 6)); setError(null) }} style={{ marginTop: 12 }} />
          {error && <p className="error">{error}</p>}
          <button className="btn" type="submit" disabled={busy || code.length !== 6} style={{ marginTop: 14 }}>{busy ? 'One moment…' : 'Sign in'}</button>
          <button type="button" className="quiet" onClick={() => { setStep('email'); setError(null) }}>Use another email, or send a new code</button>
        </form>
      )}
    </section>
  )
}

// The AI provider switch (6 Oct, Manthan's offer). Claude is the default and always one tap away.
function ProviderSwitch() {
  const st = useQuery(api.settings.providerStatus, {})
  const setProvider = useMutation(api.settings.setProvider)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  if (!st) return null
  const flip = async (p: 'claude' | 'inference') => { setBusy(true); setError(null); try { await setProvider({ provider: p }) } catch (e: any) { setError(String(e?.message ?? e).includes('INFERENCE_API_KEY') ? 'Set INFERENCE_API_KEY on this server first.' : "Couldn't switch. Try again.") } finally { setBusy(false) } }
  return (
    <section className="adm-card adm-wide">
      <h2>AI provider</h2>
      <p className="note">Plans, chapters, fact checks, teach-backs and picture scenes use this. Ask or object stays on Claude (its web search is Claude's).{st.since ? ` Switched ${time(st.since)}.` : ''}</p>
      <div className="adm-seg" role="group" aria-label="AI provider">
        <button type="button" aria-pressed={st.provider === 'claude'} disabled={busy} onClick={() => flip('claude')}>Claude (Anthropic)</button>
        <button type="button" aria-pressed={st.provider === 'inference'} disabled={busy || !st.inferenceKeySet} onClick={() => flip('inference')}>DeepSeek v4 Pro (The Inference Company)</button>
      </div>
      {!st.inferenceKeySet && <p className="note">The Inference Company key isn't set on this server yet.</p>}
      {st.provider === 'inference' && <p className="note">Readers' topics and chapters now go to The Inference Company. Switch back to Claude any time; chapters already written stay as they are.</p>}
      {error && <p className="error">{error}</p>}
    </section>
  )
}

// This week's trending handbooks (6 Oct): built every Monday 6:30am IST from what's trending on social media.
function TrendingCard() {
  const found = useQuery(api.trendingAdmin.candidates, {})
  const built = useQuery(api.settings.trendingNow, {})
  const buildOne = useMutation(api.trendingAdmin.buildOne)
  const findNow = useMutation(api.trendingAdmin.findNow)
  const [started, setStarted] = useState(false)
  if (found === undefined || built === undefined) return null
  return (
    <section className="adm-card adm-wide">
      <h2>Trending topics</h2>
      <p className="adm-status">{found?.at ? `Last search ${time(found.at)}.` : 'Not searched yet this week.'} Building one costs about ₹100 and takes about 15 minutes.</p>
      <How>Every Monday 6:30am IST, Claude searches what's trending in India and parks topics here (D39). Nothing is written until you tap <b>Build it</b>: a plan, 7 checked chapters and pictures, then it is on the Shelf under its subject.</How>
      {!found || found.picks.length === 0 ? <p className="note">No topics found yet this week.</p> : (
        <div className="adm-scroll"><table className="adm-table">
          <thead><tr><th>Topic</th><th>Why this week</th><th>Goal</th><th>Kind</th><th></th></tr></thead>
          <tbody>{found.picks.map((p: any) => (
            <tr key={p.line}>
              <td><b>{p.line}</b></td><td><small>{p.why}</small></td><td><small>{p.goal}</small></td><td>{p.mode || ''}</td>
              <td>{p.state === 'building' ? <small>Building since {time(p.startedAt)}…</small> : <button type="button" className="btn adm-btn-sm" onClick={() => buildOne({ line: p.line, goal: p.goal || undefined, mode: p.mode || undefined })}>Build it</button>}</td>
            </tr>
          ))}</tbody>
        </table></div>
      )}
      <p><button type="button" className="quiet" disabled={started} onClick={async () => { await findNow({}); setStarted(true) }}>{started ? 'Searching: topics appear here in about a minute' : "Find this week's topics now"}</button></p>
      {built && built.length > 0 && <><h3>Built from trending</h3><ul className="adm-list">{built.map((r: any) => <li key={r.topic}><span>{r.topic}</span><b>{r.week}</b></li>)}</ul></>}
    </section>
  )
}

// Razorpay (6 Oct): money in, by test and live. Amounts and times only.
function PaymentsCard() {
  const d = useQuery(api.payments.adminList, {})
  const budget = useQuery(api.membership.budgetToday, {})
  if (!d) return null
  const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`
  const when = (t: number) => new Date(t).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })
  return (
    <section className="adm-card adm-wide">
      <h2>Payments (Razorpay)</h2>
      <p className="note">{d.live ? (d.mode === 'live' ? 'Live: real money.' : 'Test mode: no real money moves.') : 'Off: no Razorpay keys set, so Pay still only records the tap.'}</p>
      {budget && <p className="note">Free readers' spend today: about ₹{budget.spent} of ₹{budget.budget}. Past that, new typed topics and web-checked answers pause for free readers until midnight IST; members aren't paused.</p>}
      <ul className="adm-list">
        <li><span>Paid, live</span><b>{d.paidLive} · {inr(d.rupeesLive)}</b></li>
        <li><span>Paid, test</span><b>{d.paidTest} · {inr(d.rupeesTest)}</b></li>
        <li><span>People who paid</span><b>{d.payers}</b></li>
        <li><span>Pay sheets opened</span><b>{d.started}</b></li>
      </ul>
      {d.recent.length > 0 && <Paged items={d.recent}>{(page) => <ul className="adm-list">{page.map((r, i) => <li key={i}><span>{when(r.at)} · {r.plan === 'year' ? 'year' : 'month'}{r.tier ? ` · tier ${r.tier}` : ''} · {r.mode}{r.via ? ` · ${r.via}` : ''}</span><b>{r.status} {inr(r.amount)}</b></li>)}</ul>}</Paged>}
    </section>
  )
}

// What the app spends (7 Oct, Prateek): per day, then per model, then per job inside a model. Estimates from list
// prices (costs.ts); each provider's bill is the truth.
const JOB: Record<string, string> = { plan: 'Plans', chapter: 'Chapters', check: 'Fact checks and picture scenes', versions: 'Quiz versions', match: 'Match with a ready book', library: 'Library check', photo: 'Wikimedia photos (free)', move: 'Moving figures', artifact: 'Try-it pages', repair: 'Rewrites and polish', scenes: 'Picture scenes', picture: 'Pictures', intent: 'Goal question', research: 'Research', transcript: 'YouTube transcripts', ask: 'Ask or object', teach: 'Teach it back', simpler: 'Say it simpler (removed)', audit: 'Audits' }
function CostsCard() {
  const [days, setDays] = useState(14)
  const rows = useQuery(api.costs.byDay, { days })
  if (!rows) return null
  const inr = (n: number) => `₹${n.toLocaleString('en-IN', { maximumFractionDigits: n < 10 ? 1 : 0 })}`
  const total = rows.reduce((a, d) => a + d.inr, 0)
  const byModel = new Map<string, { model: string; provider: string; inr: number; calls: number }>()
  for (const d of rows) for (const m of d.models) { const x = byModel.get(m.model) ?? { model: m.model, provider: m.provider, inr: 0, calls: 0 }; x.inr += m.inr; x.calls += m.calls; byModel.set(m.model, x) }
  return (
    <section className="adm-card adm-wide">
      <h2>What we spend (estimated)</h2>
      <div className="adm-head-row">
        <p className="adm-big"><b>{inr(total)}</b> over the last {days} days</p>
        <Seg label="Cost window" value={days} onChange={setDays} options={[7, 14, 30].map((n) => ({ v: n, label: `${n} days` }))} />
      </div>
      <How>Tap a day for its models, a model for what it was used for. List prices at ₹94.90 a dollar (19 Oct); the providers' bills are the real numbers.</How>
      <ul className="adm-list">{[...byModel.values()].sort((a, b) => b.inr - a.inr).map((m) => <li key={m.model}><span>{m.provider} · {m.model} · {m.calls} calls</span><b>{inr(m.inr)}</b></li>)}</ul>
      {rows.map((d) => (
        <details key={d.day} className="cost-day">
          <summary><span>{d.day}</span><b>{inr(d.inr)}</b><span className="note">{d.calls} calls</span></summary>
          {d.models.map((m) => (
            <details key={m.model} className="cost-model">
              <summary><span>{m.provider} · {m.model}</span><b>{inr(m.inr)}</b><span className="note">{m.calls} calls{m.failed ? `, ${m.failed} failed` : ''}{m.tokensIn ? `, ${Math.round(m.tokensIn / 1000)}k in / ${Math.round(m.tokensOut / 1000)}k out` : ''}</span></summary>
              <ul className="adm-list">{m.kinds.map((k) => <li key={k.kind}><span>{JOB[k.kind] ?? k.kind} · {k.calls} calls{k.failed ? `, ${k.failed} failed` : ''}</span><b>{inr(k.inr)}</b></li>)}</ul>
            </details>
          ))}
        </details>
      ))}
    </section>
  )
}

// Self-improving handbooks (6 Oct): diagnosis, the lesson for the writer, and A vs B on getting readers through chapter 1.
function ExperimentsCard() {
  const rows = useQuery(api.doctor.adminList, {})
  const shelf = useQuery(api.shelf.adminList, {})
  const act = useMutation(api.doctor.ownerAction)
  const scan = useMutation(api.doctor.scanNow)
  const rewrite = useMutation(api.doctor.rewriteNow)
  const [scanned, setScanned] = useState(false)
  const [pick, setPick] = useState('')
  const [started, setStarted] = useState<string | null>(null)
  if (!rows) return null
  const rate = (p: number, s: number) => (s ? `${p}/${s} (${Math.round((p / s) * 100)}%)` : '0')
  const ready = (shelf ?? []).filter((r) => r.kind === 'ready').map((r) => r.topic).sort()
  return (
    <section className="adm-card adm-wide">
      <h2>Chapter 1 rewrites (A/B tests)</h2>
      <How>Start a rewrite of chapter 1 for any ready topic: the doctor diagnoses the current chapter 1 and writes a B version, and new readers are split half and half. On a running test, make B the default or stop it. The nightly 4am scan starts tests by itself where 2 or more readers quit chapter 1; B replaces A on its own with 8+ readers a side and a clear win.</How>
      <p className="adm-inline">
        <select className="adm-select" value={pick} onChange={(e) => setPick(e.target.value)} aria-label="Ready topic"><option value="">Pick a ready topic…</option>{ready.map((t) => <option key={t} value={t}>{t}</option>)}</select>
        <button type="button" className="btn adm-btn-sm" disabled={!pick || started === pick} onClick={async () => { await rewrite({ topic: pick }); setStarted(pick) }}>{started === pick ? 'Started: the test appears below in a few minutes' : 'Rewrite chapter 1 now'}</button>
      </p>
      {rows.length === 0 ? <p className="note">No tests yet.</p> : rows.map((e) => (
        <div key={e.id} className="adm-exp">
          <p><strong>{e.topic}</strong> <span className="adm-j-tag">{e.status}</span> <small>{e.quit} of {e.starts} quit before the test · started {time(e.startedAt)}</small></p>
          <p className="serif">{e.diagnosis}</p>
          <p className="note"><strong>Lesson for the writer:</strong> {e.lesson}</p>
          <p className="note">A (current): {rate(e.aPasses, e.aStarts)} passed chapter 1 · B (rewrite): {rate(e.bPasses, e.bStarts)}</p>
          {e.status === 'running'
            ? <p><button type="button" className="quiet" onClick={() => act({ id: e.id, action: 'promote' })}>Make B the default now</button> · <button type="button" className="quiet" onClick={() => act({ id: e.id, action: 'stop' })}>Stop the test, keep A</button></p>
            : <p className="note">{e.status === 'promoted' ? 'B is the chapter 1 readers get now.' : e.status === 'stopped' ? 'Stopped; A stayed.' : 'Finished.'} Nothing to do.</p>}
        </div>
      ))}
      <p><button type="button" className="quiet" disabled={scanned} onClick={async () => { await scan({}); setScanned(true) }}>{scanned ? 'Checking now: new tests appear in a few minutes' : 'Check every topic for quitters now'}</button></p>
    </section>
  )
}

// D39: "there should be a way to eliminate my requests from the app". One tap marks this phone as ours; the signed-in
// account is marked with it. Owner accounts are always left out of the numbers (metrics), whichever phone they use.
function MineCard() {
  const token = deviceToken()
  const st = useQuery(api.admin.exclusion, { deviceToken: token })
  const excludeMe = useMutation(api.stats.excludeMe)
  if (!st) return null
  return (
    <section className="adm-card adm-wide">
      <h2>Your phones</h2>
      <p className="note">{st.excluded ? 'This phone is marked as yours and left out of every number above.' : 'This phone is not marked yet: what you do on it counts as a visitor.'} {st.phones} phones and {st.accounts} accounts are left out in all; your owner accounts always are.</p>
      {!st.excluded && <button type="button" className="btn" onClick={() => excludeMe({ deviceToken: token })}>This phone is mine, leave it out</button>}
    </section>
  )
}

// D39 (Prateek, 9 Oct: "card 1 of 7: which chapter, which user, when did they come, why did they leave, and is there a
// guess?"): one row per person in the window, newest first, with where they got to and the best guess why they stopped.
type PersonRow = { visitor: string; first: number; source: string; device: string | null; topic: string | null; started: boolean; plan: boolean; openedCh1: boolean; ch1Card: number | null; ch1Of: number | null; passed: number; startedCh2: boolean; signedUp: boolean; spentS: number; reason: string; landed: boolean; typed: boolean; timeline: { t: number; what: string }[] }
function PeopleCard({ rows }: { rows: PersonRow[] }) {
  const gotTo = (r: PersonRow) => r.passed >= 2 ? `passed ${r.passed} chapters` : r.startedCh2 ? 'in chapter 2' : r.passed === 1 ? 'passed chapter 1' : r.openedCh1 ? `chapter 1, card ${r.ch1Card ?? '?'}${r.ch1Of ? ` of ${r.ch1Of}` : ''}` : r.plan ? 'saw the plan' : r.started ? 'started a handbook' : r.typed ? 'typed in the box' : r.landed ? 'the landing page' : 'arrived'
  const lastSeen = (r: PersonRow) => { const t = r.timeline.length ? Math.max(...r.timeline.map((x) => x.t)) : -1; return t >= 0 ? `+${secs(t)}` : '' }
  return (
    <section className="adm-card adm-wide">
      <h2>Each person, where they got to, and why they stopped</h2>
      <How>Latest 50 people in this window, newest first. "Why" is the best guess from the last thing they did. Tap a row in "Each person's path" below for every step.</How>
      <div className="adm-scroll adm-tall"><table className="adm-table">
        <thead><tr><th>Came</th><th>From</th><th>Phone</th><th>Topic</th><th>Got to</th><th>Stayed</th><th>Last seen</th><th>Signed up</th><th>Why they stopped (guess)</th></tr></thead>
        <tbody>{rows.map((r) => (
          <tr key={r.visitor + r.first}>
            <td>{time(r.first)}</td><td>{r.source}</td><td>{r.device ?? '?'}</td><td>{r.topic ?? ''}</td><td><b>{gotTo(r)}</b></td><td>{secs(r.spentS)}</td><td>{lastSeen(r)}</td><td>{r.signedUp ? 'yes' : ''}</td><td><small>{r.reason}</small></td>
          </tr>
        ))}</tbody>
      </table></div>
    </section>
  )
}
