import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";

// Plan-model comparison (17 Oct, Prateek: "one plan run by all 3 models, quality check on all levels"). A blind judge
// that is none of the three (GPT-6.1 Sol on Cheaper Inference, the outside reviewer on dev) reads the same research and
// the three plans labelled A, B, C in shuffled order, and scores each. scripts/plan-models.mjs runs the rest. Dev only.
const JUDGE = `You review three plans for the same short phone handbook, written from the same research brief for the same reader. The plans are labelled A, B and C; you don't know who wrote them. Score each plan 1 to 5 on each dimension (5 = an editor would change nothing), then rank them.

Dimensions:
- fit: the number of chapters and the pace ("quick": one or two sittings; "course": one chapter a day) fit the reader's goal. No padding chapters, nothing squeezed.
- level: chapter 1 starts where this reader is (the level and the brief's "start"), and the steps up are even.
- coverage: every piece in the brief is placed, in a sensible order, and no chapter relies on something not yet taught.
- promises: each chapter's outcome and hook promise only what the brief's facts support and one sitting can deliver. Penalise promises of skills, numbers or results the research doesn't back.
- clarity: titles and hooks are specific, plain and make you want to read; no jargon a reader at this level wouldn't know.
- analogy: the plan's "picture" fits the topic and helps (5), or there is none and that's right for this topic (4); a strained picture scores low.

Return JSON only: {"scores":{"A":{"fit":n,"level":n,"coverage":n,"promises":n,"clarity":n,"analogy":n},"B":{...},"C":{...}},"rank":["best label","second","third"],"why":"two plain sentences on what separates them","worst_promise":"the single promise most likely to be broken, quoted, with its label"}`;

// One plan on its own (the eval gate, one run per case): the same dimensions, no ranking.
const JUDGE_ONE = JUDGE.replace("You review three plans for the same short phone handbook, written from the same research brief for the same reader. The plans are labelled A, B and C; you don't know who wrote them. Score each plan 1 to 5 on each dimension (5 = an editor would change nothing), then rank them.", "You review the plan for a short phone handbook, written from the research brief below for the reader below. Score it 1 to 5 on each dimension (5 = an editor would change nothing).")
  .replace(/Return JSON only:[\s\S]*$/, `Return JSON only: {"scores":{"fit":n,"level":n,"coverage":n,"promises":n,"clarity":n,"analogy":n},"worst_promise":"the single promise most likely to be broken, quoted"}`);
export const judgeOne = internalAction({
  args: { reader: v.string(), brief: v.any(), plan: v.any() },
  handler: async (ctx, { reader, brief, plan }): Promise<any> => {
    const r: any = await ctx.runAction(internal.ai.generate, { kind: "audit", system: JUDGE_ONE, user: `Reader: ${reader}\n\nResearch brief:\n${JSON.stringify(brief).slice(0, 14000)}\n\nPlan:\n${JSON.stringify(plan)}`, model: "ci:gpt-6.1-sol" });
    return r.ok ? { ok: true, json: r.json } : { ok: false, error: r.error };
  },
});

export const judge = internalAction({
  args: { reader: v.string(), brief: v.any(), plans: v.any() },
  handler: async (ctx, { reader, brief, plans }): Promise<any> => {
    const user = `Reader: ${reader}\n\nResearch brief:\n${JSON.stringify(brief).slice(0, 14000)}\n\n${Object.entries(plans as Record<string, any>).map(([k, p]) => `Plan ${k}:\n${JSON.stringify(p)}`).join("\n\n")}`;
    const r: any = await ctx.runAction(internal.ai.generate, { kind: "audit", system: JUDGE, user, model: "ci:gpt-6.1-sol" });
    return r.ok ? { ok: true, json: r.json } : { ok: false, error: r.error };
  },
});
