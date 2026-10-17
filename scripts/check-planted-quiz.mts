// The planted-mistakes test for the quiz check (17 Oct, D128): 6 mistakes planted in the 3 easier quizzes of a dev
// chapter (git, "The add-commit loop"), checked by check v5 and by QUIZ_CHECK_PROMPT with the same reference.
//   CH2_DIR=<folder with ch2.json> npx tsx scripts/check-planted-quiz.mts [runs]

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { referenceForCheck } from "../convex/prompts.ts";
const S = process.env.CH2_DIR ?? "."; // folder holding ch2.json (the dev chapter row: handbooks:readChapterRow k97bm5rzf5azan5dy77mc6ky5h8gffhe n 2)
const run = (fn: string, a: any) => JSON.parse(execFileSync("npx", ["convex", "run", fn, JSON.stringify(a)], { maxBuffer: 1e8}).toString());
const ch = JSON.parse(readFileSync(`${S}/ch2.json`, "utf8"));
const h = run("evalShape:read", { handbookId: "k97bm5rzf5azan5dy77mc6ky5h8gffhe" });
const qs = [...ch.quizTiers.easier.filter(Boolean), ...ch.recallTiers.easier.filter(Boolean)].map((q: any) => JSON.parse(JSON.stringify(q)));
const sub = (q: any, path: string[], from: string, to: string) => { let o = q; for (const k of path.slice(0, -1)) o = o[k]; const k = path.at(-1)!; if (!String(o[k]).includes(from)) throw new Error("plant missing: " + from); o[k] = String(o[k]).replace(from, to); };
qs[0].answer = "a";
sub(qs[0], ["whyNot", "c"], "It neither saves a commit snapshot nor deletes any local files.", "It saves a commit snapshot right away.");
sub(qs[1], ["reteach"], "Git skips it during status checks and blanket staging commands.", "Git skips it during status checks and blanket staging commands. This also removes the file from earlier commits.");
sub(qs[2], ["reteach"], "To see line-by-line modifications, use `git diff`.", "The answer is `git diff server.py`. To see line-by-line modifications, use `git diff`.");
sub(qs[2], ["reteach"], "additions with a plus sign and deletions with a minus sign", "additions with a minus sign and deletions with a plus sign");
sub(qs[1], ["whyNot", "a"], "it does not instruct Git to ignore files.", "so it is the wrong place to list files to ignore.");
const plants = [
  { k: 1, test: (c: any[]) => c[0].answer === "b" },
  { k: 2, test: (c: any[]) => !JSON.stringify(c[0]).includes("saves a commit snapshot right away") },
  { k: 3, test: (c: any[]) => !JSON.stringify(c[1]).includes("removes the file from earlier commits") },
  { k: 4, test: (c: any[]) => !JSON.stringify(c[2]).includes("The answer is") },
  { k: 5, test: (c: any[]) => !JSON.stringify(c[2]).includes("additions with a minus sign") },
  { k: 6, test: (c: any[]) => !/\bwrong\b/i.test(JSON.stringify(c[1])) },
];
const taught = ch.cards.filter((c: any) => c?.type !== "exercise" && typeof c?.body === "string").map((c: any) => `${c.title ? `${c.title}: ` : ""}${c.body}`).join("\n\n");
const facts = referenceForCheck(h.brief, h.plan?.chapters?.[1]?.pieces);
const reference = [`The chapter these quizzes test (already fact checked: check the quizzes against it, never fix it):\n${taught}`, facts].filter(Boolean).join("\n\n");
const runs = Number(process.argv[2] ?? 3);
for (const version of ["v5", "quiz"]) for (let i = 0; i < runs; i++) {
  const r = run("evalCheck:run", { cards: qs, version, effort: "low", title: ch.title, topic: "git", reference });
  if (!r.ok) { console.log(version, "error", r.error); continue; }
  const missed = plants.filter((p) => !p.test(r.cards)).map((p) => p.k);
  const inr = ((r.tokensIn * 3 + r.tokensOut * 15) / 1e6) * 85;
  console.log(JSON.stringify({ version, caught: 6 - missed.length, missed, applied: r.applied, skipped: r.skipped, tokensIn: r.tokensIn, tokensOut: r.tokensOut, inr: Math.round(inr * 100) / 100, s: Math.round(r.ms / 100) / 10 }));
}
