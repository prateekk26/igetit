// The Shelf judge, direct from Anthropic against Cheaper Inference (19 Oct). Dev only. Two parts:
//  A. agreement: the 7 latest chapter 1s on dev, judged by Anthropic twice (how much Opus differs from itself) and by
//     Cheaper Inference once; compares the score out of 12, each check and the doubtful claims.
//  B. accuracy: chapter 1 of "Indian stock market basics" with the 12 planted mistakes of scripts/check-planted.mjs,
//     judged twice each way; counts the planted mistakes each run names in dubious_claims.
// Results in evals/ci-judge/<time>/results.json.   node scripts/ci-judge.mjs
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdirSync, writeFileSync } from "node:fs";
const run = promisify(execFile);
const convex = async (fn, args) => JSON.parse((await run("npx", ["convex", "run", fn, JSON.stringify(args)], { maxBuffer: 1e8, timeout: 5 * 60 * 1000 })).stdout.trim());
const judge = (via, ch) => convex("evalCiJudge:judge", { via, title: ch.title, cards: ch.cards, ...(ch.outcomeLine ? { outcomeLine: ch.outcomeLine } : {}) });

// The planted chapter, built exactly as scripts/check-planted.mjs builds it.
async function plantedChapter() {
  const base = await convex("handbooks:readChapterRow", { handbookId: "k973n0cktbq4xgdwx0cazj3p9h8fthyg", n: 1 });
  const cards = base.cards.map(({ simpler: _s, html: _h, ...c }) => c);
  cards.splice(6, 0, { type: "exercise", kind: "check", prompt: "What makes a share's price rise during the day?", options: [
    { id: "a", text: "The company raises it after good news" }, { id: "b", text: "More people want to buy than owners want to sell" }, { id: "c", text: "The exchange sets a new price each morning" }],
    answer: "a", whyNot: { b: "Buyers and sellers don't set the price; the company does.", c: "The exchange only opens the market; it doesn't set prices." } });
  const PLANTS = [
    [0, "can change several times a second", "can change only once a minute"],
    [1, "cut into crores of pieces", "cut into exactly 1,000 pieces"],
    [1, "you usually buy your slice from another owner who wants out, not from the company", "you usually buy your slice directly from the company, not from another owner"],
    [2, "up 0.6%", "up 6%"],
    [3, "Benjamin Graham, who taught Warren Buffett,", "Benjamin Graham, who was taught by Warren Buffett,"],
    [7, "Watch it for two minutes.", "Watch it for two minutes. Prices come from India's oldest exchange, the Bombay Stock Exchange, opened in 1995."],
    [4, "at 9:30 am, buys at 9:40", "at 8:30 am, buys at 8:40"],
    [1, "with a sliver of the profits", "with a guaranteed share of the profits every month"],
    [5, "40 hands up, 4 slices left, and the price climbs", "40 hands up, 4 slices left, and the price falls"],
    [2, "The 200 left over", "The 400 left over"],
    [2, "and not one tin of paint changed in that minute.", "and not one tin of paint changed in that minute. That ₹3 rise on 300 shares adds up to ₹9,000."],
    [1, "It's tiny, but it's legally yours,", "It's tiny, but it's legally yours (it reaches your demat account two working days after you buy, the T+2 rule),"],
  ];
  for (const [i, from, to] of PLANTS) { if (!cards[i].body.includes(from)) throw new Error(`plant not found in card ${i}: ${from}`); cards[i] = { ...cards[i], body: cards[i].body.replace(from, to) }; }
  return { title: base.title, cards };
}
// Words that show a doubtful-claims line is about a plant (checked by hand afterwards too; raw replies are saved).
const PLANT_WORDS = [
  ["once a minute"], ["1,000"], ["directly from the company", "from the company"], ["6%"], ["taught by", "buffett"], ["1995", "oldest exchange"],
  ["8:30", "8:40"], ["guaranteed"], ["price falls", "falls"], ["answer key", "exercise answer", "correct answer is b", "correct answer is 'b'"], ["400"], ["9,000"], ["t+2", "two working days"],
];

const CHECKS = ["hook", "short_cards", "concrete_images", "one_idea", "answerable", "feedback_names_confusion", "no_cliche", "topic_specific", "facts_ok", "would_keep_reading", "laugh_or_sit_up", "open_loop"];
const agree = (a, b) => (a?.json && b?.json ? CHECKS.filter((k) => a.json.checks?.[k] === b.json.checks?.[k]).length : null);
const brief = (r) => ({ ok: r.ok, ms: r.ms, score: r.json?.score, dubious: r.json?.dubious_claims?.length ?? null, tokensIn: r.tokensIn, tokensOut: r.tokensOut, model: r.model, error: r.error });

const stamp = new Date().toISOString().slice(0, 16).replace(/:/g, "-");
const dir = `evals/ci-judge/${stamp}`;
mkdirSync(dir, { recursive: true });
const save = (o) => writeFileSync(`${dir}/results.json`, JSON.stringify(o, null, 2));

const chapters = await convex("evalCiJudge:pick", { n: 7 });
console.log("chapters:", chapters.map((c) => c.topic).join(" | "));
const partA = [];
for (const ch of chapters) {
  const [d1, d2, ci] = await Promise.all([judge("direct", ch), judge("direct", ch), judge("ci", ch)]);
  const row = { topic: ch.topic, handbookId: ch.handbookId, d1, d2, ci, agree_d1_d2: agree(d1, d2), agree_d1_ci: agree(d1, ci), agree_d2_ci: agree(d2, ci) };
  partA.push(row); save({ chapters: chapters.map((c) => c.topic), partA });
  console.log(ch.topic, JSON.stringify({ d1: brief(d1), d2: brief(d2), ci: brief(ci), agree: [row.agree_d1_d2, row.agree_d1_ci, row.agree_d2_ci], ciHeaders: ci.ci, sentFallback: ci.sentFallback, thinking: ci.thinkingBlocks }));
}

const planted = await plantedChapter();
const runsB = await Promise.all([judge("direct", planted), judge("direct", planted), judge("ci", planted), judge("ci", planted)]);
const partB = runsB.map((r) => {
  const text = [...(r.json?.dubious_claims ?? []), r.json?.why ?? "", r.json?.fix ?? ""].join(" \n ").toLowerCase();
  const caught = PLANT_WORDS.map((ws, k) => (ws.some((w) => text.includes(w)) ? k + 1 : null)).filter(Boolean);
  return { via: r.via, ...brief(r), caught: caught.length, caughtWhich: caught, dubious_claims: r.json?.dubious_claims, facts_ok: r.json?.checks?.facts_ok };
});
save({ chapters: chapters.map((c) => c.topic), partA, partB, rawB: runsB });
for (const r of partB) console.log("planted", r.via, JSON.stringify({ caught: `${r.caught}/13`, which: r.caughtWhich, ms: r.ms, tokensOut: r.tokensOut, error: r.error }));
console.log("saved", `${dir}/results.json`);
