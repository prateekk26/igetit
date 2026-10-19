import { useEffect, useState } from 'react'

// Measured on prod 16 to 20 Oct (observability report, p50): research 43 s, plan 11 s, a chapter 33 s, its check 9 s.
export const BOOK_MS = 95_000      // goal picked to chapter 1 checked (/admin's last 5 typed books: 66 to 96 s)
export const CHAPTER_MS = 50_000   // one chapter written and checked, with the gaps between steps

// A bar that fills while something is written (20 Oct, Prateek's yes to the UX list, item 1): the sliding stripe read as
// "stuck" after half a minute. It fills against the measured time (expectMs) from when the write began (since), slows as
// it nears the end, and never reaches full on its own: past the expected time it creeps toward 95%. `floor` lifts it to
// a stage the server has already finished (research done: at least 45%, the plan done: 60%), so it never sits behind what the steps say.
export default function WaitBar({ since, expectMs, floor = 0 }: { since?: number; expectMs: number; floor?: number }) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => { const t = window.setInterval(() => setNow(Date.now()), 500); return () => clearInterval(t) }, [])
  const t = Math.max(0, now - (since ?? now)) / expectMs
  const p = Math.max(floor, 0.95 * (1 - Math.exp(-2.3 * t)))   // about 86% at the expected time, 94% at twice it
  return (
    <div className="waitbar" aria-hidden="true">
      <span style={{ width: `${Math.round(Math.min(0.95, p) * 1000) / 10}%` }} />
    </div>
  )
}
