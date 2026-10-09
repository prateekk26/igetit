import { Component, StrictMode, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { ConvexReactClient } from 'convex/react'
import { ConvexAuthProvider } from '@convex-dev/auth/react'
import './index.css'
import './screens.css'
import App from './App.tsx'
import Stats from './screens/Stats'
import Admin from './screens/Admin'
import Policy, { POLICY_PAGES, type PolicyPage } from './screens/Policy'
import Print from './screens/Print'
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
      <Safety>{onPrint ? <Print /> : policy ? <Policy page={policy} /> : onAdmin ? <Admin /> : onStats ? <Stats /> : <App />}</Safety>
    </ConvexAuthProvider>
  </StrictMode>,
)
