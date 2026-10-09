// The free-chapter rule in words, from the server's number (membership.ts LIMITS.visitorChapters, 2 since D26), so
// every screen says the same thing (UX review 9 Oct, #10: it was said three ways).
export const freeChaptersText = (n: number) => (n <= 1 ? 'Chapter 1' : n === 2 ? 'Chapters 1 and 2' : `Chapters 1 to ${n}`)

// The one free typed topic, said beside every topic box before the first choice (Shaktimaan, 9 Oct night: a reader made
// their one typed topic without knowing it was limited). Numbers are the server's (membership.ts LIMITS, typedAllowance).
// A line that matches a ready handbook opens it and never counts. Copy (agent).
export type TypedAllowance = { member: boolean; used: number; limit: number; superAdmin?: boolean }
export const TYPED_RULE = "Free: one handbook written just for what you type. Ready handbooks on the Shelf are free too, and don't use it."
export function typedBoxText(a: TypedAllowance | null | undefined, replacing?: string | null): string | null {
  if (replacing) return `This replaces “${replacing}”, which you haven't read yet, so it doesn't use another typed topic.`
  if (!a) return TYPED_RULE
  if (a.superAdmin || a.limit > 100) return null
  if (a.member) return a.used >= a.limit ? `You have ${a.limit} handbooks of your own on the go, the most at once. Finish one to type another; ready handbooks open any time.` : `Members keep ${a.limit} handbooks of their own on the go. You have ${a.used}.`
  return a.used >= a.limit ? "You've used your one free typed topic. A new one needs membership; ready handbooks stay free." : "Your one free typed topic: what you type here is written just for you. Ready handbooks don't use it."
}
// The same rule for suggestions that write a new handbook (the topics offered after a declined line).
export function typedPickText(a: TypedAllowance | null | undefined): string {
  if (a?.member) return '"Written for you" ones count as one of your own handbooks.'
  if (a && a.used >= a.limit && !a.superAdmin) return '"Written for you" ones need membership: your free typed topic is used.'
  return '"Written for you" ones would be your one free typed topic.'
}
