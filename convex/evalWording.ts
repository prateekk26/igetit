// D87 (11 Oct): try the wording step (handbooks.cleanWording) on chapters already written, without saving anything:
// returns each changed sentence before and after. Dev only, for the before/after Prateek sees before it ships.
//   npx convex run evalWording:tryOn '{"handbookIds":["..."]}'
import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { cleanWording } from "./handbooks";

const BANNED = /\b(wrong|wrongly|incorrect|incorrectly)\b/i;
const sentences = (c: any) => JSON.stringify(c).split(/(?<=[.!?])\s+|\\n/).filter((x) => BANNED.test(x));

export const tryOn = internalAction({
  args: { handbookIds: v.array(v.id("handbooks")) },
  handler: async (ctx, { handbookIds }) => {
    const out: any[] = [];
    for (const handbookId of handbookIds) {
      const h: any = await ctx.runQuery(internal.evalShape.read, { handbookId });
      for (const ch of h?.chapters ?? []) {
        const cards = ch.cards ?? [];
        if (!cards.some((c: any) => BANNED.test(JSON.stringify(c)))) continue;
        const r = await cleanWording(ctx, cards);
        const changed = cards.map((c: any, i: number) => ({ i, before: sentences(c), after: JSON.stringify(r.cards[i]) === JSON.stringify(c) ? null : sentences(r.cards[i]), same: JSON.stringify({ ...c, body: 0, title: 0, prompt: 0, options: 0, whyNot: 0, reteach: 0, instruction: 0, idea: 0 }) === JSON.stringify({ ...r.cards[i], body: 0, title: 0, prompt: 0, options: 0, whyNot: 0, reteach: 0, instruction: 0, idea: 0 }) }))
          .filter((x: any) => x.before.length);
        const diffs = changed.map((x: any) => {
          const a = cards[x.i], b = r.cards[x.i];
          return { card: x.i, type: a.type, kept: x.after === null, otherFieldsSame: x.same, before: JSON.stringify(a).slice(0, 4000), after: JSON.stringify(b).slice(0, 4000) };
        });
        out.push({ topic: h.plan?.topic ?? h.topic, n: ch.n, fixed: r.fixed, stillBanned: r.cards.some((c: any) => BANNED.test(JSON.stringify(c))), diffs });
      }
    }
    return out;
  },
});
