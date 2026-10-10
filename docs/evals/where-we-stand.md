# Evals: where I Get It stands (11 Oct)

Each step of basics.md and advanced.md against what the code and the evals/ folder already do. "Have" means it exists and runs; "part" means a piece of it exists; "no" means nothing does yet. Checked against the code on 11 Oct; update the table when a row changes.

| Step | Where we are | What exists |
|---|---|---|
| One core output | Have | The chapter. docs/intent-spec.md says what a handbook must deliver; it is the closest thing we have to a definition of good. |
| Input levers | Part | The intent spec lists them (outcome, facts, taught before tested, shape from the goal) but as rules, not as levers with levels. |
| Rubric with levels | No | The offline judge (docs/section6-check/judge.py) uses 12 yes/no checks, and the eval rounds rank chapters against each other. No worst-to-best levels per lever. basics.md has a first draft for three levers. |
| Log every output | Have | aiCalls (what went in, what came out, tokens, ms, model, tries) for every call; one Langfuse trace per handbook with every step (research, plan, chapter, fact check); /admin "AI pipeline". |
| Score every output | Part | Live chapters get a fact check (Sonnet) that rewrites false cards and stores "checked" or "unchecked", and the call log records how many fixes it made. Nothing gives a live chapter a rubric score. Ready-topic chapters were judged offline once. |
| Fix the rubric on a miss | No | Misses get fixed in the prompts (writer v1 to v6, plan v1 to v9) and recorded in docs/decisions.md and docs/lessons.md, not as rubric edge cases. |
| Read 50 to 100 outputs, note, group, count | Part | The delivery review (scripts/delivery-review.mjs, .claude/agents/delivery-reviewer.md) reads handbooks against the intent spec and traces each gap to the step that caused it. Its notes come from an AI reviewer on benchmark handbooks, not from us on real readers' chapters. |
| Test set in two lists | No | Each eval round picks its own two or three topics (scripts/plan-eval.mjs, chapter-eval.mjs, research-eval.mjs, shape-bench.mjs). plan-eval keeps four regression lines (three safety, one vague line), the nearest thing to "Must keep working". |
| Runs per case | Part | Two runs per case in the eval scripts (RUNS = 2); plan-eval's regression lines must pass both. Advanced asks for three to five, all passing. |
| Check the scorer | Part | The fact checker caught 10 of 10 planted false facts (docs/section6-check/README.md, evals/model-choice.md): a check on the bad ones, which is the part that matters most. The 12-check judge was never compared with our own scores; its draft was marked "to be checked by Prateek". Gemini is kept off judging because it marks its own family's chapters too kindly (9 Oct). |
| Test every change before it ships | No | A prompt or model change ships after its own eval round, not after a fixed set. scripts/prove-path.mjs runs after every deploy, but it tests the reader's path through the app, not chapter quality. |
| Time and cost next to the score | Have | Every call logs ms and tokens; /admin shows cost per chapter and the eval reports compare cost. |
| Steady answers | Have | A zod schema on every model reply with one corrective retry; options shuffled server-side (the model put the key at B in 64 of 90 quizzes). |
| Watch it live | Part | The reader signals are stored: quiz answers (answers table), where chapter 1 loses people (/admin), "Ask or object" questions, teach-back. The nightly doctor (convex/doctor.ts) rewrites a ready topic's chapter 1 when readers quit and A/B tests it. None of it turns a bad chapter into a test case. |

## The three gaps worth closing first

1. **A test set, run before every change.** 20 cases in Fix next and Must keep working, three runs each, run before any prompt or model change ships. Good first cases: the late days of "Hold a room for 10 minutes" (Gemini timed out on 8 of the last 9), the "try" vs "tryit" card mix-up, a quick recipe that must stay 3 short chapters, a vague line, and the three safety lines from plan-eval. The open question on adding Gemini 3.7 Flash as a fallback is exactly the kind of change this set should judge.
2. **Our own notes on 50 real chapters.** Live chapters written since D62 (10 Oct), each with its steps from Langfuse, one note on the first thing wrong, grouped and counted. Prateek writes the notes (he knows the readers); an agent can build the review page and do the grouping.
3. **A rubric with levels, then a checked scorer.** Turn the intent spec into levers with worst, best and levels between (basics.md has a draft), score 30 chapters by hand, and see how many of the bad ones a Sonnet scorer also marks worst before scoring every live chapter.

Sprint scoring: Evals is weighted 5x in the "AI Agent as a Service" rubric (docs/handbook-build-sprint.md, Scoring), and Observability 7x.
