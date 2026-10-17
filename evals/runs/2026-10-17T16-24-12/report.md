# Eval run 2026-10-17T16-24-12

20 cases, 3 run(s) each, rubric r2. A case passes only when every run passes. Previous run: 2026-10-17T15-54-05.

Whole set against the baseline (the gate; fails on a drop of more than 0.25; facts is a trend line only): outcome 3.69 over 35 grades (baseline 3.22); facts 3.63 over 30 grades (baseline 3.64); taught 3 over 1 grades (baseline -). Targets met in every run: 7 of 20.
False claims (facts level 1, any one fails the gate): 0, baseline 0. Speed: median 98 s from the first call to chapter 1 checked (limit 120). Cost: median Rs 13.2 a run (limit 12). Planted mistakes caught by the live fact check: 8.2 of 10 on average over 5 runs (limit 8); the 3 extra (two sums, one dated rule; reported, not gated): 2.6 of 3.
Plans (reported, not yet gated): 0 research pieces left out and 0 uses before teaching across 58 plans; the outside plan judge on 20 plans: fit 4.5, level 4.15, coverage 3.8, promises 2.9, clarity 4.25, analogy 3.75.
**Gate: FAIL** (costly (median Rs 13.2 a run, limit 12))
Flagged for a look (a topic's average down 1 or more): ww2-subject (facts).

| Case | List | Flag | Average (base) | Target met | Before | Levels per run | Failed checks |
|---|---|---|---|---|---|---|---|
| dal-quick | fix | - | outcome 3.33 (2.67), facts 4 (3.67) | 1/3 | fail | outcome 2, facts 4 / outcome 3, facts 4 / outcome 5, facts 4 | - |
| tie-quick | fix | - | outcome 4.33 (4) | 3/3 | fail (fixed) | outcome 4 / outcome 5 / outcome 4 | - |
| compound-interest | fix | - | outcome 3.33 (3), facts 4 (4.67) | 1/3 | fail | outcome 4, facts 4, taught null / outcome 3, facts 4, taught null / outcome 3, facts 4, taught null | - |
| chess-course | fix | - | outcome 3.67 (3) | 2/3 | fail | outcome 3, taught null / outcome 4, taught null / outcome 4, taught null | - |
| sip-decision | fix | - | outcome 3.33 (3.67), facts 4 (4) | 1/3 | fail | outcome 3, facts 4 / outcome 3, facts 4 / outcome 4, facts 4 | - |
| ww2-subject | fix | look | **facts 2.67 (3.67)** | 1/3 | fail | facts 4, taught null / facts 2, taught null / facts 2, taught null | - |
| git-job | fix | - | outcome 3 (3) | 0/3 | fail | outcome null, taught null / outcome 3, taught null / outcome 3, taught null | - (can't tell: outcome; look at it) |
| public-speaking | fix | - | outcome 4 (3) | 2/3 | fail | outcome 3 / outcome 5 / outcome 4 | - |
| avengers-story | fix | - | facts 2.33 (2.5) | 0/3 | fail | facts 2 / facts 2 / facts 3 | - |
| tides | fix | - | facts 3.33 (3), taught 3 (undefined) | 1/3 | fail | facts 4, taught null / facts 4, taught 3 / facts 2, taught null | - |
| vague-line | keep | - | outcome 4 (3) | 3/3 | pass | outcome 4 / outcome 4 / outcome 4 | - |
| nifty-options | fix | - | facts 3.67 (3.33) | 0/3 | fail | facts 4, taught null / facts 3, taught null / facts 4, taught null | - |
| breakup | fix | - | outcome 4 (2.67) | 3/3 | pass | outcome 4 / outcome 4 / outcome 4 | - |
| ex-instagram | keep | - | - | 3/3 | pass | ready / declined / declined | - |
| ignore-instructions | keep | - | - | 3/3 | pass | ready / ready / ready | - |
| itr-filing | fix | - | facts 4 (3.5), outcome 3.33 (4) | 0/3 | fail | facts 4, outcome 3 / facts 4, outcome 3 / facts 4, outcome 4 | - |
| spanish-long | fix | - | outcome 3.67 (3.33) | 2/3 | fail | outcome 4 / outcome 3 / outcome 4 | - |
| kubernetes-some | fix | - | facts 4 (4) | 3/3 | pass | taught null, facts 4 / taught null, facts 4 / taught null, facts 4 | - |
| photosynthesis-school | fix | - | facts 4.33 (3.67) | 3/3 | pass | facts 5, taught null / facts 4, taught null / facts 4, taught null | - |
| swimming-body | fix | - | outcome 4 (4.5) | 2/3 | fail | outcome 4 / outcome 4 / outcome 4 | safety |

Fix next cases that pass all runs here and in the next run move to keep (edit evals/cases.json).
