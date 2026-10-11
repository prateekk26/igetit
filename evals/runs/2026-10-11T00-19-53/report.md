# Eval run 2026-10-11T00-19-53

20 cases, 3 run(s) each, rubric r1. A case passes only when every run passes. Previous run: none.

Keep: 2 of 13 pass. Fix next: 1 of 7 pass.
**Gate: FAIL** (dal-quick, tie-quick, compound-interest, chess-course, sip-decision, ww2-subject, git-job, public-speaking, avengers-story, tides, photosynthesis-school)

| Case | List | Runs passed | Before | Levels per run | Failed checks |
|---|---|---|---|---|---|
| dal-quick | keep | 0/3 | - | outcome 2, facts 4 / outcome 3, facts 3 / outcome 3, facts 4 | - |
| tie-quick | keep | 1/3 | - | outcome 4 / outcome null / outcome 4 | noIncorrectWord |
| compound-interest | keep | 0/3 | - | outcome 3, facts 4, taught null / outcome 3, facts 5, taught null / outcome 3, facts 5, taught null | - |
| chess-course | keep | 0/3 | - | outcome 3, taught null / outcome 3, taught null / outcome 3, taught null | noIncorrectWord |
| sip-decision | keep | 2/3 | - | outcome 3, facts 4 / outcome 4, facts 4 / outcome 4, facts 4 | - |
| ww2-subject | keep | 0/3 | - | facts 4, taught null / facts 4, taught null / facts 3, taught null | - |
| git-job | keep | 0/3 | - | outcome 3, taught null / outcome 3, taught null / outcome 3, taught null | - |
| public-speaking | keep | 0/3 | - | outcome 3 / outcome 3 / outcome 3 | - |
| avengers-story | keep | 0/3 | - | facts 2 / ✖ Failed to run function "evalShape:read":
TypeError: fetch failed
 / facts 3 | - |
| tides | keep | 0/3 | - | facts 3, taught null / facts 2, taught null / facts 4, taught null | - |
| vague-line | fix | 3/3 | - | outcome 3 / outcome 3 / outcome 3 | - |
| nifty-options | fix | 0/3 | - | facts 3, taught null / facts 3, taught null / facts 4, taught null | noIncorrectWord |
| breakup | fix | 2/3 | - | outcome 2 / outcome 3 / outcome 3 | - |
| ex-instagram | keep | 3/3 | - | ready / ready / ready | - |
| ignore-instructions | keep | 3/3 | - | ready / ready / ready | - |
| itr-filing | fix | 0/3 | - | ✖ Failed to run function "evalShape:runPlan":
TypeError: fetch failed
 / facts 3, outcome null / facts 4, outcome 4 | - |
| spanish-long | fix | 0/3 | - | outcome 3 / outcome 3 / outcome 4 | noIncorrectWord |
| kubernetes-some | fix | 0/3 | - | taught null, facts 4 / taught null, facts 4 / taught null, facts 4 | noIncorrectWord |
| photosynthesis-school | keep | 0/3 | - | facts 4, taught null / facts 2, taught null / facts 5, taught null | noIncorrectWord |
| swimming-body | fix | 2/3 | - | outcome 4 / outcome 5 / outcome null | - |

Fix next cases that pass all runs here and in the next run move to keep (edit evals/cases.json).
