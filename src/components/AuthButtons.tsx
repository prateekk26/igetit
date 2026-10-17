// 18 Oct (Prateek: "home page landing page all should have sign in sign up button"; "top bar sign button"): for a
// visitor not signed in, on every top bar and on the home page's bar. Both open the same email-code screen; "Sign up"
// only changes its heading. Short labels on a phone. Copy (agent).
export type AuthLinks = { signIn: () => void; signUp: () => void } | null

export default function AuthButtons({ links }: { links: AuthLinks | undefined }) {
  if (!links) return null
  return (
    <span className="auth-links">
      <button type="button" className="auth-in" onClick={links.signIn}>Sign in</button>
      <button type="button" className="auth-up" onClick={links.signUp}><span className="auth-long">Sign up free</span><span className="auth-short">Sign up</span></button>
    </span>
  )
}
