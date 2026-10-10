// D65 (Prateek, 10 Oct): the free eleven, ready handbooks anyone can read start to finish with no daily limit
// ("make it free, the complete course ... a flavor of what's on offer without restrictions"). The free sign-up after
// chapter 2 stays (agent's recommendation, not yet answered). Names as stored on the cache row. docs/free-ten.md.
export const FREE_TEN = new Set<string>([
  "Hold a room for 10 minutes",
]);

// A new start on these words opens the handbook that replaced them. The old row stays for the readers already in it
// (its unread chapters would otherwise be swapped for another plan's days) and for nothing else.
export const REDIRECT: Record<string, string> = {
  "public speaking": "hold a room for 10 minutes",
};
