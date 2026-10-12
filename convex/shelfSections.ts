// D35 (Prateek, 9 Oct 12:5x: "The categorization is horrible for the shelf. Can we fix it?"): the Shelf's sections are
// subjects a reader looks for, fixed here, in this order. Every handbook sits on exactly one. A model sorts new rows
// (shelf.ts classify, Sonnet low, one call for all unsorted rows); the owner can move any row on /admin. The old shelves
// by popularity (Trending, Most finished, New) are gone: the Spotlight does that job, and they stole books from their
// subject. Copy (agent).
export const SECTIONS: { key: string; label: string; note: string; hint: string }[] = [
  // 11 Oct evening (Prateek: "Know before you go ... give them a nice space on the shelf"): one shelf for the travel
  // series, drawn right under the free shelf. Copy (agent).
  // 13 Oct (Prateek: "Give me the 5 shelfs", "more interesting shelf names ... more fun"): five shelves, his pick of the
  // names; "History and big ideas" and "Films, music and sport" became one, "Plot twist" (shelf.mergeSections moved
  // their books). The notes under each name are Copy (agent).
  { key: "travel", label: "Wheels up", note: "Visas, money and the rules that catch Indians out, country by country.", hint: "travelling to a country or city: visas, entry rules, money, getting around, local laws and customs for visitors" },
  { key: "money", label: "Money moves", note: "Shares, funds, IPOs, your pay. Study aid, not advice.", hint: "investing, stocks, bonds, mutual funds, IPOs, reading accounts, personal finance, tax, credit cards, salary, jobs and careers" },
  { key: "tech", label: "Bots on payroll", note: "Put AI to work, and see inside the phone in your hand.", hint: "AI agents, coding, automation tools, software, how gadgets work, phones, batteries, chips" },
  { key: "doing", label: "Hands dirty", note: "Cook, swim, speak, parent: you practise, you log it.", hint: "any skill done with the body or voice, or practised at home: cooking a dish, swimming, dance, public speaking, fitness, a craft, parenting, habits" },
  { key: "stories", label: "Plot twist", note: "Wars, thinkers, films and sport: the story behind the story.", hint: "history, philosophy, religion and spirituality, classic literature, science ideas, films and franchises, music scenes, sports to watch and their rules, champions" },
];
export const SECTION_KEYS = SECTIONS.map((s) => s.key);
// The shelves' order on the Shelf, as the owner arranged it on /admin (settings row SHELF_ORDER_KEY, a JSON list of
// keys). A shelf missing from the saved list goes at the end, so a new shelf shows up without anyone arranging it.
export const SHELF_ORDER_KEY = "shelfOrder";
export const sectionOrder = (saved?: string[] | null) => [...new Set([...(saved ?? []).filter((k) => SECTION_KEYS.includes(k)), ...SECTION_KEYS])];
// The books' order on a shelf (13 Oct, Prateek: "Let the admins rearrange the shelf"): the ones the owner placed, in the
// owner's order, then the rest as before, the books readers finish most to the left, then the most opened, then a cover.
type Orderable = { order?: number | null; passes?: number | null; starts?: number | null; cover?: unknown; topic: string };
export const byShelfOrder = (a: Orderable, b: Orderable) =>
  (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER) || (b.passes ?? 0) - (a.passes ?? 0) || (b.starts ?? 0) - (a.starts ?? 0)
  || Number(!!b.cover) - Number(!!a.cover) || a.topic.localeCompare(b.topic);

export const CLASSIFY_PROMPT = `You sort handbooks onto the shelves of a small library. Shelves, by key:\n${SECTIONS.map((s) => `- ${s.key}: ${s.label}. ${s.hint}.`).join("\n")}\n\nFor each handbook (its typed name, what it teaches by day 7, and its kind) pick the ONE shelf a reader would look on first. A recipe, a sport you practise or a speaking skill is "doing" even if it is also a story; a sport you watch is "stories"; a gadget is "tech"; anything about the past or a thinker is "stories"; a job or a raise is "money". Return JSON only: {"shelves":[{"id":"<id as given>","key":"<shelf key>"}]}`;

// A travel handbook's flag, drawn on its cover (11 Oct evening, Prateek: "Add flags on the cover"). Only the
// "Know before you go" series; matched on the place in its name. Emoji flags, so nothing new to load.
const FLAGS: [RegExp, string][] = [
  [/\b(usa|united states|america)\b/i, "🇺🇸"], [/\b(schengen|europe)\b/i, "🇪🇺"], [/\bjapan\b/i, "🇯🇵"], [/\bthailand\b/i, "🇹🇭"],
  [/\baustralia\b/i, "🇦🇺"], [/\bkenya\b/i, "🇰🇪"], [/\b(dubai|uae)\b/i, "🇦🇪"], [/\bsingapore\b/i, "🇸🇬"], [/\bvietnam\b/i, "🇻🇳"],
  [/\b(bali|indonesia)\b/i, "🇮🇩"],
];
export function flagOf(topic: string): string | null {
  if (!/^know before you go/i.test(topic.trim())) return null;
  return FLAGS.find(([re]) => re.test(topic))?.[1] ?? null;
}
