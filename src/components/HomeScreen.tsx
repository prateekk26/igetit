import { useState } from 'react'
import Sheet from './Sheet'
import { canInstall, install, isAndroid, isIOS, isStandalone } from '../lib/push'
import { track } from '../lib/track'

// "Add to home screen" (15 Oct, Prateek: "help them create a shortcut to the website on the homescreen … both android
// and ios. Export button -> view more -> add to homescreen"). Android's Chrome install box when it offers one; otherwise
// the steps, with the icons the reader will see. Hidden once opened from the home screen. Copy (agent).
const ShareIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3v12M7.5 7.5 12 3l4.5 4.5" /><path d="M8 10H6a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1h-2" /></svg>
)
const DotsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="5" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="12" cy="19" r="2" /></svg>
)

export default function HomeScreen() {
  const [open, setOpen] = useState(false)
  const [gone, setGone] = useState(false)
  if (gone || isStandalone() || !(isIOS() || isAndroid() || canInstall())) return null
  // iPhones never offer an install box, so they always get the steps; if Chrome's box can't open, the steps instead
  // (a tap must never do nothing).
  const tap = async () => {
    const prompt = !isIOS() && canInstall()
    track('home_screen', { v: prompt ? 'prompt' : isIOS() ? 'ios' : 'android' })
    if (prompt) { try { if (await install()) setGone(true); return } catch { /* falls through to the steps */ } }
    setOpen(true)
  }
  const ios = isIOS()
  return (
    <>
      <p className="note" style={{ marginTop: 'var(--l)' }}>
        <button type="button" className="quiet" style={{ padding: 0 }} onClick={tap}>Add I Get It to your home screen</button>
      </p>
      {open && (
        <Sheet onClose={() => setOpen(false)} label="Add to your home screen">
          <div className="home-steps">
            <p className="verdict" style={{ fontSize: 'var(--ui)' }}>Add I Get It to your home screen</p>
            <p className="note" style={{ marginTop: 0 }}>It opens like an app, one tap from tonight's chapter.</p>
            <ol>
              {ios ? (
                <>
                  <li>Tap the Share button <span className="home-icon"><ShareIcon /></span> in your browser's bar.</li>
                  <li>Tap <b>View More</b>.</li>
                  <li>Tap <b>Add to Home Screen</b>, then <b>Add</b>.</li>
                </>
              ) : (
                <>
                  <li>Tap the menu <span className="home-icon"><DotsIcon /></span> at the top right of Chrome.</li>
                  <li>Tap <b>Add to home screen</b> (some phones say <b>Install app</b>).</li>
                  <li>Tap <b>Add</b> or <b>Install</b>.</li>
                </>
              )}
            </ol>
            <button type="button" className="btn" onClick={() => setOpen(false)}>Got it</button>
          </div>
        </Sheet>
      )}
    </>
  )
}
