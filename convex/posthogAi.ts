// PostHog AI observability (11 Oct, D69, Prateek: "Let's enable AI observability", in PostHog): every AI call in the
// call log goes to PostHog's LLM analytics as one $ai_generation event, grouped by handbook ($ai_trace_id). Numbers
// only, like the Langfuse export (convex/langfuse.ts), which keeps running: step, model, provider, time, tokens, cost,
// tries and the error line. Never the prompt, the reply or anything a reader typed. Sent every 2 minutes from the log by
// a scheduled job, so a reader never waits on it and nothing is lost if PostHog is down. Uses the same POSTHOG_KEY
// (and POSTHOG_HOST) as the page views; without the key it does nothing. Events don't create PostHog persons, so the
// visitors count is untouched.
import { v } from "convex/values";
import { internalAction, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { inrOf } from "./costs";
import type { Row, Info } from "./langfuse";

const KEY = "posthogAi.exportedUntil";
const FIRST_FROM = Date.parse("2026-10-02T00:00:00+05:30");   // the first run sends the sprint's history (kickoff, 2 Oct)
const BATCH = 200;          // calls per request
const ROUNDS = 5;           // requests per run, so the history catches up in a few runs
const INR_PER_USD = 84;     // as in costs.ts

export const cursor = internalQuery({
  args: {},
  handler: async (ctx) => {
    const row = await ctx.db.query("settings").withIndex("by_key", (q) => q.eq("key", KEY)).unique();
    return row ? Number(row.value) : FIRST_FROM;
  },
});

export const setCursor = internalMutation({
  args: { at: v.number() },
  handler: async (ctx, { at }) => {
    const row = await ctx.db.query("settings").withIndex("by_key", (q) => q.eq("key", KEY)).unique();
    if (row) await ctx.db.patch(row._id, { value: String(at), at: Date.now() });
    else await ctx.db.insert("settings", { key: KEY, value: String(at), at: Date.now() });
  },
});

const provider = (model: string) =>
  /^claude|anthropic/i.test(model) ? "anthropic" : /^gemini/i.test(model) ? "google" : /^gpt|^o\d/i.test(model) ? "openai"
    : /^glm/i.test(model) ? "zhipu" : /^deepseek/i.test(model) ? "deepseek" : model.split(/[-/]/)[0] || "other";

function event(c: Row, h: Info | undefined) {
  const usd = inrOf(c.model, c.ok, c.tokensIn, c.tokensOut) / INR_PER_USD;
  return {
    event: "$ai_generation",
    distinct_id: "igetit-pipeline",
    timestamp: new Date(c.at).toISOString(),
    properties: {
      $process_person_profile: false,
      $ai_trace_id: c.handbookId ?? `call:${c.id}`,
      $ai_span_id: c.id,
      $ai_span_name: c.chapter ? `${c.kind} · chapter ${c.chapter}` : c.kind,
      $ai_model: c.model,
      $ai_provider: provider(c.model),
      $ai_input_tokens: c.tokensIn,
      $ai_output_tokens: c.tokensOut,
      ...(c.cachedIn ? { $ai_cache_read_input_tokens: c.cachedIn } : {}),
      $ai_latency: c.ms / 1000,
      $ai_total_cost_usd: usd,
      $ai_is_error: !c.ok,
      ...(c.ok ? {} : { $ai_error: (c.error ?? "failed").slice(0, 300) }),
      step: c.kind, attempts: c.attempts, ...(c.chapter ? { chapter: c.chapter } : {}),
      handbook_kind: h?.kind ?? "one-off",
      environment: process.env.LANGFUSE_ENVIRONMENT ?? "production",
    },
  };
}

export const exportNew = internalAction({
  args: {},
  handler: async (ctx): Promise<{ sent: number; skipped?: string }> => {
    const key = process.env.POSTHOG_KEY;
    if (!key) return { sent: 0, skipped: "no PostHog key" };
    const host = (process.env.POSTHOG_HOST ?? "https://us.i.posthog.com").replace(/\/+$/, "");
    let sent = 0;
    for (let round = 0; round < ROUNDS; round++) {
      const after: number = await ctx.runQuery(internal.posthogAi.cursor, {});
      const fetched: Row[] = await ctx.runQuery(internal.langfuseData.calls, { after, limit: BATCH + 1, withText: false });
      if (!fetched.length) break;
      // Stop at a millisecond boundary, so calls logged in the same millisecond never straddle two requests.
      const rows = fetched.length > BATCH ? fetched.filter((c) => c.at < fetched[BATCH].at) : fetched;
      if (!rows.length) return { sent, skipped: "too many calls in one millisecond" };
      const ids = [...new Set(rows.map((c) => c.handbookId).filter((x): x is string => !!x))];
      const infos: Info[] = ids.length ? await ctx.runQuery(internal.langfuseData.handbooks, { ids }) : [];
      const byId = new Map(infos.map((h) => [h.id, h]));
      // Not model calls (a transcript fetch, a photo search): logged, never sent as generations.
      const batch = rows.filter((c) => c.kind !== "transcript" && c.kind !== "photo").map((c) => event(c, c.handbookId ? byId.get(c.handbookId) : undefined));
      if (batch.length) {
        const res = await fetch(`${host}/batch/`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ api_key: key, batch }) });
        // Not sent: keep the cursor where it was, so the next run sends these again.
        if (!res.ok) throw new Error(`PostHog ${res.status}: ${(await res.text().catch(() => "")).slice(0, 300)}`);
      }
      await ctx.runMutation(internal.posthogAi.setCursor, { at: Math.max(...rows.map((c) => c.at)) });
      sent += batch.length;
      if (fetched.length <= BATCH) break;
    }
    return { sent };
  },
});
