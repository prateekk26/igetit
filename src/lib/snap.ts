import { useEffect } from 'react'

// Gentle snap scrolling on the pages made of screen-sized parts (20 Oct, Prateek: "not in reading pages but in home
// screen and other info screens"): the homepage and Pricing. "proximity", not "mandatory": the page settles on a part
// only when a scroll stops near its top, and never fights a scroll through a long part. Reading pages (Tonight, What
// you know, the Shelf, a handbook, a chapter, the policy pages) never snap. Off under reduce motion.
//
// `firm` (21 Oct, Prateek: "add snap scroll on the landing page"; the gentle one let a swipe stop halfway, 401 px down)
// takes the browser's snap off and steers by direction instead: when a scroll comes to rest between two parts, the page
// glides on to the next part the way it was going, so every swipe lands on one. (CSS "mandatory" was tried first: a slow
// half-screen drag sprang back to where it started, which reads as stuck.) It leaves the page alone while a finger is
// down, while a box has the focus (a phone's keyboard), inside a part taller than the screen (still reading it), at the
// very bottom, and when the next part is more than a screen away. `stops` names the candidates; only the ones whose
// computed scroll-snap-align isn't "none" count, so CSS decides per width.
export function useSnapPage(topPad: string, firm?: { stops: string }) {
  const stops = firm?.stops
  useEffect(() => {
    let still = false
    try { still = window.matchMedia('(prefers-reduced-motion: reduce)').matches } catch { /* snap */ }
    if (still) return
    const html = document.documentElement
    html.classList.add('snap-page')
    if (stops) html.classList.add('snap-firm')
    html.style.setProperty('--snap-pad', topPad)
    const undo = () => { html.classList.remove('snap-page', 'snap-firm'); html.style.removeProperty('--snap-pad') }
    if (!stops) return undo

    let rest = window.scrollY, touching = false, steering = false, idle = 0
    const tops = () => {
      const pad = parseFloat(getComputedStyle(html).scrollPaddingTop) || 0
      return [...document.querySelectorAll<HTMLElement>(stops)]
        .filter((el) => getComputedStyle(el).scrollSnapAlign !== 'none')
        .map((el) => { const r = el.getBoundingClientRect(); return { top: Math.round(r.top + window.scrollY - pad), bottom: Math.round(r.bottom + window.scrollY) } })
        .sort((a, b) => a.top - b.top)
    }
    const settle = () => {
      if (touching) return
      const y = window.scrollY
      if (steering) { steering = false; rest = y; return }
      const moved = y - rest
      rest = y
      const el = document.activeElement as HTMLElement | null
      if (Math.abs(moved) < 8 || el?.matches?.('input, textarea')) return
      const max = html.scrollHeight - window.innerHeight
      if (y >= max - 2) return
      const all = tops()
      if (all.some((s) => Math.abs(s.top - y) <= 3)) return
      const inside = [...all].reverse().find((s) => s.top <= y)
      // still reading a part taller than the screen: its bottom is below the screen's bottom
      if (inside && inside.bottom > y + window.innerHeight + 4) return
      // the way it was going, unless it just ran past a part by a little (under a third of a screen): then back to that one
      const next = all.find((s) => s.top > y)?.top, prev = inside?.top
      const near = window.innerHeight * 0.34
      const target = moved > 0
        ? (prev !== undefined && prev > y - moved && y - prev < near ? prev : next ?? max)
        : (next !== undefined && next < y - moved && next - y < near ? next : prev ?? 0)
      if (Math.abs(target - y) > window.innerHeight * 1.1) return
      steering = true
      window.scrollTo({ top: Math.min(target, max), behavior: 'smooth' })
    }
    const onScroll = () => { window.clearTimeout(idle); idle = window.setTimeout(settle, 160) }
    const down = () => { touching = true; steering = false; window.clearTimeout(idle) }
    const up = () => { touching = false; onScroll() }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('touchstart', down, { passive: true })
    window.addEventListener('touchend', up, { passive: true })
    window.addEventListener('touchcancel', up, { passive: true })
    return () => {
      undo(); window.clearTimeout(idle)
      window.removeEventListener('scroll', onScroll); window.removeEventListener('touchstart', down)
      window.removeEventListener('touchend', up); window.removeEventListener('touchcancel', up)
    }
  }, [topPad, stops])
}
