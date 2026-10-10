import { v } from "convex/values";
import { query } from "./_generated/server";

// PostHog for the visitors row of the sprint's Virality rubric (11 Oct, Prateek: "Let's get it up"): the rubric counts
// unique visitors only from PostHog, Plausible, GA4 or Datafast with read-only access, else caps the row at L2. Page views
// only (no autocapture, no recordings), set up in src/main.tsx. The project key is public by design (it ships to every
// browser), but it lives in Convex env, not in code or a VITE_ variable:
//   npx convex env set POSTHOG_KEY phc_... --prod      npx convex env set POSTHOG_HOST https://us.i.posthog.com --prod
// Phones marked as ours (statsExcluded) get nothing, so PostHog counts the same people /stats does.
export const config = query({
  args: { deviceToken: v.string() },
  handler: async (ctx, { deviceToken }) => {
    const key = process.env.POSTHOG_KEY;
    if (!key || deviceToken.length < 8 || deviceToken.length > 64) return null;
    const ours = await ctx.db.query("statsExcluded").filter((q) => q.eq(q.field("deviceToken"), deviceToken)).first();
    if (ours) return null;
    return { key, host: process.env.POSTHOG_HOST ?? "https://us.i.posthog.com" };
  },
});
