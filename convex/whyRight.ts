import { v } from "convex/values";
import { internalAction, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { WHYRIGHT_PROMPT } from "./prompts";

// D38 (Prateek, 9 Oct): chapters written before the writer was asked for "whyRight" get one per exercise, from the
// chapter's own cards, on Sonnet low (about ₹1 a chapter). Three places hold chapters: the ready topics (cache), the
// shared library (chapter1 and later chapters), and readers' own copies (chapters). A reader's copy of a ready topic
// takes the cache's lines by matching prompts (no model call); only typed handbooks opened in the last 7 days get a call.
//   npx convex run --prod whyRight:run '{"scope":"cache"}'   then "library", "copies", "readers"

type Target = { table: "cache" | "library" | "chapters"; id: string; n: number };
const lacks = (cards: any[] | undefined) => (cards ?? []).some((c) => c?.type === "exercise" && !c.whyRight);
// A chapter's "Remember this?" recall quizzes (recallCards, addressed as 100 and 101) need the line as much as its cards.
const missing = (cards: any[] | undefined, recall?: any[]) => lacks(cards) || lacks(recall);
const RECALL = 100;

export const targets = internalQuery({
  args: { scope: v.string() },
  handler: async (ctx, { scope }): Promise<Target[]> => {
    const out: Target[] = [];
    if (scope === "cache") {
      // Several cache rows share one topic's content (one per spelling): one row per topic gets the model call; the
      // twins take its lines by matching prompts (scope "cacheCopies").
      const seen = new Set<string>();
      for (const r of (await ctx.db.query("cache").collect()).sort((a, b) => a._creationTime - b._creationTime)) {
        if (seen.has(r.topic)) continue; seen.add(r.topic);
        for (const ch of (r.chapters ?? []) as any[]) if (missing(ch.cards, ch.recallCards)) out.push({ table: "cache", id: r._id, n: ch.n });
      }
    }
    if (scope === "library") for (const r of await ctx.db.query("library").collect()) {
      if (!r.published) continue;
      if (missing(r.chapter1?.cards, r.chapter1?.recallCards)) out.push({ table: "library", id: r._id, n: 1 });
      for (const [n, ch] of Object.entries((r.chapters ?? {}) as Record<string, any>)) if (missing(ch?.cards, ch?.recallCards)) out.push({ table: "library", id: r._id, n: Number(n) });
    }
    if (scope === "readers") {
      const since = Date.now() - 7 * 24 * 3600000;
      for (const h of await ctx.db.query("handbooks").collect()) {
        if (h.source !== "live" || h.hiddenAt || (h.status as string) === "declined") continue;
        const p = await ctx.db.query("progress").withIndex("by_handbook", (q) => q.eq("handbookId", h._id)).unique();
        if (!p || p.lastOpenedAt < since) continue;
        for (const ch of await ctx.db.query("chapters").withIndex("by_handbook_n", (q) => q.eq("handbookId", h._id)).collect()) if (ch.status === "ready" && missing(ch.cards, ch.recallCards)) out.push({ table: "chapters", id: ch._id, n: ch.n });
      }
    }
    return out;
  },
});

export const read = internalQuery({
  args: { table: v.string(), id: v.string(), n: v.number() },
  handler: async (ctx, { table, id, n }) => {
    const doc: any = await ctx.db.get(id as any);
    if (!doc) return null;
    const ch = table === "cache" ? (doc.chapters ?? []).find((c: any) => c.n === n) : table === "library" ? (n === 1 ? doc.chapter1 : doc.chapters?.[String(n)]) : doc;
    if (!ch?.cards) return null;
    const cards: any[] = [...(ch.cards as any[])];
    for (const [i, c] of ((ch.recallCards ?? []) as any[]).entries()) cards[RECALL + i] = c;   // sparse: 100, 101 are the recall quizzes
    return { title: ch.title ?? "", cards };
  },
});

export const write = internalMutation({
  args: { table: v.string(), id: v.string(), n: v.number(), lines: v.record(v.string(), v.string()) },
  handler: async (ctx, { table, id, n, lines }) => {
    const doc: any = await ctx.db.get(id as any);
    if (!doc) return 0;
    const apply = (cards: any[], base = 0) => cards.map((c, i) => (c?.type === "exercise" && !c.whyRight && lines[String(base + i)] ? { ...c, whyRight: lines[String(base + i)] } : c));
    let written = 0;
    const count = (before: any[], after: any[]) => after.filter((c, i) => c?.whyRight && !before[i]?.whyRight).length;
    // One chapter object in, the same out with the lines on its cards and its recall cards.
    const fill = (ch: any) => { const cards = apply(ch.cards ?? []); written += count(ch.cards ?? [], cards); const recallCards = ch.recallCards ? apply(ch.recallCards, RECALL) : undefined; if (recallCards) written += count(ch.recallCards, recallCards); return { ...ch, cards, ...(recallCards ? { recallCards } : {}) }; };
    if (table === "cache") { const chapters = (doc.chapters ?? []).map((c: any) => (c.n === n ? fill(c) : c)); await ctx.db.patch(doc._id, { chapters }); }
    else if (table === "library") {
      if (n === 1) await ctx.db.patch(doc._id, { chapter1: fill(doc.chapter1 ?? {}) });
      else { const ch = doc.chapters?.[String(n)]; if (ch) await ctx.db.patch(doc._id, { chapters: { ...doc.chapters, [String(n)]: fill(ch) } }); }
    } else { const f = fill(doc); await ctx.db.patch(doc._id, { cards: f.cards, ...(f.recallCards ? { recallCards: f.recallCards } : {}) }); }
    return written;
  },
});

export const fillOne = internalAction({
  args: { table: v.string(), id: v.string(), n: v.number() },
  handler: async (ctx, { table, id, n }): Promise<{ ok: boolean; written: number; error?: string }> => {
    const r: any = await ctx.runQuery(internal.whyRight.read, { table, id, n });
    if (!r) return { ok: false, written: 0, error: "no chapter" };
    const teach = r.cards.filter((c: any) => c && c.type !== "exercise" && typeof c.body === "string").map((c: any) => `${c.title ? c.title + ": " : ""}${c.body}`).join("\n\n").slice(0, 7000);
    const ex = r.cards.map((c: any, i: number) => ({ c, i })).filter(({ c }: any) => c && c.type === "exercise" && !c.whyRight)
      .map(({ c, i }: any) => `#${i} (${c.kind ?? "quiz"}): ${c.prompt}\n` + (c.options ?? []).map((o: any) => `  ${o.id}) ${o.text}`).join("\n") + `\n  right: ${c.kind === "poll" ? "(poll, no wrong answer)" : c.answer}`).join("\n\n");
    if (!ex) return { ok: true, written: 0 };
    const g: any = await ctx.runAction(internal.ai.generate, { kind: "whyright", system: WHYRIGHT_PROMPT, user: `Chapter: ${r.title}\n\nThe chapter's cards:\n${teach}\n\nExercises:\n${ex}` });
    if (!g.ok) return { ok: false, written: 0, error: String(g.error).slice(0, 160) };
    const lines: Record<string, string> = {};
    for (const [k, val] of Object.entries((g.json?.whyRight ?? {}) as Record<string, unknown>)) { const t = String(val ?? "").trim().slice(0, 400); if (t && /^\d+$/.test(k)) lines[k] = t; }
    const written: number = await ctx.runMutation(internal.whyRight.write, { table, id, n, lines });
    return { ok: true, written };
  },
});

// Readers' copies of a ready topic: take the cache's lines where the exercise prompt matches (no model call).
// Paged (a page of 25 handbooks and their chapters at a time): reading every chapter in one query is too much.
export const copyTargets = internalQuery({
  args: { cursor: v.union(v.string(), v.null()) },
  handler: async (ctx, { cursor }) => {
    const page = await ctx.db.query("handbooks").paginate({ cursor, numItems: 25 });
    const out: { chapterId: string; topicKey: string; level: string; topic: string; n: number }[] = [];
    for (const h of page.page) {
      if (h.source !== "cache" || h.hiddenAt) continue;
      for (const ch of await ctx.db.query("chapters").withIndex("by_handbook_n", (q) => q.eq("handbookId", h._id)).collect()) if (missing(ch.cards, ch.recallCards)) out.push({ chapterId: ch._id, topicKey: h.topicKey, level: h.level, topic: h.topic, n: ch.n });
    }
    return { out, cursor: page.continueCursor, done: page.isDone };
  },
});
export const copyOne = internalMutation({
  args: { chapterId: v.id("chapters"), topicKey: v.string(), level: v.string(), topic: v.string(), n: v.number() },
  handler: async (ctx, { chapterId, topicKey, level, topic, n }) => {
    const ch = await ctx.db.get(chapterId);
    const r: any = (await ctx.db.query("cache").withIndex("by_key", (q) => q.eq("topicKey", topicKey).eq("level", level as any)).first())
      ?? (await ctx.db.query("cache").withIndex("by_topic", (q) => q.eq("topic", topic)).first());
    const src = (r?.chapters ?? []).find((c: any) => c.n === n);
    if (!ch?.cards || !src?.cards) return 0;
    const byPrompt = new Map<string, string>();
    for (const c of [...(src.cards as any[]), ...((src.recallCards ?? []) as any[])]) if (c?.type === "exercise" && c.whyRight && c.prompt) byPrompt.set(String(c.prompt), c.whyRight);
    let written = 0;
    const take = (cards: any[]) => cards.map((c) => { if (c?.type !== "exercise" || c.whyRight) return c; const w = byPrompt.get(String(c.prompt)); if (!w) return c; written++; return { ...c, whyRight: w }; });
    const cards = take(ch.cards as any[]), recallCards = ch.recallCards ? take(ch.recallCards as any[]) : undefined;
    if (written) await ctx.db.patch(chapterId, { cards, ...(recallCards ? { recallCards } : {}) });
    return written;
  },
});

// Cache twins: a row whose chapters lack lines takes them from the first row of the same topic that has them.
export const cacheCopyTargets = internalQuery({
  args: {},
  handler: async (ctx) => {
    const rows = (await ctx.db.query("cache").collect()).sort((a, b) => a._creationTime - b._creationTime);
    const out: { id: string; donor: string }[] = [];
    for (const r of rows) {
      if (!(r.chapters ?? []).some((ch: any) => missing(ch.cards))) continue;
      const donor = rows.find((d) => d._id !== r._id && d.topic === r.topic && (d.chapters ?? []).some((ch: any) => (ch.cards ?? []).some((c: any) => c?.type === "exercise" && c.whyRight)));
      if (donor) out.push({ id: r._id, donor: donor._id });
    }
    return out;
  },
});
export const copyCacheOne = internalMutation({
  args: { id: v.id("cache"), donor: v.id("cache") },
  handler: async (ctx, { id, donor }) => {
    const r: any = await ctx.db.get(id), d: any = await ctx.db.get(donor);
    if (!r || !d) return 0;
    const byPrompt = new Map<string, string>();
    for (const ch of (d.chapters ?? []) as any[]) for (const c of (ch.cards ?? []) as any[]) if (c?.type === "exercise" && c.whyRight && c.prompt) byPrompt.set(String(c.prompt), c.whyRight);
    let written = 0;
    const chapters = (r.chapters ?? []).map((ch: any) => ({ ...ch, cards: (ch.cards ?? []).map((c: any) => { if (c?.type !== "exercise" || c.whyRight) return c; const w = byPrompt.get(String(c.prompt)); if (!w) return c; written++; return { ...c, whyRight: w }; }) }));
    if (written) await ctx.db.patch(id, { chapters });
    return written;
  },
});

// The chain: one chapter per step, the rest rescheduled, so no step runs long. scope: cache | library | readers | copies
export const run = internalAction({
  args: { scope: v.string(), items: v.optional(v.any()), done: v.optional(v.number()), written: v.optional(v.number()), limit: v.optional(v.number()) },
  handler: async (ctx, { scope, items, done = 0, written = 0, limit }): Promise<void> => {
    if (scope === "cacheCopies") {
      const list: any[] = await ctx.runQuery(internal.whyRight.cacheCopyTargets, {});
      let w = 0; for (const t of list) w += await ctx.runMutation(internal.whyRight.copyCacheOne, t);
      console.log(`whyRight cacheCopies: ${list.length} twin rows, ${w} lines copied`); return;
    }
    if (scope === "copies") {
      let cursor: string | null = null, looked = 0, w = 0;
      for (;;) {
        const p: any = await ctx.runQuery(internal.whyRight.copyTargets, { cursor });
        for (const t of p.out) { looked++; w += await ctx.runMutation(internal.whyRight.copyOne, t); }
        cursor = p.cursor; if (p.done) break;
      }
      console.log(`whyRight copies: ${looked} reader chapters looked at, ${w} lines copied`); return;
    }
    const list: Target[] = items ?? (await ctx.runQuery(internal.whyRight.targets, { scope })).slice(0, limit ?? 10000);
    const [head, ...rest] = list;
    if (!head) { console.log(`whyRight ${scope}: ${done} chapters, ${written} lines`); return; }
    const r = await ctx.runAction(internal.whyRight.fillOne, head).catch((e: any) => ({ ok: false, written: 0, error: String(e?.message ?? e) }));
    if (!r.ok) console.log("whyRight failed", head.table, head.id, head.n, r.error);
    await ctx.scheduler.runAfter(0, internal.whyRight.run, { scope, items: rest, done: done + 1, written: written + r.written });
  },
});
