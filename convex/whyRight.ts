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
const missing = (cards: any[] | undefined) => (cards ?? []).some((c) => c?.type === "exercise" && !c.whyRight);

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
        for (const ch of (r.chapters ?? []) as any[]) if (missing(ch.cards)) out.push({ table: "cache", id: r._id, n: ch.n });
      }
    }
    if (scope === "library") for (const r of await ctx.db.query("library").collect()) {
      if (!r.published) continue;
      if (missing(r.chapter1?.cards)) out.push({ table: "library", id: r._id, n: 1 });
      for (const [n, ch] of Object.entries((r.chapters ?? {}) as Record<string, any>)) if (missing(ch?.cards)) out.push({ table: "library", id: r._id, n: Number(n) });
    }
    if (scope === "readers") {
      const since = Date.now() - 7 * 24 * 3600000;
      for (const h of await ctx.db.query("handbooks").collect()) {
        if (h.source !== "live" || h.hiddenAt || (h.status as string) === "declined") continue;
        const p = await ctx.db.query("progress").withIndex("by_handbook", (q) => q.eq("handbookId", h._id)).unique();
        if (!p || p.lastOpenedAt < since) continue;
        for (const ch of await ctx.db.query("chapters").withIndex("by_handbook_n", (q) => q.eq("handbookId", h._id)).collect()) if (ch.status === "ready" && missing(ch.cards)) out.push({ table: "chapters", id: ch._id, n: ch.n });
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
    return { title: ch.title ?? "", cards: ch.cards as any[] };
  },
});

export const write = internalMutation({
  args: { table: v.string(), id: v.string(), n: v.number(), lines: v.record(v.string(), v.string()) },
  handler: async (ctx, { table, id, n, lines }) => {
    const doc: any = await ctx.db.get(id as any);
    if (!doc) return 0;
    const apply = (cards: any[]) => cards.map((c, i) => (c?.type === "exercise" && !c.whyRight && lines[String(i)] ? { ...c, whyRight: lines[String(i)] } : c));
    let written = 0;
    const count = (before: any[], after: any[]) => after.filter((c, i) => c.whyRight && !before[i]?.whyRight).length;
    if (table === "cache") { const chapters = (doc.chapters ?? []).map((c: any) => { if (c.n !== n) return c; const cards = apply(c.cards ?? []); written += count(c.cards ?? [], cards); return { ...c, cards }; }); await ctx.db.patch(doc._id, { chapters }); }
    else if (table === "library") {
      if (n === 1) { const cards = apply(doc.chapter1?.cards ?? []); written += count(doc.chapter1?.cards ?? [], cards); await ctx.db.patch(doc._id, { chapter1: { ...doc.chapter1, cards } }); }
      else { const ch = doc.chapters?.[String(n)]; if (ch) { const cards = apply(ch.cards ?? []); written += count(ch.cards ?? [], cards); await ctx.db.patch(doc._id, { chapters: { ...doc.chapters, [String(n)]: { ...ch, cards } } }); } }
    } else { const cards = apply(doc.cards ?? []); written += count(doc.cards ?? [], cards); await ctx.db.patch(doc._id, { cards }); }
    return written;
  },
});

export const fillOne = internalAction({
  args: { table: v.string(), id: v.string(), n: v.number() },
  handler: async (ctx, { table, id, n }): Promise<{ ok: boolean; written: number; error?: string }> => {
    const r: any = await ctx.runQuery(internal.whyRight.read, { table, id, n });
    if (!r) return { ok: false, written: 0, error: "no chapter" };
    const teach = r.cards.filter((c: any) => c.type !== "exercise" && typeof c.body === "string").map((c: any) => `${c.title ? c.title + ": " : ""}${c.body}`).join("\n\n").slice(0, 7000);
    const ex = r.cards.map((c: any, i: number) => ({ c, i })).filter(({ c }: any) => c.type === "exercise" && !c.whyRight)
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
export const copyTargets = internalQuery({
  args: {},
  handler: async (ctx) => {
    const out: { chapterId: string; cacheId: string; n: number }[] = [];
    const cache = await ctx.db.query("cache").collect();
    for (const h of await ctx.db.query("handbooks").collect()) {
      if (h.source !== "cache" || h.hiddenAt) continue;
      const r = cache.find((x) => x.topicKey === h.topicKey && x.level === h.level) ?? cache.find((x) => x.topic === h.topic);
      if (!r) continue;
      for (const ch of await ctx.db.query("chapters").withIndex("by_handbook_n", (q) => q.eq("handbookId", h._id)).collect()) if (missing(ch.cards)) out.push({ chapterId: ch._id, cacheId: r._id, n: ch.n });
    }
    return out;
  },
});
export const copyOne = internalMutation({
  args: { chapterId: v.id("chapters"), cacheId: v.id("cache"), n: v.number() },
  handler: async (ctx, { chapterId, cacheId, n }) => {
    const ch = await ctx.db.get(chapterId), r: any = await ctx.db.get(cacheId);
    const src = (r?.chapters ?? []).find((c: any) => c.n === n);
    if (!ch?.cards || !src?.cards) return 0;
    const byPrompt = new Map<string, string>();
    for (const c of src.cards as any[]) if (c?.type === "exercise" && c.whyRight && c.prompt) byPrompt.set(String(c.prompt), c.whyRight);
    let written = 0;
    const cards = (ch.cards as any[]).map((c) => { if (c?.type !== "exercise" || c.whyRight) return c; const w = byPrompt.get(String(c.prompt)); if (!w) return c; written++; return { ...c, whyRight: w }; });
    if (written) await ctx.db.patch(chapterId, { cards });
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
      const list: any[] = items ?? (await ctx.runQuery(internal.whyRight.copyTargets, {}));
      let w = 0; for (const t of list) w += await ctx.runMutation(internal.whyRight.copyOne, t);
      console.log(`whyRight copies: ${list.length} reader chapters looked at, ${w} lines copied`); return;
    }
    const list: Target[] = items ?? (await ctx.runQuery(internal.whyRight.targets, { scope })).slice(0, limit ?? 10000);
    const [head, ...rest] = list;
    if (!head) { console.log(`whyRight ${scope}: ${done} chapters, ${written} lines`); return; }
    const r = await ctx.runAction(internal.whyRight.fillOne, head).catch((e: any) => ({ ok: false, written: 0, error: String(e?.message ?? e) }));
    if (!r.ok) console.log("whyRight failed", head.table, head.id, head.n, r.error);
    await ctx.scheduler.runAfter(0, internal.whyRight.run, { scope, items: rest, done: done + 1, written: written + r.written });
  },
});
