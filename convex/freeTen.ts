// D65 (Prateek, 10 Oct): the free eleven, ready handbooks anyone can read start to finish with no daily limit
// ("make it free, the complete course ... a flavor of what's on offer without restrictions"). The free sign-up after
// chapter 2 stays (agent's recommendation, not yet answered). Names as stored on the cache row. docs/free-ten.md.
// 11 Oct night (agent; Prateek: "All the pending handbooks as well"): the other ten, built from hand plans
// (convex/plans/) on dev, read, then copied word for word.
export const FREE_TEN = new Set<string>([
  "Hold a room for 10 minutes",
  "Build a system that lands your next job",
  "Ask for a raise and get it",
  "Speak English without translating in your head",
  "Tell a good IPO from hype",
  "Start the thing you keep putting off",
  "Spot what India's past multibaggers had in common",
  "Why 9 in 10 F&O traders lose money",
  "Make ChatGPT and Claude do your boring work",
  "Make your credit card pay you back",
  "Plan to buy your next car",
]);

// D99 (13 Oct, Prateek: "Let me make handbooks free as well", then "keep the sign-up, build make free"): the owner can
// make any ready handbook free, or take one of the eleven off, from /admin (shelf.free on the ready row). Unset means
// the list above decides. Free means what D65 means: no daily chapter limit; the sign-up after chapter 2 stays.
export const isFreeRow = (r: { kind: string; topic: string; title?: string; free?: boolean }) =>
  r.kind === "ready" && (r.free ?? (FREE_TEN.has(r.topic) || (!!r.title && FREE_TEN.has(r.title))));

// The same key as handbooks.topicKeyOf (kept here so this file imports nothing).
const key = (t: string) => t.normalize("NFKC").toLowerCase().replace(/https?:\/\/\S+/g, " ").replace(/[^\p{L}\p{M}\p{N}]+/gu, " ").trim().replace(/\s+/g, " ").slice(0, 80);

// A new start on these words opens the handbook that replaced them, or the free handbook on that subject. An old row
// stays for the readers already in it (its unread chapters would otherwise be swapped for another plan's days).
const TO: Record<string, string[]> = {
  "Hold a room for 10 minutes": ["public speaking"],
  "Build a system that lands your next job": ["job search", "how to find a job", "how to get a job", "job hunting"],
  "Ask for a raise and get it": ["salary negotiation", "how to ask for a raise", "ask for a raise", "negotiate salary"],
  "Speak English without translating in your head": ["spoken english", "english speaking", "speak english fluently", "improve my english"],
  "Tell a good IPO from hype": ["ipo", "ipos", "how ipos work", "how indian ipos work", "should i apply for an ipo"],
  "Start the thing you keep putting off": ["procrastination", "how to stop procrastinating", "stop procrastinating"],
  "Spot what India's past multibaggers had in common": ["multibaggers", "multibagger stocks", "how to find multibagger stocks"],
  "Why 9 in 10 F&O traders lose money": ["f&o", "f&o trading", "futures and options", "options trading"],
  "Make ChatGPT and Claude do your boring work": ["chatgpt", "how to use chatgpt", "ai at work", "chatgpt for work"],
  "Make your credit card pay you back": ["credit card", "credit cards", "credit score", "cibil score", "credit card rewards"],
  "Plan to buy your next car": ["car buying", "buying a car", "how to buy a car", "car loan"],
  // The 11 Oct evening batch (12 Oct): other ways to type them. Redirects, not copies: a copy row per spelling holds the
  // whole handbook, and 38 of them pushed the whole-cache read on every visit past Convex's 16 MB limit.
  "Read the night sky": ["stargazing", "night sky", "stargazing for beginners"],
  "Taste coffee like a barista": ["coffee tasting", "taste coffee"],
  "Calm your child's meltdown without losing yours": ["child meltdowns", "toddler tantrums", "tantrums"],
  "Get your child reading for fun": ["get my child to read", "kids reading habit"],
  "Teach your child money with their pocket money": ["pocket money", "teach kids about money"],
  "Understand Formula 1 in a week": ["formula 1", "f1", "understand f1"],
  "Know before you go: Singapore": ["singapore trip", "travel to singapore"],
  "Know before you go: Vietnam": ["vietnam trip", "travel to vietnam"],
  "Know before you go: Dubai": ["dubai trip", "travel to dubai"],
  "Know before you go: Bali": ["bali trip", "travel to bali"],
  "Know before you go: Japan": ["japan trip", "travel to japan"],
  "Know before you go: Thailand": ["thailand trip", "travel to thailand"],
  "Know before you go: the USA": ["travel to the usa", "usa trip", "visiting america"],
  "Know before you go: a Europe trip on a Schengen visa": ["europe trip", "travel to europe", "schengen visa"],
  "Know before you go: Australia": ["australia trip", "travel to australia"],
  "Know before you go: Kenya": ["kenya trip", "travel to kenya", "kenya safari"],
};
export const REDIRECT: Record<string, string> = Object.fromEntries(Object.entries(TO).flatMap(([title, words]) => words.map((w) => [key(w), key(title)])));
