# Learned too late

Things we realised a bit too late. Better late than never. Each one is raw material for a post: what we realised, when we could have known, what the wait cost, and what we do now. Numbers over adjectives. Newest day on top.

This is narrower than docs/lessons.md. Lessons are everything a day taught. This file is only the "should have done this on day 1" moments, with the price of finding out late. When one comes from a lesson, link to the day; don't copy it.

How entries get here:
- Prateek starts a message with "late:" and the hook (scripts/post-idea-hook.sh) saves it word for word under "Noted during the day" at the bottom. Fold those into the day before the session ends.
- Any session that catches something late (a bug live for days, a rule found after breaking it, a tool that would have saved hours) adds an entry itself (AGENTS.md §2).

Entry format:

```
### <what we were late on, in a few words>
- **Realised:** date (day N)
- **Could have known:** date (day N), and from what
- **What it cost:** numbers
- **Now:** what we do instead
- **Post opener:** one line, a draft only; the post is in Prateek's words
```

Day 1 is Fri 2 Oct (kickoff); Sat 17 Oct is submission.


## Tue 13 Oct (day 12)

### Quick handbooks asked chapter 1's question at every chapter
- **Realised:** 13 Oct (day 12), when Prateek read "Navigating the corporate world as a woman" and saw the same quiz open chapters 2 to 5.
- **Could have known:** 10 Oct (day 9), the day quick handbooks stopped having quizzes after chapter 1 (D62). The review lookup walked back to the last chapter that had any, which was always chapter 1.
- **What it cost:** every quick-handbook reader past chapter 2 got the same question again, every chapter, for 3 days. 203 handbooks on dev have this shape.
- **Now:** review questions come only from the chapter just finished (commit 07673b7).
- **Post opener:** "My app asked readers the same question five chapters in a row. I only noticed because I read it myself."


## Sun 11 Oct (day 10)

### Evals came after the big changes, not before
- **Realised:** 11 Oct (day 10), when the test set, the scorer on every chapter and the release gate went in (D72).
- **Could have known:** 7 Oct (day 6), the Eval basics class. Really 2 Oct, the day we decided an AI writes every chapter.
- **What it cost:** two big changes shipped with nothing to compare against: plans and chapters moved from Opus to Gemini Flash on 8 Oct (D15), and the whole handbook shape changed on 10 Oct (D62). The only checks were one-topic comparisons. The first full run (11 Oct) had 17 of 20 cases below their target, and we can't tell if those changes helped or hurt, because there's no "before".
- **Now:** `npm run eval:gate` before any prompt, model or scorer change ships. A low score on a live chapter becomes a test case in one tap.
- **Post opener:** "I swapped the AI model behind my app before I had a single test. Here's what I can't answer now."

### Analytics on day 10, not day 1
- **Realised:** 11 Oct, 04:20 (day 10), scoring the sprint rubric row by row.
- **Could have known:** 2 Oct (day 1). The handbook asks for analytics with read-only access in week one, and the Virality rubric counts visitors only from PostHog, Plausible, GA4 or Datafast.
- **What it cost:** about 269 visitors from 9 days that the rubric doesn't count; they live only in our own /stats. (AI call numbers did recover: PostHog took the call log back to 2 Oct, D69. Visitors can't be sent back.)
- **Now:** PostHog from 11 Oct (D68), page views only, with a public read-only dashboard.
- **Post opener:** "269 people visited my app in 9 days. Officially, zero did."

### Linear on day 10, after the list had already run away
- **Realised:** 11 Oct (day 10). Prateek: "you keep adding to the list every time and keep inventing issues to fix even when I ask you to complete something end to end." And on himself: "I also keep on increasing scope when I discover some insights or bugs."
- **Could have known:** around 9 Oct (day 8), when the UX pass came back with 51 items.
- **What it cost:** a night report with 27 actions and proposals on top; "finish X" kept turning into X plus new finds, so it was hard to see when anything was done.
- **Now:** finish only what was asked; anything new goes to Linear Triage in one line, and only Prateek moves it out.
- **Post opener:** "My AI coder and I had the same bad habit: every bug we found became today's job."


## Sat 10 Oct (day 9)

### Fact-check fixes to step cards were thrown away for two days
- **Realised:** 10 Oct, night (day 9), when both dal chapters came back "unchecked" (lessons.md, Sat 10 Oct, the night).
- **Could have known:** 8 Oct (day 7), the day steps cards came in.
- **What it cost:** every fix the fact check wrote for a steps card was skipped, because our guard only accepted a fix with a body or a prompt. Nobody noticed, because the old checker rarely rewrote those cards.
- **Now:** a fix passes when it keeps the original card's keys and kinds of value. Dal went from "unchecked" to "fixed, 2".
- **Post opener:** "My fact checker was finding mistakes. My own code was quietly binning the fixes."


## Fri 9 Oct (day 8)

### Error messages never reached the live site
- **Realised:** 9 Oct (day 8), in the UX review (lessons.md, Fri 9 Oct, the day).
- **Could have known:** the first time we tested an error on prod instead of dev.
- **What it cost:** on the live site, "That email and password don't match" and "You're already paid up" could only ever show the generic fallback. Dev passes the words through, so every test looked fine.
- **Now:** a reason the screen must act on travels as a ConvexError code; fallbacks cover the likely causes on their own.
- **Post opener:** "Every error message in my app worked perfectly. On my laptop."


## Thu 8 Oct (day 7)

### Hashtags and links: we were following folklore
- **Realised:** 8 Oct (day 7), reading the platforms' own guidance (lessons.md, Thu 8 Oct).
- **Could have known:** before the first post. Instagram's guidance (Dec 2025) says up to 5 targeted hashtags.
- **What it cost:** our posts carried 11 to 13 hashtags, and links on X went in the first reply on advice X's head of product had already contradicted.
- **Now:** 3 to 5 hashtags, #IGetIt first; on X, a two-week test of link placement, judged by visitors with utm_source=x.
- **Post opener:** "I used 13 hashtags per post. Instagram had already said 5."


## Noted during the day
