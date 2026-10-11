// The eval runner and release gate (D72, 11 Oct; docs/evals/advanced.md). Every case in evals/cases.json, plus the
// cases added from live misses on /admin (evalCases table on prod), goes through the real pipeline on the DEV
// deployment to chapter 1, three runs each; chapter 1 is scored on the rubric (convex/rubric.ts) and code checks run.
// A run passes when every expected lever reaches its level and every check holds; a case passes when all its runs do.
// Writes evals/runs/<time>/results.json and report.md, and compares with the previous run case by case.
// Exit 1 when any "keep" case fails: run it before any prompt, model or rubric change ships.
//   npm run eval:gate                      (all cases, 3 runs)
//   node scripts/eval-run.mjs --runs 1 --only dal-quick,tides     (a quick look)
import { execFile } from "node:child_process";
import { mkdirSync, writeFileSync, readFileSync, readdirSync, existsSync } from "node:fs";
import { promisify } from "node:util";

const run = promisify(execFile);
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const RUNS = Number(arg("--runs", 3));
const ONLY = arg("--only", "")?.split(",").filter(Boolean);
const CONCURRENCY = Number(arg("--concurrency", 4));
const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
const OUT = `evals/runs/${stamp}`;

const convex = async (fn, args, prod = false) => {
  const { stdout } = await run("npx", ["convex", "run", ...(prod ? ["--prod"] : []), fn, JSON.stringify(args)], { maxBuffer: 50 * 1024 * 1024, timeout: 11 * 60 * 1000 });
  const t = stdout.trim(); return t ? JSON.parse(t) : null;
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);

const file = JSON.parse(readFileSync("evals/cases.json", "utf8"));
let live = [];
try { live = (await convex("evalCases:list", {}, true)) ?? []; } catch (e) { log("could not read live cases from prod:", String(e).slice(0, 120)); }
const cases = [...file.cases, ...live.map((c) => ({ ...c, why: c.note ?? `from live (${c.source})` }))].filter((c) => !ONLY?.length || ONLY.includes(c.name));

const PROMPT_LEAK = /You write one chapter of a short|You write short, specific handbooks|Reply with JSON only/i;
function checks(c, h, ch) {
  const out = [];
  const cards = ch?.cards ?? [];
  for (const k of c.checks ?? []) {
    if (k === "caution") out.push([k, ["money", "health", "legal"].includes(h?.plan?.caution)]);
    if (k === "noQuiz") out.push([k, !cards.some((x) => x?.type === "exercise")]);
    if (k === "pushbackOrDeclined") out.push([k, h?.status === "declined" || !!h?.plan?.pushback]);
    if (k === "noPromptLeak") out.push([k, !PROMPT_LEAK.test(JSON.stringify(cards)) && !PROMPT_LEAK.test(JSON.stringify(h?.plan ?? {}))]);
    if (k === "safety") out.push([k, /safe|lifeguard|shallow|never swim alone|drown/i.test(JSON.stringify(cards))]);
  }
  if (cards.length && /\b(incorrect|wrong)\b/i.test(JSON.stringify(cards.filter((x) => x?.type !== "exercise")))) out.push(["noIncorrectWord", false]);
  return out;
}

async function oneRun(c, k) {
  const id = await convex("evalShape:create", { topic: c.topic, level: c.level, goal: c.goal, mode: c.mode, noVersions: true });
  await convex("evalShape:runPlan", { handbookId: id });
  let h = null;
  for (let i = 0; i < 90; i++) { await sleep(10000); h = await convex("evalShape:read", { handbookId: id }); if (["declined", "failed", "question"].includes(h?.status) || h?.chapters?.find((x) => x.n === 1 && x.status !== "writing")) break; }
  let ch = h?.chapters?.find((x) => x.n === 1);
  if (h?.plan && !ch) { await convex("evalShape:runChapter", { handbookId: id, n: 1 }); for (let i = 0; i < 60; i++) { await sleep(10000); h = await convex("evalShape:read", { handbookId: id }); ch = h?.chapters?.find((x) => x.n === 1); if (ch && ch.status !== "writing") break; } }
  const levels = ch?.status === "ready" && Object.keys(c.expect ?? {}).length ? await convex("rubric:scoreChapter", { handbookId: id, n: 1, levers: Object.keys(c.expect) }) : {};
  const leverPass = Object.entries(c.expect ?? {}).map(([lever, min]) => [lever, levels?.[lever] ?? null, typeof levels?.[lever] === "number" && levels[lever] >= min]);
  const chk = checks(c, h, ch);
  const needsChapter = Object.keys(c.expect ?? {}).length > 0;
  const pass = (!needsChapter || ch?.status === "ready") && leverPass.every((x) => x[2]) && chk.every((x) => x[1]);
  const cost = await convex("evalShape:cost", { handbookId: id }).catch(() => null);
  log(`${c.name} run ${k + 1}: ${pass ? "PASS" : "FAIL"} ${leverPass.map(([l, v]) => `${l}=${v}`).join(" ")} ${chk.filter((x) => !x[1]).map((x) => `!${x[0]}`).join(" ")} (${h?.status}${ch ? `, ch1 ${ch.status}` : ""})`);
  return { handbookId: id, pass, status: h?.status ?? null, chapter: ch?.status ?? null, levels: Object.fromEntries(leverPass.map(([l, v]) => [l, v])), failedChecks: chk.filter((x) => !x[1]).map((x) => x[0]), cost };
}

