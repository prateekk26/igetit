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
import { summarise, record } from "./eval-record.mjs";

const run = promisify(execFile);
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const RUNS = Number(arg("--runs", 3));
const ONLY = arg("--only", "")?.split(",").filter(Boolean);
const CONCURRENCY = Number(arg("--concurrency", 4));
const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
const OUT = `evals/runs/${stamp}`;

// A "fetch failed" from the command line is the network, not the product (3 of 62 runs on 11 Oct): try twice more.
const convex = async (fn, args, prod = false, tries = 3) => {
  try {
    const { stdout } = await run("npx", ["convex", "run", ...(prod ? ["--prod"] : []), fn, JSON.stringify(args)], { maxBuffer: 50 * 1024 * 1024, timeout: 11 * 60 * 1000 });
    const t = stdout.trim(); return t ? JSON.parse(t) : null;
  } catch (e) {
    if (tries > 1 && /fetch failed|ECONNRESET|ETIMEDOUT/i.test(String(e?.stderr || e?.message || e))) { await new Promise((r) => setTimeout(r, 5000)); return convex(fn, args, prod, tries - 1); }
    throw e;
  }
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
  // "Teaches before it tests" can't apply to a chapter with no quiz: the scorer says "can't tell" (null) and that counts
  // as not applicable when the chapter really has no exercise; any other null is a failure to look at.
  const noQuiz = !(ch?.cards ?? []).some((x) => x?.type === "exercise");
  const leverPass = Object.entries(c.expect ?? {}).map(([lever, min]) => [lever, levels?.[lever] ?? null, (typeof levels?.[lever] === "number" && levels[lever] >= min) || (lever === "taught" && levels?.[lever] == null && noQuiz)]);
  const chk = checks(c, h, ch);
  const needsChapter = Object.keys(c.expect ?? {}).length > 0;
  const pass = (!needsChapter || ch?.status === "ready") && leverPass.every((x) => x[2]) && chk.every((x) => x[1]);
  // The floor (11 Oct night, after the baseline): the lowest level each lever reached in the baseline run. Falling below
  // it, or failing a hard check (safety and leaks), is what fails the gate; the target ("expect") is what we work toward.
  const HARD = new Set(["pushbackOrDeclined", "noPromptLeak", "caution"]);
  // D85 (Prateek, 11 Oct): a "can't tell" grade is left out of the floor and flagged ("unsure") for a look; a case fails
  // only when every run of it is "can't tell" on a floored lever (rows below), since then the grader can't see it at all.
  const unsure = Object.keys(c.floor ?? {}).filter((lever) => levels?.[lever] == null && !(lever === "taught" && noQuiz));
  const floorPass = (!needsChapter || ch?.status === "ready") && Object.entries(c.floor ?? {}).every(([lever, min]) => { const lv = levels?.[lever]; return (typeof lv === "number" && lv >= min) || lv == null; }) && chk.every((x) => x[1] || !HARD.has(x[0]));
  const cost = await convex("evalShape:cost", { handbookId: id }).catch(() => null);
  log(`${c.name} run ${k + 1}: ${pass ? "PASS" : "FAIL"} ${leverPass.map(([l, v]) => `${l}=${v}`).join(" ")} ${chk.filter((x) => !x[1]).map((x) => `!${x[0]}`).join(" ")} (${h?.status}${ch ? `, ch1 ${ch.status}` : ""})`);
  return { handbookId: id, pass, floorPass, unsure, status: h?.status ?? null, chapter: ch?.status ?? null, levels: Object.fromEntries(leverPass.map(([l, v]) => [l, v])), failedChecks: chk.filter((x) => !x[1]).map((x) => x[0]), cost };
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
// D85: a floored lever the grader couldn't grade in any run is a failure, not noise.
const blind = (r) => { const ok = r.runs.filter((x) => !x.error); return ok.length > 0 && [...new Set(ok.flatMap((x) => x.unsure ?? []))].some((l) => ok.every((x) => x.unsure?.includes(l))); };
// A run that errored before scoring (a network blip in the CLI) is retried by the next run, not counted against the floor.
const rows = Object.values(results).map((r) => ({ ...r, errored: r.runs.every((x) => x.error), passed: r.runs.every((x) => x.pass), passes: r.runs.filter((x) => x.pass).length, floorHeld: r.runs.filter((x) => !x.error).every((x) => x.floorPass) && !blind(r), unsure: [...new Set(r.runs.flatMap((x) => x.unsure ?? []))], before: prev?.cases?.find((p) => p.name === r.name)?.passed ?? null }));
const keepFails = rows.filter((r) => !r.floorHeld);
mkdirSync(OUT, { recursive: true });
writeFileSync(`${OUT}/results.json`, JSON.stringify({ at: stamp, runs: RUNS, rubric: file.rubric, previous: prevDir, cases: rows }, null, 2));
const L = [`# Eval run ${stamp}`, "", `${rows.length} cases, ${RUNS} run(s) each, rubric ${file.rubric}. A case passes only when every run passes. Previous run: ${prevDir ?? "none"}.`, "",
  `Floors held: ${rows.filter((r) => r.floorHeld).length} of ${rows.length} (the gate). Targets met in every run: ${rows.filter((r) => r.passed).length} of ${rows.length} (keep ${rows.filter((r) => r.list === "keep" && r.passed).length} of ${rows.filter((r) => r.list === "keep").length}, fix next ${rows.filter((r) => r.list === "fix" && r.passed).length} of ${rows.filter((r) => r.list === "fix").length}).`,
  keepFails.length ? `**Gate: FAIL** (${keepFails.map((r) => r.name).join(", ")})` : "**Gate: PASS**", "",
  "| Case | List | Floor held | Target met | Before | Levels per run | Failed checks |", "|---|---|---|---|---|---|---|",
  ...rows.map((r) => `| ${r.name} | ${r.list} | ${r.floorHeld ? "yes" : "**no**"} | ${r.passes}/${r.runs.length} | ${r.before === null ? "-" : r.before ? "pass" : "fail"}${r.errored ? " (this run errored)" : r.before !== null && r.before !== r.passed ? (r.passed ? " (fixed)" : " (broke)") : ""} | ${r.runs.map((x) => Object.entries(x.levels ?? {}).map(([l, v]) => `${l} ${v}`).join(", ") || x.status || x.error || "-").join(" / ")} | ${[...new Set(r.runs.flatMap((x) => x.failedChecks ?? []))].join(", ") || "-"}${r.unsure.length ? ` (can't tell: ${r.unsure.join(", ")}; look at it)` : ""} |`),
  "", "Fix next cases that pass all runs here and in the next run move to keep (edit evals/cases.json)."];
writeFileSync(`${OUT}/report.md`, L.join("\n") + "\n");
// D82: the summary goes to prod too, for /admin Evals ("Last test run"). A failure here never changes the gate.
try { log("sent to /admin Evals, gate", await record(summarise({ at: stamp, runs: RUNS, rubric: file.rubric, cases: rows.map((r) => ({ ...r, floor: cases.find((c) => c.name === r.name)?.floor })) }, file))); } catch (e) { log("could not send the summary to prod:", String(e).slice(0, 120)); }
log(`report: ${OUT}/report.md`, keepFails.length ? `GATE FAIL: ${keepFails.map((r) => r.name).join(", ")}` : "GATE PASS");
process.exit(keepFails.length ? 1 : 0);
