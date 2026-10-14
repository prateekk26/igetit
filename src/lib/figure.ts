// Explainer figures (14 Oct, Prateek: "figure out a way to generate the images from the board to explain stuff better";
// "We need similar images or motion graphics"). The C boards explain with labelled diagrams on an ink plate (C6: the Sun,
// sunlight, a Moon half lit and half dark, Earth), not with scenes. A figure is a small spec (one of a few layouts, the
// real words and numbers of the page) drawn by this file in the brand's look, so every figure is on-brand and moves.
//
// The motion rules come from the motion-design course Prateek saved (Movez, 27 Sep): a frame is a pure function of time,
// figureSvg(spec, t), so the same code animates on the page and renders a video frame by frame; closed-form springs, no
// easing curves, no timers inside; something new every beat; nothing fades in alone. A figure builds in about 2 to 3
// seconds and then holds; reduce motion shows its last frame.

export type Glyph = 'sun' | 'moon' | 'earth' | 'phone' | 'battery' | 'coin' | 'card' | 'plane' | 'person' | 'bag' | 'bin' | 'eye' | 'dot'
export type FigureSpec =
  | { kind: 'bars'; title?: string; items: { label: string; value: number; show: string }[]; best?: number; caption?: string }
  | { kind: 'converge'; title?: string; items: string[]; into: { label: string; sub?: string }; caption?: string }
  | { kind: 'lots'; title?: string; left: string; right: string; dots?: number; from: 'left' | 'right'; caption?: string; legend?: string }
  | { kind: 'loop'; title?: string; left: string; right: string; via: string; inside: string; outside: string; charge?: boolean; caption?: string }
  | { kind: 'equation'; title?: string; terms: { show: string; label: string }[]; ops: string[]; caption?: string }
  | { kind: 'vs'; title?: string; wrong: { head: string; line: string }; right: { head: string; line: string }; caption?: string }
  | { kind: 'flow'; title?: string; nodes: { glyph: Glyph; label: string }[]; links?: string[]; caption?: string }

export const W = 340, H = 236
const INK = '#1B1A17', PAPER = '#FAF7F0', MARI = '#F2A93B', DIM = 'rgba(250,247,240,0.62)', LINE = 'rgba(250,247,240,0.28)', INDIGO = '#8F95EA'

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x))
// Closed-form damped spring, 0 to 1, a pure function of time (seconds since its start).
export function spring(t: number, k = 170, d = 24) {
  if (t <= 0) return 0
  const w0 = Math.sqrt(k), z = d / (2 * w0)
  if (z < 1) { const wd = w0 * Math.sqrt(1 - z * z); return 1 - Math.exp(-z * w0 * t) * (Math.cos(wd * t) + (z * w0 / wd) * Math.sin(wd * t)) }
  return 1 - Math.exp(-w0 * t) * (1 + w0 * t)
}
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
// Rough line breaking for the plate's labels (Baloo at ~0.55 em a character).
function wrap(s: string, px: number, size: number): string[] {
  const max = Math.max(4, Math.floor(px / (size * 0.53)))
  const out: string[] = []; let line = ''
  for (const w of s.split(/\s+/)) { if ((line + ' ' + w).trim().length > max && line) { out.push(line); line = w } else line = (line + ' ' + w).trim() }
  if (line) out.push(line)
  return out
}
// fit: shrink the size until one line fits that width (labels inside boxes and circles; 14 Oct bake-off: long words ran out).
function text(x: number, y: number, s: string, o: { size?: number; weight?: number; fill?: string; anchor?: 'start' | 'middle' | 'end'; width?: number; op?: number; lh?: number; fit?: number } = {}) {
  const size = o.fit ? Math.min(o.size ?? 13, o.fit / Math.max(1, s.length * 0.56)) : o.size ?? 13, lines = o.width ? wrap(s, o.width, size) : [s], lh = o.lh ?? size * 1.2
  const y0 = y - ((lines.length - 1) * lh) / 2
  return `<text x="${x}" y="${y0}" font-family="'Baloo 2', system-ui, sans-serif" font-size="${size}" font-weight="${o.weight ?? 700}" fill="${o.fill ?? PAPER}" text-anchor="${o.anchor ?? 'start'}" dominant-baseline="middle" opacity="${(o.op ?? 1).toFixed(3)}">${lines.map((l, i) => `<tspan x="${x}" dy="${i ? lh : 0}">${esc(l)}</tspan>`).join('')}</text>`
}
// An element that arrives: opacity and a spring scale about its own centre.
function pop(t: number, at: number, cx: number, cy: number, inner: string) {
  const s = spring(t - at, 260, 20), a = clamp((t - at) * 7)
  if (a <= 0) return ''
  return `<g opacity="${a.toFixed(3)}" transform="translate(${cx} ${cy}) scale(${(0.55 + 0.45 * s).toFixed(4)}) translate(${-cx} ${-cy})">${inner}</g>`
}
// A stroke that draws itself.
function draw(t: number, at: number, d: string, o: { stroke?: string; width?: number; dash?: string; arrow?: boolean; len?: number } = {}) {
  const p = spring(t - at, 90, 19), len = o.len ?? 400
  if (p <= 0) return ''
  const head = o.arrow ? ` marker-end="url(#fig-arrow)"` : ''
  return `<path d="${d}" fill="none" stroke="${o.stroke ?? PAPER}" stroke-width="${o.width ?? 2.5}" stroke-linecap="round" stroke-dasharray="${len}" stroke-dashoffset="${(len * (1 - p)).toFixed(2)}"${head} opacity="${clamp(p * 3).toFixed(3)}"/>`
}

