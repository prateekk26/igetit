# Scorecard: I Get It against the sprint rubric (2.2.0)

Agent's self-score, night of 11 Oct, for Prateek to check (Submit: "picked my primary track and scored myself on its rubric; know which row I'd fix with two more hours"). Numbers from prod /admin (last 30 days, our own phones left out) unless marked. Points = (L − 1) × weight. Rows marked "?" need Prateek's own numbers (social impressions and reactions live in his accounts).

## Recommendation: AI Agent as a Service as the primary track

It scores highest on what we can prove without new traffic, and its root row (real output on a real surface) is what the product does every time someone types a line: a pipeline of agents researches, plans, writes, fact-checks, illustrates and builds interactive pages for a real reader on the live site. Virality and Revenue both hinge on numbers we don't have yet (1 sign-up with an email, ₹0 paid). Bonus from the other tracks (0.5x, cap 50) still counts.

The open question for Prateek: is a learning product "agents as employees replacing a human function"? Our case: it replaces a tutor's prep department (a researcher, a curriculum designer, a writer, an editor who fact-checks, an illustrator, an interaction designer), with a manager step (the plan) deciding the work per reader. A reviewer could read it as a consumer app instead; the honest paragraph below says what it is either way.

## AI Agent as a Service (164 base + overflow)

| Row | Weight | Level | Points | Evidence | To raise it |
|---|---|---|---|---|---|
| Working product shipping real output | 20x | L5 (claim) / L4 (safe) | 80 / 60 | 90 handbooks started by real readers in 30 days; each typed line is researched (Gemini + Google Search), planned, written, fact-checked (Sonnet), illustrated (Runway) and given tap-to-try pages, with no human in the loop, on www.igetit.now. Overflow: every handbook a judge types during judging is one more autonomous real task. | Show a judge-typed topic end to end in the submission (a screen recording) |
| Agent org structure | 5x | L4 | 15 | The plan step is a manager: it reads the reader's goal and the research brief and decides the chapters, each chapter's blocks (picture, teach, try it, timer, quiz) and its proof, then the writer, the fact checker, the picture scenes and the Try it builder work per chapter; a failing writer is replaced (Gemini to Opus) and a chapter that misses is re-taught next time (reading report) | L5 needs specialists spawned on the fly |
| Observability | 7x | L5 | 28 | Every call logged (aiCalls, callStats); one trace tree per handbook in Langfuse and in PostHog LLM analytics (who called whom, tokens and cost per step); /admin: per-step p50/p95/p99, per-handbook timeline, search across runs, two runs side by side, alerts on a failure or cost spike (D73) | Turn on ALERT_EMAIL so alerts also arrive by email |
| Evaluation and iteration | 5x | L4 | 15 | Versioned prompts (plan v1 to v9, writer v1 to v6, check v1 to v3) with an eval round per change (evals/); a rubric scorer on every chapter (D72); a 20-case test set in two lists, three runs a case, and a gate that fails a release when a must-keep case breaks (npm run eval:gate); low live scores go into the set with one tap; the owner checks the scorer on /admin (D75); two prompt ideas were tested head to head before any change (evals/do-once-2026-10-11.md) and the rubric moved to r2 on what they showed | L5: run the gate on every prompt change for a week and show the gains across versions |
| Agent handoffs and memory | 2x | L5 | 8 | Working memory: the research brief and the "Already taught" ledger passed chapter to chapter; episodic: the reading report (what the reader missed, how they did) shapes the next chapter; semantic: the reader's profile line and the plan carried across sittings | — |
| Cost and latency per task | 1x | L4 | 3 | A chapter (the task a reader waits on): about 30 s to 2 min, about ₹1 to ₹9 ($0.01 to $0.11) | Under 1 min and under $0.10 every time: the slow tail is Gemini timeouts |
| Management UI | 1x | L3 | 2 | /admin: shelf switches, awards, provider switch, pipeline, quality, test set, alerts; a PM could run it with docs | A one-page walkthrough for a non-engineer |
| **Total** | | | **151 (claim) / 131 (safe)** | | |

## Virality (164 base + overflow)

| Row | Weight | Level | Points | Evidence | To raise it |
|---|---|---|---|---|---|
| Impressions and views | 1x | ? | ? | Prateek's X, LinkedIn, Instagram analytics | Screenshots of each platform's totals |
| Reactions and comments | 2x | ? | ? | Same | Same |
| Amplification quality | 3x | ? | ? | Any notable reshare | — |
| Visitors to product | 10x | L2 cap | 10 | 269 visitors on /stats in 30 days, but PostHog (an accepted tool) only counts from 11 Oct; without its numbers the row caps at L2 | Every visitor from now on counts in PostHog |
| Signups or meaningful actions | 25x | L2 | 25 | 90 first-use events (a handbook started) if anonymous first use counts; 1 if only accounts count | The free sign-up offer on the free eleven |
| **Total** | | | **35 + social** | | |

## Revenue (176 base + overflow)

| Row | Weight | Level | Points | Evidence |
|---|---|---|---|---|
| Signups (email + first use) | 20x | L2 | 20 | 1 account with an email that used the product |
| Live product quality | 8x | L4 | 24 | Chapter 1 in about 1 to 2 min from a typed line; 29 of 80 who opened chapter 1 finished it; landing cut to 5 screens |
| Revenue generated | 4x | L1 | 0 | ₹0; Razorpay live since 7 Oct |
| Waitlist | 4x | L1 | 0 | none |
| Pain point severity | 2x | L3 | 4 | Named users and conversations: the first user test (4 Oct), the calisthenics reader, coursemates |
| SOM | 2x | L3 | 4 | Indian learners who save self-improvement content × ₹2,000 a year (needs the GrowthX calculator) |
| Right to win | 2x | L2 | 2 | — |
| Why now | 1x | L3 | 2 | Cheap fast models with search (Gemini 3.8 Flash at about ₹1 a plan) made a researched handbook per person affordable this year |
| Moat | 1x | L2 | 1 | Taste in the craft; the eval set and reading reports compound |
| **Total** | | | **57** | |

## Cross-track bonus (0.5x, cap 50), if AI Agent is primary

Virality signups L2: 1 × 12.5 = 12.5. Virality visitors L2: 1 × 5 = 5. Revenue live product quality L4: 3 × 4 = 12. Revenue signups L2: 1 × 10 = 10. About 39.

## The row to fix with two more hours

Evals, from L4 to L5: run the gate on the next two prompt changes and publish the before/after table. Second: a screen recording of a stranger's typed topic going end to end, for the root row's evidence.
