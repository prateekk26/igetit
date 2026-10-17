import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { CHECK_PROMPT_V3, CHECK_PROMPT_V4, CHECK_PROMPT_V5, QUIZ_CHECK_PROMPT, checkUserMessage } from "./prompts";
import { applyAnywhere, validFix, factCheck } from "./handbooks";

// The planted-mistakes test for the fact check (17 Oct; the 6 Oct test in evals/model-choice.md, rebuilt on a current
// chapter because the old one wasn't kept). One run: the chapter with its planted mistakes goes to Sonnet with the check
// prompt (v3, whole cards back; or v4, edits back), the fixes are applied the way handbooks.ts applies them, and the
// cards come back with the tokens and time. scripts/check-planted.mjs plants, runs and scores. Dev only.
export const run = internalAction({
  // version "live": the prompt and effort a reader's chapter gets today (the eval gate runs this one).
  args: { cards: v.any(), version: v.union(v.literal("v3"), v.literal("v4"), v.literal("v5"), v.literal("quiz"), v.literal("live")), effort: v.optional(v.union(v.literal("low"), v.literal("medium"))), title: v.string(), topic: v.string(), reference: v.optional(v.string()) },
  handler: async (ctx, { cards, version, effort, title, topic, reference }): Promise<any> => {
    const t0 = Date.now();
    // "live" (17 Oct): the real fact check a reader's chapter gets, second ask for an edit that missed included.
    if (version === "live") {
      const out = await factCheck(ctx, topic, "new", title, cards as any[]);
      return { ok: out.report.status !== "unchecked" || out.report.fixes > 0, ms: Date.now() - t0, tokensIn: 0, tokensOut: 0, applied: out.report.fixes, skipped: out.report.notes.filter((x: string) => /fix skipped/.test(x)).length, fixes: out.report.notes, cards: out.cards };
    }
    // reference (17 Oct, quiz check test): sent the way factCheck sends it.
    const user = checkUserMessage(topic, "new", { title, cards }) + `\nToday: ${new Date().toISOString().slice(0, 10)}` + (reference ? `\n\nReference material these cards must agree with (names and numbers in the cards should trace to it or to a named source):\n${reference}` : "");
    const system = version === "quiz" ? QUIZ_CHECK_PROMPT : version === "v5" ? CHECK_PROMPT_V5 : version === "v4" ? CHECK_PROMPT_V4 : CHECK_PROMPT_V3;
    const r: any = await ctx.runAction(internal.ai.generate, { kind: "check", system, user, model: "claude-sonnet-5-5", effort });
    const ms = Date.now() - t0;
    if (!r.ok) return { ok: false, ms, error: r.error };
    const out = (cards as any[]).slice();
    let applied = 0, skipped = 0;
    for (const f of Array.isArray(r.json?.fixes) ? r.json.fixes : []) {
      const hit = f?.fixed && !f?.find && !f?.answer ? null : applyAnywhere(out, f);
      const i = hit ? hit.i : Number(f?.card);
      if (!Number.isInteger(i) || i < 0 || i >= out.length) { skipped++; continue; }
      const next = f?.fixed && !f?.find && !f?.answer ? f.fixed : hit?.next ?? null;
      if (validFix(out[i], next)) { out[i] = next; applied++; } else skipped++;
    }
    return { ok: true, ms, tokensIn: r.tokensIn, tokensOut: r.tokensOut, applied, skipped, fixes: r.json?.fixes ?? [], cards: out };
  },
});
