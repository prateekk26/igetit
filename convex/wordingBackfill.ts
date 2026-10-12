// D90 follow-up (12 Oct, Prateek: "Rewrite at the source"): chapters written before the wording step still say "wrong" or
// "incorrect", in the ready topics' stored chapters (cache) and in readers' copies of them. Deleting a copy brings it back
// from the cache, so the fix is a rewrite of both. The local run groups identical cards, calls rewrite (no save) for a
// dry run, then saves with setCacheCards and showcase:setCards. Needs WORDING_STEP=on where it runs.
import { v } from "convex/values";
import { internalAction, internalMutation } from "./_generated/server";
import { cleanWording } from "./handbooks";

export const rewrite = internalAction({
  args: { cards: v.array(v.any()) },
  handler: async (ctx, { cards }) => cleanWording(ctx, cards),
});

// One stored chapter's cards; the cache version is left alone, so no reader's copy is swapped by it.
export const setCacheCards = internalMutation({
  args: { cacheId: v.id("cache"), n: v.number(), cards: v.array(v.any()) },
  handler: async (ctx, { cacheId, n, cards }) => {
    const row = await ctx.db.get(cacheId);
    if (!row) throw new Error("No such cache row");
    await ctx.db.patch(cacheId, { chapters: row.chapters.map((c: any) => (c?.n === n ? { ...c, cards } : c)) });
  },
});