function glyph(g: Glyph, cx: number, cy: number, r = 22): string {
  switch (g) {
    case 'sun': return `<circle cx="${cx}" cy="${cy}" r="${r * 0.62}" fill="${MARI}"/>` + Array.from({ length: 8 }, (_, i) => { const a = (i * Math.PI) / 4; return `<line x1="${cx + Math.cos(a) * r * 0.8}" y1="${cy + Math.sin(a) * r * 0.8}" x2="${cx + Math.cos(a) * r}" y2="${cy + Math.sin(a) * r}" stroke="${MARI}" stroke-width="3" stroke-linecap="round"/>` }).join('')
    case 'moon': return `<circle cx="${cx}" cy="${cy}" r="${r * 0.8}" fill="${INK}" stroke="${PAPER}" stroke-width="2"/><path d="M${cx} ${cy - r * 0.8} A${r * 0.8} ${r * 0.8} 0 0 0 ${cx} ${cy + r * 0.8} Z" fill="${PAPER}"/>`
    case 'earth': return `<circle cx="${cx}" cy="${cy}" r="${r * 0.7}" fill="#2F3478" stroke="${INDIGO}" stroke-width="2"/><path d="M${cx - r * 0.4} ${cy - r * 0.2} q${r * 0.3} -${r * 0.3} ${r * 0.6} 0 t${r * 0.3} ${r * 0.3}" stroke="#17603C" stroke-width="4" fill="none" stroke-linecap="round"/>`
    case 'phone': return `<rect x="${cx - r * 0.45}" y="${cy - r * 0.8}" width="${r * 0.9}" height="${r * 1.6}" rx="${r * 0.18}" fill="none" stroke="${PAPER}" stroke-width="2.5"/><circle cx="${cx}" cy="${cy + r * 0.55}" r="2" fill="${PAPER}"/>`
    case 'battery': return `<rect x="${cx - r * 0.75}" y="${cy - r * 0.42}" width="${r * 1.4}" height="${r * 0.84}" rx="5" fill="none" stroke="${PAPER}" stroke-width="2.5"/><rect x="${cx + r * 0.68}" y="${cy - r * 0.18}" width="5" height="${r * 0.36}" rx="2" fill="${PAPER}"/><rect x="${cx - r * 0.6}" y="${cy - r * 0.28}" width="${r * 0.7}" height="${r * 0.56}" rx="3" fill="${MARI}"/>`
    case 'coin': return `<circle cx="${cx}" cy="${cy}" r="${r * 0.7}" fill="${MARI}"/>${text(cx, cy + 1, '₹', { size: r * 0.8, anchor: 'middle', fill: INK, weight: 800 })}`
    case 'card': return `<rect x="${cx - r * 0.85}" y="${cy - r * 0.55}" width="${r * 1.7}" height="${r * 1.1}" rx="6" fill="${MARI}"/><rect x="${cx - r * 0.85}" y="${cy - r * 0.25}" width="${r * 1.7}" height="${r * 0.2}" fill="${INK}"/>`
    case 'plane': return `<path d="M${cx - r} ${cy} L${cx + r} ${cy - r * 0.15} L${cx - r * 0.2} ${cy - r * 0.55} Z M${cx - r * 0.2} ${cy + r * 0.1} L${cx + r} ${cy - r * 0.15}" fill="${PAPER}" stroke="${PAPER}" stroke-width="2" stroke-linejoin="round"/>`
    case 'person': return `<circle cx="${cx}" cy="${cy - r * 0.42}" r="${r * 0.3}" fill="${PAPER}"/><path d="M${cx - r * 0.55} ${cy + r * 0.7} q0 -${r * 0.85} ${r * 0.55} -${r * 0.85} t${r * 0.55} ${r * 0.85} Z" fill="${PAPER}"/>`
    case 'bag': return `<rect x="${cx - r * 0.55}" y="${cy - r * 0.3}" width="${r * 1.1}" height="${r * 0.95}" rx="6" fill="${MARI}"/><path d="M${cx - r * 0.28} ${cy - r * 0.3} v-${r * 0.2} a${r * 0.28} ${r * 0.28} 0 0 1 ${r * 0.56} 0 v${r * 0.2}" fill="none" stroke="${MARI}" stroke-width="2.5"/>`
    case 'bin': return `<path d="M${cx - r * 0.5} ${cy - r * 0.45} h${r} l-${r * 0.12} ${r * 1.1} h-${r * 0.76} Z" fill="none" stroke="${PAPER}" stroke-width="2.5" stroke-linejoin="round"/><line x1="${cx - r * 0.62}" y1="${cy - r * 0.45}" x2="${cx + r * 0.62}" y2="${cy - r * 0.45}" stroke="${PAPER}" stroke-width="2.5" stroke-linecap="round"/>`
    case 'eye': return `<path d="M${cx - r * 0.8} ${cy} q${r * 0.8} -${r * 0.7} ${r * 1.6} 0 q-${r * 0.8} ${r * 0.7} -${r * 1.6} 0 Z" fill="none" stroke="${PAPER}" stroke-width="2.5"/><circle cx="${cx}" cy="${cy}" r="${r * 0.22}" fill="${MARI}"/>`
    default: return `<circle cx="${cx}" cy="${cy}" r="${r * 0.4}" fill="${MARI}"/>`
  }
}

