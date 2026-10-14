import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { inrOf } from "./costs";

// Which model should write the explainer figures (14 Oct, Prateek: "How do we decide on a model? Show me the outputs for a
// few different models with cost and latency implications"). Dev only, never on a reader's path: each model gets the
// same prompt and the same chapters, and the run returns each reply with its time, tokens, estimated cost and a check of
// what it wrote (a shape the drawer knows, labels short enough, and no number the page doesn't have).
//   npx convex run evalFigures:run "$(cat args.json)"   args: { models: string[], chapters: [{ topic, cards }] }

export const FIGURE_PROMPT = `You choose and describe explainer figures for the pages of one chapter of a short handbook read on a phone.

A figure is a small labelled diagram drawn by our app on a dark plate, like a page in a picture book that explains (the Sun, an arrow of sunlight, a Moon half lit and half dark). It replaces a painted scene on pages that explain an IDEA: a mechanism, a comparison of numbers, a sum, a rule, many things that share one idea, a wrong picture against the right one, a chain of cause and effect. Pages that tell a STORY about people (a scene, a character's moment) keep their painted scene: return null for them. Return null too when a figure would only repeat the words, or when the page has nothing to draw.

You may use only these seven layouts, with exactly these fields:
1. {"kind":"bars","title":"...","items":[{"label":"...","value":<number>,"show":"..."}],"best":<index or omit>,"caption":"..."} 2 to 5 items with real values from the page; "show" is how the value is written (₹2,000, 80%). "best" marks the one to highlight.
2. {"kind":"converge","title":"...","items":["...","..."],"into":{"label":"...","sub":"..."},"caption":"..."} 2 to 4 things that come down to one idea.
3. {"kind":"lots","title":"...","left":"...","right":"...","from":"left"|"right","dots":<6 to 12>,"legend":"...","caption":"..."} things moving from one side to the other.
4. {"kind":"loop","title":"...","left":"...","right":"...","via":"...","inside":"...","outside":"...","charge":<true to reverse>,"caption":"..."} something crosses inside while something else goes round the outside through "via".
5. {"kind":"equation","title":"...","terms":[{"show":"...","label":"..."}],"ops":["÷","="],"caption":"..."} a sum with the page's own numbers; the last term is the answer.
6. {"kind":"vs","title":"...","wrong":{"head":"...","line":"..."},"right":{"head":"...","line":"..."},"caption":"..."} the mistaken picture against the right one.
7. {"kind":"flow","title":"...","nodes":[{"glyph":"sun|moon|earth|phone|battery|coin|card|plane|person|bag|bin|eye|dot","label":"..."}],"links":["so","..."],"caption":"..."} 2 to 4 steps, cause to effect.

Rules:
- Every word and number comes from the page. Never invent a fact, a number or a name. If a number isn't on the page, don't show it.
- Labels are short: titles up to 40 characters, item labels up to 24, captions up to 90. Plain words a 12-year-old would know; explain nothing in a figure that the page doesn't explain.
- The caption says the one idea the figure shows, in one sentence.
- At most one figure per page, and at most four per chapter: keep the ones that teach most.

Return JSON only: {"figures":[{"card":<page index>,"spec":<figure or null>,"why":"<one short reason>"}]} with one entry for every page given.`;

const KINDS = new Set(["bars", "converge", "lots", "loop", "equation", "vs", "flow"]);
const GLYPHS = new Set(["sun", "moon", "earth", "phone", "battery", "coin", "card", "plane", "person", "bag", "bin", "eye", "dot"]);
// The checks the drawer needs, and the "own words" rule: every number in a figure must appear on its page.
function check(spec: any, page: string): string[] {
  const out: string[] = [];
  if (!spec || typeof spec !== "object") return out;
  if (!KINDS.has(spec.kind)) return [`unknown kind ${spec.kind}`];
  const need: Record<string, string[]> = { bars: ["items"], converge: ["items", "into"], lots: ["left", "right", "from"], loop: ["left", "right", "via", "inside", "outside"], equation: ["terms", "ops"], vs: ["wrong", "right"], flow: ["nodes"] };
  for (const f of need[spec.kind]) if (spec[f] === undefined) out.push(`${spec.kind} missing ${f}`);
  if (spec.kind === "bars" && Array.isArray(spec.items) && spec.items.some((i: any) => typeof i?.value !== "number")) out.push("a bar has no number");
  if (spec.kind === "flow" && Array.isArray(spec.nodes) && spec.nodes.some((n: any) => !GLYPHS.has(n?.glyph))) out.push("a flow node has an unknown glyph");
  if (spec.title && String(spec.title).length > 48) out.push("title too long");
  if (spec.caption && String(spec.caption).length > 110) out.push("caption too long");
  const pageNums = new Set((page.replace(/,(?=\d{3})/g, "").match(/\d+(?:\.\d+)?/g) ?? []).map((x) => String(Number(x))));
  const shown = JSON.stringify({ ...spec, items: spec.items?.map?.((i: any) => (typeof i === "string" ? i : { ...i, value: undefined })) });
  for (const n of shown.replace(/,(?=\d{3})/g, "").match(/\d+(?:\.\d+)?/g) ?? []) if (!pageNums.has(String(Number(n))) && !["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"].includes(String(Number(n)))) out.push(`number ${n} is not on the page`);
  return [...new Set(out)];
}

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
