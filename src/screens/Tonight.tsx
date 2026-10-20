import { useState } from 'react'
import Ooh, { GoArrow } from '../components/Ooh'
import { nameOf } from '../lib/name'
import { nameFor, vt } from '../lib/vt'

// Tonight (C4, 14 Oct; Prateek: "follow the UI given and use our backend to populate the data"): the home of a reader
// coming back. "Tonight" and the date, Ooh saying what's next, tonight's chapter of the book they read last on a marigold
// card with its own Start, then "Your book": every handbook they have, its cover, a dot a chapter (a bar past ten), and
// how far they got. A tap on a book opens its plan. Managing books (remove, start a new one, the account) is one tap
// further, "Manage your books". Copy (agent).
type Row = { _id: string; topic: string; status: string; passed: number; total?: number; current: number; card?: number; started?: boolean; lastAt: number; cover?: string | null; nextTitle?: string | null; nextMinutes?: number }
type Props = { rows: Row[]; onContinue: (id: string) => void; onOpen: (id: string) => void; onManage: () => void; onNew: () => void }

const today = () => new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })

export default function Tonight({ rows, onContinue, onOpen, onManage, onNew }: Props) {
  const ready = rows.filter((r) => r.status === 'ready')
  const unfinished = ready.filter((r) => r.passed < (r.total ?? 7))
  // Tonight's book: the one read last that isn't finished.
  const book = unfinished.find((r) => r.started) ?? unfinished[0] ?? null
  const total = book?.total ?? 7
  const midway = !!book && (book.card ?? 0) > 0
  // A long list (Prateek, 20 Oct: "will this list go endless?"): books still being read first, finished ones last, the
  // first five shown and "Show all N books" for the rest. No scroll box (awkward on a phone), no pages (more taps).
  const SHOWN = 5
  const [all, setAll] = useState(false)
  const isDone = (r: Row) => r.status === 'ready' && r.passed >= (r.total ?? 7)
  const ordered = [...rows.filter((r) => !isDone(r)), ...rows.filter(isDone)]
  const listed = all ? ordered : ordered.slice(0, SHOWN)
  const say = !book ? (ready.length ? "You've finished every book you have. Pick your next one from the Shelf." : 'Your first book is still being written. It shows up here when it is ready.')
    : midway ? `You stopped partway through chapter ${book.current}. Pick up where you left off.`
    : book.current > 1 ? `Two quick questions on chapter ${book.current - 1} first, then chapter ${book.current}.`
    : `Chapter 1 is ready. It takes about ${book.nextMinutes ?? 5} minutes.`
  return (
    <section className="c4">
      <div className="c4-main">
        <h1>Tonight</h1>
        <p className="c4-date">{today()}</p>
        {/* Nothing to read tonight (20 Oct): a big Ooh, happy when every book is finished, curious while the first is written */}
        {!book && <div className="ooh-empty"><Ooh face={ready.length ? 'happy' : 'curious'} size={96} idle /></div>}
        <p className={`c3-says c4-says${book ? '' : ' empty'}`}>{book && <Ooh size={28} idle />}<span>{say}</span></p>
        {book && (
          <div className="c4-tonight c4-card">
            <div className="c4-card-words">
              {/* Which book (Prateek, 20 Oct: "chapter 1 of what?"): its name over the chapter line; the same book is
                  marked "Tonight" in the list beside it. */}
              <span className="c4-book">{nameOf(book.topic)}</span>
              <span className="c4-kicker">Chapter {book.current} of {total}</span>
              <h2>{book.nextTitle ?? book.topic}</h2>
              <span className="c4-meta">{midway ? 'Partway through' : `${book.nextMinutes ?? 5} minutes${book.current > 1 ? ', after two quick questions' : ''}`}</span>
              <button type="button" className="c4-go nudge-go" onClick={(e) => { nameFor(e.currentTarget.closest('.c4-card'), 'chap'); vt(() => onContinue(book._id), 'chap') }}><span>{midway ? 'Continue' : 'Start'}</span><GoArrow /></button>
            </div>
            {book.cover && <img className="c4-card-pic" src={book.cover} alt="" />}
          </div>
        )}
      </div>
      <div className="c4-books">
        <h2 className="c4-label">Your book{rows.length === 1 ? '' : 's'}</h2>
        <ul>
          {listed.map((r) => {
            const t = r.total ?? 7, done = r.passed >= t, on = r._id === book?._id
            return (
              <li key={r._id} className={on ? 'c4-on' : undefined}>
                <button type="button" onClick={(e) => { nameFor(e.currentTarget.querySelector('img'), 'book-pic'); vt(() => onOpen(r._id), 'book') }}>
                  {r.cover ? <img src={r.cover} alt="" /> : <span className="c4-blank" aria-hidden="true">{nameOf(r.topic).slice(0, 1)}</span>}
                  <span className="c4-book-t">
                    <b>{nameOf(r.topic)}{on && <span className="c4-on-tag">Tonight</span>}</b>
                    <span className="c4-progress" role="img" aria-label={r.status !== 'ready' ? 'Being written' : done ? `All ${t} chapters done` : `${r.passed} of ${t} chapters done`}>
                      {r.status !== 'ready' ? <small>Being written</small> : (
                        <>
                          {t <= 10 ? Array.from({ length: t }, (_, k) => <i key={k} className={k < r.passed ? 'on' : undefined} style={k < r.passed ? { ['--k' as any]: k } : undefined} />) : <span className="c4-bar"><i style={{ width: `${(r.passed / t) * 100}%` }} /></span>}
                          <small>{done ? 'Finished' : `${r.passed} of ${t}`}</small>
                        </>
                      )}
                    </span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
        {ordered.length > SHOWN && (
          <button type="button" className="c4-all" aria-expanded={all} onClick={() => setAll((x) => !x)}>{all ? 'Show fewer' : `Show all ${ordered.length} books`}</button>
        )}
        <div className="c4-more">
          <button type="button" className="c-more" onClick={onNew}>Start a new book →</button>
          <button type="button" className="c-more" onClick={onManage}>Manage your books</button>
        </div>
      </div>
    </section>
  )
}
