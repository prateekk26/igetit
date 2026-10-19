import Ooh from './Ooh'

// A page waiting on the server (20 Oct, Prateek: "simple loading… ur call, don't overdo"): Ooh's thinking face, the one
// that loops while a book is written, small and centred; the words are for screen readers. Button waits keep their words.
export default function PageLoading({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="page-loading" aria-busy="true">
      <Ooh face="making" size={44} />
      <span className="lp-visually-hidden" role="status">{label}</span>
    </div>
  )
}
