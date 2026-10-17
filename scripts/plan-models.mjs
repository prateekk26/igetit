// Plan-model comparison (17 Oct). For each topic: research once, then the plan by Gemini 3.8 Flash, Claude Sonnet 5.5
// (medium) and Claude Opus 5.5 (medium) from that same brief, each pinned with no backup; chapter 1 from each plan by
// the same Gemini writer and the same fact check. Then: code checks on each plan, the eval gate's graders on chapter 1
// (facts, outcome), plan time and cost, and a blind judge on the three plans. Writes evals/plan-models/<time>/.
//   node scripts/plan-models.mjs [case names, comma-separated]
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
const run = promisify(execFile);
const convex = async (fn, args) => { const { stdout } = await run("npx", ["convex", "run", fn, JSON.stringify(args)], { maxBuffer: 1e8, timeout: 11 * 60 * 1000 }); const t = stdout.trim(); return t ? JSON.parse(t) : null; };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);
// TOPICS='[{"name":"...","topic":"...","goal":"...","level":"new"}]' runs new topics instead of cases from evals/cases.json.
const CASES = process.env.TOPICS ? JSON.parse(process.env.TOPICS) : JSON.parse(readFileSync("evals/cases.json", "utf8")).cases;
const pick = process.env.TOPICS ? CASES.map((c) => c.name) : (process.argv[2] ?? "compound-interest,nifty-options,itr-filing").split(",");
const MODELS = [["gemini", "gemini-3.8-flash"], ["sonnet", "claude-sonnet-5-5"], ["opus", "claude-opus-5-5"]];
const OUT = `evals/plan-models/${new Date().toISOString().slice(0, 16).replace(":", "-")}${process.env.TOPICS ? "-new" : ""}`;

