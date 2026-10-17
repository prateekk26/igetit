import { v } from "convex/values";
import { internalAction, internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { ownedHandbook } from "./handbooks";

// Explainer figures in every book (15 Oct, Prateek: "I need pictures replaced everywhere", "except for pictures where
// we'll use sonnet"). For each chapter, Claude Sonnet reads its pages and, page by page, either describes a figure (one of
// the seven layouts src/lib/figure.ts draws, with the page's own words and numbers) or says none: a story about people
// keeps its painting. The decision is kept per page, by the page's words (cardFigures), so a Shelf chapter copied to many
// readers is decided once. A page with a figure is never sent for a painting (images.ts). The app draws and animates it.

// A page's key: its title and words, hashed (FNV-1a, 52 bits). Any copy of the same page finds the same decision.
export function pageKey(card: any): string {
  const s = `${card?.title ?? ""}\u0001${card?.body ?? ""}`;
  let h1 = 0x811c9dc5, h2 = 0x01000193;
  for (let i = 0; i < s.length; i++) { const c = s.charCodeAt(i); h1 = Math.imul(h1 ^ c, 16777619) >>> 0; h2 = Math.imul(h2 ^ c, 2246822519) >>> 0; }
  return h1.toString(36) + h2.toString(36) + s.length.toString(36);
}
const TEXT_TYPES = new Set(["picture", "teach", "example", "mistake", "try"]);
export const figurePages = (cards: any[]) => cards.map((c, i) => ({ c, i })).filter(({ c }) => c && TEXT_TYPES.has(c.type) && typeof c.body === "string" && !/^in one breath$/i.test(String(c.title ?? "").trim()));
const MAX_PER_CHAPTER = 4;

export const FIGURE_PROMPT = `You choose and describe explainer figures for the pages of one chapter of a short handbook read on a phone.

A figure is a small labelled diagram drawn by our app on a dark plate, like a page in a picture book that explains (the Sun, an arrow of sunlight, a Moon half lit and half dark). It replaces a painted scene on pages that explain an IDEA: a mechanism, a comparison of numbers, a sum, a rule, many things that share one idea, a wrong picture against the right one, a chain of cause and effect. Pages that tell a STORY about people (a scene, a character's moment) keep their painted scene: return null for them. Return null too when a figure would only repeat the words, or when the page has nothing to draw.

You may use only these seven layouts, with exactly these fields:
1. {"kind":"bars","title":"...","items":[{"label":"...","value":<number>,"show":"..."}],"best":<index or omit>,"caption":"..."} 2 to 5 items with real values from the page; "show" is how the value is written (₹2,000, 80%). "best" marks the one to highlight.
2. {"kind":"converge","title":"...","items":["...","..."],"into":{"label":"...","sub":"..."},"caption":"..."} 2 to 4 things that come down to one idea.
3. {"kind":"lots","title":"...","left":"...","right":"...","from":"left"|"right","dots":<6 to 12>,"legend":"...","caption":"..."} things moving from one side to the other.
4. {"kind":"loop","title":"...","left":"...","right":"...","via":"...","inside":"...","outside":"...","charge":<true to reverse>,"caption":"..."} something crosses inside while something else goes round the outside through "via".
5. {"kind":"equation","title":"...","terms":[{"show":"...","label":"..."}],"ops":["÷","="],"caption":"..."} a sum with the page's own numbers; the last term is the answer.
6. {"kind":"vs","title":"...","wrong":{"head":"...","line":"..."},"right":{"head":"...","line":"..."},"caption":"..."} the mistaken picture against the right one.
7. {"kind":"flow","title":"...","nodes":[{"glyph":"sun|moon|earth|phone|battery|coin|card|plane|person|bag|bin|eye|dot","label":"..."}],"links":["so","..."],"caption":"..."} 2 to 4 steps, cause to effect.

Rules:
- Every word and number comes from the page. Never invent a fact, a number or a name. If a number isn't on the page, don't show it.
- Labels are short: titles up to 40 characters, item labels up to 24, captions up to 90. Plain words a 12-year-old would know; explain nothing in a figure that the page doesn't explain.
- The caption says the one idea the figure shows, in one sentence.
- At most one figure per page, and at most four per chapter: keep the ones that teach most.

Return JSON only: {"figures":[{"card":<page index>,"spec":<figure or null>,"why":"<one short reason>"}]} with one entry for every page given.`;

const KINDS = new Set(["bars", "converge", "lots", "loop", "equation", "vs", "flow"]);
const GLYPHS = new Set(["sun", "moon", "earth", "phone", "battery", "coin", "card", "plane", "person", "bag", "bin", "eye", "dot"]);
// The checks the drawer needs, and the "own words" rule: every number in a figure must appear on its page.
export function check(spec: any, page: string): string[] {
  const out: string[] = [];
  if (!spec || typeof spec !== "object") return out;
  if (!KINDS.has(spec.kind)) return [`unknown kind ${spec.kind}`];
  const need: Record<string, string[]> = { bars: ["items"], converge: ["items", "into"], lots: ["left", "right", "from"], loop: ["left", "right", "via", "inside", "outside"], equation: ["terms", "ops"], vs: ["wrong", "right"], flow: ["nodes"] };
  for (const f of need[spec.kind]) if (spec[f] === undefined) out.push(`${spec.kind} missing ${f}`);
  if (spec.kind === "bars" && Array.isArray(spec.items) && spec.items.some((i: any) => typeof i?.value !== "number")) out.push("a bar has no number");
  if (spec.kind === "flow" && Array.isArray(spec.nodes) && spec.nodes.some((n: any) => !GLYPHS.has(n?.glyph))) out.push("a flow node has an unknown glyph");
  if (spec.title && String(spec.title).length > 48) out.push("title too long");
  if (spec.caption && String(spec.caption).length > 110) out.push("caption too long");
  const pageNums = new Set((page.replace(/,(?=\d{3})/g, "").match(/\d+(?:\.\d+)?/g) ?? []).map((x) => String(Number(x))));
  const shown = JSON.stringify({ ...spec, items: spec.items?.map?.((i: any) => (typeof i === "string" ? i : { ...i, value: undefined })) });
  for (const n of shown.replace(/,(?=\d{3})/g, "").match(/\d+(?:\.\d+)?/g) ?? []) if (!pageNums.has(String(Number(n))) && !["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"].includes(String(Number(n)))) out.push(`number ${n} is not on the page`);
  return [...new Set(out)];
}

// What a chapter's pages have: card index -> figure, for the pages that have one.
export const forChapter = query({
  args: { handbookId: v.id("handbooks"), n: v.number(), deviceToken: v.optional(v.string()) },
  handler: async (ctx, { handbookId, n, deviceToken }) => {
    await ownedHandbook(ctx, handbookId, deviceToken);
    const ch = await ctx.db.query("chapters").withIndex("by_handbook_n", (q) => q.eq("handbookId", handbookId).eq("n", n)).unique();
    const out: Record<number, any> = {};
    for (const { c, i } of figurePages((ch?.cards as any[]) ?? [])) {
      const row = await ctx.db.query("cardFigures").withIndex("by_key", (q) => q.eq("key", pageKey(c))).first();
      if (row?.spec) out[i] = row.spec;
    }
    return out;
  },
});

// Which of these pages are decided, and which have a figure (for images.ts and the backfill).
export const decided = internalQuery({
  args: { keys: v.array(v.string()) },
  handler: async (ctx, { keys }) => {
    const out: Record<string, boolean> = {};
    for (const k of keys) { const row = await ctx.db.query("cardFigures").withIndex("by_key", (q) => q.eq("key", k)).first(); if (row) out[k] = !!row.spec; }
    return out;
  },
});

export const store = internalMutation({
  args: { rows: v.array(v.object({ key: v.string(), spec: v.any(), why: v.optional(v.string()) })), model: v.string() },
  handler: async (ctx, { rows, model }) => {
    for (const r of rows) {
      const had = await ctx.db.query("cardFigures").withIndex("by_key", (q) => q.eq("key", r.key)).first();
      if (!had) await ctx.db.insert("cardFigures", { key: r.key, spec: r.spec ?? null, why: r.why, model, at: Date.now() });
    }
  },
});

// One caller at a time decides a set of pages (17 Oct). The claim lapses after CLAIM_MS, so a caller that died never
// blocks the pages for good; the one that finishes removes it.
const CLAIM_MS = 120_000;
export const claim = internalMutation({
  args: { key: v.string() },
  handler: async (ctx, { key }) => {
    const now = Date.now(), row = await ctx.db.query("figureClaims").withIndex("by_key", (q) => q.eq("key", key)).first();
    if (row && row.until > now) return false;
    if (row) await ctx.db.patch(row._id, { until: now + CLAIM_MS }); else await ctx.db.insert("figureClaims", { key, until: now + CLAIM_MS });
    return true;
  },
});
export const release = internalMutation({
  args: { key: v.string() },
  handler: async (ctx, { key }) => { for (const row of await ctx.db.query("figureClaims").withIndex("by_key", (q) => q.eq("key", key)).collect()) await ctx.db.delete(row._id); },
});

// Decide one chapter's pages (only those not decided yet). Returns the card indexes that have a figure.
export async function decideChapter(ctx: any, topic: string, cards: any[], trace?: { handbookId?: Id<"handbooks">; chapter?: number }): Promise<number[]> {
  const pages = figurePages(cards);
  if (!pages.length) return [];
  const keys = pages.map(({ c }) => pageKey(c));
  let known: Record<string, boolean> = await ctx.runQuery(internal.figures.decided, { keys });
  // 17 Oct: another caller deciding the same pages (a chapter opened while its pictures start) is waited for, not repeated.
  const open = () => keys.filter((k) => known[k] === undefined);
  const claimKey = open().join(".");
  if (claimKey && !(await ctx.runMutation(internal.figures.claim, { key: claimKey }))) {
    for (let t = 0; t < CLAIM_MS / 3000 && open().length; t++) { await new Promise((r) => setTimeout(r, 3000)); known = await ctx.runQuery(internal.figures.decided, { keys }); }
    if (!open().length) return pages.filter(({ c }) => known[pageKey(c)]).map(({ i }) => i);
    if (!(await ctx.runMutation(internal.figures.claim, { key: claimKey }))) return pages.filter(({ c }) => known[pageKey(c)]).map(({ i }) => i);
  }
  try { if (pages.some(({ c }) => known[pageKey(c)] === undefined)) {
    const user = `Handbook: ${topic}\n\n` + pages.map(({ c, i }) => `Page ${i} (${c.type}${c.title ? `, "${c.title}"` : ""}):\n${c.body}`).join("\n\n");
    const r: any = await ctx.runAction(internal.ai.generate, { kind: "figures", system: FIGURE_PROMPT, user, ...(trace ? { trace } : {}), logAs: "figures" });
    if (!r.ok) return pages.filter(({ c }) => known[pageKey(c)]).map(({ i }) => i);
    const byCard = new Map<number, any>();
    for (const f of r.json?.figures ?? []) {
      const card = Number(f?.card); const page = pages.find((p) => p.i === card);
      if (!page || !f?.spec || check(f.spec, String(page.c.body)).length) continue;
      if (byCard.size < MAX_PER_CHAPTER) byCard.set(card, { spec: f.spec, why: String(f.why ?? "").slice(0, 200) });
    }
    const rows = pages.filter(({ c }) => known[pageKey(c)] === undefined).map(({ c, i }) => ({ key: pageKey(c), spec: byCard.get(i)?.spec ?? null, why: byCard.get(i)?.why }));
    await ctx.runMutation(internal.figures.store, { rows, model: r.model ?? "sonnet" });
    for (const row of rows) known[row.key] = !!row.spec;
  } } finally { if (claimKey) await ctx.runMutation(internal.figures.release, { key: claimKey }); }
  return pages.filter(({ c }) => known[pageKey(c)]).map(({ i }) => i);
}

export const forHandbookChapter = internalAction({
  args: { handbookId: v.id("handbooks"), n: v.number() },
  handler: async (ctx, { handbookId, n }): Promise<number[]> => {
    const d: any = await ctx.runQuery(internal.figures.chapterCards, { handbookId, n });
    return d ? decideChapter(ctx, d.topic, d.cards, { handbookId, chapter: n }) : [];
  },
});
export const chapterCards = internalQuery({
  args: { handbookId: v.id("handbooks"), n: v.number() },
  handler: async (ctx, { handbookId, n }) => {
    const h = await ctx.db.get(handbookId);
    const ch = await ctx.db.query("chapters").withIndex("by_handbook_n", (q) => q.eq("handbookId", handbookId).eq("n", n)).unique();
    return h && ch?.status === "ready" && Array.isArray(ch.cards) ? { topic: (h.plan as any)?.topic ?? h.topic, cards: ch.cards } : null;
  },
});

// Opening a chapter asks for its figures if they aren't decided (any book, any reader, lazily).
export const ensure = mutation({
  args: { handbookId: v.id("handbooks"), n: v.number(), deviceToken: v.optional(v.string()) },
  handler: async (ctx, { handbookId, n, deviceToken }) => {
    await ownedHandbook(ctx, handbookId, deviceToken);
    const ch = await ctx.db.query("chapters").withIndex("by_handbook_n", (q) => q.eq("handbookId", handbookId).eq("n", n)).unique();
    if (ch?.status !== "ready" || !Array.isArray(ch.cards)) return;
    for (const { c } of figurePages(ch.cards)) {
      if (!(await ctx.db.query("cardFigures").withIndex("by_key", (q) => q.eq("key", pageKey(c))).first())) { await ctx.scheduler.runAfter(0, internal.figures.forHandbookChapter, { handbookId, n }); return; }
    }
  },
});

// The Shelf, ahead of readers: every ready topic's chapters in the cache (the copies readers get), a few at a time.
//   npx convex run figures:backfillShelf '{"limit":10}'     (repeat until it says done; --prod for live)
export const shelfChapters = internalQuery({
  args: {},
  handler: async (ctx) => {
    const out: { topic: string; n: number; cards: any[] }[] = [];
    for (const row of await ctx.db.query("cache").collect()) for (const c of (row.chapters ?? []) as any[]) if (Array.isArray(c.cards)) out.push({ topic: (row as any).plan?.topic ?? (row as any).topic ?? row.topicKey, n: c.n, cards: c.cards });
    return out;
  },
});
export const backfillShelf = internalAction({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 10 }) => {
    const all: any[] = await ctx.runQuery(internal.figures.shelfChapters, {});
    let done = 0, withFigures = 0, skipped = 0;
    for (const ch of all) {
      const keys = figurePages(ch.cards).map(({ c }) => pageKey(c));
      const known = await ctx.runQuery(internal.figures.decided, { keys });
      if (keys.every((k) => known[k] !== undefined)) { skipped++; continue; }
      if (done >= limit) break;
      const got = await decideChapter(ctx, ch.topic, ch.cards);
      done++; withFigures += got.length;
    }
    return { chaptersDecided: done, figuresAdded: withFigures, alreadyDone: skipped, total: all.length, left: all.length - skipped - done };
  },
});
