import { useEffect, useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { deviceToken } from '../lib/device'
import ActionBar from '../components/ActionBar'
import Sheet from '../components/Sheet'
import { checkout, type Paid } from '../lib/razorpay'
import { freeChaptersText } from '../lib/free'

type PlanKind = 'month' | 'year'
type Tier = { tier: number; month: number; year: number; size: number | null; left: number | null; open: boolean }
type Pay = { live: boolean; mode: 'test' | 'live' | null; customers: number; openTier: number; tier: number; kept: boolean; price: { month: number; year: number }; payments: number; plan: PlanKind | null; paidUntil: number | null }
type Plans = { tiers: Tier[]; freeDays: number; days: { month: number; year: number }; locked: { price: number; at: number } | null; signedIn: boolean; pay: Pay }
type Order = { keyId: string; orderId: string; amount: number; month: number; plan: PlanKind; email?: string }
// plan lives in App, so month or year survives the sign-in; autoPay opens the payment sheet once, right after a sign-in
// that started from "Sign in to pay" (UX review 9 Oct: the sign-in screen promised it, and it didn't happen).
type Props = { notice?: string | null; plans: Plans | undefined; onLock: () => Promise<{ price: number; already: boolean }>; onOrder: (plan: PlanKind) => Promise<Order>; onConfirm: (p: Paid) => Promise<{ ok: boolean }>; onBack: () => void; onSignIn: () => void; fromDone?: boolean; plan?: PlanKind; onPlan?: (p: PlanKind) => void; autoPay?: boolean; onAutoPay?: () => void }

const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`
const WHO = ['First 50', 'Next 100', 'Next 200', 'After that']

// Free vs member, side by side (membership.ts LIMITS are the numbers that are enforced; keep these in step).
const COMPARE: { what: string; free: string; member: string }[] = [
  { what: 'Handbooks you type', free: '1', member: '3 on the go at a time (up to 6 new a month)' },
  { what: 'Ready and shared handbooks', free: 'Every chapter, 3 new a day', member: 'Every chapter, 7 new a day' },
  { what: 'Web-checked answers', free: '3 a week', member: '30 a month' },
  { what: 'Print or save as PDF', free: '–', member: 'Any of your handbooks' },
  // The "Coming next" row (D20) left the table (UX review 9 Oct): a row that names nothing was dressed as a feature.
]

// Early-bird pricing (7 Oct): the first 50 paying readers pay least, and keep that price while they keep paying.
// Every payment is one-time (a month or a year) and nothing renews by itself. Numbers come from convex/pricing.ts;
// the spots left are the real count. Copy is (agent) until Prateek rewrites it.
export default function Pricing({ notice, plans, onLock, onOrder, onConfirm, onBack, onSignIn, fromDone, plan: planProp, onPlan, autoPay, onAutoPay }: Props) {
  const ms = useQuery(api.membership.status, { deviceToken: deviceToken() })
  const [busy, setBusy] = useState(false)
  const [planLocal, setPlanLocal] = useState<PlanKind>('month')
  const plan = planProp ?? planLocal
  const setPlan = onPlan ?? setPlanLocal
  const [sheet, setSheet] = useState(false)
  const [paidSheet, setPaidSheet] = useState<{ amount: number; plan: PlanKind } | null>(null)
  const [payError, setPayError] = useState<string | null>(null)
  const [payNote, setPayNote] = useState<string | null>(null)
  // Razorpay has the money but our confirm failed (a dropped connection on the way back from a UPI app): Pay is replaced
  // by "Check again" with the same reply, so nobody pays twice (UX review 9 Oct; it used to say "Nothing was charged").
  const [pending, setPending] = useState<Paid | null>(null)
  useEffect(() => {
    if (!autoPay || !plans?.signedIn || !plans.pay.live || plans.pay.paidUntil || busy) return
    onAutoPay?.()
    payNow('Signed in. Opening the payment sheet…')
  }, [autoPay, plans?.signedIn]) // eslint-disable-line react-hooks/exhaustive-deps
  if (!plans) return <div className="splash">Loading…</div>
  const p = plans.pay
  const live = p.live
  const price = p.price[plan]
  const saving = p.price.month * 12 - p.price.year
  const done = plans.locked
  const pay = async () => {
    setBusy(true)
    try { await onLock(); setSheet(true) } finally { setBusy(false) }
  }
  // Razorpay: order on our server at this person's tier price, money on Razorpay's sheet, and the days count only
  // once the server has checked Razorpay's signature.
  const confirm = async (reply: Paid, amount: number, kind: PlanKind) => {
    try {
      const r = await onConfirm(reply)
      if (r.ok) { setPending(null); setPayError(null); setPayNote(null); setPaidSheet({ amount, plan: kind }); return }
    } catch { /* below */ }
    setPending(reply)
    setPayError(`Razorpay has your payment, but we couldn't confirm it yet. Don't pay again: tap Check again, or it shows up here within a few minutes. If not, write to prateekksubs@gmail.com with payment number ${reply.razorpay_payment_id}.`)
  }
  const payNow = async (note: string | null = null) => {
    setPayError(null); setPayNote(note); setBusy(true)
    let o: Order
    try { o = await onOrder(plan) } catch (e: any) {
      const m = String(e?.data ?? e?.message ?? e)   // the server's code (ConvexError data), readable on the live site too
      setPayError(m.includes('busy') ? 'Too many tries just now. Wait a few minutes and try again.'
        : /already.paid|Already paid/.test(m) ? "You're already paid up."
        : m.includes('signin') ? 'Sign in first, then pay.'
        : m.includes('payments-off') ? "Payments are switched off just now. Nothing was charged."
        : "Couldn't start the payment just now. Nothing was charged; try again in a minute.")
      setBusy(false); return
    }
    try {
      const reply = await checkout(o, (why) => setPayError(`${why} Nothing was charged. Try again, or another way to pay.`))
      if (!reply) { setPayNote('Closed. Nothing was charged.'); return }
      setPayNote('Paid on Razorpay. Confirming…')
      await confirm(reply, o.amount, o.plan)
    } catch {
      setPayError("Razorpay's payment sheet didn't load. Check your connection, or turn off a content blocker for this site, and try again. Nothing was charged.")
    } finally { setBusy(false) }
  }
  const checkAgain = async () => { if (!pending) return; setBusy(true); setPayNote('Checking with Razorpay…'); try { await confirm(pending, price, plan) } finally { setBusy(false) } }
  const superAdmin = !!(ms as any)?.superAdmin
  // The next tier up, if there is one and it costs more: what this price becomes once these spots are gone.
  const later = (() => { const t = plans.tiers.find((x) => x.tier === p.tier + 1); return t && t.month > p.price.month ? t : null })()
  const until = (t: number) => new Date(t).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  return (
    <>
      {notice && <p className="why-here">{notice}</p>}
      {ms?.member && ms.until ? (
        <>
          <p className="sub" style={{ marginTop: 10 }}><span className="member-mark" style={{ marginLeft: 0 }}>Member</span></p>
          <h1>You're a member. Thank you.</h1>
          {/* The owner's account is a member for good (D36); its far-off date read as a second, odd date (UX review 9 Oct). */}
          <p className="lede">{superAdmin ? 'Your account is a member for good (owner).' : `Covered until ${until(ms.until)}.`} Here's everything that's switched on for you.</p>
          <ul className="unlocks">
            {COMPARE.filter((r) => r.member !== r.free).map((r) => <li key={r.what}><span className="unlock-on" aria-hidden="true">✓</span><strong>{r.what}:</strong> {r.member}</li>)}
          </ul>
          <p className="note">Your own handbooks on the go: {ms.typed.limit >= 999 ? `${ms.typed.used}, no limit` : `${ms.typed.used} of ${ms.typed.limit}`}. Going back to chapters you've opened is always free.</p>
        </>
      ) : (
        <>
          <p className="sub" style={{ marginTop: 10 }}>{fromDone ? 'You reached the summit' : 'Pricing'}</p>
          <h1>Come early, pay less, for as long as you stay.</h1>
          <p className="lede">{freeChaptersText((ms as any)?.limits?.visitorChapters ?? 2)} of any handbook need no account. A free account opens every chapter of every ready one, plus one of your own. Members get more of their own, and the first 50 pay the least.</p>
          <table className="compare">
            <thead><tr><th scope="col"><span className="lp-visually-hidden">What you get</span></th><th scope="col">Free account</th><th scope="col">Member</th></tr></thead>
            <tbody>{COMPARE.map((r) => <tr key={r.what}><th scope="row">{r.what}</th><td>{r.free}</td><td>{r.member}</td></tr>)}</tbody>
          </table>
          <p className="note">A "new chapter" is one you open for the first time. Going back to chapters you've opened is always free.</p>
        </>
      )}

      <ol className="tiers">
        {plans.tiers.map((t) => (
          <li key={t.tier} className={t.open ? 'open' : t.left === 0 ? 'full' : ''}>
            <span className="tier-who">{WHO[t.tier - 1]}</span>
            <span className="tier-price"><b>{inr(t.month)}</b> a month <span>or {inr(t.year)} a year</span></span>
            <span className="tier-left">{t.left === 0 ? 'Full' : t.open ? (t.left === null ? 'Open now' : `${t.left} of ${t.size} left`) : t.left === null ? '' : `${t.size} spots`}</span>
          </li>
        ))}
      </ol>
      <p className="note" style={{ textAlign: 'center' }}>Spots left are counted live from real payments.</p>

      <p className="once"><strong>One-time payment. No auto-renew.</strong> You pay for a month or a year, once. Nothing is charged again unless you tap Pay again.</p>

      <ul className="rules">
        <li><strong>Free stays free.</strong> Every ready and shared handbook, your own one, and everything you've already opened stay yours whether you pay or not.</li>
        <li><strong>A year saves {inr(saving)}.</strong> {inr(p.price.year)} once, instead of {inr(p.price.month)} twelve times.</li>
        <li><strong>Your price stays yours.</strong> Pay again within 7 days of your time running out and you keep it, even after it goes up for newcomers.</li>
        <li><strong>Nothing to cancel.</strong> If you don't pay again, you aren't charged. When your paid days end you go back to the free limits; every handbook and chapter you opened stays open.</li>
      </ul>

      {live ? (
        <>
          {p.mode === 'test' && <p className="note" style={{ textAlign: 'center' }}>Test mode: no real money moves.</p>}
          {p.paidUntil ? <p className="locked">Paid. You're covered until {until(p.paidUntil)}.</p>
            : p.kept ? <p className="locked">Your early price is kept: {inr(p.price.month)} a month or {inr(p.price.year)} a year.</p> : null}
          {/* The struck price is always the real next tier, never a made-up "was" price (7 Oct). */}
          {!p.paidUntil && (
            <div className="chips" role="group" aria-label="Pay for">
              <button type="button" className="chip price-chip" aria-pressed={plan === 'month'} onClick={() => setPlan('month')}>A month · {inr(p.price.month)}</button>
              <button type="button" className="chip price-chip" aria-pressed={plan === 'year'} onClick={() => setPlan('year')}>A year · {inr(p.price.year)}</button>
            </div>
          )}
          {/* One price per chip (8 Oct night, review: "₹299₹199" read as a typo); the next tier is a line, not a strike-through. */}
          {!p.paidUntil && later && <p className="note" style={{ textAlign: 'center' }}>{inr(later.month)} a month once the {WHO[p.tier - 1]?.toLowerCase() ?? 'first'} spots are gone. Your price stays yours while you keep paying.</p>}
          <ActionBar busy={busy}>
            {/* Errors sit by the Pay button, where the eye is (UX review 9 Oct: they printed 1,400 px down the page). */}
            {payError && <p className="error pay-error" role="alert">{payError}</p>}
            {payNote && !payError && <p className="note pay-note" role="status">{payNote}</p>}
            {p.paidUntil ? <button className="btn btn-ghost" onClick={onBack}>Back</button>
              : pending ? <button className="btn" disabled={busy} onClick={checkAgain}>Check again</button>
              : !plans.signedIn ? <><button className="btn" onClick={onSignIn}>Sign in to pay {inr(price)}</button><button type="button" className="quiet" onClick={onBack}>I'll decide later</button></>
              : <><button className="btn" disabled={busy} onClick={() => payNow()}>Pay {inr(price)} for one {plan}</button><button type="button" className="quiet" onClick={onBack}>I'll decide later</button></>}
          </ActionBar>
          {!plans.signedIn && <p className="note" style={{ textAlign: 'center' }}>Sign in first, so what you pay for stays with you on any phone.</p>}
        </>
      ) : (
        <>
          {done && <p className="locked">You tapped Pay at {inr(done.price)} a month. Payments aren't live yet, so nothing was charged.</p>}
          <ActionBar busy={busy}>
            {done ? <button className="btn btn-ghost" onClick={onBack}>Back</button> : (
              <>
                <button className="btn" disabled={busy} onClick={pay}>Pay {inr(p.price.month)} a month</button>
                <button type="button" className="quiet" onClick={onBack}>I'll decide later</button>
              </>
            )}
          </ActionBar>
        </>
      )}

      {paidSheet !== null && (
        <Sheet onClose={() => setPaidSheet(null)} label="Paid">
          <h2>Paid. Thank you.</h2>
          <p>{inr(paidSheet.amount)} for one {paidSheet.plan}{p.mode === 'test' ? ' (test mode, no real money moved)' : ''}. Razorpay emails the receipt. It was a one-time payment: nothing renews by itself.</p>
          {/* A plain button: the fixed bar inside the sheet covered the sheet's last lines on phones (UX review 9 Oct). */}
          <button className="btn sheet-btn" onClick={() => { setPaidSheet(null); onBack() }}>Back to reading</button>
        </Sheet>
      )}

      {sheet && (
        <Sheet onClose={() => setSheet(false)} label="Payments aren't live yet">
          <h2>Payments aren't live yet.</h2>
          <p>You weren't charged, and no card was asked for. Thanks for tapping Pay: your price of {inr(p.price.month)} a month is saved, and we'll ask before anything is charged.</p>
          <button className="btn sheet-btn" onClick={() => setSheet(false)}>Got it</button>
        </Sheet>
      )}
    </>
  )
}