const key = (x) => String(x ?? "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const same = (a, b) => { const x = key(a), y = key(b); return !!x && !!y && (x === y || x.includes(y) || y.includes(x)); };
function planChecks(p, brief) {
  const chs = p?.chapters ?? [], held = chs.map((c) => (c.pieces ?? []).map(String));
  const parts = (brief?.parts ?? []).map((x) => String(x.part ?? ""));
  return {
    chapters: chs.length, format: p?.format ?? null, minutes: chs.reduce((s, c) => s + (Number(c.readMinutes ?? c.minutes) || 0), 0),
    missingPieces: parts.filter((x) => x && !held.flat().some((y) => same(x, y))).length,
    usedBeforeTaught: chs.flatMap((c, i) => (c.assumes ?? []).filter((a) => !held.slice(0, i).flat().some((y) => same(a, y)))).length,
    picture: p?.picture?.name ?? null, outcome: p?.outcome7 ?? null,
  };
}
async function waitCh1(id) {
  for (let i = 0; i < 80; i++) { await sleep(10000); const h = await convex("evalShape:read", { handbookId: id }); const ch = h?.chapters?.find((x) => x.n === 1); if (["failed", "declined", "question"].includes(h?.status) || (ch && ch.status !== "writing")) return h; }
  return convex("evalShape:read", { handbookId: id });
}
// Every chapter, in order: a quick handbook writes the next one by itself; a course gets each one started here.
async function wholeBook(id) {
  let h = await convex("evalShape:read", { handbookId: id });
  const total = h?.plan?.chapters?.length ?? 0;
  for (let n = 2; n <= total; n++) {
    if (!h.chapters.find((x) => x.n === n)) await convex("evalShape:runChapter", { handbookId: id, n });
    for (let i = 0; i < 60; i++) { await sleep(10000); h = await convex("evalShape:read", { handbookId: id }); const c = h.chapters.find((x) => x.n === n); if (c && c.status !== "writing") break; }
  }
  return h;
}
mkdirSync(OUT, { recursive: true });
const results = [];
for (const name of pick) {
  const c = CASES.find((x) => x.name === name);
  const base = { topic: c.topic, level: c.level, ...(c.goal ? { goal: c.goal } : {}), ...(c.mode ? { mode: c.mode } : {}), noVersions: true };
  log(name, "research + gemini plan");
  const first = await convex("evalShape:create", { ...base, planModel: MODELS[0][1] });
  await convex("evalShape:runPlan", { handbookId: first });
  const h0 = await waitCh1(first);
  const brief = h0?.brief ?? null;
  const ids = { gemini: first };
  for (const [label, model] of MODELS.slice(1)) { ids[label] = await convex("evalShape:create", { ...base, planModel: model, ...(brief ? { brief } : {}) }); await convex("evalShape:runPlan", { handbookId: ids[label] }); }
  const books = { gemini: h0 };
  for (const [label] of MODELS.slice(1)) { log(name, label, "waiting"); books[label] = await waitCh1(ids[label]); }
  log(name, "writing every chapter of the three books");
  const full = await Promise.all(MODELS.map(([label]) => wholeBook(ids[label])));
  MODELS.forEach(([label], i) => { books[label] = full[i]; });
  const row = { case: name, topic: c.topic, goal: c.goal ?? null, level: c.level, models: {} };
  for (const [label] of MODELS) {
    const h = books[label], id = ids[label];
    const steps = (await convex("evalShape:steps", { handbookId: id }).catch(() => null)) ?? [];
    const planCalls = (Array.isArray(steps) ? steps : steps.rows ?? []).filter((s) => s.kind === "plan");
    // The eval gate's graders on every chapter: facts and outcome, and from chapter 2 (which has quizzes) taught.
    const grades = [];
    for (const c of (h?.chapters ?? []).filter((x) => x.status === "ready")) grades.push({ n: c.n, ...(await convex("rubric:scoreChapter", { handbookId: id, n: c.n, levers: c.n === 1 ? ["facts", "outcome"] : ["facts", "outcome", "taught"] })) });
    const avg = (k) => { const v = grades.map((g) => g[k]).filter((x) => typeof x === "number"); return v.length ? Math.round((v.reduce((a, b) => a + b, 0) / v.length) * 100) / 100 : null; };
    const all = Array.isArray(steps) ? steps : [];
    row.models[label] = { handbookId: id, status: h?.status, checks: planChecks(h?.plan, brief), chaptersWritten: grades.length, chaptersFailed: (h?.chapters ?? []).filter((x) => x.status === "failed").length,
      planCalls: planCalls.length, planSeconds: Math.round(planCalls.reduce((s, x) => s + (x.ms ?? 0), 0) / 1000), planInr: Math.round(planCalls.reduce((s, x) => s + (x.inr ?? 0), 0) * 100) / 100,
      bookInr: Math.round(all.reduce((s, x) => s + (x.inr ?? 0), 0) * 10) / 10, opusChapters: all.filter((x) => x.kind === "chapter" && /opus/.test(x.model)).length,
      grades, facts: avg("facts"), outcome: avg("outcome"), taught: avg("taught"), falseClaims: grades.filter((g) => g.facts === 1).length, misleading: grades.filter((g) => g.facts === 2).length };
    log(name, label, JSON.stringify(row.models[label]));
  }
  // The blind judge: shuffled labels.
  const order = MODELS.map((m) => m[0]).sort(() => Math.random() - 0.5), labels = ["A", "B", "C"];
  const plans = Object.fromEntries(order.map((m, i) => [labels[i], books[m]?.plan ?? null]));
  const j = await convex("evalPlanModels:judge", { reader: `typed "${c.topic}", goal "${c.goal ?? "-"}", level ${c.level === "new" ? "complete beginner" : "knows a little"}`, brief, plans }).catch((e) => ({ ok: false, error: String(e).slice(0, 200) }));
  const who = Object.fromEntries(order.map((m, i) => [labels[i], m]));
  if (j?.ok) { for (const [L, s] of Object.entries(j.json?.scores ?? {})) if (who[L]) row.models[who[L]].judge = s; row.rank = (j.json?.rank ?? []).map((L) => who[L] ?? L); row.why = j.json?.why; row.worstPromise = String(j.json?.worst_promise ?? "").replace(/\b([ABC])\b/g, (m) => who[m] ?? m); }
  else row.judgeError = j?.error;
  log(name, "rank", JSON.stringify(row.rank ?? row.judgeError));
  results.push(row);
  writeFileSync(`${OUT}/results.json`, JSON.stringify(results, null, 1));
}
log("wrote", OUT);
