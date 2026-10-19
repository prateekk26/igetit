import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalAction, internalMutation, internalQuery, query, type MutationCtx } from "./_generated/server";
import { isOwner } from "./admin";

// What the app spends, per day, per provider and model, and per job inside a model (7 Oct, Prateek: "per day cost by
// all models, and in a model see what's costing"). Every call already goes through handbooks.logAiCall; it adds its
// estimated cost here, so /admin reads one small row per day, model and job instead of the full call log.
// Estimates in rupees from list prices in dollars; a provider's bill is the truth.
// 19 Oct (Prateek: "the real prices for all models", "correct conversion as of today"): prices checked that day on each
// provider's page; the rate is Google Finance's at 19 Oct 16:44 UTC. Older rows in costDaily keep the ₹84 they were
// written with until costs:backfill is run. Gemini's prices double on 1 Jan 2027 ($1.50 / $7.50, TTS $1.00 / $18.00).
export const USD_INR = 94.9;

// $ per million tokens, in / out. The first key a model id contains wins, so the specific ones come first.
const PER_M_USD: [string, number, number][] = [
  ["ci:claude-opus-5.5", 2.616629, 13.083145],   // Opus 5.5 through Cheaper Inference: their catalog rate 19 Oct (it moves; never above list)
  ["opus-5-5", 4, 20],              // Claude Opus 5.5
  ["ci:claude-sonnet-5.5", 1.3, 6.5],   // Sonnet 5.5 through Cheaper Inference: their catalog rate 19 Oct (the fact check, D143)
  ["opus", 5, 25],                  // older Opus (5, 4.8 ...)
  ["fable", 10, 50],                // Claude Fable 5.1 (masked comparison only)
  ["sonnet-5", 2, 10],              // Claude Sonnet 5.5 and 5
  ["sonnet", 3, 15],                // Sonnet 4.6
  ["haiku", 1, 5],                  // Claude Haiku 4.5
  ["gemini-3.8-flash-lite-tts", 0.5, 6], // read aloud, plain words (D140)
  ["gemini-3.8-flash-tts", 0.5, 9], // read aloud: text in, audio tokens out
  ["gemini-3.8-flash", 0.75, 3.75], // output includes thinking tokens
  ["deepseek-v4.1-flash", 0.3, 1.2],   // not re-checked 19 Oct (unused); a reseller's bill may differ
];
const PER_CALL_USD: [string, number][] = [   // $ per successful call; Runway credits are $0.01 each (Runway's API pricing page)
  ["gen4_image_turbo", 0.02],   // 2 credits
  ["gen4_image", 0.05],         // 5 credits (720p)
  ["muse_image", 0.01],         // 1 credit
  ["supadata", 0],              // YouTube transcripts, free tier
  ["wikimedia", 0],             // Commons photos, free (logged for their time, 8 Oct)
];

export function providerOf(model: string) {
  const m = model.toLowerCase();
  if (m.startsWith("claude") || m === "anthropic") return "Anthropic";
  if (m.startsWith("gpt") || m.startsWith("o1") || m.startsWith("o3")) return "OpenAI";
  if (m.includes("gemini")) return "Google";
  if (m.startsWith("glm") || m.startsWith("ci:")) return "Cheaper Inference";
  if (m.startsWith("tic:") || m.includes("deepseek")) return "The Inference Company";
  if (m.includes("image") || m.startsWith("gen4") || m.startsWith("muse")) return "Runway";
  if (m.includes("supadata")) return "Supadata";
  if (m.includes("wikimedia")) return "Wikimedia";
  return "Other";
}

export function inrOf(model: string, ok: boolean, tokensIn = 0, tokensOut = 0) {
  const m = model.toLowerCase() === "anthropic" ? "opus" : model.toLowerCase();
  for (const [k, a, b] of PER_M_USD) if (m.includes(k)) return ((tokensIn * a + tokensOut * b) / 1e6) * USD_INR;
  for (const [k, p] of PER_CALL_USD) if (m.includes(k)) return ok ? p * USD_INR : 0;
  return 0;
}

const IST = 5.5 * 60 * 60 * 1000;
const dayOf = (t: number) => new Date(t + IST).toISOString().slice(0, 10);

