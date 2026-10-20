import { flushSync } from 'react-dom'

// Page-to-page motion with the browser's own View Transitions (20 Oct, D155): the old screen and the new one are
// snapshotted and animated between, and an element named on both sides (a book's cover, the tab's dot) moves from one
// place to the other. No library. Browsers without it, and phones set to reduce motion, just change screen.
const still = () => { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches } catch { return true } }

export function vt(update: () => void, kind: string) {
  const d = document as Document & { startViewTransition?: (cb: () => void) => { finished: Promise<void> } }
  if (!d.startViewTransition || still()) { update(); return }
  const html = document.documentElement
  html.dataset.vt = kind
  const t = d.startViewTransition(() => flushSync(update))
  t.finished.finally(() => { if (html.dataset.vt === kind) delete html.dataset.vt })
}

// Names one element for the next transition only (a tapped cover or row), so it can grow into its place on the next screen.
export function nameFor(el: Element | null | undefined, name: string) {
  if (!el) return
  const e = el as HTMLElement
  e.style.setProperty('view-transition-name', name)
  setTimeout(() => { if (e.isConnected) e.style.removeProperty('view-transition-name') }, 1200)
}
