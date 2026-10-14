// The page voice (15 Oct, Prateek: "a female voice to read out with emotions and intonation"): one audio element for the
// whole app, so a new page always stops the last one. Files come from voiceNode.page (Gemini speech, cached per page).
let el: HTMLAudioElement | null = null
let token = 0

function audio() {
  if (!el) { el = new Audio(); el.preload = 'auto' }
  return el
}

// Plays a URL to the end. Resolves true when it finished, false when it was stopped or could not play.
export function playUrl(url: string): Promise<boolean> {
  const a = audio(), mine = ++token
  return new Promise((resolve) => {
    const done = (ok: boolean) => { a.onended = null; a.onerror = null; resolve(ok && mine === token) }
    a.onended = () => done(true)
    a.onerror = () => done(false)
    a.src = url
    a.playbackRate = 1.1   // this voice reads slowly; a touch faster sounds natural (agent)
    a.play().catch(() => done(false))
  })
}

export function stopAudio() {
  token++
  if (el) { el.pause(); el.onended = null; el.onerror = null }
}

// Auto-play (15 Oct, Prateek: "We want auto scroll (quizes auto answered) as well as an option. It should span
// chapters"): one switch for the phone, kept across chapters and visits.
const AUTO = 'igi.autoplay'
export const autoOn = () => { try { return localStorage.getItem(AUTO) === '1' } catch { return false } }
export const setAuto = (on: boolean) => { try { localStorage.setItem(AUTO, on ? '1' : '0') } catch { /* private mode: this visit only */ } }

// Seconds a page needs when no voice plays: about 3 words a second, at least 4 s.
export const readMs = (text: string) => Math.max(4000, Math.round((text.split(/\s+/).filter(Boolean).length / 3) * 1000) + 1200)
