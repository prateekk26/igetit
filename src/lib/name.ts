// The typed line is the name everywhere (D28): first letter capitalised, nothing else changed. A first word with a
// digit in it keeps its spelling, so "n8n" never becomes "N8n" (D28a).
export function nameOf(t: string | null | undefined): string {
  const s = (t ?? '').trim()
  if (!s) return ''
  return /\d/.test(s.split(/\s+/)[0]) ? s : s.charAt(0).toUpperCase() + s.slice(1)
}

// A name inside a button: long typed lines (up to 200 characters) are cut at a word, so the button stays one or two lines.
export function shortName(t: string, max = 40): string {
  if (t.length <= max) return t
  const cut = t.slice(0, max)
  return (cut.lastIndexOf(' ') > max * 0.6 ? cut.slice(0, cut.lastIndexOf(' ')) : cut).replace(/[\s,.;:-]+$/, '') + '…'
}

// Convex document ids are lowercase letters and digits; anything else saved on the phone is ignored, never sent.
export const isId = (s: string | null | undefined): s is string => !!s && /^[a-z0-9]{20,40}$/.test(s)
