import { v } from "convex/values";
import { internalAction, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { HOLD_A_ROOM } from "./showcasePlans";
// The free ten (11 Oct night, agent; Prateek: "All the pending handbooks as well"): hand plans written to the same bar
// as HOLD_A_ROOM (one running example, a Try it card by card 3 of chapter 1, 7 chapters of under 5 minutes each).
import { PLAN as LANDS_YOUR_JOB } from "./plans/lands_your_job";
import { PLAN as ASK_RAISE } from "./plans/ask_raise";
import { PLAN as ENGLISH } from "./plans/english";
import { PLAN as IPO } from "./plans/ipo";
import { PLAN as PUTTING_OFF } from "./plans/putting_off";
import { PLAN as MULTIBAGGERS } from "./plans/multibaggers";
import { PLAN as FNO } from "./plans/fno";
import { PLAN as AI_WORK } from "./plans/ai_work";
import { PLAN as CREDIT_CARD } from "./plans/credit_card";
import { PLAN as CAR } from "./plans/car";
import { drawMoves, topicKeyOf, factCheck } from "./handbooks";

// D65 (Prateek, 10 Oct): the showcase handbooks of the free eleven, written with exactly the steps a reader's handbook
// gets (research for the goal, the chapter writer with "Already taught", the fact check, Try it pages, quiz versions),
// from a plan made by hand, every chapter in order. The result is a test handbook ("test", never shared, never on the
// shelf) owned by the token below, so it can be read in full before anything goes live.
// Run: npx convex run showcase:build '{"key":"hold-a-room"}'   then watch: npx convex run showcase:status '{"handbookId":"..."}'

const OWNER = "showcase-build";
export const PLANS: Record<string, any> = {
  "hold-a-room": HOLD_A_ROOM, "lands-your-job": LANDS_YOUR_JOB, "ask-raise": ASK_RAISE, english: ENGLISH, ipo: IPO, "putting-off": PUTTING_OFF,
  multibaggers: MULTIBAGGERS, fno: FNO, "ai-work": AI_WORK, "credit-card": CREDIT_CARD, car: CAR,
};
const KIT = new Set(["picture", "teach", "example", "mistake", "try", "move", "doit", "steps", "tryit", "exercise", "quiz", "watch", "breath"]);

// Every plan against the bar before anything is written: 3 to 7 chapters (28 for hold-a-room), blocks from the kit,
// a Try it card among chapter 1's first three blocks, outcome lines, no "incorrect"/"wrong".
//   npx convex run showcase:checkPlans '{}'
export const checkPlans = internalQuery({
  args: {},
  handler: async () => Object.entries(PLANS).map(([key, p]) => {
    const ch: any[] = p.chapters ?? [];
    const issues: string[] = [];
    if (key !== "hold-a-room" && (ch.length < 3 || ch.length > 7)) issues.push(`${ch.length} chapters`);
    ch.forEach((c, i) => {
      const bad = (c.blocks ?? []).filter((b: string) => !KIT.has(b));
      if (bad.length) issues.push(`ch${i + 1} blocks ${bad.join(",")}`);
      if (!c.outcome) issues.push(`ch${i + 1} no outcome`);
      if ((c.readMinutes ?? 3) > 4) issues.push(`ch${i + 1} ${c.readMinutes} min`);
    });
    const t1 = (ch[0]?.blocks ?? []).indexOf("tryit");
    if (t1 < 0 || t1 > 2) issues.push(`ch1 tryit at ${t1 + 1}`);
    if (/\b(incorrect|wrong)\b/i.test(JSON.stringify(p))) issues.push("says incorrect/wrong");
    return { key, topic: p.topic, mode: p.mode, caution: p.caution, chapters: ch.length, tryits: ch.filter((c) => (c.blocks ?? []).includes("tryit")).length, issues };
  }),
});

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
      const chapters = plan.chapters.map((c: any, i: number) => ({ ...c, n: i + 1 }));
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

// A chapter left "unchecked" only because the checker wanted the plain "try" card typed "tryit" (fixTryit does that
// afterwards) or did not know the "picture" type (11 Oct night, the free ten): check it again with each Try it card
// shown as its idea line and kept exactly as built, and each picture card shown as a teach card, its corrected words
// put back into the picture card. Nothing is inserted (no delivery check), so card positions hold.
//   npx convex run showcase:recheck '{"handbookId":"...","n":1}'
export const recheck = internalAction({
  args: { handbookId: v.id("handbooks"), n: v.number() },
  handler: async (ctx, { handbookId, n }): Promise<any> => {
    const h: any = await ctx.runQuery(internal.handbooks.readHandbook, { handbookId });
    const ch: any = await ctx.runQuery(internal.handbooks.readChapterRow, { handbookId, n });
    if (!h || !ch?.cards) return { ok: false };
    const sent = ch.cards.map((c: any) => c?.type === "tryit" ? { type: "tryit", title: c.title, idea: c.idea } : c?.type === "picture" ? { type: "teach", ...(c.title ? { title: c.title } : {}), body: c.body ?? "" } : c);
    const checked = await factCheck(ctx, h.plan?.topic ?? h.topic, h.level, ch.title ?? "", sent, { trace: { handbookId, chapter: n } as any });
    const cards = ch.cards.map((orig: any, i: number) => {
      const c = checked.cards[i];
      if (orig?.type === "tryit") return orig;
      if (orig?.type === "picture") return c?.type === "teach" && typeof c.body === "string" ? { ...orig, body: c.body, ...(c.title ? { title: c.title } : {}) } : orig;
      return c ?? orig;
    });
    await ctx.runMutation(internal.handbooks.patchCheckedCards, { id: ch._id, cards, factCheck: { ...checked.report, notes: ["re-checked 11 Oct (Try it cards kept as built, picture cards checked as text)", ...checked.report.notes] } });
    return { status: checked.report.status, fixes: checked.report.fixes, notes: checked.report.notes };
  },
});
