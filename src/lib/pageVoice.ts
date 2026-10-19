// The page voice (15 Oct, Prateek: "a female voice to read out with emotions and intonation"): one audio element for the
// whole app, so a new page always stops the last one. Files come from voiceNode.page (Gemini speech, cached per page).
let el: HTMLAudioElement | null = null
let token = 0

function audio() {
  if (!el) { el = new Audio(); el.preload = 'auto' }
  return el
}

// Plays a URL to the end. Resolves true when it finished, false when it was stopped or could not play. onStart (19 Oct,
// play logging) runs once the browser has really started it, never for a play the browser refused.
export function playUrl(url: string, onStart?: () => void): Promise<boolean> {
  const a = audio(), mine = ++token
  return new Promise((resolve) => {
    // 17 Oct: only the clip still playing clears the handlers. A clip cut off while loading fails late (its play()
    // rejects after the next clip has started) and used to clear the next clip's handlers, so auto-play froze on a page.
    const done = (ok: boolean) => { if (mine === token) { a.onended = null; a.onerror = null } resolve(ok && mine === token) }
    a.onended = () => done(true)
    a.onerror = () => done(false)
    a.src = url
    a.playbackRate = 1.1   // this voice reads slowly; a touch faster sounds natural (agent)
    a.play().then(() => { if (mine === token) onStart?.() }).catch(() => done(false))
  })
}

export function stopAudio() {
  token++
  if (el) { el.pause(); el.onended = null; el.onerror = null }
}

// Auto-play (15 Oct, Prateek: "We want auto scroll (quizes auto answered) as well as an option. It should span
// chapters"): one switch, kept across chapters. 17 Oct: kept for this visit only (it was kept for good), so a reader who
// comes back and taps an old chapter isn't read to and carried on into the next one without asking.
const AUTO = 'igi.autoplay'
export const autoOn = () => { try { return sessionStorage.getItem(AUTO) === '1' } catch { return false } }
export const setAuto = (on: boolean) => { try { sessionStorage.setItem(AUTO, on ? '1' : '0'); localStorage.removeItem(AUTO) } catch { /* private mode: this screen only */ } }

// Seconds a page needs when no voice plays: about 3 words a second, at least 4 s.
export const readMs = (text: string) => Math.max(4000, Math.round((text.split(/\s+/).filter(Boolean).length / 3) * 1000) + 1200)
