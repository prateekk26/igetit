// The chapter rubric and its scorer (D72, 11 Oct night; docs/evals/basics.md, Eval basics: "every output your AI gives
// logged and scored against it"). One output, the chapter; three input levers; levels from worst to best. Every chapter
// written for a reader is scored after it is saved (a scheduled step, so a reader never waits on it), one lever per
// call (Advanced evals: "one lever per call"), quoting the line it scored. Sonnet at low effort, about ₹1 a lever.
// The rubric grows by edge cases: when a score is wrong, add the case to the level's text here and bump RUBRIC_VERSION.
import { v } from "convex/values";
import { internalAction, internalMutation, internalQuery, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { isOwner } from "./admin";

export const RUBRIC_VERSION = "r1";

export const LEVERS = {
  outcome: {
    name: "Delivers its outcome",
    levels: [
      "L1: never gets to the outcome line; it explains around it, or the outcome is something else entirely.",
      "L2: names the outcome but stops at explaining it; no example of it being done.",
      "L3: explains the outcome and shows it done on an example, but the reader never does it themselves.",
      "L4: the reader does it once (a Try it, a Your turn, a timer, a worked exercise), but the closing card doesn't say what they can now do.",
      "L5: the reader does it once inside the chapter and the closing card names what they can now do, in the outcome's own terms.",
    ],
  },
  facts: {
    name: "True, specific facts",
    levels: [
      "L1: a false claim a reader could act on (a wrong number, rule, law, date or step).",
      "L2: a claim that is misleading or out of date, even if not strictly false.",
      "L3: nothing false, but vague where a number or a name was available (\"experts say\", \"many people\").",
      "L4: specific and checkable, with at most one vague claim.",
      "L5: specific and checkable throughout, numbers where they exist, India-first where it matters, nothing a careful editor would flag.",
    ],
  },
  taught: {
    name: "Teaches before it tests",
    levels: [
      "L1: a quiz or task needs something the chapter never taught, or the marked answer is not the best one.",
      "L2: a question can only be answered by someone who already knew the topic.",
      "L3: every question is answerable from the cards, but the wrong options are filler.",
      "L4: every question maps to a card and every wrong option is a real, named confusion.",
      "L5: L4, and terms are explained in plain words before they appear in any question or option.",
    ],
  },
} as const;
export type Lever = keyof typeof LEVERS;

const SYSTEM = `You score one chapter of a short phone handbook on ONE lever of a rubric. Read the chapter's cards and the plan's line for this chapter. Pick the single level whose text fits best; when two fit, pick the lower. Quote the exact words (at most 25) from the chapter that decided it. If the chapter doesn't show enough to tell, set "level" to null and "cantTell" to true. Reply with JSON only: {"level": 1-5 or null, "quote": "...", "why": "one plain sentence", "cantTell": false}.`;

const cardText = (c: any) => [c.type, c.title, c.body, c.prompt, c.idea, c.instruction, c.kind && c.type === "doit" ? `${c.kind}${c.target ? ` ${c.target}` : ""}` : null, Array.isArray(c.items) ? c.items.join(" / ") : null, Array.isArray(c.options) ? c.options.map((o: any) => `${o.id}) ${o.text}${c.answer === o.id ? " [marked answer]" : ""}`).join(" | ") : null, Array.isArray(c.steps) ? c.steps.map((s: any) => (typeof s === "string" ? s : s?.text ?? "")).join(" / ") : null].filter(Boolean).join(" :: ");

export function scorerUser(lever: Lever, plan: any, n: number, cards: any[], facts: string | null) {
  const L = LEVERS[lever];
  const spec = plan?.chapters?.[n - 1] ?? {};
  return [
    `Lever: ${L.name}`, "Levels:", ...L.levels,
    "", `Plan for chapter ${n}: title "${spec.title ?? ""}"; outcome "${spec.outcome ?? ""}"; covers "${spec.covers ?? ""}".`,
    lever === "facts" && facts ? `\nResearch facts for this handbook (what was checked when it was written):\n${facts.slice(0, 6000)}` : "",
    "", "The chapter's cards, in order:", ...cards.map((c, i) => `${i + 1}. ${cardText(c)}`.slice(0, 1500)),
  ].join("\n");
}

export const save = internalMutation({
  args: { handbookId: v.id("handbooks"), n: v.number(), lever: v.string(), level: v.union(v.number(), v.null()), quote: v.string(), why: v.string(), model: v.string() },
  handler: async (ctx, a) => {
    for (const old of await ctx.db.query("scores").withIndex("by_handbook_n", (q) => q.eq("handbookId", a.handbookId).eq("n", a.n)).collect()) if (old.lever === a.lever) await ctx.db.delete(old._id);
    await ctx.db.insert("scores", { ...a, rubric: RUBRIC_VERSION, at: Date.now() });
  },
});

export const inputs = internalQuery({
  args: { handbookId: v.id("handbooks"), n: v.number() },
  handler: async (ctx, { handbookId, n }) => {
    const h: any = await ctx.db.get(handbookId);
    const ch: any = await ctx.db.query("chapters").withIndex("by_handbook_n", (q) => q.eq("handbookId", handbookId).eq("n", n)).unique();
    if (!h || !ch || ch.status !== "ready") return null;
    const facts = Array.isArray(h.brief?.facts) ? h.brief.facts.map((f: any) => (typeof f === "string" ? f : f?.fact ?? f?.text ?? JSON.stringify(f))).join("\n") : null;
    return { plan: h.plan, cards: ch.cards ?? [], facts };
  },
});

// Score one chapter on every lever. Scheduled after a chapter is saved; also run by the eval runner and by hand:
//   npx convex run rubric:scoreChapter '{"handbookId":"...","n":1}'
export const scoreChapter = internalAction({
  args: { handbookId: v.id("handbooks"), n: v.number(), levers: v.optional(v.array(v.string())) },
  handler: async (ctx, { handbookId, n, levers }): Promise<Record<string, number | null>> => {
    const inp: any = await ctx.runQuery(internal.rubric.inputs, { handbookId, n });
    if (!inp) return {};
    const out: Record<string, number | null> = {};
    for (const lever of (levers ?? Object.keys(LEVERS)) as Lever[]) {
      if (!(lever in LEVERS)) continue;
      const r: any = await ctx.runAction(internal.ai.generate, { kind: "score", system: SYSTEM, user: scorerUser(lever, inp.plan, n, inp.cards, inp.facts), trace: { handbookId, chapter: n } });
      if (!r.ok || !r.json) continue;
      const level = typeof r.json.level === "number" ? Math.max(1, Math.min(5, Math.round(r.json.level))) : null;
      await ctx.runMutation(internal.rubric.save, { handbookId, n, lever, level, quote: String(r.json.quote ?? "").slice(0, 400), why: String(r.json.why ?? "").slice(0, 400), model: r.model ?? "?" });
      out[lever] = level;
    }
    return out;
  },
});

// /admin "Quality": the last days' scores per lever, and the lowest-scored chapters with the line that decided each.
export const dashboard = query({
  args: { days: v.number() },
  handler: async (ctx, { days }) => {
    if (!(await isOwner(ctx)).ok) return null;
    const since = Date.now() - days * 86400000;
    const rows = await ctx.db.query("scores").withIndex("by_at", (q) => q.gt("at", since)).collect();
    const per: Record<string, number[]> = {};
    for (const r of rows) if (r.level !== null) (per[r.lever] ??= [0, 0, 0, 0, 0])[r.level - 1]++;
    const low = rows.filter((r) => r.level !== null && r.level <= 2).sort((a, b) => (a.level! - b.level!) || b.at - a.at).slice(0, 12);
    const topics = new Map<string, string>();
    for (const r of low) if (!topics.has(r.handbookId)) { const h: any = await ctx.db.get(r.handbookId); topics.set(r.handbookId, String(h?.plan?.topic ?? h?.topic ?? "?").slice(0, 60)); }
    return {
      rubric: RUBRIC_VERSION, scored: rows.length, cantTell: rows.filter((r) => r.level === null).length,
      levers: Object.entries(LEVERS).map(([k, L]) => ({ lever: k, name: L.name, counts: per[k] ?? [0, 0, 0, 0, 0] })),
      low: low.map((r) => ({ handbookId: r.handbookId as string, topic: topics.get(r.handbookId) ?? "?", n: r.n, lever: r.lever, level: r.level, quote: r.quote, why: r.why, at: r.at })),
    };
  },
});
