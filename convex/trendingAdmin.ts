import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { isOwner } from "./admin";
import { weekStartIST } from "./landing";

// D39: the owner's side of trending topics (trending.ts runs in Node for the search and cannot hold mutations or queries):
// the found topics parked for /admin, "Build it" for one of them, and "Find this week's topics now".
const KEY = "trending:candidates";
export const remember = internalMutation({
  args: { week: v.string(), picks: v.array(v.any()) },
  handler: async (ctx, { week, picks }) => {
    const row = await ctx.db.query("settings").withIndex("by_key", (q) => q.eq("key", KEY)).unique();
    const value = JSON.stringify({ week, at: Date.now(), picks });
    if (row) await ctx.db.patch(row._id, { value, at: Date.now() }); else await ctx.db.insert("settings", { key: KEY, value, at: Date.now() });
  },
});
// /admin: this week's found topics, with what happened to each.
export const candidates = query({
  args: {},
  handler: async (ctx) => {
    if (!(await isOwner(ctx)).ok) return null;
    const row = await ctx.db.query("settings").withIndex("by_key", (q) => q.eq("key", KEY)).unique();
    if (!row) return { week: null, at: null, picks: [] as any[] };
    try { return JSON.parse(row.value); } catch { return { week: null, at: null, picks: [] as any[] }; }
  },
});
// "Build it": one found topic becomes a ready handbook on the Shelf (plan, 7 checked chapters, pictures; about ₹100).
export const buildOne = mutation({
  args: { line: v.string(), goal: v.optional(v.string()), mode: v.optional(v.string()) },
  handler: async (ctx, { line, goal, mode }) => {
    if (!(await isOwner(ctx)).ok) throw new Error("Owner only");
    const topic = line.trim().slice(0, 120); if (topic.length < 3) throw new Error("A topic, please");
    await ctx.scheduler.runAfter(0, internal.ready.build, { topic, goal: goal?.trim().slice(0, 120) || undefined, mode: ["skill", "story", "subject"].includes(mode ?? "") ? mode : undefined, trendingWeek: weekStartIST(), aliases: [] });
    const row = await ctx.db.query("settings").withIndex("by_key", (q) => q.eq("key", KEY)).unique();
    if (row) { try { const d = JSON.parse(row.value); d.picks = (d.picks ?? []).map((p: any) => (p.line === topic ? { ...p, state: "building", startedAt: Date.now() } : p)); await ctx.db.patch(row._id, { value: JSON.stringify(d) }); } catch {} }
    return { ok: true };
  },
});
export const findNow = mutation({ args: {}, handler: async (ctx) => { if (!(await isOwner(ctx)).ok) throw new Error("Owner only"); await ctx.scheduler.runAfter(0, internal.trending.suggest, {}); } });
