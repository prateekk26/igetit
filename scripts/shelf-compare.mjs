// The Shelf review (D120) against Prateek's own decisions (17 Oct): every prod library row he approved or rejected by
// hand, plus the rows the old judge scored, goes through the new review on dev (nothing saved). Prints the old verdict,
// his decision and the new verdict side by side; writes evals/shelf-compare/<time>.json.
//   node scripts/shelf-compare.mjs
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdirSync, writeFileSync } from "node:fs";
const run = promisify(execFile);
const cx = async (args) => (await run("npx", ["convex", ...args], { maxBuffer: 1e9, timeout: 10 * 60 * 1000 })).stdout;
const rows = (await cx(["data", "library", "--prod", "--limit", "1000", "--format", "jsonLines"])).split("\n").filter((l) => l.startsWith("{")).map((l) => JSON.parse(l))
  .filter((r) => r.chapter1?.cards && ((r.reviewedBy && r.reviewedBy.includes("@")) || typeof r.judge?.score === "number"));
const out = [];
for (const r of rows) {
  let facts = null;
  if (r.sourceHandbookId) { try { const h = JSON.parse(await cx(["run", "--prod", "handbooks:readHandbook", JSON.stringify({ handbookId: r.sourceHandbookId })])); facts = Array.isArray(h?.brief?.facts) ? h.brief.facts.map((f) => (typeof f === "string" ? f : f?.fact ?? JSON.stringify(f))).join("\n") : null; } catch { /* no source */ } }
  const n = JSON.parse(await cx(["run", "evalShelf:run", JSON.stringify({ plan: r.plan, chapter1: r.chapter1, facts })]));
  const row = { topic: r.topic, you: r.reviewedBy?.includes("@") ? `${r.review}${r.reviewWhy ? ` (${r.reviewWhy})` : ""}` : null, oldJudge: typeof r.judge?.score === "number" ? `${r.judge.score} of 12${r.judge.weakest ? `, ${r.judge.weakest}` : ""}` : null, newReview: n.review, newLine: n.line, why: n.reviewWhy, fixes: n.fixes, truth: n.truth, delivers: n.delivers };
  out.push(row); console.log(JSON.stringify({ topic: row.topic, you: row.you, old: row.oldJudge, new: `${row.newReview}: ${row.newLine}` }));
}
mkdirSync("evals/shelf-compare", { recursive: true });
const file = `evals/shelf-compare/${new Date().toISOString().slice(0, 16).replace(":", "-")}.json`;
writeFileSync(file, JSON.stringify(out, null, 1)); console.log("wrote", file);
