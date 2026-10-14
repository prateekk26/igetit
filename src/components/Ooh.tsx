// Ooh, the marigold dot with two ink eyes (theme C, 14 Oct; brand book C, page 6). It acts with its eyes and its round
// body only. A face plays once and settles in 0.5 to 1.4 s; only "making" loops. One moving Ooh on a screen at most.
// The motion lives in theme-c.css (.ooh-*); reduce motion shows the still face.
export type OohFace = 'curious' | 'happy' | 'again' | 'getit' | 'making'

const INK = '#1B1A17'
const eyes = (rx = 3, ry = 4, cy = 18) => (
  <>
    <ellipse cx="15" cy={cy} rx={rx} ry={ry} />
    <ellipse cx="25" cy={cy} rx={rx} ry={ry} />
  </>
)
const arcs = (
  <g fill="none" stroke={INK} strokeWidth="2.6" strokeLinecap="round">
    <path d="M11.5 19.5q3.5-5 7 0" />
    <path d="M21.5 19.5q3.5-5 7 0" />
  </g>
)

// tone "cream" is Ooh on a marigold page (C1, C9): a paper face with an indigo shadow a step down and right.
export default function Ooh({ face = 'curious', size = 40, className = '', tone = 'marigold' }: { face?: OohFace; size?: number; className?: string; tone?: 'marigold' | 'cream' }) {
  return (
    <svg className={`ooh ooh-${face} ${className}`} width={size} height={size} viewBox="-6 -8 52 52" aria-hidden="true" focusable="false">
      <g className="ooh-body">
        {tone === 'cream' && <circle cx="21" cy="21" r="19.5" fill="#2F3478" />}
        <circle cx="20" cy="20" r={tone === 'cream' ? 19.5 : 20} fill={tone === 'cream' ? '#FAF7F0' : '#F2A93B'} />
        {face === 'happy' ? arcs
          : face === 'getit' ? <><g className="ooh-la" fill={INK}>{eyes()}</g><g className="ooh-lb">{arcs}</g></>
          : face === 'making' ? <g className="ooh-eyes" fill={INK}>{eyes(2.8, 3.6, 15)}</g>
          : <g className="ooh-eyes" fill={INK}>{eyes()}</g>}
      </g>
    </svg>
  )
}

// The wordmark: lowercase "ı get it", the first i's dot is Ooh (brand book C, page 1). Eyes only at large sizes.
export function Wordmark() {
  return (
    <span className="wm" aria-hidden="true">
      <span className="wm-i">ı<span className="wm-dot" /></span> get it
    </span>
  )
}

// The round arrow at the end of a main button (C1, C3, C4, C9): ink circle, marigold arrow; on an ink button, the reverse.
export function GoArrow() {
  return (
    <span className="go-arrow" aria-hidden="true">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></svg>
    </span>
  )
}