export async function addCost(ctx: MutationCtx, c: { model: string; kind: string; ok: boolean; tokensIn?: number; tokensOut?: number; at?: number }) {
  const day = dayOf(c.at ?? Date.now());
  const provider = providerOf(c.model);
  const row = await ctx.db.query("costDaily").withIndex("by_day_model_kind", (q) => q.eq("day", day).eq("model", c.model).eq("kind", c.kind)).unique();
  const inr = inrOf(c.model, c.ok, c.tokensIn, c.tokensOut);
  if (row) await ctx.db.patch(row._id, { calls: row.calls + 1, failed: row.failed + (c.ok ? 0 : 1), tokensIn: row.tokensIn + (c.tokensIn ?? 0), tokensOut: row.tokensOut + (c.tokensOut ?? 0), inr: row.inr + inr });
  else await ctx.db.insert("costDaily", { day, provider, model: c.model, kind: c.kind, calls: 1, failed: c.ok ? 0 : 1, tokensIn: c.tokensIn ?? 0, tokensOut: c.tokensOut ?? 0, inr });
}

// One-off: rebuild costDaily from the whole call log, a page at a time. Run: npx convex run --prod costs:backfill '{}'
export const page = internalQuery({
  args: { cursor: v.union(v.string(), v.null()) },
  handler: async (ctx, { cursor }) => {
    const r = await ctx.db.query("aiCalls").paginate({ cursor, numItems: 150 });
    return { rows: r.page.map((c) => ({ model: c.model, kind: c.kind, ok: c.ok, tokensIn: c.tokensIn, tokensOut: c.tokensOut, at: c.at })), cursor: r.continueCursor, done: r.isDone };
  },
});
export const clear = internalMutation({ args: {}, handler: async (ctx) => { for (const r of await ctx.db.query("costDaily").collect()) await ctx.db.delete(r._id); } });
export const addMany = internalMutation({
  args: { rows: v.array(v.object({ model: v.string(), kind: v.string(), ok: v.boolean(), tokensIn: v.optional(v.number()), tokensOut: v.optional(v.number()), at: v.number() })) },
  handler: async (ctx, { rows }) => { for (const r of rows) await addCost(ctx, r); },
});
export const backfill = internalAction({
  args: {},
  handler: async (ctx): Promise<{ calls: number }> => {
    await ctx.runMutation(internal.costs.clear, {});
    let cursor: string | null = null, calls = 0;
    for (;;) {
      const p: any = await ctx.runQuery(internal.costs.page, { cursor });
      if (p.rows.length) await ctx.runMutation(internal.costs.addMany, { rows: p.rows });
      calls += p.rows.length; cursor = p.cursor;
      if (p.done) break;
    }
    return { calls };
  },
});

// /admin: the last N days, newest first, each with providers, models and jobs. Owner only.
export const byDay = query({
  args: { days: v.optional(v.number()) },
  handler: async (ctx, { days = 14 }) => {
    if (!(await isOwner(ctx)).ok) return null;
    const since = dayOf(Date.now() - (Math.min(60, Math.max(1, days)) - 1) * 24 * 60 * 60 * 1000);
    const rows = await ctx.db.query("costDaily").withIndex("by_day_model_kind", (q) => q.gte("day", since)).collect();
    const out = new Map<string, { day: string; inr: number; calls: number; models: Map<string, { model: string; provider: string; inr: number; calls: number; failed: number; tokensIn: number; tokensOut: number; kinds: { kind: string; inr: number; calls: number; failed: number; tokensIn: number; tokensOut: number }[] }> }>();
    for (const r of rows) {
      const d = out.get(r.day) ?? { day: r.day, inr: 0, calls: 0, models: new Map() };
      const m = d.models.get(r.model) ?? { model: r.model, provider: r.provider, inr: 0, calls: 0, failed: 0, tokensIn: 0, tokensOut: 0, kinds: [] };
      m.inr += r.inr; m.calls += r.calls; m.failed += r.failed; m.tokensIn += r.tokensIn; m.tokensOut += r.tokensOut;
      m.kinds.push({ kind: r.kind, inr: r.inr, calls: r.calls, failed: r.failed, tokensIn: r.tokensIn, tokensOut: r.tokensOut });
      d.inr += r.inr; d.calls += r.calls;
      d.models.set(r.model, m); out.set(r.day, d);
    }
    return [...out.values()].sort((a, b) => (a.day < b.day ? 1 : -1)).map((d) => ({
      day: d.day, inr: Math.round(d.inr), calls: d.calls,
      models: [...d.models.values()].sort((a, b) => b.inr - a.inr).map((m) => ({ ...m, inr: Math.round(m.inr * 10) / 10, kinds: m.kinds.sort((a, b) => b.inr - a.inr).map((k) => ({ ...k, inr: Math.round(k.inr * 10) / 10 })) })),
    }));
  },
});
