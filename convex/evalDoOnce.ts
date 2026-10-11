// Experiment (11 Oct night, dev only, nothing stored but the call log): does a "do it once" rule in the writer prompt
// lift the rubric's "delivers its outcome" lever without costing facts? The baseline eval run and the read-and-count
// pass both found chapter 1s that explain and show but never have the reader do the thing (outcome L3). For a test
// handbook that already has a plan and a brief, chapter 1 is written twice on Gemini 3.8 Flash with the same user
// message generateChapter sends, once with the live writer prompt and once with the rule appended, and each is scored
// on outcome and facts. The live prompt is untouched; changing it is Prateek's call, with this as the evidence.
//   npx convex run evalDoOnce:compare '{"handbookId":"..."}'
import { v } from "convex/values";
import { internalAction, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { CHAPTER_PROMPT_V6, chapterUserMessage, chapterContext, briefForChapter } from "./prompts";
import { scorerUser } from "./rubric";

export const DO_ONCE = `

DO IT ONCE (every chapter): before the closing card, the reader does the chapter's one thing once, inside the chapter: a "try" card titled "Your turn" with a concrete task they can finish in under 2 minutes (on paper, out loud or on their phone), built from the chapter's outcome line; or, when the request gives a "tryit" block, that Try it card. A quiz alone does not count as doing it. The closing card then names what the reader can now do, in the outcome's own words.`;

const SCORE_SYSTEM = `You score one chapter of a short phone handbook on ONE lever of a rubric. Read the chapter's cards and the plan's line for this chapter. Pick the single level whose text fits best; when two fit, pick the lower. Quote the exact words (at most 25) from the chapter that decided it. If the chapter doesn't show enough to tell, set "level" to null and "cantTell" to true. Reply with JSON only: {"level": 1-5 or null, "quote": "...", "why": "one plain sentence", "cantTell": false}.`;

export const inputs = internalQuery({
  args: { handbookId: v.id("handbooks") },
  handler: async (ctx, { handbookId }) => {
    const h: any = await ctx.db.get(handbookId);
    if (!h?.plan) return null;
    const facts = Array.isArray(h.brief?.facts) ? h.brief.facts.map((f: any) => (typeof f === "string" ? f : f?.fact ?? JSON.stringify(f))).join("\n") : null;
    return { plan: h.plan, brief: h.brief ?? null, level: h.level, language: h.language ?? "English", voice: h.voice ?? "friend", facts };
  },
});

export const compare = internalAction({
  args: { handbookId: v.id("handbooks"), runs: v.optional(v.number()) },
  handler: async (ctx, { handbookId, runs = 2 }): Promise<any> => {
    const inp: any = await ctx.runQuery(internal.evalDoOnce.inputs, { handbookId });
    if (!inp) return { error: "no plan" };
    const pieces = Array.isArray(inp.plan.chapters?.[0]?.pieces) ? inp.plan.chapters[0].pieces.map(String) : undefined;
    const user = chapterUserMessage(inp.plan, inp.level, inp.language, inp.voice, 1) + chapterContext(inp.brief, inp.plan, 1, []) + briefForChapter(inp.brief, pieces);
    const out: any = { topic: inp.plan.topic, live: [], doOnce: [] };
    for (let k = 0; k < runs; k++) {
      for (const [arm, system] of [["live", CHAPTER_PROMPT_V6], ["doOnce", CHAPTER_PROMPT_V6 + DO_ONCE]] as const) {
        const r: any = await ctx.runAction(internal.ai.generate, { kind: "chapter", system, user, model: "gemini-3.8-flash", logAs: "eval chapter" });
        if (!r.ok) { out[arm].push({ error: String(r.error).slice(0, 120) }); continue; }
        const cards = Array.isArray(r.json?.cards) ? r.json.cards : [];
        const levels: Record<string, number | null> = {};
        for (const lever of ["outcome", "facts"] as const) {
          const s: any = await ctx.runAction(internal.ai.generate, { kind: "score", system: SCORE_SYSTEM, user: scorerUser(lever, inp.plan, 1, cards, inp.facts), logAs: "eval score" });
          levels[lever] = s.ok && typeof s.json?.level === "number" ? s.json.level : null;
        }
        out[arm].push({ ...levels, cards: cards.map((c: any) => c?.type).join(","), doing: cards.some((c: any) => ["try", "tryit", "doit"].includes(c?.type)) });
      }
    }
    return out;
  },
});

// The same question one step up (11 Oct night): the writer follows the plan's blocks, so the rule goes in the plan.
// For a test handbook with a brief: plan with the live plan prompt and with PLAN_DO_ONCE appended (Gemini 3.8 Flash),
// write chapter 1 from each plan with the live writer, score outcome and facts.
//   npx convex run evalDoOnce:comparePlan '{"handbookId":"..."}'
export const PLAN_DO_ONCE = `

DO IT ONCE (every chapter): every chapter's blocks include one block where the reader does the chapter's one thing once, inside the chapter: "tryit" (a small interactive page), "try" (a task they finish in under 2 minutes on paper, out loud or on their phone) or "doit" (for body skills). In chapter 1 it sits within the first three blocks. A quiz alone does not count as doing it.`;

export const handbookFor = internalQuery({
  args: { handbookId: v.id("handbooks") },
  handler: async (ctx, { handbookId }) => {
    const h: any = await ctx.db.get(handbookId);
    return h ? { topic: h.topic, level: h.level, language: h.language ?? "English", voice: h.voice ?? "friend", goal: h.goal, mode: h.mode, brief: h.brief ?? null } : null;
  },
});

export const comparePlan = internalAction({
  args: { handbookId: v.id("handbooks") },
  handler: async (ctx, { handbookId }): Promise<any> => {
    const { planUserMessage, briefForPlan, PLAN_PROMPT_V9 } = await import("./prompts");
    const h: any = await ctx.runQuery(internal.evalDoOnce.handbookFor, { handbookId });
    if (!h?.brief) return { error: "no brief" };
    const facts = Array.isArray(h.brief?.facts) ? h.brief.facts.map((f: any) => (typeof f === "string" ? f : f?.fact ?? JSON.stringify(f))).join("\n") : null;
    const planUser = planUserMessage(h.topic, h.level, h.language, h.voice, undefined, h.goal, h.mode) + briefForPlan(h.brief);
    const out: any = { topic: h.topic };
    for (const [arm, system] of [["live", PLAN_PROMPT_V9], ["doOnce", PLAN_PROMPT_V9 + PLAN_DO_ONCE]] as const) {
      const p: any = await ctx.runAction(internal.ai.generate, { kind: "plan", system, user: planUser, model: "gemini-3.8-flash", logAs: "eval plan" });
      if (!p.ok) { out[arm] = { error: String(p.error).slice(0, 100) }; continue; }
      const plan = p.json;
      const blocks1 = (plan?.chapters?.[0]?.blocks ?? []).join(",");
      const pieces = Array.isArray(plan.chapters?.[0]?.pieces) ? plan.chapters[0].pieces.map(String) : undefined;
      const user = chapterUserMessage(plan, h.level, h.language, h.voice, 1) + chapterContext(h.brief, plan, 1, []) + briefForChapter(h.brief, pieces);
      const c: any = await ctx.runAction(internal.ai.generate, { kind: "chapter", system: CHAPTER_PROMPT_V6, user, model: "gemini-3.8-flash", logAs: "eval chapter" });
      if (!c.ok) { out[arm] = { blocks1, error: String(c.error).slice(0, 100) }; continue; }
      const cards = Array.isArray(c.json?.cards) ? c.json.cards : [];
      const levels: Record<string, number | null> = {};
      for (const lever of ["outcome", "facts"] as const) {
        const s: any = await ctx.runAction(internal.ai.generate, { kind: "score", system: SCORE_SYSTEM, user: scorerUser(lever, plan, 1, cards, facts), logAs: "eval score" });
        levels[lever] = s.ok && typeof s.json?.level === "number" ? s.json.level : null;
      }
      const withDoing = (plan?.chapters ?? []).filter((ch: any) => (ch.blocks ?? []).some((b: string) => ["try", "tryit", "doit"].includes(b))).length;
      out[arm] = { ...levels, blocks1, cards: cards.map((x: any) => x?.type).join(","), chaptersWithDoing: `${withDoing}/${plan?.chapters?.length ?? 0}` };
    }
    return out;
  },
});
