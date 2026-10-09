import { useEffect, useState } from 'react'

// Whether the phone thinks it is online, kept up to date. Offline, saves wait in a queue and go through when the
// connection returns; the screens say so instead of sitting silent (UX review 9 Oct, #18).
export function useOnline(): boolean {
  const [on, setOn] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine !== false))
  useEffect(() => {
    const up = () => setOn(true), down = () => setOn(false)
    window.addEventListener('online', up)
    window.addEventListener('offline', down)
    return () => { window.removeEventListener('online', up); window.removeEventListener('offline', down) }
  }, [])
  return on
}
