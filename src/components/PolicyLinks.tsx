// The four policy pages' names and the footer links to them (11 Oct: split out of screens/Policy.tsx so every footer
// stops pulling the policy pages' text into the first download; the pages themselves load when opened).
export const POLICY_PAGES = ['terms', 'privacy', 'refunds', 'contact'] as const
export type PolicyPage = (typeof POLICY_PAGES)[number]

export const TITLES: Record<PolicyPage, string> = {
  terms: 'Terms of use',
  privacy: 'Privacy',
  refunds: 'Refunds, cancellation and delivery',
  contact: 'Contact',
}

export function PolicyLinks() {
  return (
    <span className="policy-links">
      {POLICY_PAGES.map((p) => <a key={p} href={`/${p}`}>{p === 'refunds' ? 'Refunds' : TITLES[p].replace(' of use', '')}</a>)}
    </span>
  )
}
