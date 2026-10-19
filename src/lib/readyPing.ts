import { useEffect, useRef } from 'react'

// When the chapter a reader is waiting for lands (20 Oct, Prateek's yes to the UX list, item 2). Before, nothing called
// back a reader who switched to another app during the minute-and-a-half wait. If the page is in the background, the
// tab's name becomes "✓ Chapter 1 is ready" until they come back; if it's on screen, a short buzz (phones that allow it;
// browsers ignore vibrate on a hidden page). A phone with reminders on also gets a push (convex/pushSend.ts ready).
export function useReadyPing(key: string | null, status: string | undefined, label: string) {
  const prev = useRef<{ key: string | null; status: string | undefined }>({ key, status })
  useEffect(() => {
    const was = prev.current
    prev.current = { key, status }
    if (!key || was.key !== key || was.status !== 'writing' || status !== 'ready') return
    if (document.hidden) {
      const before = document.title
      document.title = `✓ ${label} · I Get It`
      const back = () => { if (!document.hidden) { document.title = before; document.removeEventListener('visibilitychange', back) } }
      document.addEventListener('visibilitychange', back)
    } else {
      try { navigator.vibrate?.([40, 60, 40]) } catch { /* not every phone buzzes */ }
    }
  }, [key, status, label])
}
