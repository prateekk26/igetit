import { v } from "convex/values";
import Anthropic from "@anthropic-ai/sdk";
import { internalAction, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { JUDGE, JUDGE_MODEL } from "./evalModels";

// The Shelf judge through Cheaper Inference (19 Oct, Prateek: "we can use that api to use opus here for judge"). The same
// Opus 5.5 request the Shelf review sends (library.ts judgeChapter: JUDGE prompt, effort high, 16,000 tokens), sent either
// to Anthropic as today or to Cheaper Inference's Anthropic-style endpoint with CHEAPER_INFERENCE_API_KEY. Dev only:
// scripts/ci-judge.mjs picks the chapters, runs both and compares. Not on the reader's path.

const CI_BASE = "https://api.cheaperinference.com";   // their SDK appends /v1/messages
const CI_MODEL = "claude-opus-5.5";
const SUFFIX = "\n\nReturn only the JSON object. No prose, no code fences.";   // as callAnthropic sends it

// The latest chapter 1s on this deployment, one per topic (on dev every book is ours, so test books count).
export const pick = internalQuery({
  args: { n: v.number() },
  handler: async (ctx, { n }) => {
    const out: any[] = [];
    for (const h of await ctx.db.query("handbooks").order("desc").take(300)) {
      if (out.length >= n) break;
      if ((h as any).status === "declined") continue;
      const ch = await ctx.db.query("chapters").withIndex("by_handbook_n", (q) => q.eq("handbookId", h._id).eq("n", 1)).unique();
      if (!ch || ch.status !== "ready" || !Array.isArray(ch.cards) || ch.cards.length < 3) continue;
      if (out.some((o) => o.topic === h.topic)) continue;
      out.push({ handbookId: h._id, topic: h.topic, title: ch.title, cards: ch.cards, outcomeLine: ch.outcomeLine });
    }
    return out;
  },
});

export const judge = internalAction({
  args: { via: v.union(v.literal("direct"), v.literal("ci")), title: v.optional(v.string()), cards: v.any(), outcomeLine: v.optional(v.string()) },
  handler: async (ctx, { via, title, cards, outcomeLine }): Promise<any> => {
    const user = "Chapter JSON:\n" + JSON.stringify({ title, cards, outcomeLine });
    const t0 = Date.now();
    if (via === "direct") {
      const r: any = await ctx.runAction(internal.ai.generate, { kind: "audit", system: JUDGE, user, model: JUDGE_MODEL, effort: "high", logAs: "eval ci-judge" });
      return { via, ok: r.ok, ms: Date.now() - t0, json: r.json, error: r.error, model: r.model, tokensIn: r.tokensIn, tokensOut: r.tokensOut };
    }
    const key = process.env.CHEAPER_INFERENCE_API_KEY;
    if (!key) return { via, ok: false, ms: 0, error: "no CHEAPER_INFERENCE_API_KEY" };
    const ci = new Anthropic({ apiKey: key, baseURL: CI_BASE });
    // The same request as callAnthropic, less Anthropic's server-side fallback beta (theirs to honour or not; tried first).
    const base = { model: CI_MODEL, max_tokens: 16000, system: JUDGE + SUFFIX, messages: [{ role: "user" as const, content: user }], output_config: { effort: "high" } };
    let sentFallback = true;
    const send = (p: any) => ci.beta.messages.create(p).withResponse();
    try {
      let got: any;
      try { got = await send({ ...base, betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" }); }
      catch (e: any) { if (e?.status !== 400) throw e; sentFallback = false; got = await send(base); }
      const { data: res, response } = got;
      const h = (k: string) => response.headers.get(k);
      const text = res.content.filter((b: any) => b.type === "text").map((b: any) => b.text).join("");
      const m = text.match(/\{[\s\S]*\}/);
      const json = m ? JSON.parse(m[0]) : null;
      return { via, ok: !!json, ms: Date.now() - t0, json, error: json ? undefined : "no JSON in reply", model: res.model, stop: res.stop_reason,
        thinkingBlocks: res.content.filter((b: any) => b.type === "thinking").length, tokensIn: res.usage?.input_tokens, tokensOut: res.usage?.output_tokens, sentFallback,
        ci: { requestId: h("x-ci-request-id"), techniques: h("x-ci-techniques"), cache: h("x-ci-cache"), savedUsd: h("x-ci-saved-usd"), tokensSaved: h("x-ci-tokens-saved") } };
    } catch (e: any) {
      return { via, ok: false, ms: Date.now() - t0, error: String(e?.message ?? e).slice(0, 500), sentFallback };
    }
  },
});
