import { useEffect, useRef, useState } from 'react'
import { useAuthActions } from '@convex-dev/auth/react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import ActionBar from '../components/ActionBar'

// heading and backLabel (8 Oct night, critique): the wall names the chapter it opens and says where "Not now" goes.
type Props = { onDone: () => Promise<void>; onBack: () => void; reason?: string | null; heading?: string; backLabel?: string }

// Sign in or sign up with a 6-digit code by email (7 Oct, Prateek: less friction than a password; no spam, ever).
// The same code works for a new account and an existing one. Email + password stays as a fallback for accounts made
// before 7 Oct. Copy is (agent) until Prateek rewrites it.
export default function SignIn({ onDone, onBack, reason, heading, backLabel = 'Not now' }: Props) {
  const { signIn } = useAuthActions()
  const [mode, setMode] = useState<'code' | 'password'>('code')
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [flow, setFlow] = useState<'signUp' | 'signIn'>('signIn')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sentNote, setSentNote] = useState<string | null>(null)
  const [resendAt, setResendAt] = useState(0)   // "Send a new code" waits 30 s, and says when it has sent one (UX review 9 Oct)
  const [, tick] = useState(0)
  const valid = /^\S+@\S+\.\S+$/.test(email.trim())
  // Until the Gmail app password is set (mailLimits.codesReady), codes can't go out: start on the password form.
  const codesReady = useQuery(api.mailLimits.codesReady, {})
  // The code field takes focus when the step changes (autoFocus alone misses it on some phones).
  const codeRef = useRef<HTMLInputElement>(null)
  useEffect(() => { if (step === 'code') codeRef.current?.focus() }, [step])
  useEffect(() => { if (codesReady === false) { setMode('password'); setFlow('signUp') } }, [codesReady])
  useEffect(() => { if (resendAt <= Date.now()) return; const t = setInterval(() => { tick((x) => x + 1); if (resendAt <= Date.now()) clearInterval(t) }, 1000); return () => clearInterval(t) }, [resendAt])
  const waitS = Math.max(0, Math.ceil((resendAt - Date.now()) / 1000))
  // An error goes away as soon as the reader changes what it was about (UX review 9 Oct: it stayed after the fix).
  const edit = (set: (v: string) => void) => (v: string) => { set(v); if (error) setError(null) }

  const sendCode = async (again = false) => {
    if (!valid) { setError("Check the email: it needs an @ and a dot."); return }
    setBusy(true); setError(null); setSentNote(null)
    try {
      await signIn('email-otp', { email: email.trim() }); setStep('code'); setCode('')
      setResendAt(Date.now() + 30000)
      if (again) setSentNote(`A new code is on its way to ${email.trim()}. The older one stops working.`)
    }
    catch (e: any) {
      const m = String(e?.message ?? e)
      setError(m.includes('too many') ? "That's a few codes in a row. Wait a few minutes, then try again." : "Couldn't send the code just now. Try again in a minute.")
    } finally { setBusy(false) }
  }
  const checkCode = async () => {
    setBusy(true); setError(null)
    try { await signIn('email-otp', { email: email.trim(), code: code.trim() }); await onDone() }
    catch { setCode(''); setError("That code didn't work. A code works for 10 minutes and only the newest one counts: check the latest email, or send a new code.") }
    finally { setBusy(false) }
  }
  const pwOk = valid && password.length >= (flow === 'signUp' ? 8 : 1)
  const withPassword = async () => {
    if (!valid) { setError("Check the email: it needs an @ and a dot."); return }
    if (flow === 'signUp' && password.length < 8) { setError('Use at least 8 characters for the password.'); return }
    if (!password) { setError('Type your password.'); return }
    setBusy(true); setError(null)
    try { await signIn('password', { email: email.trim(), password, flow }); await onDone() }
    catch (e: any) {
      const m = String(e?.message ?? e)
      // Say what to do next, not "didn't go through" (UX review 9 Oct: an existing account got that). On the live site
      // the server's reason is hidden, so each message covers the likely causes without saying which accounts exist.
      if (/already exists/i.test(m)) { setFlow('signIn'); setPassword(''); setError('There is already an account with this email. Sign in with its password, or use a code by email.'); return }
      if (flow === 'signIn') { setPassword(''); setError("That email and password don't match. Forgot it, or never set one? A code by email signs you in."); return }
      setError("Couldn't make that account. If this email has signed up before, sign in instead: a code by email works for every account.")
    } finally { setBusy(false) }
  }

  if (mode === 'password') {
    const fresh = codesReady === false
    return (
      <>
        {reason && <p className="why-here">{reason}</p>}
        <h1>{fresh ? 'Keep reading, free.' : flow === 'signUp' ? 'Make an account with a password.' : 'Sign in with a password.'}</h1>
        {fresh && <p className="free-banner"><strong>Free.</strong> Just an email and a password. No card, no spam, ever.</p>}
        <p className="lede signin-lede">{fresh ? 'An email and a password, and every chapter of every ready handbook opens. Your place is kept on any phone or laptop.' : flow === 'signUp' ? 'Or skip the password: a code by email works for new accounts too.' : 'For accounts made with a password.'}</p>
        {/* A real form (UX review 9 Oct): Go on the keyboard sends it, and password managers offer to save it. */}
        <form onSubmit={(e) => { e.preventDefault(); if (!busy) withPassword() }} noValidate>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" className="input" type="email" autoComplete="email" inputMode="email" autoFocus value={email} onChange={(e) => edit(setEmail)(e.target.value)} enterKeyHint="next" />
          </div>
          <div className="field">
            <label htmlFor="password">{flow === 'signUp' ? 'Choose a password (8+ characters)' : 'Password'}</label>
            <input id="password" className="input" type="password" autoComplete={flow === 'signUp' ? 'new-password' : 'current-password'} value={password} onChange={(e) => edit(setPassword)(e.target.value)} enterKeyHint="go" />
            {flow === 'signUp' && password.length > 0 && password.length < 8 && <p className="note" aria-live="polite">{8 - password.length} more character{8 - password.length === 1 ? '' : 's'}.</p>}
          </div>
          <button type="submit" hidden aria-hidden="true" tabIndex={-1} />
        </form>
        <p className="note">
          <button type="button" className="quiet" style={{ padding: 0 }} onClick={() => { setFlow(flow === 'signUp' ? 'signIn' : 'signUp'); setError(null) }}>{flow === 'signUp' ? 'I already have a password' : 'Make a new password account'}</button>
          {codesReady !== false && ' · '}
          {codesReady !== false && <button type="button" className="quiet" style={{ padding: 0 }} onClick={() => { setMode('code'); setError(null) }}>Use a code by email</button>}
        </p>
        {codesReady !== false && flow === 'signIn' && <p className="note">Forgot it? A code by email signs you in too.</p>}
        {error && <p className="error" role="alert">{error}</p>}
        <ActionBar busy={busy}>
          <button className="btn" onClick={withPassword} disabled={busy} aria-disabled={!pwOk || undefined}>{busy ? 'Signing you in…' : flow === 'signUp' ? 'Create my account' : 'Sign me in'}</button>
          <button type="button" className="quiet" onClick={onBack}>{backLabel}</button>
        </ActionBar>
      </>
    )
  }

  return (
    <>
      {reason && <p className="why-here">{reason}</p>}
      <h1>{heading ?? 'Keep reading, free.'}</h1>
      {!heading && <p className="free-banner"><strong>Free.</strong> Just your email. No card, no spam, ever.</p>}
      <p className="lede signin-lede">{heading ? 'Your email, then a 6-digit code. No card. Every chapter of every ready handbook opens too.' : 'Your email, then a 6-digit code. Every chapter of every ready handbook opens, and your place is kept on any phone or laptop.'}</p>
      {step === 'email' ? (
        <form className="field" onSubmit={(e) => { e.preventDefault(); if (!busy) sendCode() }} noValidate>
          <label htmlFor="email">Email</label>
          <input id="email" className="input" type="email" autoComplete="email" inputMode="email" autoFocus value={email} onChange={(e) => edit(setEmail)(e.target.value)} enterKeyHint="send" />
        </form>
      ) : (
        <form className="field" onSubmit={(e) => { e.preventDefault(); if (code.length === 6 && !busy) checkCode() }}>
          <label htmlFor="code">The 6-digit code we sent to {email.trim()}</label>
          {/* No maxLength: a pasted "Your code is 123456" was cut to "Your c" before the digits were picked out (UX review 9 Oct). */}
          <input id="code" ref={codeRef} className="input" inputMode="numeric" autoComplete="one-time-code" autoFocus value={code} enterKeyHint="go"
            onChange={(e) => { const v = e.target.value; const run = v.match(/\d{6}/); edit(setCode)(run ? run[0] : v.replace(/\D/g, '').slice(0, 6)) }} />
          <p className="note">
            <button type="button" className="quiet" style={{ padding: 0 }} disabled={busy || waitS > 0} onClick={() => sendCode(true)}>{waitS > 0 ? `Send a new code (in ${waitS} s)` : 'Send a new code'}</button>
            {' · '}
            <button type="button" className="quiet" style={{ padding: 0 }} onClick={() => { setStep('email'); setError(null); setSentNote(null) }}>Use a different email</button>
          </p>
          {sentNote && <p className="note" role="status">{sentNote}</p>}
        </form>
      )}
      <p className="note">{step === 'email' ? "The code comes from “I Get It” in about twenty seconds. Not in your inbox after a minute? Look in Spam or Promotions. It works for 10 minutes. No other emails, ever." : "Sent by “I Get It”. Not in your inbox? Look in Spam or Promotions. The code works for 10 minutes."}</p>
      {error && <p className="error" role="alert">{error}</p>}
      <ActionBar busy={busy}>
        {step === 'email'
          ? <button className="btn" onClick={() => sendCode()} disabled={busy}>{busy ? 'Sending…' : 'Email me a code'}</button>
          : <button className="btn" onClick={checkCode} disabled={busy || code.length !== 6}>{busy ? 'Checking…' : 'Sign me in'}</button>}
        <button type="button" className="quiet" onClick={onBack}>{backLabel}</button>
      </ActionBar>
      {/* Accounts made before 7 Oct have a password; a new person never needs this line, so it reads as an answer, not a choice. */}
      <p className="note" style={{ textAlign: 'center' }}><button type="button" className="quiet" style={{ padding: 0 }} onClick={() => { setMode('password'); setFlow('signIn'); setError(null) }}>I already have a password</button></p>
    </>
  )
}
