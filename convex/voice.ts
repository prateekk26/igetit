import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";
import { RateLimiter, HOUR, MINUTE, DAY } from "@convex-dev/rate-limiter";
import { components } from "./_generated/api";
import { ownedHandbook } from "./handbooks";
import { COST_INR, ownerIsMember, spendFits } from "./membership";

// Read it to me (15 Oct, Prateek: "we want a female voice to read out with emotions and intonation"). The page's own words
// go to Gemini's speech model and come back as audio, kept per exact text (pageAudio), so a page is paid for once. Only
// words from the reader's own chapter (or the one before, for "Last time") can be read: anything else is refused, so the
// voice can't be used to read arbitrary text on our bill.
export const VOICE = "Sulafat";   // a warm female voice (agent's pick)
export const VOICE_VERSION = "v3";   // v2 (15 Oct): bracket tags instead of a spoken direction; v3: WAV header and label no longer played

const limiter = new RateLimiter(components.rateLimiter, {
  voiceOwner: { kind: "fixed window", rate: 240, period: HOUR },
  voiceAll: { kind: "fixed window", rate: 4000, period: HOUR },
  // Preloading (15 Oct, Prateek: "Let's use up 50 of them"): Gemini's speech model allows our project 100 new clips a day
  // and 10 a minute on Tier 1 (AI Studio). Pages voiced ahead of time get at most 50 a day and 5 a minute across the
  // app, so a reader who presses play still has the rest. A play is never counted here.
  voicePreloadDay: { kind: "fixed window", rate: 50, period: DAY },
  voicePreloadMinute: { kind: "fixed window", rate: 5, period: MINUTE },
});

export const cached = internalQuery({
  args: { key: v.string() },
  handler: async (ctx, { key }) => {
    const row = await ctx.db.query("pageAudio").withIndex("by_key", (q) => q.eq("key", key)).first();
    return row ? { url: await ctx.storage.getUrl(row.storageId), ms: row.ms } : null;
  },
});

export const save = internalMutation({
  args: { key: v.string(), storageId: v.id("_storage"), ms: v.number(), chars: v.number() },
  handler: async (ctx, a) => {
    const had = await ctx.db.query("pageAudio").withIndex("by_key", (q) => q.eq("key", a.key)).first();
    if (had) { await ctx.storage.delete(a.storageId); return; }
    await ctx.db.insert("pageAudio", { ...a, at: Date.now() });
  },
});

const norm = (s: string) => s.toLowerCase().normalize("NFKC").replace(/[*_`#>]/g, "").replace(/[^\p{L}\p{N}]+/gu, " ").trim();
function strings(x: any, out: string[] = []): string[] {
  if (typeof x === "string") out.push(x);
  else if (Array.isArray(x)) for (const y of x) strings(y, out);
  else if (x && typeof x === "object") for (const y of Object.values(x)) strings(y, out);
  return out;
}

// Before a page is spoken for the first time: the owner's, every part from their chapter, within the hourly caps and,
// for a free reader, within the day's budget.
export const gate = internalMutation({
  args: { handbookId: v.id("handbooks"), chapter: v.number(), parts: v.array(v.string()), deviceToken: v.optional(v.string()), preload: v.optional(v.boolean()) },
  handler: async (ctx, { handbookId, chapter, parts, deviceToken, preload }): Promise<{ ok: true } | { ok: false; code: string }> => {
    const h = await ownedHandbook(ctx, handbookId, deviceToken);
    const chs = await Promise.all([chapter, chapter - 1].map((n) => ctx.db.query("chapters").withIndex("by_handbook_n", (q) => q.eq("handbookId", handbookId).eq("n", n)).unique()));
    const corpus = norm(strings([chs.map((c) => [c?.title, c?.cards, (c as any)?.recallCards, (c as any)?.quizTiers, (c as any)?.recallTiers]), (h.plan as any)?.chapters, h.topic]).join(" \u0000 "));
    for (const p of parts) if (norm(p) && !corpus.includes(norm(p))) return { ok: false, code: "not-on-page" };
    const key = String(h.userId ?? h.ownerToken ?? h._id);
    if (preload && (!(await limiter.check(ctx, "voicePreloadMinute")).ok || !(await limiter.check(ctx, "voicePreloadDay")).ok)) return { ok: false, code: "preload-cap" };
    if (!(await limiter.limit(ctx, "voiceOwner", { key })).ok || !(await limiter.limit(ctx, "voiceAll")).ok) return { ok: false, code: "busy" };
    if (!(await ownerIsMember(ctx, h)) && !(await spendFits(ctx, COST_INR.voice))) return { ok: false, code: "paused-today" };
    if (preload) { await limiter.limit(ctx, "voicePreloadMinute"); await limiter.limit(ctx, "voicePreloadDay"); }
    return { ok: true };
  },
});
