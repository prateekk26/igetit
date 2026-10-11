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
