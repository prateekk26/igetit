// Observability you can act on (D73, 11 Oct night; the AI Agent rubric's Observability row: "diff two runs side by side,
// alerts on failure or cost spike, search across runs"). Built on the callStats rows every AI call already writes.
// - Alerts: every 10 minutes, the last hour of readers' calls is checked for a failure spike (over 20% failed, at least
//   10 calls) or a cost spike (over ₹300 and over 3 times the typical hour of the last 7 days). An alert is a row here,
//   shown at the top of /admin until acknowledged; with ALERT_EMAIL set in the Convex env it is also emailed (mail.ts).
// - Search: handbooks by words in the topic, or by id, across any window.
// - Diff: two handbooks' runs step by step (each step and chapter: model, time, tokens, tries, ₹, failed or not).
import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import { isOwner } from "./admin";

const HOUR = 3600000;
const reader = (r: Doc<"callStats">) => !!r.handbookId && !r.kind.startsWith("eval");

export const check = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const week = await ctx.db.query("callStats").withIndex("by_at", (q) => q.gte("at", now - 7 * 24 * HOUR)).take(20000);
    const last = week.filter((r) => r.at >= now - HOUR && reader(r));
    const raised: string[] = [];
    const recent = async (kind: string) => !!(await ctx.db.query("alerts").withIndex("by_at", (q) => q.gte("at", now - HOUR)).filter((q) => q.eq(q.field("kind"), kind)).first());
    const failed = last.filter((r) => !r.ok).length;
    if (last.length >= 10 && failed / last.length > 0.2 && !(await recent("failures"))) {
      const byStep: Record<string, number> = {};
      for (const r of last) if (!r.ok) byStep[`${r.kind} on ${r.model}`] = (byStep[`${r.kind} on ${r.model}`] ?? 0) + 1;
      const worst = Object.entries(byStep).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k, n]) => `${k} ×${n}`).join(", ");
      raised.push(`failures`);
      await ctx.db.insert("alerts", { kind: "failures", at: now, message: `${failed} of ${last.length} readers' AI calls failed in the last hour (${Math.round((100 * failed) / last.length)}%). Most: ${worst}.`, value: failed / last.length, threshold: 0.2 });
    }
    const hourly: number[] = [];
    for (let h = 1; h < 7 * 24; h++) hourly.push(week.filter((r) => reader(r) && r.at < now - h * HOUR && r.at >= now - (h + 1) * HOUR).reduce((a, r) => a + r.inr, 0));
    const typical = [...hourly].sort((a, b) => a - b)[Math.floor(hourly.length / 2)] ?? 0;
    const spent = last.reduce((a, r) => a + r.inr, 0);
    const limit = Math.max(300, 3 * typical);
    if (spent > limit && !(await recent("cost"))) {
      raised.push("cost");
      await ctx.db.insert("alerts", { kind: "cost", at: now, message: `Readers' AI calls cost ₹${Math.round(spent)} in the last hour, against a typical hour of ₹${Math.round(typical)} (alert above ₹${Math.round(limit)}).`, value: spent, threshold: limit });
    }
    if (raised.length && process.env.ALERT_EMAIL) await ctx.scheduler.runAfter(0, internal.mail.sendAlert, { to: process.env.ALERT_EMAIL, kinds: raised });
    return { raised, lastHourCalls: last.length, failed, spent: Math.round(spent), typical: Math.round(typical) };
  },
});

export const open = query({
  args: {},
  handler: async (ctx) => {
    if (!(await isOwner(ctx)).ok) return null;
    const rows = await ctx.db.query("alerts").withIndex("by_at").order("desc").take(20);
    return rows.map((a) => ({ id: a._id as string, kind: a.kind, at: a.at, message: a.message, acked: !!a.ackedAt }));
  },
});

export const ack = mutation({
  args: { id: v.id("alerts") },
  handler: async (ctx, { id }) => { if (!(await isOwner(ctx)).ok) throw new Error("Owner only"); await ctx.db.patch(id, { ackedAt: Date.now() }); },
});

