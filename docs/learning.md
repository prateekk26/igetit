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


## Tue 20 Oct (day 19)

### The wait screen promised two minutes for a 90-second wait
- **Realised:** 20 Oct (day 19), reading /admin's new "chapter 1 in" column (66 to 96 s) next to the screen's "About two minutes in all"
- **Could have known:** 17 Oct (day 16), when the gate measured 98 s from research to chapter 1 and the plan moved to Sonnet (11 s)
- **What it cost:** 3 days of every typed book's wait saying it took a third longer than it did, on a screen that also never called back a reader who left
- **Now:** the times sit in WaitBar.tsx next to their measurement; any change to the pipeline's speed rereads them
- **Post opener:** Our loading screen said two minutes. It took ninety seconds. Here's what we changed.

## Mon 19 Oct (day 18)

### The live address went down over a $10 payment
- **Realised:** 19 Oct (day 18), when www.igetit.now refused every secure connection
- **Could have known:** 17 Oct (day 16), from the Convex invoice marked "Payment failed" and the dashboard banner
- **What it cost:** about a day of www.igetit.now down; paying readers and the Razorpay-approved address both live there
- **Now:** a failed Convex payment is fixed the same day; the custom domain is re-added and checked after any plan change
- **Post opener:** "My app went down and the code was fine. A $10 card decline deleted my domain."

### Our AI cost numbers were wrong for weeks
- **Realised:** 19 Oct (day 18), checking an Opus price against Anthropic's list
- **Could have known:** from the day Sonnet 5.5 and Opus 5.5 went in, from their price pages
- **What it cost:** Sonnet shown 50% high, Opus 25% high, voice 2.4 times low, the rupee 13% off; pictures missing from every book's cost
- **Now:** dollars from each provider's page in convex/costs.ts, one rate (USD_INR), a date on both
- **Post opener:** "I optimised my AI bill for a week using prices I'd never checked."

## Sat 17 Oct (day 16)

### Backup models were eating almost half the AI bill
- **Realised:** 17 Oct (day 16), chasing why a book cost ₹70 to ₹75 instead of ₹15 to ₹20.
- **Could have known:** 9 Oct (day 8), when the call log started marking chapters that "bounced" to Opus and /admin showed it; nobody added it up as money.
- **What it cost:** in the 7 days to 17 Oct, ₹368 of ₹830 of live AI spend went to backups (Opus chapters ₹194, Claude research ₹92, Opus plans ₹82); 14 of 38 Gemini chapter calls failed. A typed book's median was ₹50. Readers waited too: 212 s median to chapter 1, 405 s for the slowest 5%.
- **Now:** the release gate fails when a test book's median cost is over ₹14.5, the second Gemini model (which failed the same way) is gone, and backups are a cost line we read, not a safety net we forget.
- **Post opener:** "Our safety net was costing more than the thing it was catching."

## Fri 16 Oct (day 15)

### Payments were blocked on our own domain for six days
- **Realised:** 16 Oct (day 15), when Prateek said people were trying to pay and couldn't; Razorpay's payment page said "Payment blocked as website does not match registered website(s)".
- **Could have known:** 10 Oct (day 9), the day www.igetit.now became the live address (D66). The switch covered our code and Convex settings; nobody listed the outside dashboards that hold our address.
- **What it cost:** every payment from www.igetit.now since then. Razorpay recorded one blocked ₹199 attempt (16 Oct 17:47), the only attempt since 7 Oct; our own stats counted 0 Pay taps that week, so we can't say how many more gave up before Razorpay. Fix: 24 to 48 hours of Razorpay review.
- **Now:** an address change gets a list of every outside service that stores it (Razorpay website and webhook, sign-in redirect, analytics, link previews), each checked with one real attempt from the new address.
- **Post opener:** "We moved to a shiny new domain. Our payment provider quietly refused every rupee for six days."


## Tue 13 Oct (day 12)

### Our posts talked about the build instead of what a reader gets
- **Realised:** 13 Oct (day 12). UD (GrowthX mentor) reviewed one of our X posts in a DM (x.com/KurkanjiPrateek/status/2109700326127435996): the first line, the most valuable space, said "Day N of building in public", and "people don't care". The numbers line ("78 visitors · 32 handbooks started...") meant nothing to a stranger and was too small to make anyone curious. The post called the AI model "he". The clone story made UD think I Get It might be an AI clone product. And the reel's script didn't make sense until 15 seconds in: "Please don't use AI to write the script."
- **Could have known:** 6 Oct (day 5), when we fixed the X format as Day N plus live numbers. Every X post since opened with the journey. And from our own reel formula: the point lands in the first 3 seconds.
- **What it cost:** X has sent 2 visitors in total (1 from x, 1 from t.co) out of 80 tracked, against 52 from GrowthX and 21 from Instagram. That's 8 days of daily X posts.
- **Now:** every post opens with what the reader will learn and keeps the build story out. Every caption and reel script goes through the humanizer skill (.claude/skills/humanizer, from github.com/blader/humanizer) and gets read aloud before Prateek sees it. x-post, ig-post and docs/content-system.md say so.
- **Post opener:** "A mentor read my tweet and asked: who is 'he'? It was an AI. I'd been writing like one too."

### "The next chapter will slow down" was a promise the writer never heard
- **Realised:** 13 Oct (day 12), redesigning the question after each chapter (D96).
- **Could have known:** 7 Oct (day 6), when chapters without a reader profile became one shared copy and stopped receiving the reading report.
- **What it cost:** every "Lost me" or "Too easy" from a reader with no profile (most of them) paid for a rewrite, about ₹13, that never saw the rating, while the screen promised the change. And when we first fixed it, a member's note ("use cricket examples") still went nowhere: the writer's instructions only knew about missed quizzes, so 0 of 536 words used it. Sent in the Reader line instead, the next try built an example around cricket commentators.
- **Now:** only members' answers rewrite a chapter, and they travel in the Reader line, which the writer follows on every card.
- **Post opener:** "For six days my app told readers 'got it, the next chapter will slow down'. It never told the AI."

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
