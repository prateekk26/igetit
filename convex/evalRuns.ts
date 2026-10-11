// The Evals tab on /admin (D82, 11 Oct; Prateek: "a separate section on the dashboard called evals. Design it well").
// record: scripts/eval-run.mjs sends each run's summary here (npx convex run --prod evalRuns:record), so the last test
// run shows on prod although the runs themselves happen on dev. overview: the strip at the top of the tab, each lever's
// share of chapters at L4 or L5 this week against last week, and how far the owner is with checking the scorer.
import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { isOwner } from "./admin";
import { LEVERS, RUBRIC_VERSION } from "./rubric";

const WEEK = 7 * 86400000;
export const CHECK_GOAL = 30; // Advanced evals: about 30 chapters, a mix of good and bad, before trusting the scorer

const caseRow = v.object({
  name: v.string(), list: v.string(), floorHeld: v.boolean(), passes: v.number(), runs: v.number(), errored: v.boolean(),
  levels: v.array(v.any()), floor: v.any(), expect: v.any(), failedChecks: v.array(v.string()), before: v.union(v.boolean(), v.null()),
});

export const record = internalMutation({
  args: { stamp: v.string(), at: v.number(), rubric: v.string(), runs: v.number(), full: v.boolean(), inr: v.number(), cases: v.array(caseRow), baseline: v.optional(v.boolean()) },
  handler: async (ctx, { baseline, ...a }) => {
    const old = await ctx.db.query("evalRuns").withIndex("by_stamp", (q) => q.eq("stamp", a.stamp)).unique();
    // The baseline run (11 Oct) came before floors existed; the floors were set from it, so it is not a gate result.
    const row = { ...a, gate: (baseline ? "baseline" : a.cases.every((c) => c.floorHeld) ? "pass" : "fail") as "pass" | "fail" | "baseline" };
    if (old) await ctx.db.replace(old._id, row); else await ctx.db.insert("evalRuns", row);
    return row.gate;
  },
});

export const overview = query({
  args: {},
  handler: async (ctx) => {
    if (!(await isOwner(ctx)).ok) return null;
    const now = Date.now();
    const rows = await ctx.db.query("scores").withIndex("by_at", (q) => q.gt("at", now - 2 * WEEK)).collect();
    const levers = Object.entries(LEVERS).map(([k, L]) => {
      const share = (from: number, to: number) => {
        const r = rows.filter((x) => x.lever === k && x.level !== null && x.at > from && x.at <= to);
        return r.length ? { good: r.filter((x) => x.level! >= 4).length, of: r.length } : null;
      };
      return { lever: k, name: L.name, now: share(now - WEEK, now), before: share(now - 2 * WEEK, now - WEEK) };
    });
    const id = await getAuthUserId(ctx);
    const me: any = id ? await ctx.db.get(id) : null;
    const mine = (await ctx.db.query("humanScores").collect()).filter((h) => h.by === me?.email);
    const runs = await ctx.db.query("evalRuns").withIndex("by_at").order("desc").take(10);
    const last = runs.find((r) => r.full) ?? runs[0] ?? null;
    return {
      rubric: RUBRIC_VERSION, levers,
      checked: new Set(mine.map((h) => `${h.handbookId}#${h.n}`)).size, goal: CHECK_GOAL,
      last: last && { stamp: last.stamp, at: last.at, rubric: last.rubric, runs: last.runs, full: last.full, gate: last.gate, inr: last.inr, cases: last.cases },
      earlier: runs.filter((r) => r._id !== last?._id).map((r) => ({ stamp: r.stamp, at: r.at, runs: r.runs, full: r.full, gate: r.gate, cases: r.cases.length, held: r.cases.filter((c) => c.floorHeld).length })),
    };
  },
});
