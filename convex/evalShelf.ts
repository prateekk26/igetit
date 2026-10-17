import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { shelfReview } from "./library";

// The Shelf review on a copy of a shared row (17 Oct, D120), saving nothing: scripts/shelf-compare.mjs feeds it prod rows
// Prateek approved or rejected by hand, to see whether its verdicts point the same way. Dev only.
export const run = internalAction({
  args: { plan: v.any(), chapter1: v.any(), facts: v.union(v.string(), v.null()) },
  handler: async (ctx, { plan, chapter1, facts }): Promise<any> => {
    const out = await shelfReview(ctx, { plan, ch: chapter1, facts }, [], {});
    return { review: out.review, line: out.judge.verdict?.line, reviewWhy: out.reviewWhy ?? null, fixes: out.fixes, truth: out.judge.verdict?.truth, delivers: out.judge.verdict?.delivers, dubious: out.judge.dubious ?? [] };
  },
});