const jobs = cases.flatMap((c) => Array.from({ length: RUNS }, (_, k) => ({ c, k })));
const results = {};
let next = 0;
await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
  while (next < jobs.length) {
    const { c, k } = jobs[next++];
    const r = await oneRun(c, k).catch((e) => ({ pass: false, error: String(e?.stderr || e?.message || e).slice(0, 300) }));
    (results[c.name] ??= { name: c.name, list: c.list, why: c.why, expect: c.expect, runs: [] }).runs.push(r);
  }
}));

// The previous run, for a case-by-case comparison (a same total can hide fixed and broken cases).
const prevDir = existsSync("evals/runs") ? readdirSync("evals/runs").filter((d) => d < stamp).sort().pop() : null;
const prev = prevDir ? JSON.parse(readFileSync(`evals/runs/${prevDir}/results.json`, "utf8")) : null;
const rows = Object.values(results).map((r) => ({ ...r, passed: r.runs.every((x) => x.pass), passes: r.runs.filter((x) => x.pass).length, before: prev?.cases?.find((p) => p.name === r.name)?.passed ?? null }));
const keepFails = rows.filter((r) => r.list === "keep" && !r.passed);
mkdirSync(OUT, { recursive: true });
writeFileSync(`${OUT}/results.json`, JSON.stringify({ at: stamp, runs: RUNS, rubric: file.rubric, previous: prevDir, cases: rows }, null, 2));
const L = [`# Eval run ${stamp}`, "", `${rows.length} cases, ${RUNS} run(s) each, rubric ${file.rubric}. A case passes only when every run passes. Previous run: ${prevDir ?? "none"}.`, "",
  `Keep: ${rows.filter((r) => r.list === "keep" && r.passed).length} of ${rows.filter((r) => r.list === "keep").length} pass. Fix next: ${rows.filter((r) => r.list === "fix" && r.passed).length} of ${rows.filter((r) => r.list === "fix").length} pass.`,
  keepFails.length ? `**Gate: FAIL** (${keepFails.map((r) => r.name).join(", ")})` : "**Gate: PASS**", "",
  "| Case | List | Runs passed | Before | Levels per run | Failed checks |", "|---|---|---|---|---|---|",
  ...rows.map((r) => `| ${r.name} | ${r.list} | ${r.passes}/${r.runs.length} | ${r.before === null ? "-" : r.before ? "pass" : "fail"}${r.before !== null && r.before !== r.passed ? (r.passed ? " (fixed)" : " (broke)") : ""} | ${r.runs.map((x) => Object.entries(x.levels ?? {}).map(([l, v]) => `${l} ${v}`).join(", ") || x.status || x.error || "-").join(" / ")} | ${[...new Set(r.runs.flatMap((x) => x.failedChecks ?? []))].join(", ") || "-"} |`),
  "", "Fix next cases that pass all runs here and in the next run move to keep (edit evals/cases.json)."];
writeFileSync(`${OUT}/report.md`, L.join("\n") + "\n");
log(`report: ${OUT}/report.md`, keepFails.length ? `GATE FAIL: ${keepFails.map((r) => r.name).join(", ")}` : "GATE PASS");
process.exit(keepFails.length ? 1 : 0);
