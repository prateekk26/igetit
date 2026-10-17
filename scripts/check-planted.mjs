// The planted-mistakes test for the fact check (17 Oct). Plants 10 known false facts in chapter 1 of "Indian stock
// market basics" (dev handbook k973n0cktbq4xgdwx0cazj3p9h8fthyg), the same 10 as the 6 Oct test in
// evals/model-choice.md, runs the check (evalCheck:run) per version and effort, and scores: caught = the planted words
// are gone from that card (#10: the marked answer is b again); stray = cards changed that had nothing planted.
// The eval gate runs it on the live settings (planted() below); by hand, to compare settings:
//   node scripts/check-planted.mjs [runs per setting, default 2]      SETTINGS='[["v4","medium"]]' to choose
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdirSync, writeFileSync } from "node:fs";
const run = promisify(execFile);
const defaultConvex = async (fn, args) => JSON.parse((await run("npx", ["convex", "run", fn, JSON.stringify(args)], { maxBuffer: 1e8, timeout: 5 * 60 * 1000 })).stdout.trim());

export async function planted({ convex = defaultConvex, settings = [["live"]], runs = 2, log = () => {} } = {}) {
  const base = await convex("handbooks:readChapterRow", { handbookId: "k973n0cktbq4xgdwx0cazj3p9h8fthyg", n: 1 });
  const cards = base.cards.map(({ simpler: _s, html: _h, ...c }) => c);
  const quiz = { type: "exercise", kind: "check", prompt: "What makes a share's price rise during the day?", options: [
    { id: "a", text: "The company raises it after good news" }, { id: "b", text: "More people want to buy than owners want to sell" }, { id: "c", text: "The exchange sets a new price each morning" }],
    answer: "a", whyNot: { b: "Buyers and sellers don't set the price; the company does.", c: "The exchange only opens the market; it doesn't set prices." } };
  cards.splice(6, 0, quiz);   // the try card moves to 7
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
  ];
  // 17 Oct (check v5): two sums and one dated rule, scored apart ("extra", of 3) so the 10 stay comparable with earlier runs.
  // 300 wanting to buy less 100 selling is 200, not 400; ₹3 on 300 shares is ₹900, not ₹9,000; Indian trades settle T+1 since 2023.
  const EXTRA = [
    [2, "The 200 left over", "The 400 left over"],
    [2, "and not one tin of paint changed in that minute.", "and not one tin of paint changed in that minute. That ₹3 rise on 300 shares adds up to ₹9,000."],
    [1, "It's tiny, but it's legally yours,", "It's tiny, but it's legally yours (it reaches your demat account two working days after you buy, the T+2 rule),"],
  ];
  const EXTRA_WORDS = ["The 400 left over", "₹9,000", "T+2"];
  for (const [i, from, to] of [...PLANTS, ...EXTRA]) { if (!cards[i].body.includes(from)) throw new Error(`plant not found in card ${i}: ${from}`); cards[i] = { ...cards[i], body: cards[i].body.replace(from, to) }; }
  // The words that show each plant survived (the card still says them).
  const WORDS = ["only once a minute", "exactly 1,000", "directly from the company", "up 6%", "was taught by Warren", "opened in 1995", "8:30 am", "guaranteed share", "and the price falls"];
  const planted = [...PLANTS.map(([i], k) => ({ k: k + 1, card: i, words: WORDS[k] })), { k: 10, card: 6, answer: "b" }];
  const extra = EXTRA.map(([i], k) => ({ k: `x${k + 1}`, card: i, words: EXTRA_WORDS[k] }));
  const plantedCards = new Set([...planted, ...extra].map((p) => p.card));

  const rows = [];
  for (const [version, effort] of settings) for (let k = 0; k < runs; k++) {
    const r = await convex("evalCheck:run", { cards, version, ...(effort ? { effort } : {}), title: base.title, topic: "Indian stock market basics" });
    if (!r.ok) { rows.push({ version, effort, error: r.error }); log(version, effort, "error", r.error); continue; }
    const missed = planted.filter((p) => p.answer ? r.cards[p.card].answer !== p.answer : JSON.stringify(r.cards[p.card]).includes(p.words)).map((p) => p.k);
    const stray = r.cards.map((c, i) => (JSON.stringify(c) !== JSON.stringify(cards[i]) && !plantedCards.has(i) ? i : null)).filter((x) => x !== null);
    const inr = ((r.tokensIn * 3 + r.tokensOut * 15) / 1e6) * 85;
    const missedExtra = extra.filter((p) => JSON.stringify(r.cards[p.card]).includes(p.words)).map((p) => p.k);
    const row = { fixes: r.fixes, version, effort, caught: 10 - missed.length, missed, caughtExtra: extra.length - missedExtra.length, missedExtra, stray, applied: r.applied, skipped: r.skipped, ms: r.ms, tokensIn: r.tokensIn, tokensOut: r.tokensOut, inr: Math.round(inr * 100) / 100 };
    rows.push(row); log(JSON.stringify({ ...row, fixes: undefined }));
  }
  return { planted, extra, rows };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const settings = process.env.SETTINGS ? JSON.parse(process.env.SETTINGS) : [["v3", "low"], ["v4", "low"], ["v4", "medium"]];
  const out = await planted({ settings, runs: Number(process.argv[2] ?? 2), log: console.log });
  const OUT = `evals/check-planted/${new Date().toISOString().slice(0, 16).replace(":", "-")}`;
  mkdirSync(OUT, { recursive: true });
  writeFileSync(`${OUT}/results.json`, JSON.stringify(out, null, 1));
  console.log("wrote", OUT);
}
