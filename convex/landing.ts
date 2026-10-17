import { v } from "convex/values";
import { smallUrl } from "./pictures";
import { query } from "./_generated/server";
import { onShelf, weekStarts } from "./shelf";
import { isFreeRow } from "./freeTen";
import { CHIP } from "./shortNames";

// Public content for the landing page, all from the ready topics: a tappable demo of
// Public speaking chapter 1, its seven-night path, and a shelf of ready topics with cover pictures.
// The homepage demo (14 Oct, Prateek: "Give an option to see 2-3 handbooks right here. If we don't impress here, we are
// done for"): three ready handbooks whose chapter 1 opens on something most people haven't heard, one each from tech,
// money and travel. The label is the switch's name. Placeholder picks (agent) until Prateek chooses.
const DEMOS = [
  { title: "Smartphone batteries and fast charging", label: "Your phone battery" },
  { title: "Make your credit card pay you back", label: "Credit card points" },
  { title: "Know before you go: Japan", label: "A trip to Japan" },
];
// The chips under the homepage box are short names for what a person wonders about, as the C1 board draws them
// ("Volcanoes", "Public speaking"), not the handbooks' long titles (14 Oct, Prateek: "Why aren't we following it to the
// t?"). One per free handbook (CHIP, in shortNames.ts); any other ready one shows its title. Copy (agent).
const keyOf = (t: string) => t.normalize("NFKC").toLowerCase().replace(/https?:\/\/\S+/g, " ").replace(/[^\p{L}\p{M}\p{N}]+/gu, " ").trim().replace(/\s+/g, " ").slice(0, 80);   // handbooks.topicKeyOf
// The order of the "start one tonight" row under the box (Prateek, 6 Oct): timely and pop-culture topics first.
// Matched against each ready topic's name; anything not listed follows.
const FEATURED = ["odyssey", "iliad", "homer", "avengers", "marvel", "k-pop", "us stock", "abroad", "philosophy", "hold a room", "public speaking", "indian stock", "vibe coding", "swimming"];
const rank = (topic: string) => { const t = topic.toLowerCase(); const i = FEATURED.findIndex((f) => t.includes(f)); return i < 0 ? FEATURED.length : i; };

export function weekStartIST(t = Date.now()): string {
  const d = new Date(t + 5.5 * 3600000);
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  return d.toISOString().slice(0, 10);
}

export const content = query({
  args: {},
  handler: async (ctx) => {
    const url = async (id?: any) => (id ? await smallUrl(ctx, id) : null);   // D29b: the small variant when one exists
    const pictureFor = async (ch: any, card: number) => url(ch?.pictures?.find((p: any) => p.card === card)?.storageId);
    // The shelf (shelf.ts) holds one light row per ready topic, so this page never loads every full handbook (7 Oct).
    const rows = (await ctx.db.query("shelf").withIndex("by_kind", (q) => q.eq("kind", "ready")).collect()).filter((r) => r.level === "new" && onShelf(r));   // D34
    // Real numbers for the carousel pills (6 Oct): started this week, share passing chapter 1, trending, new. "This week"
    // is the last 7 India days from each row's startsByDay (18 Oct: reading the week's handbooks passed 16 MB on dev).
    const thisWeek = weekStartIST();
    const shelf = [];
    for (const r of rows) {
      shelf.push({ topic: r.title, outcome: r.outcome, cover: await url(r.cover),
        week: weekStarts(r.startsByDay), starts: r.starts, passRate: r.starts >= 3 ? r.passes / r.starts : null,
        trending: r.trendingWeek === thisWeek, addedAt: r.addedAt, mode: r.mode ?? null, free: isFreeRow(r),
        improved: !!r.improvedAt && Date.now() - r.improvedAt < 14 * 24 * 3600000 });
    }

    // The pinned ready handbooks (the owner's Pin on /admin) always sit under the homepage box, up to 4; the page fills the
    // other spots at random from the shelf to learn which topics get tapped (14 Oct).
    const pinned = rows.filter((r) => r.pick).sort((a, b) => b.passes * 10 + b.starts - (a.passes * 10 + a.starts)).slice(0, 4).map((r) => r.title);

    const demos = [];
    // If a pick is missing (taken off, or a deployment without it), ready free handbooks fill in, so the proof never vanishes.
    const fill = rows.filter((r) => isFreeRow(r) && !DEMOS.some((d) => keyOf(d.title) === keyOf(r.title))).sort((a, b) => b.passes - a.passes).map((r) => ({ title: r.title, label: r.title }));
    for (const d of [...DEMOS, ...fill]) {
      if (demos.length >= 3) break;
      const row = await ctx.db.query("cache").withIndex("by_key", (q) => q.eq("topicKey", keyOf(d.title)).eq("level", "new")).first();
      const ch = row?.chapters.find((c: any) => c.n === 1);
      if (!row || !ch) continue;
      // The whole of chapter 1, every page in full with its picture (14 Oct, Prateek: "The homepage has a chapter that is very
      // incomplete... There is absolutely no way anyone would ever sign up looking at that"; it showed each card's first
      // paragraph, six at most). Cards a page can't show here (a counter, steps, a talk) are left out; the end teases chapter 2.
      const frames: any[] = [];
      for (const [i, c] of (ch.cards ?? []).entries()) {
        if (c.type === "exercise") frames.push({ kind: "exercise", prompt: c.prompt, options: c.options, answer: c.answer, whyNot: c.whyNot ?? {} });
        else if (typeof c.body === "string" && !["watch", "move", "doit", "steps", "tryit"].includes(c.type)) frames.push({ kind: c.type, title: c.title, text: c.body.replace(/\n*\s*Next:[^\n]*$/i, "").trim(), picture: await pictureFor(ch, i) });
      }
      const next = (row.plan?.chapters ?? [])[1];
      demos.push({ topic: row.topic, label: d.label, title: ch.title, frames, total: frames.length, of: (row.plan?.chapters ?? []).length || 7, next: next ? { title: next.title as string, hook: (next.hook ?? next.covers ?? "") as string } : null });
    }
    return {
      demos,
      pinned,
      chipNames: Object.fromEntries(rows.map((r) => [r.title, CHIP[r.title] ?? r.title])),
      shelf: shelf.sort((x, y) => rank(x.topic) - rank(y.topic) || Number(!x.cover) - Number(!y.cover)),
    };
  },
});