// Handbooks whose topic has the words (or whose id is the text), newest first, with their run totals.
export const search = query({
  args: { text: v.string(), days: v.number() },
  handler: async (ctx, { text, days }) => {
    if (!(await isOwner(ctx)).ok) return null;
    const words = text.toLowerCase().split(/\s+/).filter(Boolean);
    if (!words.length) return [];
    const byId = ctx.db.normalizeId("handbooks", text.trim());
    const pool: Doc<"handbooks">[] = byId ? [(await ctx.db.get(byId))!].filter(Boolean) : await ctx.db.query("handbooks").order("desc").take(3000);
    const since = days ? Date.now() - days * 24 * HOUR : 0;
    const hits = pool.filter((h) => h.createdAt >= since && (byId || words.every((w) => `${h.plan?.topic ?? ""} ${h.topic}`.toLowerCase().includes(w)))).slice(0, 30);
    const out = [];
    for (const h of hits) {
      const rs = await ctx.db.query("callStats").withIndex("by_handbook", (q) => q.eq("handbookId", h._id)).take(500);
      out.push({ id: h._id as string, topic: String(h.plan?.topic ?? h.topic).slice(0, 80), createdAt: h.createdAt, status: h.status, calls: rs.length, failed: rs.filter((r) => !r.ok).length, inr: rs.reduce((a, r) => a + r.inr, 0), ms: rs.reduce((a, r) => a + r.ms, 0) });
    }
    return out;
  },
});

// Two runs side by side: one row per step (research, plan, chapter N, check N, ...), the calls of each run in it.
export const diff = query({
  args: { a: v.id("handbooks"), b: v.id("handbooks") },
  handler: async (ctx, { a, b }) => {
    if (!(await isOwner(ctx)).ok) return null;
    const load = async (id: Id<"handbooks">) => {
      const h = await ctx.db.get(id);
      const rs = (await ctx.db.query("callStats").withIndex("by_handbook", (q) => q.eq("handbookId", id)).take(500)).sort((x, y) => x.at - y.at);
      return { topic: String(h?.plan?.topic ?? h?.topic ?? "?").slice(0, 80), createdAt: h?.createdAt ?? 0, rows: rs };
    };
    const [A, B] = await Promise.all([load(a), load(b)]);
    const key = (r: Doc<"callStats">) => `${r.chapter ? `ch${String(r.chapter).padStart(2, "0")} ` : "00 "}${r.kind}`;
    const keys = [...new Set([...A.rows, ...B.rows].map(key))].sort();
    const cell = (rs: Doc<"callStats">[]) => rs.length ? { models: [...new Set(rs.map((r) => r.model))].join(", "), calls: rs.length, failed: rs.filter((r) => !r.ok).length, tries: rs.reduce((s, r) => s + (r.attempts ?? 1), 0), ms: rs.reduce((s, r) => s + r.ms, 0), tokensIn: rs.reduce((s, r) => s + r.tokensIn, 0), tokensOut: rs.reduce((s, r) => s + r.tokensOut, 0), inr: rs.reduce((s, r) => s + r.inr, 0) } : null;
    const scoresOf = async (id: Id<"handbooks">) => (await ctx.db.query("scores").withIndex("by_handbook_n", (q) => q.eq("handbookId", id)).collect()).map((s) => ({ n: s.n, lever: s.lever, level: s.level }));
    return {
      a: { topic: A.topic, createdAt: A.createdAt, scores: await scoresOf(a) }, b: { topic: B.topic, createdAt: B.createdAt, scores: await scoresOf(b) },
      steps: keys.map((k) => ({ step: k.replace(/^00 /, "").replace(/^ch0?(\d+) (.*)$/, "$2 · chapter $1"), a: cell(A.rows.filter((r) => key(r) === k)), b: cell(B.rows.filter((r) => key(r) === k)) })),
    };
  },
});
