import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { inrOf } from "./costs";
import { FIGURE_PROMPT, check } from "./figures";

// Which model should write the explainer figures (14 Oct, Prateek: "How do we decide on a model? Show me the outputs for a
// few different models with cost and latency implications"). Dev only, never on a reader's path: each model gets the
// same prompt and the same chapters, and the run returns each reply with its time, tokens, estimated cost and a check of
// what it wrote (a shape the drawer knows, labels short enough, and no number the page doesn't have).
//   npx convex run evalFigures:run "$(cat args.json)"   args: { models: string[], chapters: [{ topic, cards }] }

export const run = internalAction({
  args: { models: v.array(v.object({ model: v.string(), effort: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"))) })), chapters: v.array(v.object({ topic: v.string(), cards: v.array(v.object({ type: v.string(), title: v.optional(v.string()), body: v.string() })) })) },
  handler: async (ctx, { models, chapters }) => {
    const user = (c: { topic: string; cards: { type: string; title?: string; body: string }[] }) =>
      `Handbook: ${c.topic}\n\n` + c.cards.map((x, i) => `Page ${i} (${x.type}${x.title ? `, "${x.title}"` : ""}):\n${x.body}`).join("\n\n");
    return await Promise.all(models.map(async ({ model, effort }) => {
      const rows = [];
      for (const c of chapters) {
        const t0 = Date.now();
        const r: any = await ctx.runAction(internal.ai.generate, { kind: "figures", system: FIGURE_PROMPT, user: user(c), model, effort, logAs: "eval figures" });
        const ms = Date.now() - t0;
        const figs: any[] = r.ok ? (r.json?.figures ?? []) : [];
        rows.push({
          topic: c.topic, ok: !!r.ok, error: r.ok ? null : r.error, ms, tokensIn: r.tokensIn ?? 0, tokensOut: r.tokensOut ?? 0,
          inr: inrOf(r.model ?? model, !!r.ok, r.tokensIn ?? 0, r.tokensOut ?? 0),
          figures: figs.map((f) => ({ card: f.card, spec: f.spec ?? null, why: f.why ?? "", problems: f.spec ? check(f.spec, c.cards[f.card]?.body ?? "") : [] })),
        });
      }
      return { model, effort: effort ?? null, rows };
    }));
  },
});
