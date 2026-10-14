import { useEffect, useRef } from 'react'
import { duration, figureAlt, figureSvg, type FigureSpec } from '../lib/figure'

// An explainer figure on a page (15 Oct): it builds itself once, about 2 to 3 seconds, then holds its last frame.
// Reduce motion shows the finished figure straight away. The frame is a pure function of time (src/lib/figure.ts).
export default function Figure({ spec }: { spec: FigureSpec }) {
  const box = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = box.current
    if (!el) return
    const end = duration(spec) + 0.4
    const calm = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (calm) { el.innerHTML = figureSvg(spec, end); return }
    let raf = 0
    const t0 = performance.now()
    const tick = (now: number) => {
      const t = (now - t0) / 1000
      el.innerHTML = figureSvg(spec, Math.min(t, end))
      if (t < end) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [spec])
  return (
    <div className="story-figure" role="img" aria-label={figureAlt(spec)}>
      <div ref={box} className="story-figure-svg" />
    </div>
  )
}