// A story to read while a new plan is written (Prateek, 6 Oct): one "Story time" card with its picture from a
// ready handbook, so the wait is worth something and the reader can add that handbook too. The seed picks which.
// D29 (Prateek, 9 Oct 02:1x): a proper story while the handbook is written. A handbook is picked first, then one of its
// stories, so no topic dominates; never the topic the reader is waiting for. Returns every frame, the typed name, and
// what the UI needs to start that handbook with one tap (kind "ready" + topic; the UI calls the same start as the Shelf).
export const waitStory = query({
  args: { seed: v.number(), exclude: v.optional(v.string()) },
  handler: async (ctx, { seed, exclude }) => {
    const ex = (exclude ?? "").trim().toLowerCase();
    const rows = (await ctx.db.query("shelf").withIndex("by_kind", (q) => q.eq("kind", "ready")).collect())
      .filter((r) => onShelf(r) && (r.stories ?? []).length && r.title.toLowerCase() !== ex && r.topic.toLowerCase() !== ex);   // D34: a story never sells a handbook that is off the Shelf
    if (!rows.length) return null;
    const n = Math.abs(Math.floor(seed));
    // D29a: the scroll moves between genres: pick a kind first (by the plan's mode and caution), then a handbook in it, then a story.
    const kindOf = (r: any) => (r.caution && r.caution !== "none" ? "decision" : r.mode === "story" ? "story" : r.mode === "skill" ? "skill" : "subject");
    const kinds = [...new Set(rows.map(kindOf))];
    const kind = kinds[n % kinds.length];
    const inKind = rows.filter((r) => kindOf(r) === kind);
    const r = inKind[Math.floor(n / kinds.length) % inKind.length];
    const list = r.stories as any[];
    const st = list[Math.floor(n / (kinds.length * inKind.length)) % list.length];
    const frames: string[] = Array.isArray(st.frames) && st.frames.length ? st.frames : String(st.text ?? "").split(/\n\s*\n/).filter(Boolean);
    return {
      topic: r.title, key: r.key, kind: r.kind, title: st.title ?? null, frames, text: frames.join("\n\n"), source: st.source ?? null,
      chapter: st.chapter ?? "", picture: st.storageId ? await smallUrl(ctx, st.storageId) : null, pictureFull: st.storageId ? await ctx.storage.getUrl(st.storageId) : null,
      count: rows.reduce((t, x) => t + (x.stories ?? []).length, 0), handbooks: rows.length,
    };
  },
});

