import { Component, StrictMode, Suspense, lazy, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { ConvexReactClient } from 'convex/react'
import { ConvexAuthProvider } from '@convex-dev/auth/react'
import './index.css'
import './screens.css'
import './theme-c.css'   // theme C, Picture book (14 Oct); remove this line to go back to the print look
import App from './App.tsx'
import Ooh from './components/Ooh'
import { POLICY_PAGES, type PolicyPage } from './components/PolicyLinks'
// Pages a reader rarely opens load only when opened (11 Oct, Prateek: "only download the things for the first screen").
const Stats = lazy(() => import('./screens/Stats'))
const Admin = lazy(() => import('./screens/Admin'))
const Policy = lazy(() => import('./screens/Policy'))
const Print = lazy(() => import('./screens/Print'))
import { initTrack, startSession, track } from './lib/track'
import { registerServiceWorker, captureInstallPrompt } from './lib/push'
import { api } from '../convex/_generated/api'
import { deviceToken } from './lib/device'

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string)
initTrack(convex)
registerServiceWorker()
captureInstallPrompt()

// /stats is the public numbers page and /admin the owner's; every other page load counts as a visit (once a day per phone).
const path = window.location.pathname.replace(/\/+$/, '')
const onStats = path === '/stats'
const onAdmin = path === '/admin'
// /terms, /privacy, /refunds, /contact: plain pages, not counted as visits.
const policy = POLICY_PAGES.find((p) => path === `/${p}`) as PolicyPage | undefined
const onPrint = path === '/print'   // a member's handbook on one page (7 Oct)
// The app's own addresses: home, /pricing and /shelf (App.tsx keeps them in step). A mistyped or guessed address showed
// the home page and kept the wrong address (UX review 9 Oct): it is put back to / before the app starts.
if (!onStats && !onAdmin && !policy && !onPrint && !['', '/pricing', '/shelf'].includes(path)) window.history.replaceState(null, '', '/' + window.location.search)
if (!onStats && !onAdmin && !policy && !onPrint) {
  startSession(path || '/')
  const utm = new URLSearchParams(window.location.search).get('utm_source')
  const ref = document.referrer && !document.referrer.startsWith(window.location.origin) ? document.referrer : undefined
  convex.mutation(api.stats.recordVisit, { visitor: deviceToken(), source: utm ?? ref }).catch(() => {})
  // PostHog (11 Oct, D68): page views, for the sprint's visitors row (convex/analytics.ts). Loaded after the page,
  // never on a test visit or a phone marked as ours; no clicks, no cookies (localStorage only). Since 22 Oct (D160,
  // Prateek: "why isn't the session replay getting captured … I want that fixed") session replays too, with every typed
  // box masked and the sign-in screens (which show the email) blacked out; sent through e.igetit.now, PostHog's managed
  // proxy on our domain (POSTHOG_HOST), so ad blockers don't drop the visit.
  if (utm !== 'internal') convex.query(api.analytics.config, { deviceToken: deviceToken() }).then(async (c) => {
    if (!c) return
    const { default: posthog } = await import('posthog-js')
    posthog.init(c.key, {
      api_host: c.host, ui_host: 'https://us.posthog.com', capture_pageview: 'history_change', capture_pageleave: true, autocapture: false,
      session_recording: { maskAllInputs: true }, disable_surveys: true, capture_performance: false, persistence: 'localStorage', person_profiles: 'identified_only',
    })
  }).catch(() => {})
}

// A crash anywhere used to leave a blank page (8 Oct, found on Public speaking chapter 1). Now: one plain line and a
// reload button, and the error is counted so /admin can see it. Copy (agent).
class Safety extends Component<{ children: ReactNode }, { err: string | null }> {
  state = { err: null as string | null }
  static getDerivedStateFromError(e: unknown) { return { err: String((e as any)?.message ?? e).slice(0, 160) } }
  componentDidCatch(e: unknown) { track('crash', { m: String((e as any)?.message ?? e).slice(0, 120), path: window.location.pathname }) }
  render() {
    if (!this.state.err) return this.props.children
    // Reload alone reopened the same broken address (UX review 9 Oct, #19). The second way out forgets which handbook was
    // open on this phone (the handbooks themselves stay) and starts from the home page.
    return (
      <div className="splash" style={{ padding: 24, textAlign: 'center', display: 'grid', gap: 12, justifyItems: 'center' }}>
        <Ooh face="sleepy" size={88} />
        <p className="serif" style={{ fontSize: 20 }}>Something broke on our side. Your place is saved.</p>
        <button type="button" className="btn" style={{ maxWidth: 320 }} onClick={() => window.location.reload()}>Reload</button>
        <button type="button" className="quiet" onClick={() => { try { localStorage.removeItem('igetit.active') } catch { /* nothing to forget */ } window.location.assign('/') }}>Start from the home page</button>
      </div>
    )
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConvexAuthProvider client={convex}>
      <Safety><Suspense fallback={<div className="splash" />}>{onPrint ? <Print /> : policy ? <Policy page={policy} /> : onAdmin ? <Admin /> : onStats ? <Stats /> : <App />}</Suspense></Safety>
    </ConvexAuthProvider>
  </StrictMode>,
)
