// Sends an eval run's summary to prod for /admin Evals (D82, 11 Oct). scripts/eval-run.mjs calls it after every run;
// by hand, for a run already on disk:
//   node scripts/eval-record.mjs evals/runs/2026-10-11T00-19-53
// Case names, levels, averages and cost only (the typed lines stay in evals/cases.json).
import { execFile } from "node:child_process";
import { readFileSync } from "node:fs";
import { promisify } from "node:util";

const run = promisify(execFile);
const HARD = new Set(["pushbackOrDeclined", "noPromptLeak", "caution"]);

// The gate (D88, Prateek, 11 Oct). Single-run floors, then per-case averages, both failed on a run with no change (3
// runs a case swing about half a level), so the gate judges the whole set: each lever's average over every graded run
// of every case, against the baseline's (cases.json "base"), plus the hard checks. A case is only flagged.
export const SET_DROP = 0.25, CASE_FLAG = 1;
// One case: its graded levels per lever (a crashed run, a "can't tell", and "taught" on a chapter with no quiz are left
// out), its averages, and whether it is flagged (a drop of CASE_FLAG or more against its own base) or failed outright.
export function caseView(r, base, needsChapter) {
  const ok = r.runs.filter((x) => !x.error);
  const hard = ok.some((x) => (x.failedChecks ?? []).some((c) => HARD.has(c)));
  const wrote = ok.filter((x) => !needsChapter || x.chapter === "ready");
  const graded = {}, avg = {}, drops = [];
  for (const x of wrote) for (const [lever, n] of Object.entries(x.levels ?? {})) if (typeof n === "number") (graded[lever] ??= []).push(n);
  for (const [lever, v] of Object.entries(graded)) {
    avg[lever] = Math.round((v.reduce((a, n) => a + n, 0) / v.length) * 100) / 100;
    if (typeof base?.[lever] === "number" && avg[lever] <= base[lever] - CASE_FLAG) drops.push(lever);
  }
  const noChapter = ok.length > 0 && !wrote.length && needsChapter;
  return { graded, avg, drops, crashed: ok.length - wrote.length, failed: hard || noChapter, flagged: drops.length > 0 };
}
export function setGate(views, base) {
  const pool = {};
  for (const v of views) for (const [lever, ns] of Object.entries(v.graded)) (pool[lever] ??= []).push(...ns);
  const pooled = Object.fromEntries(Object.entries(pool).map(([lever, ns]) => [lever, { avg: Math.round((ns.reduce((a, n) => a + n, 0) / ns.length) * 100) / 100, n: ns.length, base: base?.[lever] ?? null }]));
  const dropped = Object.entries(pooled).filter(([, p]) => typeof p.base === "number" && p.avg < p.base - SET_DROP).map(([l]) => l);
  return { pooled, dropped, pass: !dropped.length && !views.some((v) => v.failed) };
}

export function summarise(results, caseFile) {
  const byName = Object.fromEntries(caseFile.cases.map((c) => [c.name, c]));
  const [d, t] = results.at.split("T");
  const at = Date.parse(`${d}T${t.replace(/-/g, ":")}Z`);
  const baseline = results.cases.every((r) => typeof r.floorHeld !== "boolean");
  const views = [];
  const cases = results.cases.map((r) => {
    const base = byName[r.name]?.base ?? {};
    const g = caseView(r, base, Object.keys(r.expect ?? byName[r.name]?.expect ?? {}).length > 0);
    views.push(g);
    return {
      // The baseline's lists were re-sorted after it ran (D80); show it under today's lists, like its floors.
      name: r.name, list: baseline ? byName[r.name]?.list ?? r.list : r.list, floor: {}, base, avg: g.avg, drops: g.drops, crashed: g.crashed, expect: r.expect ?? {},
      floorHeld: !g.failed && !g.flagged, failed: g.failed,
      unsure: Object.keys(base).filter((l) => r.runs.some((x) => !x.error && x.chapter === "ready" && x.levels?.[l] == null)),
      passes: r.runs.filter((x) => x.pass).length, runs: r.runs.length, errored: !!r.errored,
      levels: r.runs.map((x) => (x.error ? null : x.levels ?? {})),
      failedChecks: [...new Set(r.runs.flatMap((x) => x.failedChecks ?? []))],
      before: typeof r.before === "boolean" ? r.before : null,
    };
  });
  const inr = results.cases.flatMap((r) => r.runs).reduce((s, x) => s + (x.cost?.inr ?? 0), 0);
  const full = results.runs >= 3 && results.cases.length >= caseFile.cases.length;
  const set = setGate(views, caseFile.base);
  return { stamp: results.at, at, baseline, pass: set.pass, pooled: set.pooled, rubric: results.rubric ?? caseFile.rubric, runs: results.runs, full, inr: Math.round(inr), cases };
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
