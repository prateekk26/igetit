import { lazy, type ComponentType } from 'react'

// A screen that is not part of the first download (11 Oct, Prateek: "only download the things for the first screen so
// that it is lighter on the phone"). preload() fetches it in the background; once it has arrived the screen renders
// straight away, with no loading frame. Before that, React.lazy shows the nearest Suspense fallback (src/main.tsx).
export function deferred<P extends object>(load: () => Promise<{ default: ComponentType<P> }>) {
  let Loaded: ComponentType<P> | null = null
  let pending: Promise<{ default: ComponentType<P> }> | null = null
  const preload = () => (pending ??= load().then((m) => { Loaded = m.default; return m }))
  const Lazy = lazy(preload)
  function Deferred(props: P) { return Loaded ? <Loaded {...props} /> : <Lazy {...props} /> }
  Deferred.preload = preload
  return Deferred
}

// Fetch the given screens once the first screen has settled: when the browser is idle, or after 2 s where there is no
// idle callback (Safari). Skipped on save-data and 2G, where the reader pays for every byte; they load when opened.
export function preloadWhenIdle(screens: { preload: () => Promise<unknown> }[]) {
  const c = (navigator as any).connection
  if (c?.saveData || /2g/.test(String(c?.effectiveType ?? ''))) return
  const go = () => screens.forEach((s) => { s.preload().catch(() => {}) })
  if ('requestIdleCallback' in window) (window as any).requestIdleCallback(go, { timeout: 4000 })
  else setTimeout(go, 2000)
}
