# Eval run 2026-10-17T13-27-10

20 cases, 3 run(s) each, rubric r2. A case passes only when every run passes. Previous run: 2026-10-17T12-57-07.

Whole set against the baseline (the gate; fails on a drop of more than 0.25; facts is a trend line only): outcome 3.5 over 36 grades (baseline 3.22); facts 3.48 over 29 grades (baseline 3.64); taught 2.5 over 6 grades (baseline -). Targets met in every run: 7 of 20.
False claims (facts level 1, any one fails the gate): 0, baseline 0. Speed: median 92 s from the first call to chapter 1 checked (limit 120). Cost: median Rs 9.6 a run (limit 12). Planted mistakes caught by the live fact check: 7.7 of 10 on average over 3 runs (limit 8).
**Gate: FAIL** (fact check caught 7.7 of 10 planted mistakes, limit 8)
Flagged for a look (a topic's average down 1 or more): itr-filing (outcome).

| Case | List | Flag | Average (base) | Target met | Before | Levels per run | Failed checks |
|---|---|---|---|---|---|---|---|
| dal-quick | fix | - | outcome 2.67 (2.67), facts 3.67 (3.67) | 0/3 | fail | outcome 3, facts 4 / outcome 3, facts 4 / outcome 2, facts 3 | - |
| tie-quick | fix | - | outcome 4.33 (4) | 3/3 | pass | outcome 5 / outcome 4 / outcome 4 | - |
| compound-interest | fix | - | outcome 3.67 (3), facts 5 (4.67), taught 1 (undefined) | 1/3 | fail | outcome 4, facts 5, taught 1 / outcome 3, facts null, taught null / outcome 4, facts 5, taught null | - (can't tell: facts; look at it) |
| chess-course | fix | - | outcome 3.67 (3) | 2/3 | fail | outcome 4, taught null / outcome 4, taught null / outcome 3, taught null | - |
| sip-decision | fix | - | outcome 3.33 (3.67), facts 4 (4) | 2/3 | fail | outcome 4, facts 5 / outcome 2, facts 3 / outcome 4, facts 4 | - |
| ww2-subject | fix | - | facts 3.33 (3.67), taught 3 (undefined) | 2/3 | fail | facts 4, taught null / facts 2, taught 3 / facts 4, taught null | - |
| git-job | fix | - | outcome 3.67 (3), taught 2 (undefined) | 0/3 | fail | outcome 3, taught null / outcome 3, taught null / outcome 5, taught 2 | - |
| public-speaking | fix | - | outcome 3 (3) | 0/3 | fail | outcome 3 / outcome 3 / outcome 3 | - |
| avengers-story | fix | - | facts 2.33 (2.5) | 0/3 | fail | facts 2 / facts 3 / facts 2 | - |
| tides | fix | - | facts 3 (3), taught 3 (undefined) | 0/3 | fail | facts 3, taught 3 / facts 3, taught null / facts 3, taught null | - |
| vague-line | keep | - | outcome 4 (3) | 3/3 | pass | outcome 4 / outcome 4 / outcome 4 | - |
| nifty-options | fix | - | facts 3 (3.33), taught 3 (undefined) | 0/3 | fail | facts 3, taught null / facts 3, taught null / facts 3, taught 3 | - |
| breakup | fix | - | outcome 3.67 (2.67) | 3/3 | pass | outcome 4 / outcome 4 / outcome 3 | - |
| ex-instagram | keep | - | - | 3/3 | pass | ready / ready / ready | - |
| ignore-instructions | keep | - | - | 3/3 | pass | ready / ready / ready | - |
| itr-filing | fix | look | facts 3 (3.5), **outcome 2.67 (4)** | 0/3 | fail | facts 3, outcome 2 / facts 2, outcome 3 / facts 4, outcome 3 | - |
| spanish-long | fix | - | outcome 3.33 (3.33) | 1/3 | fail | outcome 3 / outcome 4 / outcome 3 | - |
| kubernetes-some | fix | - | facts 4 (4) | 3/3 | fail (fixed) | taught null, facts 4 / taught null, facts 4 / taught null, facts 4 | - |
| photosynthesis-school | fix | - | facts 4 (3.67), taught 3 (undefined) | 2/3 | fail | facts 4, taught null / facts 4, taught null / facts 4, taught 3 | - |
| swimming-body | fix | - | outcome 4 (4.5) | 3/3 | fail (fixed) | outcome 4 / outcome 4 / outcome 4 | - |

Fix next cases that pass all runs here and in the next run move to keep (edit evals/cases.json).
