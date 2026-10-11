# Night report, 11 Oct 2026 (Prateek asleep, about 05:00 to 13:00 IST)

Asked for (Prateek, about 05:00 IST): "complete every activity expected of us in the build-sprint handbook from Pick an idea down to the end... without my intervention. I need a list of all things completed in 8 hours: each action vs how we did it and why we did it this way." Then: "Complete pending tasks on the app. All the pending handbooks as well."

What the agent did not do on its own, by rule: anything published or sent in Prateek's name (posts, DMs, replies, the Shaktimaan proofs, asking someone to pay, the final submission). Those are drafted and listed at the end, ready for him.

## Done

| # | Action | How | Why this way | Proof |
|---|---|---|---|---|
| 1 | PostHog counts visitors (Virality visitors row) | posthog-js after the page, counted pages only; key in Convex env via convex/analytics.ts; page views only; no autocapture, recordings or cookie; test visits and our phones send nothing (D68) | The rubric accepts only PostHog, Plausible, GA4 or Datafast with read-only access, else caps the 10x row at L2 | Fresh phone on www.igetit.now: page view accepted (POST /e/ 200); a test visit sent nothing |
| 2 | Read-only dashboard for the judges | Unique visitors total and per day, public link: https://us.posthog.com/shared/xmR2nkrXdooc3JeTFRXrgWIAyms5bQ | Submit asks for visitors with read-only access | Opened signed out |
| 3 | Session replays off in PostHog | Project setting switched off | Matches the code and the privacy page | Held after a reload |
| 4 | AI observability in PostHog | Every AI call's numbers as $ai_generation events every 2 min, history from kickoff, one fixed id per call (D69); Langfuse keeps running | Prateek asked for it; Observability is 7x on the AI Agent track | 3,812+ calls, all distinct |
| 5 | Lighter first download | Rarely opened screens load when opened; the reader's next screens fetched in the background | Prateek: "only download the things for the first screen" | 154 to 120 KB gzipped (−22%); every page opens live |
| 6 | Eval docs | docs/evals/basics.md, advanced.md, where-we-stand.md, our own words | Handbook's two eval sections | Committed |
| 7 | /admin signs in by emailed code (D70) | Same email-otp as readers; no password | Tanisha has no password | Live form shows email then code (a real code round trip not done: no inbox the agent may use) |
| 8 | One Gemini retry on a quick failure (D71) | 503/429/500/502: wait 5 s, Gemini once more, then Opus; timeouts straight to Opus | 2 of 10 bounces on the 28-day build were 16 s 503s | prove-path PASS live |
| 9 | **The ten free handbooks, live** (D74) | Five helper agents wrote the ten hand plans to Hold a room's bar (one running example person with fixed facts; a Try it card by card 3 of chapter 1; 7 chapters of 2 to 4 min; money topics with made-up companies and no advice); a code check on every plan; built on dev with the full reader pipeline (research, writer, fact check, Try it pages, quiz versions, scorer); tidied; read; copied word for word to prod; redirects from the plain subject words; the old "How Indian IPOs work" off the Shelf but kept for its 6 readers | Prateek: "All the pending handbooks as well" and, on 10 Oct, "make them the best we can"; hand plans because the showcase showed they beat an automatic plan on one running example and an early aha | Live check as a fresh phone at 390 px: all 11 titles on the Shelf, the old IPO title gone; a post link opens chapter 1 with its drawn picture, no sideways scroll; "job search" typed opens the new handbook (fromCache true) |
| 10 | The tidy pass on the ten | 27 chapters marked "unchecked" only because the checker wanted a card type the build fixes afterwards were checked again with Try it cards kept as built (showcase.recheck): every one came back "fixed", 2 to 6 real fixes each (a beginner's term explained, an absolute claim softened). Also: 5 Try it captions rewritten to match their pages (two were empty, two described a paper task, one gave away the answer); 3 cards retyped or removed (a story typed as a dare; a premature task); 10 uses of "wrong"/"incorrect" reworded; 3 missing outcome lines filled from the plan | Readers see the caption above every Try it page; "Tonight's dare" over a worked example misleads; AGENTS.md bans "wrong"/"incorrect" | tidy script clean on all ten |
| 11 | Multibaggers rebuilt | Its research came back with 2, then 3 facts (5 searches, no sources); the chapters teach general patterns through a made-up company, so it was read in full instead: every made-up number agrees across chapters (25% a year for 10 years is 9.3x; ₹40 to ₹720 is 18x; 6 crore shares at ₹40 is ₹240 crore) | Thin research means fewer checked facts; a full read is the honest check | Read in full |
| 12 | Hold a room fixes, live | Days 1, 3, 10, 17, 24 checked again (day 1 now passes clean); the body-text fixes of days 10 and 17 and "That sounds wrong" (day 26, now "That feels odd") carried to the stored topic and all 7 readers' copies with the existing text repair, which keeps pictures | Copying from dev again would have wiped the pictures drawn on prod | 3 edits, 1 stored row and 7 copies each |
| 13 | A rubric scorer on every chapter (D72) | Rubric r1, three levers (delivers its outcome, true and specific facts, teaches before it tests), L1 to L5; scored a minute after each chapter is saved, one lever per Sonnet call, quoting the line that decided it | Eval basics: "every output logged and scored against a rubric"; Advanced: "one lever per call", "ask for the line" | First live scores: outcome 4, facts 3, taught "can't tell" (no quiz) on the job handbook's chapter 1, each with its quote |
| 14 | The test set, runner and gate (D72) | evals/cases.json: 20 cases (12 keep, 8 fix next, incl. a harmful line and a prompt-injection line); scripts/eval-run.mjs: real pipeline on dev to chapter 1, 3 runs a case, all must pass, compared case by case with the last run; npm run eval:gate fails when a keep case breaks; low live scores become cases with one tap on /admin | Advanced evals: a test set in two lists, three runs, test every change | First baseline run in progress (results below) |
| 15 | Alerts, search across runs, two runs side by side (D73) | convex/watch.ts every 10 min; /admin AI tab: Alerts, Find and compare runs, Chapter quality | AI Agent rubric's Observability L5: "diff two runs, alerts on failure or cost spike, search across runs" | The check runs on prod: 2 calls in the last hour, nothing raised |
| 16 | Pictures for readers' chapters | 7 live chapters with at most one drawing redrawn; 70 new chapters queued (chapter 1 of every topic first) | Readers called missing pictures an impediment (9 Oct) | Queue running on prod |
| 17 | Sprint pack | docs/sprint/: scorecard.md (all three rubrics, row by row, recommends AI Agent as a Service: about 131 to 151 of 164 plus about 39 bonus), submission.md (the three things, numbers, the honest paragraph, the last-24-hours checklist), build-in-public.md (idea list, Mon/Wed/Fri raw material with real numbers and five first lines each), launch-video.md (script in the handbook's template, two more hooks, shot list), users-week.md (the daily note: the blocker is chapter 1's first two cards, where 34 of 49 quitters left) | The handbook's Scoring, Submit, Build in Public, Launch Video and Users & distribution pages | Committed |

## The handbook, Pick an idea to Submit

| Section | Expected | Status |
|---|---|---|
| Pick an idea, Lock your idea | An idea that passes the four rules; the lock sheet | Done before kickoff (docs/idea-lock.md); badges given |
| Product thinking | PRODUCT.md: the job, the forces, the flow, onboarding, v1 cut | Done (PRODUCT.md) |
| Design thinking | DESIGN.md, screens and states, words, the loop | Done (DESIGN.md) |
| Tech thinking | Four lines, agent rules, live link and public repo, the AI call capped | Done (AGENTS.md; www.igetit.now; github.com/prateekk26/igetit, public) |
| Eval basics | A rubric for one core output; every output logged and scored | Done tonight (rubric r1, scorer on every chapter) |
| Advanced evals | Read 50 outputs, test set in two lists, 3 runs, scorer checked, run before change, live misses into the set | Mostly done: set, runner, gate, closed loop built; baseline run tonight. Left for Prateek: his own notes on 50 real chapters and scoring 30 by hand to check the scorer (the handbook says the builder writes these) |
| Users & distribution | Watch 3 people; distribute; daily note, one blocker | Daily note written from data and the blocker addressed in every new handbook; watching people and sending DMs are Prateek's (users-week.md) |
| Build in Public | Idea list; three posts this week; reply to every reply; numbers noted | Idea list and raw material ready; the posts are Prateek's words (the handbook: never write posts with AI) |
| Product Launch Video | Hook, two story parts, promise or offer, a minute, posted with two more hooks | Script, hooks and shot list ready; shooting and posting are Prateek's |
| Scoring | Pick a track, score yourself, know the row to fix | Done (scorecard.md); Prateek picks the track |
| Submit | Live URL, public repo, numbers with screenshots, paragraph, submitted by 11:00 on 17 Oct | Pack ready (submission.md); screenshots and submitting are Prateek's |

## Waiting on Prateek

1. Pick the primary track (recommended: AI Agent as a Service; docs/sprint/scorecard.md).
2. Watch three people use it, and send ten DMs (docs/sprint/users-week.md).
3. Write and post this week's three posts from docs/sprint/build-in-public.md, in his words.
4. Shoot the launch video (docs/sprint/launch-video.md).
5. Ask someone to pay (the next badge): send the price or the payment link to a real prospect.
6. Show Shaktimaan the proofs for the next badges.
7. Optional: `npx convex env set ALERT_EMAIL <your email> --prod` so alerts are also emailed.
8. Read one or two of the new handbooks on his phone; their copy is (agent) until he rewrites it.
9. Tanisha: sign in at www.igetit.now/admin with her email and the code.
