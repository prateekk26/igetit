type Props = { passed: number[]; filling?: number; total?: number }

// One segment a chapter (seven, or 28 for a month-long handbook, D65). Filled = a chapter passed. `filling` animates one segment in.
export default function RungBar({ passed, filling, total = 7 }: Props) {
  return (
    <div className={total > 7 ? 'rung long' : 'rung'} role="img" aria-label={`${passed.length} of ${total} chapters done`}>
      {Array.from({ length: total }, (_, i) => {
        const n = i + 1
        const cls = n === filling ? 'filling' : passed.includes(n) ? 'on' : ''
        return <span key={n} className={cls} />
      })}
    </div>
  )
}
