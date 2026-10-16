// Level check (16 Oct, Prateek: "let the users take a small survey to assess their level first. Of course keep it
// optional and make them aware that it will be a course for a complete beginner"). Typed handbooks only: it lives on
// the goal screen (status "intent"), which ready and shared handbooks never show. Three questions, written once per
// handbook (at most 2 model calls), scored in handbooks.chooseIntent; the right answers never reach the phone.
import { ConvexError, v } from "convex/values";
import { action, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { ownedHandbook } from "./handbooks";
import { LEVEL_CHECK_PROMPT, levelCheckUserMessage } from "./prompts";

const MAX_TRIES = 2;
type Question = { idea: string; q: string; options: string[]; answer: number };
type Shown = { idea: string; q: string; options: string[] };
const shown = (qs: Question[]): Shown[] => qs.map(({ idea, q, options }) => ({ idea, q, options }));

// Three usable questions or nothing: each with an idea, a question and 3 options, the answer a valid index.
function usable(json: any): Question[] | null {
  const qs = Array.isArray(json?.questions) ? json.questions : [];
  const out: Question[] = [];
  for (const x of qs) {
    const options = Array.isArray(x?.options) ? x.options.filter((o: any) => typeof o === "string" && o.trim()).map((o: string) => o.trim().slice(0, 80)) : [];
    if (typeof x?.q !== "string" || !x.q.trim() || options.length !== 3 || !Number.isInteger(x?.answer) || x.answer < 0 || x.answer > 2) continue;
    out.push({ idea: String(x.idea ?? "").trim().slice(0, 50) || x.q.trim().slice(0, 50), q: x.q.trim().slice(0, 140), options, answer: x.answer });
  }
  return out.length >= 3 ? out.slice(0, 3) : null;
}

// The reader's own handbook, still on the goal screen. Returns the stored questions, or claims one model call.
export const claim = internalMutation({
  args: { handbookId: v.id("handbooks"), deviceToken: v.optional(v.string()) },
  handler: async (ctx, { handbookId, deviceToken }): Promise<{ questions: Shown[] } | { go: true; topic: string; goal?: string } | { no: string }> => {
    const h = await ownedHandbook(ctx, handbookId, deviceToken);
    if (h.status !== "intent") return { no: "gone" };
    if (h.levelQuiz?.questions) return { questions: shown(h.levelQuiz.questions) };
    const tries = h.levelQuizTries ?? 0;
    if (tries >= MAX_TRIES) return { no: "tries" };
    await ctx.db.patch(handbookId, { levelQuizTries: tries + 1 });
    return { go: true, topic: h.topic };
  },
});

export const save = internalMutation({
  args: { handbookId: v.id("handbooks"), questions: v.any() },
  handler: async (ctx, { handbookId, questions }) => {
    const h = await ctx.db.get(handbookId);
    if (h?.status === "intent" && !h.levelQuiz) await ctx.db.patch(handbookId, { levelQuiz: { questions } });
  },
});

// The phone asks for the questions when the reader taps "Check my level". goal: the row they picked, if any.
export const questions = action({
  args: { handbookId: v.id("handbooks"), deviceToken: v.optional(v.string()), goal: v.optional(v.string()) },
  handler: async (ctx, { handbookId, deviceToken, goal }): Promise<{ questions: Shown[] }> => {
    const c: any = await ctx.runMutation(internal.levelCheck.claim, { handbookId, deviceToken });
    if (c.questions) return { questions: c.questions };
    if (!c.go) throw new ConvexError({ code: "level-check", message: "Couldn't make the questions just now. Pick Yes or Not really instead." });
    const r: any = await ctx.runAction(internal.ai.generate, { kind: "levelcheck", system: LEVEL_CHECK_PROMPT, user: levelCheckUserMessage(c.topic, goal?.trim().slice(0, 120) || undefined), trace: { handbookId } });
    const qs = r.ok ? usable(r.json) : null;
    if (!qs) throw new ConvexError({ code: "level-check", message: "Couldn't make the questions just now. Try once more, or pick Yes or Not really." });
    await ctx.runMutation(internal.levelCheck.save, { handbookId, questions: qs });
    return { questions: shown(qs) };
  },
});

// Scored when the reader taps "Make my book" (handbooks.chooseIntent). picks: the option index per question, -1 for
// "Not sure". Two or more right means they know some; every miss is passed on as a gap.
export function scoreLevelCheck(quiz: { questions: Question[] } | undefined, picks: number[] | undefined) {
  if (!quiz?.questions?.length || !picks || picks.length !== quiz.questions.length) return null;
  const knows: string[] = [], gaps: string[] = [];
  quiz.questions.forEach((q, i) => (picks[i] === q.answer ? knows : gaps).push(q.idea));
  return { right: knows.length, of: quiz.questions.length, knows, gaps, level: knows.length >= 2 ? ("some" as const) : ("new" as const) };
}
