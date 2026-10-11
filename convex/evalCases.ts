// The closed loop of the eval set (D72, 11 Oct; docs/evals/advanced.md, "Watch it live"): a chapter that scored low on
// /admin becomes a "fix next" case with one tap, stored here; scripts/eval-run.mjs merges these with evals/cases.json
// and runs them before every release. Only the typed line, level, goal and mode are kept: never a reader's identity.
import { v } from "convex/values";
import { internalQuery, mutation, query } from "./_generated/server";
import { isOwner } from "./admin";
import { LEVERS } from "./rubric";

export const list = internalQuery({
  args: {},
  handler: async (ctx) => (await ctx.db.query("evalCases").collect()).map(({ _id, _creationTime, ...c }) => c),
});

export const forAdmin = query({
  args: {},
  handler: async (ctx) => {
    if (!(await isOwner(ctx)).ok) return null;
    return (await ctx.db.query("evalCases").collect()).sort((a, b) => b.createdAt - a.createdAt).map((c) => ({ id: c._id as string, name: c.name, list: c.list, topic: c.topic, expect: c.expect, source: c.source, note: c.note ?? null, at: c.createdAt }));
  },
});

// From a low score on /admin: the handbook's typed line and goal, expected to reach 4 on the lever that scored low.
export const addFromScore = mutation({
  args: { handbookId: v.id("handbooks"), n: v.number(), lever: v.string(), note: v.optional(v.string()) },
  handler: async (ctx, { handbookId, n, lever, note }) => {
    if (!(await isOwner(ctx)).ok) throw new Error("Owner only");
    if (!(lever in LEVERS)) throw new Error("Unknown lever");
    const h: any = await ctx.db.get(handbookId);
    if (!h) throw new Error("No such handbook");
    const topic = String(h.topic ?? "").slice(0, 200);
    const name = `live-${topic.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 30)}-${lever}`;
    if (await ctx.db.query("evalCases").withIndex("by_name", (q) => q.eq("name", name)).first()) return { name, existed: true };
    await ctx.db.insert("evalCases", {
      name, list: "fix", topic, level: h.level === "some" ? "some" : "new", ...(h.goal ? { goal: String(h.goal).slice(0, 200) } : {}), ...(h.mode ? { mode: h.mode } : {}),
      expect: { [lever]: 4 }, source: `live:${handbookId}#${n}`, ...(note ? { note: note.slice(0, 300) } : {}), createdAt: Date.now(),
    });
    return { name, existed: false };
  },
});

export const remove = mutation({
  args: { id: v.id("evalCases") },
  handler: async (ctx, { id }) => { if (!(await isOwner(ctx)).ok) throw new Error("Owner only"); await ctx.db.delete(id); },
});
