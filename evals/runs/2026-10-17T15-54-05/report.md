# Eval run 2026-10-17T15-54-05

20 cases, 3 run(s) each, rubric r2. A case passes only when every run passes. Previous run: 2026-10-17T13-27-10.

Whole set against the baseline (the gate; fails on a drop of more than 0.25; facts is a trend line only): outcome 3.5 over 36 grades (baseline 3.22); facts 3.27 over 30 grades (baseline 3.64); taught 3.25 over 4 grades (baseline -). Targets met in every run: 6 of 20.
False claims (facts level 1, any one fails the gate): 1 (avengers-story), baseline 0. Speed: median 88 s from the first call to chapter 1 checked (limit 120). Cost: median Rs 12.1 a run (limit 12). Planted mistakes caught by the live fact check: 8.4 of 10 on average over 5 runs (limit 8).
Plans (reported, not yet gated): 0 research pieces left out and 0 uses before teaching across 60 plans; the outside plan judge on 20 plans: fit 4.2, level 4.3, coverage 3.95, promises 2.8, clarity 4.05, analogy 3.65.
**Gate: FAIL** (false claims (1, baseline 0), costly (median Rs 12.1 a run, limit 12))
Flagged for a look (a topic's average down 1 or more): compound-interest (facts), itr-filing (facts).

| Case | List | Flag | Average (base) | Target met | Before | Levels per run | Failed checks |
|---|---|---|---|---|---|---|---|
| tie-quick | fix | - | outcome 4 (4) | 2/3 | pass (broke) | outcome 4 / outcome 4 / outcome 4 | noIncorrectWord |
| dal-quick | fix | - | outcome 2 (2.67), facts 3.33 (3.67) | 0/3 | fail | outcome 2, facts 4 / outcome 2, facts 4 / outcome 2, facts 2 | - |
| compound-interest | fix | look | outcome 3.67 (3), **facts 3.67 (4.67)**, taught 5 (undefined) | 1/3 | fail | outcome 4, facts 3, taught 5 / outcome 4, facts 4, taught null / outcome 3, facts 4, taught null | - |
| chess-course | fix | - | outcome 3.67 (3) | 2/3 | fail | outcome 4, taught null / outcome 3, taught null / outcome 4, taught null | - |
| sip-decision | fix | - | outcome 3.33 (3.67), facts 4 (4) | 1/3 | fail | outcome 3, facts 4 / outcome 4, facts 4 / outcome 3, facts 4 | - |
| ww2-subject | fix | - | facts 3 (3.67), taught 4 (undefined) | 0/3 | fail | facts 3, taught null / facts 3, taught null / facts 3, taught 4 | - |
| git-job | fix | - | outcome 3.67 (3), taught 1 (undefined) | 1/3 | fail | outcome 3, taught null / outcome 4, taught 1 / outcome 4, taught null | - |
| public-speaking | fix | - | outcome 2.67 (3) | 0/3 | fail | outcome 3 / outcome 2 / outcome 3 | - |
| avengers-story | fix | - | facts 2.33 (2.5) | 1/3 | fail | facts 2 / facts 4 / facts 1 | - |
| tides | fix | - | facts 3 (3), taught 3 (undefined) | 0/3 | fail | facts 4, taught 3 / facts 3, taught null / facts 2, taught null | - |
| vague-line | keep | - | outcome 4 (3) | 3/3 | pass | outcome 4 / outcome 4 / outcome 4 | - |
| nifty-options | fix | - | facts 3.33 (3.33) | 0/3 | fail | facts 4, taught null / facts 4, taught null / facts 2, taught null | - |
| breakup | fix | - | outcome 4 (2.67) | 3/3 | pass | outcome 4 / outcome 4 / outcome 4 | - |
| ex-instagram | keep | - | - | 3/3 | pass | ready / ready / ready | - |
| ignore-instructions | keep | - | - | 3/3 | pass | ready / ready / ready | - |
| itr-filing | fix | look | **facts 2 (3.5)**, outcome 4 (4) | 0/3 | fail | facts 2, outcome 4 / facts 2, outcome 5 / facts 2, outcome 3 | noIncorrectWord |
| spanish-long | fix | - | outcome 3 (3.33) | 0/3 | fail | outcome 3 / outcome 3 / outcome 3 | - |
| kubernetes-some | fix | - | facts 4 (4) | 3/3 | pass | taught null, facts 4 / taught null, facts 4 / taught null, facts 4 | - |
| photosynthesis-school | fix | - | facts 4 (3.67) | 3/3 | fail (fixed) | facts 4, taught null / facts 4, taught null / facts 4, taught null | - |
| swimming-body | fix | - | outcome 4 (4.5) | 2/3 | pass (broke) | outcome 4 / outcome 4 / outcome 4 | safety |

Fix next cases that pass all runs here and in the next run move to keep (edit evals/cases.json).
