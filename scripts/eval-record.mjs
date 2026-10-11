// Sends an eval run's summary to prod for /admin Evals (D82, 11 Oct). scripts/eval-run.mjs calls it after every run;
// by hand, for a run already on disk:
//   node scripts/eval-record.mjs evals/runs/2026-10-11T00-19-53
// Case names, levels, floors and cost only (the typed lines stay in evals/cases.json).
import { execFile } from "node:child_process";
import { readFileSync } from "node:fs";
import { promisify } from "node:util";

const run = promisify(execFile);
const HARD = new Set(["pushbackOrDeclined", "noPromptLeak", "caution"]);

// A run saved before floors existed (the baseline) has no floorHeld: work it out from evals/cases.json the same way.
function floorPass(run, floor) {
  if (run.error) return true;
  const needsChapter = Object.keys(floor ?? {}).length > 0;
  if (needsChapter && run.chapter !== "ready") return false;
  // D85: "can't tell" (null) is left out of the floor; summarise() fails a lever no run could grade.
  const ok = Object.entries(floor ?? {}).every(([lever, min]) => { const lv = run.levels?.[lever]; return (typeof lv === "number" && lv >= min) || lv == null; });
  return ok && !(run.failedChecks ?? []).some((c) => HARD.has(c));
}

export function summarise(results, caseFile) {
  const byName = Object.fromEntries(caseFile.cases.map((c) => [c.name, c]));
  const [d, t] = results.at.split("T");
  const at = Date.parse(`${d}T${t.replace(/-/g, ":")}Z`);
  const baseline = results.cases.every((r) => typeof r.floorHeld !== "boolean");
  const cases = results.cases.map((r) => {
    const floor = r.floor ?? byName[r.name]?.floor ?? {};
    return {
      // The baseline's lists were re-sorted after it ran (D80); show it under today's lists, like its floors.
      name: r.name, list: baseline ? byName[r.name]?.list ?? r.list : r.list, floor, expect: r.expect ?? {},
      floorHeld: typeof r.floorHeld === "boolean" ? r.floorHeld : r.runs.every((x) => floorPass(x, floor)) && !Object.keys(floor).some((l) => { const ok = r.runs.filter((x) => !x.error); return ok.length > 0 && ok.every((x) => x.levels?.[l] == null); }),
      unsure: r.unsure ?? Object.keys(floor).filter((l) => r.runs.some((x) => !x.error && x.levels?.[l] == null)),
      passes: r.runs.filter((x) => x.pass).length, runs: r.runs.length, errored: !!r.errored,
      levels: r.runs.map((x) => (x.error ? null : x.levels ?? {})),
      failedChecks: [...new Set(r.runs.flatMap((x) => x.failedChecks ?? []))],
      before: typeof r.before === "boolean" ? r.before : null,
    };
  });
  const inr = results.cases.flatMap((r) => r.runs).reduce((s, x) => s + (x.cost?.inr ?? 0), 0);
  const full = results.runs >= 3 && results.cases.length >= caseFile.cases.length;
  return { stamp: results.at, at, baseline, rubric: results.rubric ?? caseFile.rubric, runs: results.runs, full, inr: Math.round(inr), cases };
}

export async function record(summary) {
  const { stdout } = await run("npx", ["convex", "run", "--prod", "evalRuns:record", JSON.stringify(summary)], { maxBuffer: 10 * 1024 * 1024 });
  return stdout.trim();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const dir = process.argv[2];
  if (!dir) { console.error("usage: node scripts/eval-record.mjs evals/runs/<time>"); process.exit(1); }
  const s = summarise(JSON.parse(readFileSync(`${dir}/results.json`, "utf8")), JSON.parse(readFileSync("evals/cases.json", "utf8")));
  console.log(s.stamp, s.full ? "full run" : "partial run", `₹${s.inr}`, "gate", await record(s));
}
