// D35 (Prateek, 9 Oct 12:5x: "The categorization is horrible for the shelf. Can we fix it?"): the Shelf's sections are
// subjects a reader looks for, fixed here, in this order. Every handbook sits on exactly one. A model sorts new rows
// (shelf.ts classify, Sonnet low, one call for all unsorted rows); the owner can move any row on /admin. The old shelves
// by popularity (Trending, Most finished, New) are gone: the Spotlight does that job, and they stole books from their
// subject. Copy (agent).
export const SECTIONS: { key: string; label: string; note: string; hint: string }[] = [
  // 11 Oct evening (Prateek: "Know before you go ... give them a nice space on the shelf"): one shelf for the travel
  // series, drawn right under the free shelf. Copy (agent).
  { key: "travel", label: "Know before you go", note: "Visas, money and the rules that catch Indians out, country by country.", hint: "travelling to a country or city: visas, entry rules, money, getting around, local laws and customs for visitors" },
  { key: "money", label: "Money", note: "Shares, funds, IPOs, balance sheets. Study aid, not advice.", hint: "investing, stocks, bonds, mutual funds, IPOs, reading accounts, personal finance, tax" },
  { key: "tech", label: "Tech and AI", note: "Agents, automation, and the phone in your hand.", hint: "AI agents, coding, automation tools, software, how gadgets work, phones, batteries, chips" },
  { key: "doing", label: "Things to do", note: "Swim, cook, dance, speak: you practise, you log it.", hint: "any skill done with the body or voice: cooking a dish, swimming, dance, public speaking, fitness, a craft" },
  { key: "ideas", label: "History and big ideas", note: "Wars, thinkers, epics: the story behind the story.", hint: "history, philosophy, religion and spirituality, classic literature, science ideas, how the world got this way" },
  { key: "culture", label: "Films, music and sport", note: "Catch up on what everyone's talking about.", hint: "films and franchises, music scenes, sports to watch and their rules, champions, games" },
];
export const SECTION_KEYS = SECTIONS.map((s) => s.key);

export const CLASSIFY_PROMPT = `You sort handbooks onto the shelves of a small library. Shelves, by key:\n${SECTIONS.map((s) => `- ${s.key}: ${s.label}. ${s.hint}.`).join("\n")}\n\nFor each handbook (its typed name, what it teaches by day 7, and its kind) pick the ONE shelf a reader would look on first. A recipe, a sport you practise or a speaking skill is "doing" even if it is also culture; a sport you watch is "culture"; a gadget is "tech"; anything about the past or a thinker is "ideas". Return JSON only: {"shelves":[{"id":"<id as given>","key":"<shelf key>"}]}`;

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
