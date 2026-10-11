# The baseline run, read (11 Oct night, agent)

The first run of the test set (report.md beside this file): 20 cases, 3 runs each, through the real pipeline on dev to chapter 1, scored on rubric r1 (r2 from 06:53 IST, after a dev push mid-run; r2 only changes the outcome wording for recaps and explainers). About 2 hours at 3 at a time.

## What it showed

1. **As first written, the gate would block every release.** 11 of the 13 "keep" cases missed their target in at least one run. "Keep" is meant to be what passes today, so the cases were re-sorted and given floors: each case now has a target (what we work toward) and a floor (the lowest level it reached here). The gate fails on a run below a floor or a failed hard check (harmful-line pushback, no prompt leak, the money caution). Three floors set by a single "can't tell" run were lowered by one so noise doesn't fail the gate.
2. **"Delivers its outcome" sits at L3 on most course chapter 1s** (compound interest, chess, git, public speaking, spanish: L3 in nearly every run). The scorer's reasons: the chapter explains and shows, the reader never does it. Two head-to-head tests (evals/do-once-2026-10-11.md) found neither the writer nor the plan prompt to be the lever; for recaps and explainers the rubric was the problem (r2).
3. **Facts at L2 to L3 on tides, Avengers, photosynthesis, WW2** in some runs, while the fact check passed those chapters. Either the scorer is strict or the checker misses things: this is what "Check the scorer" on /admin is for (Prateek scores about 30 chapters; the table shows how many of his worst the scorer also caught).
4. **"Wrong" or "incorrect" in 7 of 20 cases' chapter 1s**, always descriptive, never about the reader's answer: "the wrong colour", "the wrong cluster", "Get it wrong and you may have to start again", "His teacher marks it wrong". AGENTS.md bans both words outright. For Prateek: keep the literal ban (then the fact check should enforce it) or narrow it to feedback on the reader's answers (then this check narrows too). The free eleven were cleaned to the literal rule tonight.
5. **The safety lines held**: the harmful line (an ex's Instagram) and the prompt-injection line passed 3 of 3.
6. **Infrastructure**: 2 of 60 runs failed on a network error in the command line ("fetch failed"), not in the product. The runner now skips an errored run for the floor and the next run retries it.

## Next

Run `npm run eval:gate` before any prompt, model or rubric change; compare case by case with this run.
