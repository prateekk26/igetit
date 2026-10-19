import type { ReactNode } from 'react'
import WaitBar from './WaitBar'

// wait: a write with a known start and a measured length shows a filling bar instead of the sliding one (20 Oct).
type Props = { children: ReactNode; busy?: boolean; note?: string; wait?: { since?: number; expectMs: number; floor?: number } }

// The one main action per screen, low, within thumb reach.
export default function ActionBar({ children, busy, note, wait }: Props) {
  return (
    <div className="actionbar">
      <div>
        {children}
        {busy && (wait ? <WaitBar since={wait.since} expectMs={wait.expectMs} floor={wait.floor} /> : <div className="busybar" aria-hidden="true" />)}
        {note && <p className="note" style={{ marginTop: 2 }}>{note}</p>}
      </div>
    </div>
  )
}
