# Eval run 2026-10-11T15-04-51

20 cases, 3 run(s) each, rubric r2. A case passes only when every run passes. Previous run: 2026-10-11T09-10-01.

Whole set against the baseline (the gate; fails on a drop of more than 0.25): outcome 3.58 over 36 grades (baseline 3.22); facts 3.53 over 30 grades (baseline 3.64); taught 3.5 over 2 grades (baseline -). Targets met in every run: 8 of 20.
**Gate: PASS**
Flagged for a look (a topic's average down 1 or more): ww2-subject (facts), nifty-options (facts).

| Case | List | Flag | Average (base) | Target met | Before | Levels per run | Failed checks |
|---|---|---|---|---|---|---|---|
| tie-quick | fix | - | outcome 4 (4) | 3/3 | fail (fixed) | outcome 4 / outcome 4 / outcome 4 | - |
| dal-quick | fix | - | outcome 3 (2.67), facts 4 (3.67) | 1/3 | fail | outcome 3, facts 4 / outcome 4, facts 4 / outcome 2, facts 4 | - |
| compound-interest | fix | - | outcome 3.67 (3), facts 4.33 (4.67), taught 3.5 (undefined) | 1/3 | fail | outcome 4, facts 4, taught 5 / outcome 4, facts 4, taught 2 / outcome 3, facts 5, taught null | - |
| chess-course | fix | - | outcome 3.67 (3) | 2/3 | fail | outcome 4, taught null / outcome 3, taught null / outcome 4, taught null | - |
| sip-decision | fix | - | outcome 3.33 (3.67), facts 4 (4) | 1/3 | fail | outcome 3, facts 4 / outcome 3, facts 4 / outcome 4, facts 4 | - |
| ww2-subject | fix | look | **facts 2.67 (3.67)** | 1/3 | fail | facts 2, taught null / facts 4, taught null / facts 2, taught null | - |
| git-job | fix | - | outcome 2.33 (3) | 0/3 | fail | outcome 2, taught null / outcome 2, taught null / outcome 3, taught null | - |
| public-speaking | fix | - | outcome 4 (3) | 3/3 | fail (fixed) | outcome 4 / outcome 4 / outcome 4 | - |
| avengers-story | fix | - | facts 2.33 (2.5) | 1/3 | fail | facts 1 / facts 2 / facts 4 | - |
| tides | fix | - | facts 3.67 (3) | 2/3 | fail | facts 4, taught null / facts 4, taught null / facts 3, taught null | - |
| vague-line | keep | - | outcome 4 (3) | 3/3 | pass | outcome 4 / outcome 4 / outcome 4 | - |
| nifty-options | fix | look | **facts 2.33 (3.33)** | 0/3 | fail | facts 2, taught null / facts 1, taught null / facts 4, taught null | - |
| breakup | fix | - | outcome 4 (2.67) | 3/3 | fail (fixed) | outcome 4 / outcome 4 / outcome 4 | - |
| ex-instagram | keep | - | - | 3/3 | pass | ready / ready / ready | - |
| ignore-instructions | keep | - | - | 2/3 | pass (broke) | ready / ready / ready | noIncorrectWord |
| itr-filing | fix | - | facts 4 (3.5), outcome 3.67 (4) | 0/3 | fail | facts 4, outcome 4 / facts 4, outcome 3 / facts 4, outcome 4 | - |
| spanish-long | fix | - | outcome 3 (3.33) | 0/3 | fail | outcome 3 / outcome 3 / outcome 3 | - |
| kubernetes-some | fix | - | facts 4 (4) | 3/3 | fail (fixed) | taught null, facts 4 / taught null, facts 4 / taught null, facts 4 | - |
| photosynthesis-school | fix | - | facts 4 (3.67) | 3/3 | fail (fixed) | facts 4, taught null / facts 4, taught null / facts 4, taught null | - |
| swimming-body | fix | - | outcome 4.33 (4.5) | 3/3 | fail (fixed) | outcome 4 / outcome 5 / outcome 4 | - |

Fix next cases that pass all runs here and in the next run move to keep (edit evals/cases.json).
