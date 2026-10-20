import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react'

// Small motion across the site (20 Oct, Prateek: "add these kind of microanimations throughout pages"). Two helpers:
// rows and cards that rise in as they scroll into view, and numbers that count up. Both do nothing under reduce motion,
// and only an item the script is watching is hidden (before the first paint), so nothing can be left invisible.
const still = () => { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches } catch { return true } }

// Every `.rv` inside the box rises in once, the first time it comes into view; ones arriving together follow each other
// by 70 ms. `key` re-arms it when the list changes (a new Shelf pill).
export function useReveal(box: RefObject<HTMLElement | null>, key?: unknown) {
  useLayoutEffect(() => {
    const el = box.current
    if (!el || still() || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver((seen) => {
      let k = 0
      for (const s of seen) {
        if (!s.isIntersecting) continue
        const t = s.target as HTMLElement
        t.style.setProperty('--rv-d', `${Math.min(k++, 6) * 70}ms`)
        t.classList.add('rv-in')
        io.unobserve(t)
      }
    }, { rootMargin: '0px 0px -6% 0px' })
    const wait = [...el.querySelectorAll<HTMLElement>('.rv:not(.rv-in)')]
    wait.forEach((x) => { x.classList.add('rv-wait'); io.observe(x) })
    return () => { io.disconnect(); wait.forEach((x) => { if (!x.classList.contains('rv-in')) x.classList.remove('rv-wait') }) }
  }, [box, key])
}

// A number that counts up from 0 to its value over `ms`, once per mount (and again when the value changes).
export function useCountUp(to: number, ms = 700) {
  const [n, setN] = useState(() => (still() ? to : 0))
  const from = useRef(0)
  useEffect(() => {
    if (still() || to === from.current) { setN(to); from.current = to; return }
    const a = from.current, t0 = performance.now()
    let raf = 0
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / ms), e = 1 - Math.pow(1 - p, 3)
      setN(Math.round(a + (to - a) * e))
      if (p < 1) raf = requestAnimationFrame(step); else from.current = to
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [to, ms])
  return n
}