// How long each kind takes to build, so a player knows when it has settled.
export function duration(spec: FigureSpec): number {
  switch (spec.kind) {
    case 'bars': return 0.5 + spec.items.length * 0.32 + 0.9
    case 'converge': return 0.4 + spec.items.length * 0.25 + 1.6
    case 'lots': return 3.4
    case 'loop': return 3.6
    case 'equation': return 0.4 + spec.terms.length * 0.45 + 1
    case 'vs': return 2.2
    case 'flow': return 0.4 + spec.nodes.length * 0.55 + 0.8
  }
}

export function figureSvg(spec: FigureSpec, t: number): string {
  const parts: string[] = []
  const top = spec.title ? 34 : 14, bottom = spec.caption ? H - 40 : H - 14
  if (spec.title) parts.push(text(18, 22, spec.title.toUpperCase(), { size: 11, fill: DIM, weight: 700, op: clamp(t * 5), fit: W - 36 - (spec.kind === 'lots' && spec.legend ? 96 : 0) }))
  const capAt = duration(spec) - 0.6
  if (spec.caption) parts.push(`<g opacity="${clamp((t - capAt) * 4).toFixed(3)}">${text(W / 2, H - 22, spec.caption, { size: 13, weight: 600, anchor: 'middle', width: W - 40, fill: PAPER, lh: 15 })}</g>`)

  if (spec.kind === 'bars') {
    const n = spec.items.length, rowH = Math.min(38, (bottom - top) / n), max = Math.max(...spec.items.map((i) => i.value)), x0 = 128, x1 = W - 70
    spec.items.forEach((it, i) => {
      const at = 0.35 + i * 0.32, y = top + rowH * (i + 0.5), g = spring(t - at, 120, 18), best = i === spec.best
      parts.push(`<g opacity="${clamp((t - at + 0.15) * 6).toFixed(3)}">${text(18, y, it.label, { size: 12.5, weight: 600, width: x0 - 26, lh: 13.5 })}</g>`)
      parts.push(`<rect x="${x0}" y="${y - 7}" width="${x1 - x0}" height="14" rx="7" fill="rgba(250,247,240,0.08)"/>`)
      parts.push(`<rect x="${x0}" y="${y - 7}" width="${Math.max(0, ((x1 - x0) * it.value / max) * g).toFixed(2)}" height="14" rx="7" fill="${best ? MARI : PAPER}" opacity="${best ? 1 : 0.85}"/>`)
      parts.push(`<g opacity="${clamp((t - at - 0.35) * 5).toFixed(3)}">${text(x1 + 10, y, it.show, { size: 13.5, weight: 800, fill: best ? MARI : PAPER })}</g>`)
    })
  }

  if (spec.kind === 'converge') {
    const n = spec.items.length, cx = W - 78, cy = (top + bottom) / 2, rowH = (bottom - top) / n
    spec.items.forEach((s, i) => {
      const at = 0.3 + i * 0.25, y = top + rowH * (i + 0.5), w = 150
      parts.push(pop(t, at, 18 + w / 2, y, `<rect x="18" y="${y - 14}" width="${w}" height="28" rx="14" fill="rgba(250,247,240,0.1)"/>${text(30, y, s, { size: 12, weight: 600, fit: w - 22 })}`))
      parts.push(draw(t, at + 0.55, `M${18 + w + 6} ${y} C${18 + w + 40} ${y}, ${cx - 70} ${cy}, ${cx - 46} ${cy}`, { stroke: LINE, width: 2, len: 160 }))
    })
    const nodeAt = 0.4 + n * 0.25 + 0.6
    parts.push(pop(t, nodeAt, cx, cy, `<circle cx="${cx}" cy="${cy}" r="44" fill="${MARI}"/>${text(cx, cy - (spec.into.sub ? 9 : 0), spec.into.label, { size: 15, weight: 800, fill: INK, anchor: 'middle', fit: 76 })}${spec.into.sub ? text(cx, cy + 12, spec.into.sub, { size: 10.5, weight: 700, fill: INK, anchor: 'middle', width: 74, lh: 11 }) : ''}`))
  }

  if (spec.kind === 'lots' || spec.kind === 'loop') {
    const isLoop = spec.kind === 'loop'
    const y0 = isLoop ? top + 78 : top + 8, y1 = bottom - 22, lw = 118, gap = 30, lx = (W - lw * 2 - gap) / 2, rx = lx + lw + gap
    const fenceX = W / 2
    parts.push(pop(t, 0.2, lx + lw / 2, (y0 + y1) / 2, `<rect x="${lx}" y="${y0}" width="${lw}" height="${y1 - y0}" rx="14" fill="rgba(250,247,240,0.07)" stroke="${LINE}" stroke-width="1.5"/>`))
    parts.push(pop(t, 0.35, rx + lw / 2, (y0 + y1) / 2, `<rect x="${rx}" y="${y0}" width="${lw}" height="${y1 - y0}" rx="14" fill="rgba(250,247,240,0.07)" stroke="${LINE}" stroke-width="1.5"/>`))
    parts.push(draw(t, 0.5, `M${fenceX} ${y0 - 4} V${y1 + 4}`, { stroke: MARI, width: 3, dash: '4 6', len: y1 - y0 + 8 }))
    parts.push(`<g opacity="${clamp((t - 0.5) * 5).toFixed(3)}">${text(lx + lw / 2, y1 + 12, spec.left, { size: 12, weight: 700, anchor: 'middle', fill: DIM, fit: lw })}${text(rx + lw / 2, y1 + 12, spec.right, { size: 12, weight: 700, anchor: 'middle', fill: DIM, fit: lw })}</g>`)
    const n = spec.kind === 'lots' ? (spec.dots ?? 12) : 9
    const fromLeft = spec.kind === 'lots' ? spec.from === 'left' : !spec.charge
    const cols = 3, cellX = (lw - 30) / (cols - 1), rows = Math.ceil(n / cols), cellY = Math.min(20, (y1 - y0 - 24) / Math.max(1, rows - 1))
    for (let i = 0; i < n; i++) {
      const c = i % cols, r = Math.floor(i / cols)
      const ax = (fromLeft ? lx : rx) + 15 + c * cellX, bx = (fromLeft ? rx : lx) + 15 + c * cellX, y = y0 + 15 + r * cellY
      const at = 1.2 + i * 0.09, p = spring(t - at, 70, 14)
      const x = ax + (bx - ax) * p, arc = Math.sin(Math.PI * clamp(p)) * -14
      parts.push(`<circle cx="${x.toFixed(2)}" cy="${(y + arc).toFixed(2)}" r="6" fill="${MARI}" opacity="${clamp((t - 0.7) * 4).toFixed(3)}"/>`)
    }
    if (spec.kind === 'lots' && spec.legend) parts.push(`<g opacity="${clamp((t - 0.9) * 4).toFixed(3)}"><circle cx="${W - 18 - 6}" cy="22" r="5" fill="${MARI}"/>${text(W - 34, 22, spec.legend, { size: 11, fill: DIM, anchor: 'end' })}</g>`)
    if (isLoop) {
      const ax = lx + lw / 2, bx = rx + lw / 2, peak = top + 14
      const road = fromLeft ? `M${ax} ${y0 - 2} C${ax} ${peak}, ${bx} ${peak}, ${bx} ${y0 - 2}` : `M${bx} ${y0 - 2} C${bx} ${peak}, ${ax} ${peak}, ${ax} ${y0 - 2}`
      parts.push(draw(t, 0.7, road, { stroke: PAPER, width: 2.5, len: 320, arrow: true }))
      const vx = W / 2, vy = top + 22
      parts.push(pop(t, 1.0, vx, vy + 6, `<rect x="${vx - 40}" y="${vy - 8}" width="80" height="30" rx="15" fill="${INK}" stroke="${PAPER}" stroke-width="2"/>${text(vx, vy + 7, spec.via, { size: 11.5, weight: 800, anchor: 'middle', fit: 72 })}`))
      // electrons riding the outside road
      for (let k = 0; k < 4; k++) {
        // the one thing that keeps moving once the figure is built: electrons riding the road, for as long as it's on screen
        const run = (t - 1.6 - k * 0.45) / 1.8
        if (run <= 0) continue
        const u = run % 1
        const p0 = fromLeft ? ax : bx, p3 = fromLeft ? bx : ax
        const x = (1 - u) ** 3 * p0 + 3 * (1 - u) ** 2 * u * p0 + 3 * (1 - u) * u * u * p3 + u ** 3 * p3
        const y = (1 - u) ** 3 * (y0 - 2) + 3 * (1 - u) ** 2 * u * peak + 3 * (1 - u) * u * u * peak + u ** 3 * (y0 - 2)
        parts.push(`<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="3.6" fill="${INDIGO}"/>`)
      }
      parts.push(`<g opacity="${clamp((t - 2.2) * 4).toFixed(3)}">${text(18, top + 58, spec.outside, { size: 11, weight: 700, fill: INDIGO, width: 74, lh: 12.5 })}</g>`)
      parts.push(`<g opacity="${clamp((t - 2.5) * 4).toFixed(3)}">${text(W - 18, top + 58, spec.inside, { size: 11, weight: 700, fill: MARI, anchor: 'end', width: 74, lh: 12.5 })}</g>`)
    }
  }

  if (spec.kind === 'equation') {
    const n = spec.terms.length, slot = (W - 36) / (n * 2 - 1), cy = (top + bottom) / 2 - 6
    spec.terms.forEach((term, i) => {
      const cx = 18 + slot * (i * 2) + slot / 2, at = 0.35 + i * 0.45, last = i === n - 1
      parts.push(pop(t, at, cx, cy, `<rect x="${cx - slot / 2 - 8}" y="${cy - 26}" width="${slot + 16}" height="52" rx="16" fill="${last ? MARI : 'rgba(250,247,240,0.1)'}"/>${text(cx, cy, term.show, { size: 18, weight: 800, anchor: 'middle', fill: last ? INK : PAPER, fit: slot + 4 })}`))
      parts.push(`<g opacity="${clamp((t - at - 0.2) * 5).toFixed(3)}">${text(cx, cy + 44, term.label, { size: 11, weight: 700, anchor: 'middle', fill: DIM, width: slot + 20, lh: 12.5 })}</g>`)
      if (i < n - 1) {
        const ox = cx + slot, op = spec.ops[i] ?? '', a = clamp((t - at - 0.15) * 5).toFixed(3)
        // ÷ and = drawn as shapes: at 22 px the font's ÷ read as a plus (14 Oct contact sheet)
        const mark = op === '÷' ? `<line x1="${ox - 9}" y1="${cy}" x2="${ox + 9}" y2="${cy}" stroke="${MARI}" stroke-width="3.2" stroke-linecap="round"/><circle cx="${ox}" cy="${cy - 7.5}" r="2.6" fill="${MARI}"/><circle cx="${ox}" cy="${cy + 7.5}" r="2.6" fill="${MARI}"/>`
          : op === '=' ? `<line x1="${ox - 9}" y1="${cy - 4.5}" x2="${ox + 9}" y2="${cy - 4.5}" stroke="${MARI}" stroke-width="3.2" stroke-linecap="round"/><line x1="${ox - 9}" y1="${cy + 4.5}" x2="${ox + 9}" y2="${cy + 4.5}" stroke="${MARI}" stroke-width="3.2" stroke-linecap="round"/>`
          : text(ox, cy, op, { size: 22, weight: 800, anchor: 'middle', fill: MARI })
        parts.push(`<g opacity="${a}">${mark}</g>`)
      }
    })
  }

  if (spec.kind === 'vs') {
    const colW = (W - 54) / 2, cy = (top + bottom) / 2
    ;([['wrong', spec.wrong, 18], ['right', spec.right, 36 + colW]] as const).forEach(([k, c, x], i) => {
      const at = 0.3 + i * 0.7, ok = k === 'right'
      parts.push(pop(t, at, x + colW / 2, cy, `<rect x="${x}" y="${top + 4}" width="${colW}" height="${bottom - top - 8}" rx="16" fill="${ok ? 'rgba(242,169,59,0.16)' : 'rgba(250,247,240,0.06)'}"/>`
        + (ok ? `<circle cx="${x + 22}" cy="${top + 28}" r="8" fill="${MARI}"/>` : `<circle cx="${x + 22}" cy="${top + 28}" r="7" fill="none" stroke="${DIM}" stroke-width="2.5"/>`)
        + text(x + 38, top + 28, c.head, { size: 13.5, weight: 800, fill: ok ? MARI : DIM, fit: colW - 46 })
        + text(x + 16, top + 50 + 34, c.line, { size: 12.5, weight: 600, width: colW - 28, fill: ok ? PAPER : DIM, lh: 15 })))
    })
  }

  if (spec.kind === 'flow') {
    const n = spec.nodes.length, step = (W - 36) / n, cy = (top + bottom) / 2 - 8
    spec.nodes.forEach((nd, i) => {
      const cx = 18 + step * (i + 0.5), at = 0.3 + i * 0.55
      parts.push(pop(t, at, cx, cy, glyph(nd.glyph, cx, cy, 26)))
      parts.push(`<g opacity="${clamp((t - at - 0.15) * 5).toFixed(3)}">${text(cx, cy + 44, nd.label, { size: 12, weight: 700, anchor: 'middle', width: step - 6, lh: 13 })}</g>`)
      if (i < n - 1) {
        parts.push(draw(t, at + 0.3, `M${cx + 32} ${cy} H${cx + step - 32}`, { stroke: MARI, width: 2.5, len: step - 64, arrow: true }))
        const lk = spec.links?.[i]
        if (lk) parts.push(`<g opacity="${clamp((t - at - 0.5) * 5).toFixed(3)}">${text(cx + step / 2, cy - 14, lk, { size: 10.5, weight: 700, anchor: 'middle', fill: MARI })}</g>`)
      }
    })
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img"><defs><marker id="fig-arrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M1 1 L8 5 L1 9" fill="none" stroke="${MARI}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></marker></defs><rect width="${W}" height="${H}" rx="22" fill="${INK}"/>${parts.join('')}</svg>`
}

// What the figure says in words, for screen readers (the plate itself is aria-hidden text drawn in SVG).
export function figureAlt(spec: FigureSpec): string {
  const cap = spec.caption ? ` ${spec.caption}` : ''
  switch (spec.kind) {
    case 'bars': return spec.items.map((i) => `${i.label}: ${i.show}`).join('; ') + '.' + cap
    case 'converge': return `${spec.items.join(', ')}: all one idea, ${spec.into.label}.` + cap
    case 'lots': return `Two sides, ${spec.left} and ${spec.right}; the dots move from ${spec.from === 'left' ? spec.left : spec.right} to the other side.` + cap
    case 'loop': return `${spec.inside}. ${spec.outside}, through ${spec.via}.` + cap
    case 'equation': return spec.terms.map((x, i) => `${x.label} ${x.show}${spec.ops[i] ? ` ${spec.ops[i] === '÷' ? 'divided by' : spec.ops[i] === '=' ? 'equals' : spec.ops[i]}` : ''}`).join(' ') + '.' + cap
    case 'vs': return `Not this: ${spec.wrong.head}, ${spec.wrong.line} This: ${spec.right.head}, ${spec.right.line}` + cap
    case 'flow': return spec.nodes.map((n) => n.label).join(', then ') + '.' + cap
  }
}
