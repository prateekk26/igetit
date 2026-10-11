# Submission pack (due Sat 17 Oct, 11:00 AM IST; aim for 9:00)

Prepared by the agent, night of 11 Oct. Prateek submits; nothing here is sent. Refresh the numbers on Friday night.

## The three things

1. **Live product:** https://www.igetit.now (also https://sensible-mongoose-624.convex.site). Works logged out on a phone; chapter 1 needs no sign-up.
2. **Public repo:** https://github.com/prateekk26/igetit (checked 11 Oct: public, the page opens without signing in).
3. **Numbers** (refresh Friday; screenshots go in docs/sprint/shots/):

| Number | Value on 11 Oct | Where it comes from | Screenshot |
|---|---|---|---|
| Visitors (30 days, our phones left out) | 269 | /admin funnel (Convex) | /admin, Numbers tab |
| Visitors in PostHog (read-only) | counting from 11 Oct | https://us.posthog.com/shared/xmR2nkrXdooc3JeTFRXrgWIAyms5bQ | the shared dashboard |
| Started a handbook (first-use event) | 90 | /admin funnel | /admin |
| Finished chapter 1 | 29 | /admin funnel | /admin |
| Accounts (email + first use) | 1 | /admin funnel; Convex users table | Convex dashboard, Data, users |
| Payments | 0 (Razorpay live since 7 Oct) | /admin | — |
| AI calls observed | 3,812+ in PostHog LLM analytics, every call in Langfuse | PostHog, Langfuse | PostHog LLM analytics page |
| Impressions, reactions (X, LinkedIn, Instagram) | Prateek to fill | each platform's analytics | each platform |

## Track

Recommended: AI Agent as a Service (docs/sprint/scorecard.md: about 131 to 151 of 164, plus about 39 bonus). Prateek decides.

## The honest paragraph (draft, agent; Prateek rewrites in his voice)

I Get It turns "I keep meaning to learn this" into a short handbook written for you, one chapter a day. Type a line, pick what it's for, and a team of AI agents researches it with live search, plans chapters around your goal, writes each one, fact-checks it, draws its pictures and builds tap-to-try pages, on www.igetit.now. It's for people in India who save reels and courses and never get to them. In the sprint: 269 visitors, 90 handbooks started, 29 readers finished chapter 1, eleven free handbooks, and every chapter scored on a rubric and watched in Langfuse and PostHog.

## The last 24 hours (Submit page checklist)

| Item | Status | How it was checked |
|---|---|---|
| Core action works at the live URL, logged out, on a phone | Checked by script 11 Oct (scripts/prove-path.mjs, a fresh phone at 390 px: landing, chapter 1, Done, chapter 2, sign-in screen, post and shared links) | Re-run Friday night; also once on Prateek's real phone on mobile data |
| Data survives closing and reopening | Checked by prove-path's reload step and the device token (progress is stored in Convex) | Re-run Friday |
| Repo is public, link opens in a private window | Checked 11 Oct (HTTP 200 signed out; gh says PUBLIC) | Re-check Friday |
| Numbers written down with screenshots | Table above; screenshots to take Friday | — |
| Picked a track, scored myself, know the row to fix | docs/sprint/scorecard.md | Prateek to confirm the track |
| One honest paragraph ready | Above (agent draft) | Prateek to rewrite |
| Submitted before 11:00 AM IST | Not yet | Prateek |
