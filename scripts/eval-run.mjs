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
import { summarise, record, caseView, setGate, SET_DROP } from "./eval-record.mjs";
import { planted } from "./check-planted.mjs";

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

// The plan itself (17 Oct): code checks on every run (a research piece in no chapter; a chapter relying on a piece not yet
// taught), and the outside plan judge on each case's first run (evalPlanModels:judgeOne, about Rs 1 to 3). Reported only
// until two runs set a baseline.
const pkey = (x) => String(x ?? "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const psame = (a, b) => { const x = pkey(a), y = pkey(b); return !!x && !!y && (x === y || x.includes(y) || y.includes(x)); };
function planChecks(p, brief) {
  const chs = p?.chapters ?? [], held = chs.map((ch) => (ch.pieces ?? []).map(String));
  return { chapters: chs.length, format: p?.format ?? null,
    missingPieces: (brief?.parts ?? []).map((x) => String(x?.part ?? "")).filter((x) => x && !held.flat().some((y) => psame(x, y))).length,
    usedBeforeTaught: chs.flatMap((ch, i) => (ch.assumes ?? []).filter((a) => !held.slice(0, i).flat().some((y) => psame(a, y)))).length };
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
  // D85, D88: a "can't tell" on a lever with a base is left out of the average and flagged ("unsure") for a look; the
  // gate itself is setGate() in eval-record.mjs, over every run of every case.
  const unsure = Object.keys(c.base ?? {}).filter((lever) => levels?.[lever] == null && !(lever === "taught" && noQuiz));
  const cost = await convex("evalShape:cost", { handbookId: id }).catch(() => null);
  log(`${c.name} run ${k + 1}: ${pass ? "PASS" : "FAIL"} ${leverPass.map(([l, v]) => `${l}=${v}`).join(" ")} ${chk.filter((x) => !x[1]).map((x) => `!${x[0]}`).join(" ")} (${h?.status}${ch ? `, ch1 ${ch.status}` : ""})`);
  const seconds = cost?.start && cost?.ch1At ? Math.round((cost.ch1At - cost.start) / 1000) : null;   // first call to chapter 1 checked
  const plan = h?.plan ? planChecks(h.plan, h.brief) : null;
  if (plan && k === 0) { const j = await convex("evalPlanModels:judgeOne", { reader: `typed "${c.topic}", goal "${c.goal ?? "-"}", level ${c.level === "new" ? "complete beginner" : "knows a little"}`, brief: h.brief ?? null, plan: h.plan }).catch(() => null); if (j?.ok) { plan.judge = j.json?.scores ?? null; plan.worstPromise = j.json?.worst_promise ?? null; } }
  return { handbookId: id, pass, unsure, noQuiz, status: h?.status ?? null, chapter: ch?.status ?? null, levels: Object.fromEntries(leverPass.map(([l, v]) => [l, v])), failedChecks: chk.filter((x) => !x[1]).map((x) => x[0]), cost, seconds, plan };
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
// D88: the gate judges the whole set (setGate in eval-record.mjs); a case is only flagged. A run that errored in the
// CLI (a network blip) is left out.
const rows = Object.values(results).map((r) => {
  const c = cases.find((x) => x.name === r.name);
  const v = caseView(r, c?.base ?? {}, Object.keys(c?.expect ?? {}).length > 0);
  return { ...r, view: v, errored: r.runs.every((x) => x.error), passed: r.runs.every((x) => x.pass), passes: r.runs.filter((x) => x.pass).length, floorHeld: !v.failed && !v.flagged, failed: v.failed, avg: v.avg, drops: v.drops, crashed: v.crashed, unsure: [...new Set(r.runs.flatMap((x) => x.unsure ?? []))], before: prev?.cases?.find((p) => p.name === r.name)?.passed ?? null };
});
const set = setGate(rows.map((r) => r.view), file.base);
const keepFails = rows.filter((r) => r.failed);
// 17 Oct: speed, cost and the planted-mistakes test (cases.json limits). The medians are over runs that wrote chapter 1.
const median = (xs) => { const s = xs.filter((x) => typeof x === "number").sort((a, b) => a - b); return s.length ? s[Math.floor((s.length - 1) / 2)] : null; };
const allRuns = rows.flatMap((r) => r.runs).filter((x) => !x.error && x.chapter === "ready");
const lim = file.limits ?? {};
const speed = median(allRuns.map((x) => x.seconds)), rupees = median(allRuns.map((x) => x.cost?.inr));
let plantedAvg = null, plantedExtraAvg = null, plantedRows = [];
try {
  const p = await planted({ convex: (fn, a) => convex(fn, a), settings: [["live"]], runs: 5, log: (...a) => log("planted", ...a) });
  plantedRows = p.rows; const ok = p.rows.filter((r) => typeof r.caught === "number");
  plantedAvg = ok.length ? Math.round((ok.reduce((s, r) => s + r.caught, 0) / ok.length) * 10) / 10 : null;
  plantedExtraAvg = ok.length ? Math.round((ok.reduce((s, r) => s + (r.caughtExtra ?? 0), 0) / ok.length) * 10) / 10 : null;
} catch (e) { log("planted test failed to run:", String(e).slice(0, 200)); }
const extraFails = [
  ...(typeof lim.secondsToChapter1 === "number" && speed !== null && speed > lim.secondsToChapter1 ? [`slow (median ${speed} s to chapter 1, limit ${lim.secondsToChapter1})`] : []),
  ...(typeof lim.inrPerRun === "number" && rupees !== null && rupees > lim.inrPerRun ? [`costly (median Rs ${Math.round(rupees * 10) / 10} a run, limit ${lim.inrPerRun})`] : []),
  ...(typeof lim.plantedMin === "number" && (plantedAvg === null || plantedAvg < lim.plantedMin) ? [`fact check caught ${plantedAvg ?? "nothing (did not run)"} of 10 planted mistakes, limit ${lim.plantedMin}`] : []),
];
const planRuns = allRuns.map((x) => x.plan).filter(Boolean), judged = planRuns.filter((p) => p.judge);
const planSummary = { missingPieces: planRuns.reduce((s, p) => s + p.missingPieces, 0), usedBeforeTaught: planRuns.reduce((s, p) => s + p.usedBeforeTaught, 0), judged: judged.length,
  judge: judged.length ? Object.fromEntries(["fit", "level", "coverage", "promises", "clarity", "analogy"].map((d) => [d, Math.round((judged.reduce((s, p) => s + (Number(p.judge[d]) || 0), 0) / judged.length) * 100) / 100])) : null };
const extra = { plan: planSummary, pass: !extraFails.length, fails: extraFails, secondsMedian: speed, inrMedian: rupees, planted: plantedAvg, plantedExtra: plantedExtraAvg, plantedRows: plantedRows.map(({ fixes, ...r }) => r), falseClaims: set.falseClaims, falseClaimCases: rows.filter((r) => r.runs.some((x) => x.levels?.facts === 1)).map((r) => r.name) };
const gatePass = set.pass && extra.pass;
mkdirSync(OUT, { recursive: true });
writeFileSync(`${OUT}/results.json`, JSON.stringify({ at: stamp, runs: RUNS, rubric: file.rubric, previous: prevDir, pass: gatePass, pooled: set.pooled, extra, cases: rows.map(({ view, ...r }) => r) }, null, 2));
const L = [`# Eval run ${stamp}`, "", `${rows.length} cases, ${RUNS} run(s) each, rubric ${file.rubric}. A case passes only when every run passes. Previous run: ${prevDir ?? "none"}.`, "",
  `Whole set against the baseline (the gate; fails on a drop of more than ${SET_DROP}; facts is a trend line only): ${Object.entries(set.pooled).map(([l, p]) => `${l} ${p.avg} over ${p.n} grades (baseline ${p.base ?? "-"})`).join("; ")}. Targets met in every run: ${rows.filter((r) => r.passed).length} of ${rows.length}.`,
  `False claims (facts level 1, any one fails the gate): ${set.falseClaims}${extra.falseClaimCases.length ? ` (${extra.falseClaimCases.join(", ")})` : ""}, baseline ${file.base?.falseClaims ?? 0}. Speed: median ${speed ?? "-"} s from the first call to chapter 1 checked (limit ${lim.secondsToChapter1 ?? "-"}). Cost: median Rs ${rupees === null ? "-" : Math.round(rupees * 10) / 10} a run (limit ${lim.inrPerRun ?? "-"}). Planted mistakes caught by the live fact check: ${plantedAvg ?? "-"} of 10 on average over ${plantedRows.length} runs (limit ${lim.plantedMin ?? "-"}); the 3 extra (two sums, one dated rule; reported, not gated): ${plantedExtraAvg ?? "-"} of 3.`,
  `Plans (reported, not yet gated): ${planSummary.missingPieces} research pieces left out and ${planSummary.usedBeforeTaught} uses before teaching across ${planRuns.length} plans; the outside plan judge on ${planSummary.judged} plans: ${planSummary.judge ? Object.entries(planSummary.judge).map(([d, v]) => `${d} ${v}`).join(", ") : "-"}.`,
  !gatePass ? `**Gate: FAIL** (${[...set.dropped.map((l) => (l.startsWith("false claims") ? l : `${l} dropped`)), ...keepFails.map((r) => `${r.name} failed a hard check or wrote no chapter`), ...extraFails].join(", ")})` : "**Gate: PASS**",
  rows.some((r) => r.drops?.length) ? `Flagged for a look (a topic's average down 1 or more): ${rows.filter((r) => r.drops?.length).map((r) => `${r.name} (${r.drops.join(", ")})`).join(", ")}.` : "", "",
  "| Case | List | Flag | Average (base) | Target met | Before | Levels per run | Failed checks |", "|---|---|---|---|---|---|---|---|",
  ...rows.map((r) => `| ${r.name} | ${r.list} | ${r.failed ? "**failed**" : r.drops?.length ? "look" : "-"} | ${Object.entries(r.avg ?? {}).map(([l, v]) => `${r.drops?.includes(l) ? "**" : ""}${l} ${v} (${cases.find((x) => x.name === r.name)?.base?.[l]})${r.drops?.includes(l) ? "**" : ""}`).join(", ") || "-"}${r.crashed ? `, ${r.crashed} crashed` : ""} | ${r.passes}/${r.runs.length} | ${r.before === null ? "-" : r.before ? "pass" : "fail"}${r.errored ? " (this run errored)" : r.before !== null && r.before !== r.passed ? (r.passed ? " (fixed)" : " (broke)") : ""} | ${r.runs.map((x) => Object.entries(x.levels ?? {}).map(([l, v]) => `${l} ${v}`).join(", ") || x.status || x.error || "-").join(" / ")} | ${[...new Set(r.runs.flatMap((x) => x.failedChecks ?? []))].join(", ") || "-"}${r.unsure.length ? ` (can't tell: ${r.unsure.join(", ")}; look at it)` : ""} |`),
  "", "Fix next cases that pass all runs here and in the next run move to keep (edit evals/cases.json)."];
writeFileSync(`${OUT}/report.md`, L.join("\n") + "\n");
// D82: the summary goes to prod too, for /admin Evals ("Last test run"). A failure here never changes the gate.
try { log("sent to /admin Evals, gate", await record(summarise({ at: stamp, runs: RUNS, rubric: file.rubric, extra, cases: rows.map(({ view, ...r }) => r) }, file))); } catch (e) { log("could not send the summary to prod:", String(e).slice(0, 120)); }
log(`report: ${OUT}/report.md`, gatePass ? "GATE PASS" : `GATE FAIL: ${[...set.dropped, ...keepFails.map((r) => r.name), ...extraFails].join(", ")}`);
process.exit(gatePass ? 0 : 1);
