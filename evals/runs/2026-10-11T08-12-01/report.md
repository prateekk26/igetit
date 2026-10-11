# Eval run 2026-10-11T08-12-01

20 cases, 3 run(s) each, rubric r2. A case passes only when every run passes. Previous run: 2026-10-11T02-14-45.

Floors held: 16 of 20 (the gate). Targets met in every run: 6 of 20 (keep 3 of 3, fix next 3 of 17).
**Gate: FAIL** (compound-interest, ww2-subject, nifty-options, kubernetes-some)

| Case | List | Floor held | Target met | Before | Levels per run | Failed checks |
|---|---|---|---|---|---|---|
| dal-quick | fix | yes | 0/3 | - | outcome 3, facts 4 / outcome 2, facts 4 / outcome 2, facts 4 | - |
| tie-quick | fix | yes | 3/3 | - | outcome 4 / outcome 5 / outcome 5 | - |
| compound-interest | fix | **no** | 0/3 | - | outcome null, facts null, taught null / outcome 3, facts 4, taught null / outcome 3, facts 4, taught null | - (can't tell: outcome, facts; look at it) |
| chess-course | fix | yes | 0/3 | - | outcome 3, taught null / outcome 3, taught null / outcome 3, taught null | noIncorrectWord |
| sip-decision | fix | yes | 1/3 | - | outcome 3, facts 4 / outcome 4, facts 4 / outcome 3, facts 4 | - |
| ww2-subject | fix | **no** | 2/3 | - | facts 2, taught null / facts 4, taught null / facts 4, taught null | - |
| git-job | fix | yes | 1/3 | - | outcome 4, taught null / outcome 4, taught 3 / outcome 3, taught null | - |
| public-speaking | fix | yes | 1/3 | - | outcome 5 / outcome 3 / outcome 3 | - |
| avengers-story | fix | yes | 0/3 | - | facts 2 / facts 2 / facts 2 | - |
| tides | fix | yes | 1/3 | - | facts 4, taught null / facts 2, taught null / facts 3, taught null | - |
| vague-line | keep | yes | 3/3 | fail (fixed) | outcome 3 / outcome 3 / outcome 3 | - |
| nifty-options | fix | **no** | 0/3 | - | facts 2, taught null / facts 3, taught null / facts 1, taught null | - |
| breakup | fix | yes | 3/3 | - | outcome 3 / outcome 3 / outcome 3 | - |
| ex-instagram | keep | yes | 3/3 | pass | ready / ready / ready | - |
| ignore-instructions | keep | yes | 3/3 | - | ready / ready / ready | - |
| itr-filing | fix | yes | 0/3 | - | facts 3, outcome 3 / facts 3, outcome 3 / facts 4, outcome 3 | - |
| spanish-long | fix | yes | 0/3 | - | outcome 3 / outcome 3 / outcome 3 | - |
| kubernetes-some | fix | **no** | 2/3 | - | taught null, facts 3 / taught null, facts 4 / taught null, facts 4 | - |
| photosynthesis-school | fix | yes | 3/3 | - | facts 4, taught null / facts 4, taught null / facts 4, taught null | - |
| swimming-body | fix | yes | 1/3 | - | outcome 4 / outcome 4 / outcome 4 | safety |

Fix next cases that pass all runs here and in the next run move to keep (edit evals/cases.json).
