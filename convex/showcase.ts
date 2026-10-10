import { v } from "convex/values";
import { internalAction, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { HOLD_A_ROOM } from "./showcasePlans";
import { drawMoves, topicKeyOf } from "./handbooks";

// D65 (Prateek, 10 Oct): the showcase handbooks of the free eleven, written with exactly the steps a reader's handbook
// gets (research for the goal, the chapter writer with "Already taught", the fact check, Try it pages, quiz versions),
// from a plan made by hand, every chapter in order. The result is a test handbook ("test", never shared, never on the
// shelf) owned by the token below, so it can be read in full before anything goes live.
// Run: npx convex run showcase:build '{"key":"hold-a-room"}'   then watch: npx convex run showcase:status '{"handbookId":"..."}'

const OWNER = "showcase-build";
const PLANS: Record<string, typeof HOLD_A_ROOM> = { "hold-a-room": HOLD_A_ROOM };

export const create = internalMutation({
  args: { key: v.string() },
  handler: async (ctx, { key }): Promise<Id<"handbooks">> => {
    const plan = PLANS[key];
    if (!plan) throw new Error(`No showcase plan "${key}"`);
    const now = Date.now();
    const handbookId = await ctx.db.insert("handbooks", {
      topic: plan.topic, topicKey: `showcase:${key}`, level: "new", language: "English", voice: "friend", status: "planning",
      goal: plan.goal, mode: plan.mode, goalChosenAt: now,
      ownerToken: OWNER, source: "live", test: { label: `showcase:${key}`, startedAt: now, noVersions: false }, createdAt: now,
    } as any);
    await ctx.db.insert("progress", { handbookId, currentChapter: 1, currentCard: 0, chaptersPassed: [], passedExercises: [], missedExercises: [], lastOpenedAt: now, updatedAt: now });
    return handbookId;
  },
});

// Research, then the hand-made plan, then chapter 1. Each chapter schedules the next (step), so nothing runs long.
export const build = internalAction({
  args: { key: v.string(), from: v.optional(v.number()), handbookId: v.optional(v.id("handbooks")) },
  handler: async (ctx, { key, from, handbookId }): Promise<{ handbookId: Id<"handbooks"> }> => {
    const plan = PLANS[key];
    if (!plan) throw new Error(`No showcase plan "${key}"`);
    const id: Id<"handbooks"> = handbookId ?? (await ctx.runMutation(internal.showcase.create, { key }));
    if (!handbookId) {
      await ctx.runMutation(internal.handbooks.markResearch, { handbookId: id });
      await ctx.runAction(internal.research.run, { handbookId: id }).catch((e: any) => console.log("showcase research failed", String(e).slice(0, 200)));
      const chapters = plan.chapters.map((c, i) => ({ ...c, n: i + 1 }));
      await ctx.runMutation(internal.handbooks.setPlan, { handbookId: id, plan: { ...plan, chapters }, topic: plan.topic });
    }
    await ctx.scheduler.runAfter(0, internal.showcase.step, { handbookId: id, n: from ?? 1, tries: 0 });
    return { handbookId: id };
  },
});

export const step = internalAction({
  args: { handbookId: v.id("handbooks"), n: v.number(), tries: v.number() },
  handler: async (ctx, { handbookId, n, tries }): Promise<void> => {
    const h: any = await ctx.runQuery(internal.handbooks.readHandbook, { handbookId });
    const total = h?.plan?.chapters?.length ?? 0;
    if (!h || h.hiddenAt) { console.log(`showcase ${handbookId}: stopped`); return; }
    if (n > total) { console.log(`showcase ${handbookId}: finished, ${total} chapters`); return; }
    await ctx.runMutation(internal.handbooks.startChapter, { handbookId, n });
    await ctx.runAction(internal.handbooks.generateChapter, { handbookId, n }).catch((e: any) => console.log(`showcase chapter ${n} threw`, String(e).slice(0, 200)));
    const row: any = await ctx.runQuery(internal.handbooks.readChapterRow, { handbookId, n });
    const ok = row?.status === "ready";
    console.log(`showcase ${handbookId}: chapter ${n} ${ok ? `ready (${row.cards?.length ?? 0} cards: ${(row.cards ?? []).map((c: any) => c.type).join(", ")}; check ${row.factCheck?.status ?? "?"})` : `failed: ${row?.error ?? "?"}`}`);
    if (ok) await ctx.runAction(internal.showcase.fixTryit, { handbookId, n });
    if (!ok && tries < 1) { await ctx.scheduler.runAfter(0, internal.showcase.step, { handbookId, n, tries: tries + 1 }); return; }
    if (!ok) { console.log(`showcase ${handbookId}: stopped at chapter ${n}; resume with showcase:build {"key":"...","handbookId":"${handbookId}","from":${n}}`); return; }
    await ctx.scheduler.runAfter(0, internal.showcase.step, { handbookId, n: n + 1, tries: 0 });
  },
});

// The writer (Gemini Flash) answers a "tryit" block with a plain "try" card titled "Try it", and the fact check's fix
// to the right type is skipped by its shape guard (10 Oct, day 1 twice). When the plan asked for one and none came,
// that card becomes the Try it card, with its idea taken from the card's text, and its page is built.
export const fixTryit = internalAction({
  args: { handbookId: v.id("handbooks"), n: v.number() },
  handler: async (ctx, { handbookId, n }): Promise<{ fixed: boolean; page?: boolean }> => {
    const h: any = await ctx.runQuery(internal.handbooks.readHandbook, { handbookId });
    const row: any = await ctx.runQuery(internal.handbooks.readChapterRow, { handbookId, n });
    const wanted = (h?.plan?.chapters?.[n - 1]?.blocks ?? []).includes("tryit");
    const cards: any[] = Array.isArray(row?.cards) ? row.cards.map((c: any) => ({ ...c })) : [];
    if (!wanted || cards.some((c) => c?.type === "tryit")) return { fixed: false };
    const named = cards.findIndex((c) => c?.type === "try" && /try it/i.test(String(c.title ?? "")));
    const i = named >= 0 ? named : cards.findIndex((c) => c?.type === "try" && !/your turn/i.test(String(c.title ?? "")));
    if (i < 0) return { fixed: false };
    cards[i] = { type: "tryit", title: "Try it", idea: String(cards[i].body ?? "").replace(/\*\*/g, "").slice(0, 600) };
    await drawMoves(ctx, h.plan?.topic ?? h.topic, row.title ?? "", cards, { handbookId, chapter: n });
    await ctx.runMutation(internal.showcase.setCards, { handbookId, n, cards });
    return { fixed: true, page: !!cards[i].html };
  },
});
export const setCards = internalMutation({
  args: { handbookId: v.id("handbooks"), n: v.number(), cards: v.any() },
  handler: async (ctx, { handbookId, n, cards }) => {
    const row = await ctx.db.query("chapters").withIndex("by_handbook_n", (q) => q.eq("handbookId", handbookId).eq("n", n)).unique();
    if (row) await ctx.db.patch(row._id, { cards });
  },
});

// Stop a build: the chapter writer skips a removed handbook, so the chain ends at the next step.
export const stop = internalMutation({
  args: { handbookId: v.id("handbooks") },
  handler: async (ctx, { handbookId }) => { await ctx.db.patch(handbookId, { hiddenAt: Date.now() } as any); },
});

// A plan field changed after a build started (not its chapters): copy the top-level fields from the plan file.
export const refreshPlan = internalMutation({
  args: { handbookId: v.id("handbooks"), key: v.string() },
  handler: async (ctx, { handbookId, key }) => {
    const h: any = await ctx.db.get(handbookId);
    const plan = PLANS[key];
    if (!h?.plan || !plan) throw new Error("No such handbook or plan");
    const { chapters: _c, ...top } = plan;
    await ctx.db.patch(handbookId, { plan: { ...h.plan, ...top } });
  },
});

// Where a build stands: each chapter's status, card types, check result and words.
export const status = internalQuery({
  args: { handbookId: v.id("handbooks") },
  handler: async (ctx, { handbookId }) => {
    const h: any = await ctx.db.get(handbookId);
    const rows = await ctx.db.query("chapters").withIndex("by_handbook_n", (q) => q.eq("handbookId", handbookId)).collect();
    return {
      status: h?.status, research: h?.brief ? `${(h.brief.facts ?? []).length} facts` : "none", chapters: h?.plan?.chapters?.length ?? 0,
      written: rows.sort((a, b) => a.n - b.n).map((c: any) => ({ n: c.n, status: c.status, title: c.title ?? null, cards: (c.cards ?? []).map((x: any) => x.type).join(","), check: c.factCheck?.status ?? null, error: c.error ?? null })),
    };
  },
});

// Going live (D65): the approved words are copied, not rewritten. exportChapters runs on the deployment that built
// them (dev); seedPart runs on the live one, a few chapters per call, and the last call puts the topic on the shelf.
export const exportChapters = internalQuery({
  args: { handbookId: v.id("handbooks"), from: v.number(), to: v.number() },
  handler: async (ctx, { handbookId, from, to }) => {
    const h: any = await ctx.db.get(handbookId);
    const rows = await ctx.db.query("chapters").withIndex("by_handbook_n", (q) => q.eq("handbookId", handbookId)).collect();
    return {
      plan: from === 1 ? h?.plan : undefined,
      chapters: rows.filter((c) => c.n >= from && c.n <= to && c.status === "ready").sort((a, b) => a.n - b.n).map((c: any) => ({
        n: c.n, title: c.title, cards: c.cards, recallCards: c.recallCards ?? [], quizTiers: c.quizTiers, recallTiers: c.recallTiers, outcomeLine: c.outcomeLine ?? "", factCheck: c.factCheck,
      })),
    };
  },
});
export const seedPart = internalMutation({
  args: { topic: v.string(), aliases: v.array(v.string()), plan: v.optional(v.any()), chapters: v.array(v.any()), last: v.boolean() },
  handler: async (ctx, { topic, aliases, plan, chapters, last }) => {
    const keys = [...new Set([topic, ...aliases].map(topicKeyOf))];
    for (const topicKey of keys) {
      const row = await ctx.db.query("cache").withIndex("by_key", (q) => q.eq("topicKey", topicKey).eq("level", "new")).unique();
      if (!row && !plan) throw new Error("Send the plan with the first part");
      if (row) {
        const kept = (row.chapters as any[]).filter((c) => !chapters.some((x: any) => x.n === c.n));
        await ctx.db.patch(row._id, { topic, ...(plan ? { plan } : {}), chapters: [...kept, ...chapters].sort((a: any, b: any) => a.n - b.n), version: Date.now() });
      } else await ctx.db.insert("cache", { topicKey, level: "new", topic, plan, chapters, version: Date.now(), addedAt: Date.now() });
    }
    if (last) await ctx.scheduler.runAfter(0, internal.shelf.syncReadyTopic, { topic });
    return keys;
  },
});
