import { useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import Ooh from '../components/Ooh'

// "What you know" (14 Oct, the C board of that name; the middle tab of C4's bar): every chapter passed, by handbook,
// as its title, with what it taught under it. Solid, or fuzzy when the latest warm-up question on it was missed
// (handbooks.known). A tap opens the chapter to read again. The board's "Forgotten" count is left out: nothing measures
// forgetting yet. Copy (agent).
export default function Known({ deviceToken, onOpen }: { deviceToken: string; onOpen: (handbookId: Id<'handbooks'>, n: number) => void }) {
  const d = useQuery(api.handbooks.known, { deviceToken })
  const [only, setOnly] = useState<'all' | 'fuzzy'>('all')
  if (d === undefined) return <p className="note">Loading…</p>
  const total = d.items.length, fuzzy = d.fuzzy
  const shown = d.items.filter((x) => only === 'all' || x.fuzzy)
  const books = [...new Map(shown.map((x) => [x.handbookId, x.topic])).entries()]
  return (
    <section className="known">
      <h1>What you know</h1>
      <p className="c3-says"><Ooh size={28} idle /><span>{total === 0 ? 'Nothing yet. Pass a chapter and what it taught lands here.'
        : `You know ${total} ${total === 1 ? 'thing' : 'things'} now.${fuzzy ? ` ${fuzzy} ${fuzzy === 1 ? 'is' : 'are'} getting fuzzy: you missed a warm-up question on ${fuzzy === 1 ? 'it' : 'them'}. Read ${fuzzy === 1 ? 'it' : 'them'} again.` : ''}`}</span></p>
      {total > 0 && (
        <>
          <dl className="known-counts">
            <div><dd>{total - fuzzy}</dd><dt><span className="known-dot" aria-hidden="true" />Solid</dt></div>
            <div><dd>{fuzzy}</dd><dt><span className="known-dot fuzzy" aria-hidden="true" />Fuzzy</dt></div>
          </dl>
          {fuzzy > 0 && (
            <div className="known-filter" role="group" aria-label="Show">
              <button type="button" aria-pressed={only === 'all'} onClick={() => setOnly('all')}>All</button>
              <button type="button" aria-pressed={only === 'fuzzy'} onClick={() => setOnly('fuzzy')}>Fuzzy · {fuzzy}</button>
            </div>
          )}
          {books.map(([id, topic]) => (
            <section key={id} className="known-book" aria-label={topic}>
              <h2>{d.covers?.[id] ? <img src={d.covers[id]!} alt="" /> : <span className="known-blank" aria-hidden="true">{topic.slice(0, 1)}</span>}{topic}</h2>
              <ul>
                {shown.filter((x) => x.handbookId === id).sort((a, b) => a.n - b.n).map((x) => (
                  <li key={x.n}>
                    <button type="button" onClick={() => onOpen(x.handbookId, x.n)}>
                      <span className={`known-dot${x.fuzzy ? ' fuzzy' : ''}`} aria-hidden="true" />
                      <span className="known-t"><b>{x.title}</b>{x.line && <small>{x.line}</small>}</span>
                      <span className="lp-visually-hidden">{x.fuzzy ? ', fuzzy' : ', solid'}. Read chapter {x.n} again</span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </>
      )}
    </section>
  )
}
