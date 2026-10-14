import type { ReactNode } from 'react'

// The /admin pieces in theme C (14 Oct, Prateek: "Improve the admin portal please. Very bad UX. Use the new UI"):
// a switch says on or off with a filled dot or a ring and its label, never by colour; the long explanations fold
// under "How this works" so the controls come first; a segmented row picks one of a few.

export function Switch({ on, onClick, children, disabled, label }: { on: boolean; onClick: () => void; children: ReactNode; disabled?: boolean; label?: string }) {
  return (
    <button type="button" className="adm-switch" aria-pressed={on} onClick={onClick} disabled={disabled} aria-label={label}>
      <span className="adm-dot" aria-hidden="true" />{children}
    </button>
  )
}

export function How({ children, label = 'How this works' }: { children: ReactNode; label?: string }) {
  return (
    <details className="adm-how">
      <summary>{label}</summary>
      <div className="adm-how-body">{children}</div>
    </details>
  )
}

export function Seg<T extends string | number>({ value, options, onChange, label }: { value: T; options: { v: T; label: string }[]; onChange: (v: T) => void; label: string }) {
  return (
    <div className="adm-seg" role="group" aria-label={label}>
      {options.map((o) => <button key={String(o.v)} type="button" aria-pressed={value === o.v} onClick={() => onChange(o.v)}>{o.label}</button>)}
    </div>
  )
}
