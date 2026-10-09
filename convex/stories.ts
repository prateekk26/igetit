import { v } from "convex/values";
import { internalAction, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { factCheck } from "./handbooks";

// D29 (Prateek, 9 Oct 02:1x: "a proper story that usually people would not have heard"): every ready handbook gets three
// true, little-known stories written once, from its own chapters and sources (nothing invented), checked by the same fact
// check as a chapter, and kept on its cache row (waitStories) so the Shelf's syncReady carries them to the wait screen.
// Picture: the handbook's own chapter pictures (one per story), never a new draw. About ₹3 a story on Opus medium.
// Build all: npx convex run --prod stories:buildAll '{}'   One: npx convex run --prod stories:buildFor '{"topic":"Chess"}'
// D29f (Prateek, 9 Oct 11:3x: "these are different ways of telling a story. We can keep on creating these kinds of personas and
// use the one that fits best"): one entry per storyteller, each learned from reels he sent (DESIGN.md 2b, 2c, 2d). Add a
// storyteller here, with its own name in the JSON "voice" field; the prompt lists them all. Copy (agent).
export const PERSONAS: { key: string; name: string; from: string; rules: string }[] = [
  { key: "explainer", name: "The Explainer", from: "Masala Lab, 'The Malabar parota is not from Malabar' (D29c)", rules:
    "A hidden cause behind a familiar thing from this handbook's world: a name, a habit, a rule, a dish, a number everyone uses; never a biography, never a list. In order, one frame each unless noted: (1) the contradiction, one sentence stating as false a thing the reader thinks they know; (2) the stakes, with a number; (3) the anchor, something the reader already knows, named, then 'What you might not know is…'; (4 to 6) the chain of consequences, each frame one link joined by because and so, with a date, a place and a number in each; (7) one named expert or source with one specific claim, in your own words, never a quote; (8) the widening, where it went next; (9) back to the contradiction, answered in one plain sentence, then one warm last line that gives the reader back the thing they love ('And it's delicious anyway'). Second person where it helps." },
  { key: "narrator", name: "The Narrator", from: "Arvind Vijay Mohan, the photograph a soldier carried for 33 years; the principal who lost his job for a boy's seat (D29d)", rules:
    "One real person, one object, one moment; only people the material names, only what it says they did (an invented person means this is the wrong storyteller). Past tense, measured, no jokes. (1) The cold open, one sentence holding a person, a number and a charge, withholding the how ('He was 18, and the man he had just shot had a daughter.'); (2) the stamp, a date and a place in under ten words, then the scene in short sentences with one physical detail you can see; (3) the person, by one habit or act that shows who they are, never an adjective ('on Fridays he wore ridiculous trousers so that kids would stop and talk to him'); (4 to 7) an object or a decision that travels across time (a photograph, a letter, a rule), each frame one jump with its date said plainly, each jump raising the cost; at least two frames end on a turn line of two to five words that reverses the sentence before ('He thought he was finally free. He wasn't.'); (8) the resolution with its own number or date; (9) the last line mirrors the first with the thing turned round ('the man who had taken her father from her was the one holding her while she cried')." },
  { key: "friend", name: "The Friend", from: "Ray William Johnson, the Star Wars Kid; the PTA mother framed with planted drugs (D29e)", rules:
    "A true story with someone to root for and a chain of blows, told across a table. Present tense once the scene starts ('So he records a few takes… and he leaves the tape at school'), in sentences a person would say; a person is tagged on first mention in one clause ('this guy, Mark. Mark is an eye doctor, and he is very rich'), then acts. (1) the open names what is about to happen without the how ('So this woman is about to try to ruin another woman's life'); (2 to 3) the setup, who and where, one habit each; (4 to 7) the ladder, each attempt or blow bigger than the last, with a refrain on the thing that will not move ('She prints flyers. Still not fired. She goes to the superintendent. Still not fired.'); once, a cliff question right before a reveal ('and guess what they find?'), answered in the next frame's first words; one dry aside at most, in the teller's voice, never at the expense of the handbook's subject; (8) the reckoning, with its number; (9) the verdict, the teller's own in plain words ('Good for him.'), as the last line." },
];
const PERSONA_TEXT = PERSONAS.map((p, i) => `${i + 1}. ${p.name} (learned from ${p.from}). ${p.rules}`).join("\n\n");

export const STORY_PROMPT = `You write up to four short true stories for people waiting a minute while their own handbook is written (the best three are kept after a fact check). Each is a TEASER STORY, never a summary: the kind of thing a friend tells you and you say "wait, what?"

STORYTELLERS. Each story is told by one of the storytellers below, whole, never a blend (D29f). Pick the one the material fits: a hidden cause behind a familiar thing wants the Explainer; a real named person and a real moment want the Narrator; a chain of blows that keeps escalating, with someone to root for, wants the Friend. The three stories of one handbook should come from at least two different storytellers unless the material only holds one. Say which one you used in "voice".

${PERSONA_TEXT}

RULES FOR EVERY STORYTELLER. 6 to 9 frames, 40 to 60 words each; every frame pushes forward, none restates. Every frame opens with a BEAT, two to four words in bold as its own sentence, the caption a storyteller would put on screen ('**Richard fired.**', '**No explosion.**', '**Still not fired.**'); the beat is the frame's turn, not its topic. Sentences of 8 to 14 words with beats of 2 to 5 between; one specific sensory detail per frame; no adjective doing the work a fact could do. Never a swear word, never a slur, never a joke about a body or an illness. The last frame also names the handbook chapter it points at, as a sentence, never a label: "That's chapter 2, The fire spreads." never "Chapter: The fire spreads."

Numbers: an invented person may want, do and decide, but never carries a number. Every number in the story comes from the handbook's facts, its chapter cards or the named source.

Truth: only events, names, numbers and dates that the handbook's chapters, its research facts or a source you can name support. You may use well-established history you can cite by name (a standard reference, an official body, a well-known book), and you name it. If you are not sure of a detail, leave it out. Never invent a person, a quote, a number or a date.

Variety: the three stories come from three DIFFERENT chapters of the handbook, not three retellings of the cover fact. Pick the three most surprising true moments the material holds. If the material has fewer, write fewer, or none.

Return JSON only (up to four stories): {"stories":[{"title":"<the first line's hook, under 10 words>","voice":"explainer|narrator|friend","chapter":"<the chapter it points at>","frames":["...","...","...","...","...","..."],"source":"<the named expert or source>"}]}`;

export const readReady = internalQuery({
  args: { topic: v.string() },
  handler: async (ctx, { topic }) => {
    const rows = await ctx.db.query("cache").withIndex("by_topic", (q) => q.eq("topic", topic)).collect();
    const r: any = rows.find((x) => x.level === "new") ?? rows[0];
    if (!r) return null;
    const text = (r.chapters as any[]).map((ch: any) => `## ${ch.title ?? `Chapter ${ch.n}`}\n` + (ch.cards ?? []).filter((c: any) => typeof c?.body === "string").map((c: any) => c.body).join("\n\n")).join("\n\n").slice(0, 16000);
    const pictures: string[] = [];
    for (const ch of r.chapters as any[]) for (const p of (ch.pictures ?? []) as any[]) if (p.storageId && !pictures.includes(p.storageId)) pictures.push(p.storageId);
    return { id: r._id, topic: r.topic, plan: r.plan, text, pictures, have: Array.isArray(r.waitStories) ? r.waitStories.length : 0 };
  },
});
export const save = internalMutation({
  args: { id: v.id("cache"), topic: v.string(), stories: v.any() },
  handler: async (ctx, { id, topic, stories }) => { await ctx.db.patch(id, { waitStories: stories }); await ctx.scheduler.runAfter(0, internal.shelf.syncReadyTopic, { topic }); },
});
export const buildFor = internalAction({
  args: { topic: v.string(), force: v.optional(v.boolean()) },
  handler: async (ctx, { topic, force }): Promise<any> => {
    const r: any = await ctx.runQuery(internal.stories.readReady, { topic });
    if (!r) return { ok: false, error: "no ready handbook with that topic" };
    if (r.have && !force) return { ok: true, skipped: "already has stories" };
    const sources = (r.plan?.sources ?? []).map((s: any) => `- ${s.who}: ${s.what}`).join("\n");
    const user = `Handbook: ${r.topic}\nOutcome: ${r.plan?.outcome7 ?? ""}\nListed sources:\n${sources || "(none)"}\n\nChapters:\n${r.text}\n\nWrite the three stories.`;
    const g: any = await ctx.runAction(internal.ai.generate, { kind: "stories", system: STORY_PROMPT, user, logAs: "stories" });
    if (!g.ok) return { ok: false, error: g.error };
    const raw: any[] = (g.json?.stories ?? []).filter((s: any) => Array.isArray(s?.frames) && s.frames.length >= 3).slice(0, 4);
    // The same fact check as a chapter, frame by frame (each frame as a teach card); a corrected frame replaces its original.
    const cards = raw.flatMap((s: any) => s.frames.map((f: string) => ({ type: "teach", title: s.title, body: f })));
    // Level "some": the check's beginner-term rule (explain every term of art) is not a truth test; only false claims count.
    // The check sees the handbook's own chapters, so a name or a number in a story can be matched to the cards it came from.
    const checked = await factCheck(ctx, r.topic, "some", "Wait stories", cards, { effort: "low", reference: r.text.slice(0, 12000) });
    let k = 0;
    // D29a: a story with a claim the check could not stand behind is dropped, never softened. The check's own notes say
    // when a claim is false or unsupported ("not true", "no evidence", "not established", "invented"…); a note that only
    // confirms or rewords ("correct", "no change needed") keeps the story as written.
    const BAD = /\b(false|not true|untrue|incorrect|wrong|no evidence|not established|unsupported|cannot be verified|unverified|invented|made up|fabricated|did not happen|never happened|misattribut|no record)\b/i;
    const badIdx = new Set((checked.report.notes ?? []).filter((x: string) => BAD.test(String(x)) && !/no false claim|no change needed|is (accurate|correct|true)/i.test(String(x))).map((x: string) => Number(String(x).match(/card (\d+)/)?.[1])).filter((x: number) => Number.isInteger(x)));
    const stories: any[] = [];
    raw.forEach((s: any, i: number) => {
      const start = k; k += s.frames.length;
      const frames = s.frames.map((f: string) => String(f)).filter(Boolean);   // the original words, never the softened ones
      const bad = Array.from({ length: s.frames.length }, (_, j) => start + j).some((idx) => badIdx.has(idx));
      if (bad || frames.length < 4) return;
      stories.push({ title: String(s.title).slice(0, 80), voice: ["explainer", "narrator", "friend"].includes(s.voice) ? s.voice : undefined, chapter: String(s.chapter ?? "").slice(0, 120), frames, source: String(s.source ?? "").slice(0, 120), storageId: r.pictures[i % Math.max(1, r.pictures.length)] ?? undefined });
    });
    stories.splice(3);   // the best three stay (the writer gave up to four)
    await ctx.runMutation(internal.stories.save, { id: r.id, topic: r.topic, stories });
    return { ok: true, stories: stories.map((s: any) => ({ title: s.title, voice: s.voice, chapter: s.chapter, frames: s.frames, source: s.source })), dropped: raw.length - stories.length, fixes: checked.report.fixes, notes: checked.report.notes, candidates: raw.map((s: any) => ({ title: s.title, chapter: s.chapter, frames: s.frames, source: s.source })) };
  },
});
export const readyTopics = internalQuery({ args: {}, handler: async (ctx) => [...new Set((await ctx.db.query("cache").collect()).filter((r) => r.level === "new").map((r) => r.topic))] });
export const buildAll = internalAction({
  args: { topics: v.optional(v.array(v.string())), done: v.optional(v.number()), force: v.optional(v.boolean()) },
  handler: async (ctx, { topics, done = 0, force }): Promise<void> => {
    // Hold switch (dc, 9 Oct): a settings row "stories:hold" stops the chain between topics.
    const hold: string | null = await ctx.runQuery(internal.repairData.shrunkFor, { from: "stories:hold" });
    if (hold) { console.log("stories: held"); return; }
    const list: string[] = topics ?? (await ctx.runQuery(internal.stories.readyTopics, {}));
    const [head, ...rest] = list;
    if (!head) { console.log(`stories: ${done} topics done`); return; }
    const r = await ctx.runAction(internal.stories.buildFor, { topic: head, force }).catch((e: any) => ({ ok: false, error: String(e?.message ?? e) }));
    console.log("stories", head, JSON.stringify(r).slice(0, 200));
    await ctx.scheduler.runAfter(0, internal.stories.buildAll, { topics: rest, done: done + 1, force });
  },
});
