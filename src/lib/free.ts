// The free-chapter rule in words, from the server's number (membership.ts LIMITS.visitorChapters, 2 since D26), so
// every screen says the same thing (UX review 9 Oct, #10: it was said three ways).
export const freeChaptersText = (n: number) => (n <= 1 ? 'Chapter 1' : n === 2 ? 'Chapters 1 and 2' : `Chapters 1 to ${n}`)
