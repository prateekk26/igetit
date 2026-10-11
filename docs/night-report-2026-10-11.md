# Night report, 11 Oct 2026 (Prateek asleep)

Asked for (Prateek, about 05:00 IST): "complete every activity expected of us in the build-sprint handbook from Pick an idea down to the end... without my intervention. I need a list of all things completed in 8 hours: each action vs how we did it and why we did it this way." Then: "Complete pending tasks on the app. All the pending handbooks as well."

What the agent did not do on its own, by rule: anything published or sent in Prateek's name (posts, DMs, replies, the Shaktimaan proofs, asking someone to pay, the final submission). Those are drafted and listed at the end, ready for one tap each.

## Done

| # | Action | How | Why this way | Proof |
|---|---|---|---|---|
| 1 | PostHog counts visitors (Virality rubric's visitors row) | posthog-js loaded after the page on counted pages only; key in Convex env, served by convex/analytics.ts; page views and page leaves only; no autocapture, recordings, surveys or cookie; test visits and phones marked as ours send nothing (D68) | The rubric accepts only PostHog, Plausible, GA4 or Datafast with read-only access, else caps the 10x visitors row at L2; PostHog is free and shares a read-only dashboard | Fresh phone on www.igetit.now: page view accepted (POST /e/ 200), test visit sent nothing |
| 2 | Read-only dashboard for the judges | Dashboard "I Get It · visitors (GrowthX Build Sprint)" with unique visitors total and per day, public share link on: https://us.posthog.com/shared/xmR2nkrXdooc3JeTFRXrgWIAyms5bQ | Submit asks for visitors with read-only analytics access | Opened signed out: 2 visitors |
| 3 | Session replays off in PostHog | Project setting "Record user sessions" switched off | Matches the code and the privacy page; readers type personal goals | Held after a reload |
| 4 | AI observability in PostHog | Every AI call's numbers (step, model, provider, time, tokens, cost, tries, error; never text) as $ai_generation events every 2 minutes, history back to kickoff, a fixed id per call so a resend is kept once (D69); Langfuse keeps running | Prateek asked for it in PostHog; the AI Agent track scores Observability 7x (bonus 3.5x on another track) | 3,812 calls in PostHog, 3,812 distinct |
| 5 | Lighter first download | Admin, Stats, Policy, Print, Tune, Compare load when opened; Done, Sign-in, Shelf, Pricing fetched in the background after the first screen (skipped on save-data and 2G) | Prateek: "only download the things for the first screen"; Next.js needs a server host outside Convex, so React on Vite stays | Main bundle 523 to 400 KB (154 to 120 KB gzipped); every page opens live |
| 6 | Eval docs | docs/evals/basics.md, advanced.md, where-we-stand.md, in our own words (repo is public) | Handbook's Eval basics and Advanced evals; Evals weigh 5x | Committed |
| 7 | /admin signs in by emailed code (D70) | Same email-otp provider as readers; no password field | Tanisha has no password; only a code-verified email can open /admin | Live form shows email then code; a real code round trip not done (no inbox the agent may use) |
| 8 | One Gemini retry on a quick failure (D71) | 503/429/500/502 or a dropped connection: wait 5 s, Gemini once more, then Opus; timeouts straight to Opus | 2 of 10 Opus bounces on the 28-day build were 16 s 503s; no model choice changed | Tested on the real error strings; prove-path PASS live |
