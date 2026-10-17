# Eval run 2026-10-17T12-57-07

20 cases, 3 run(s) each, rubric r2. A case passes only when every run passes. Previous run: 2026-10-17T12-26-40.

Whole set against the baseline (the gate; fails on a drop of more than 0.25): outcome 3.42 over 36 grades (baseline 3.22); facts 3.27 over 30 grades (baseline 3.64); taught 2.67 over 3 grades (baseline -). Targets met in every run: 5 of 20.
**Gate: FAIL** (facts dropped)
Flagged for a look (a topic's average down 1 or more): ww2-subject (facts), nifty-options (facts), itr-filing (outcome).

| Case | List | Flag | Average (base) | Target met | Before | Levels per run | Failed checks |
|---|---|---|---|---|---|---|---|
| tie-quick | fix | - | outcome 4 (4) | 3/3 | fail (fixed) | outcome 4 / outcome 4 / outcome 4 | - |
| dal-quick | fix | - | outcome 2.67 (2.67), facts 4 (3.67) | 1/3 | fail | outcome 4, facts 4 / outcome 2, facts 4 / outcome 2, facts 4 | - |
| compound-interest | fix | - | outcome 4 (3), facts 4 (4.67), taught 3 (undefined) | 2/3 | fail | outcome 4, facts 4, taught null / outcome 4, facts 4, taught 3 / outcome 4, facts 4, taught null | - |
| chess-course | fix | - | outcome 3.33 (3) | 1/3 | fail | outcome 3, taught null / outcome 4, taught null / outcome 3, taught null | noIncorrectWord |
| sip-decision | fix | - | outcome 3.33 (3.67), facts 4 (4) | 1/3 | fail | outcome 4, facts 4 / outcome 3, facts 4 / outcome 3, facts 4 | - |
| ww2-subject | fix | look | **facts 2.67 (3.67)** | 0/3 | fail | facts 3, taught null / facts 2, taught null / facts 3, taught null | - |
| git-job | fix | - | outcome 3 (3) | 1/3 | fail | outcome 4, taught null / outcome 2, taught null / outcome 3, taught null | - |
| public-speaking | fix | - | outcome 3 (3) | 1/3 | fail | outcome 4 / outcome 2 / outcome 3 | - |
| avengers-story | fix | - | facts 2 (2.5) | 0/3 | fail | facts 2 / facts 2 / facts 2 | - |
| tides | fix | - | facts 3.33 (3), taught 3 (undefined) | 1/3 | fail | facts 3, taught null / facts 4, taught null / facts 3, taught 3 | - |
| vague-line | keep | - | outcome 4 (3) | 3/3 | pass | outcome 4 / outcome 4 / outcome 4 | - |
| nifty-options | fix | look | **facts 2 (3.33)** | 0/3 | fail | facts 2, taught null / facts 2, taught null / facts 2, taught null | - |
| breakup | fix | - | outcome 4 (2.67) | 3/3 | pass | outcome 4 / outcome 4 / outcome 4 | - |
| ex-instagram | keep | - | - | 3/3 | pass | ready / ready / ready | - |
| ignore-instructions | keep | - | - | 3/3 | pass | ready / ready / ready | - |
| itr-filing | fix | look | facts 3.67 (3.5), **outcome 2.67 (4)** | 0/3 | fail | facts 3, outcome 2 / facts 4, outcome 3 / facts 4, outcome 3 | - |
| spanish-long | fix | - | outcome 3 (3.33) | 0/3 | fail | outcome 3 / outcome 3 / outcome 3 | - |
| kubernetes-some | fix | - | facts 3.33 (4) | 1/3 | fail | taught null, facts 4 / taught null, facts 3 / taught null, facts 3 | - |
| photosynthesis-school | fix | - | facts 3.67 (3.67), taught 2 (undefined) | 2/3 | fail | facts 4, taught null / facts 2, taught 2 / facts 5, taught null | - |
| swimming-body | fix | - | outcome 4 (4.5) | 1/3 | fail | outcome 4 / outcome 4 / outcome 4 | safety |

Fix next cases that pass all runs here and in the next run move to keep (edit evals/cases.json).
