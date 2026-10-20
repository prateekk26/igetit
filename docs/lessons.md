# Lessons, day by day

What each day taught us, not what shipped (that's PROGRESS.md). Every build day gets two halves, Product/Tech and GTM, written by whichever session did the work (Prateek, 8 Oct: "Product/Tech and GTM lessons every single day we build"). Each lesson: what we thought, what we learned, what we do now. Numbers over adjectives. Newest day on top.

Feeds the 9:30 X draft (scripts/x-nightly.sh reads yesterday's day) and the end-of-sprint write-up. A message that starts with "learned:" lands under "Noted during the day" at the bottom; fold those into the day before the session ends.


## Tue 20 Oct, the day (day 19; the wait that fills)

### Product/Tech
- Thought: the wait screen's "about two minutes" was a safe promise. Learned: since the 17 Oct speed-up the real wait is 66 to 96 s (p50: research 43 s, plan 11 s, chapter 33 s, check 9 s), so the screen was overstating it by a third; the second test book still took 120 s. Now: the times live in one place (WaitBar.tsx BOOK_MS, CHAPTER_MS), next to the measurement they came from.
- Thought: a progress bar is one component. Learned: the wait spans two screens (the wait screen, then the handbook page once the plan lands), and timing each screen on its own made the bar fall from 70% to 7% at the hand-off. Now: chapter 1 of a new book carries the book's clock and a 60% floor onto the handbook page.

- Thought: a scroll-reveal is a CSS class and an observer. Learned: hiding everything with a class on the list leaves any row added later (a live query, a new book) invisible forever, because nothing watches it. Now: the helper hides only the items it is watching, and does it before the first paint (no flash of the list, then blank, then rise).

- Thought: `tsc -p tsconfig.app.json` is the build's type check. Learned: the build runs `tsc -b`, which also checks convex/ with stricter settings; a Convex push passed, the site build failed, and prod ran new functions on the old page for a few minutes. Now: `npx tsc -b` before every deploy.

- Thought: an entrance animation and a page-to-page morph can share an element. Learned: turning the entrance off with a rule that only applies during the transition makes it play the moment the transition ends (the picture blinked in again after growing into place). Now: a screen reached by a morph remembers it in its own state and skips its entrance for good.

- Thought: checking motion needs a real book each time (₹15 to ₹30 on dev). Learned: a throwaway preview page that mounts the wait screen with made-up props plays every stage in 12 s for nothing, and a ready book covers the rest. Now: real books only for what touches the server.

### GTM
- Thought: people watch the wait. Learned: nothing called back a reader who switched apps during a 90 s wait, and the push we already had only reaches phones that turned on reminders, which happens after chapter 1. Now: the tab's name says "✓ Chapter 1 is ready"; the push reaches second-book readers. Worth reading: wait_view against chapter 1 opens in PostHog after a week.

## Tue 20 Oct, the night (day 19; why readers stop after chapter 1)

### Product/Tech
- Thought: a lot of people are finishing chapter 1 now. Learned: real readers passed chapter 1 43 times from 6 to 17 Oct, 1 to 2 a day, and 0 times on 18 and 19 Oct; the rest were our tests. Now: tests are left out of every analysis (1,280 then 390 px pattern), and marking them is the first fix.
- Thought: chapter 1 to chapter 2 is the leak. Learned: in the same sitting it's 62% to 86% since the wall moved after chapter 2; the leak is coming back (3 of 43, 0 reminders ever set) and the start of chapter 2 (0 of 7 who skipped its recall question finished, 7 of 10 who answered did). Now: no recall when chapter 2 follows chapter 1 the same night is the first product change to test.
- Thought: the sign-up wall is the problem. Learned: it converts about 29% of the visitors who reach it, and both real readers who tapped it after chapter 2 finished signing up; only about 7 ever reached it. Now: grow the number who reach it, and make it an offer.

### GTM
- Thought: any traffic teaches us. Learned: GrowthX visitors go on to chapter 2 at 18%, typed-topic readers at 70%; coursemates sample, strangers with a topic read. Now: judge changes on readers outside GrowthX, and watch five strangers instead of waiting three weeks for numbers.

## Mon 19 Oct, the day (day 18; the site down, the real prices, the cheaper judge and voice)

### Product/Tech
- Thought: the site was down because of something we shipped. Learned: Convex deleted the custom domain itself a day after a $10 subscription payment failed (audit log), while the app kept running on the .convex.site address. Now: a failed Convex payment is a site-down risk, not a billing note.
- Thought: our cost table was close enough. Learned: it priced Sonnet 5.5 at $3/$15 (list is $2/$10), Opus 5.5 at $5/$25 ($4/$20), the read-aloud voice as plain text ($9 a million audio tokens, not $3.75), and used Rs 84 to the dollar (Rs 94.90 today); Runway pictures belonged to no book. Now: prices in dollars, one rate, checked on each provider's page, and every picture counted in its book.
- Thought: a reseller's "Opus" might be weaker. Learned: on 7 chapters it agreed with Anthropic's Opus as closely as Opus agrees with itself (11.2 against 11.3 of 12), at Rs 2.03 a book against Rs 3.57; it missed one planted wrong quiz key twice. Now: the Shelf judge runs there, Anthropic as backup (D138).
- Thought: the Lite voice is the same voice, cheaper. Learned: a third cheaper and quicker, but in one request per page it once read a headline and dropped the paragraph (26 of 33 words), skipped code lines once, and once read the tone tag aloud; one clip per page also made the first page start 13 to 18 s after the tap. Now: Lite for plain words, the full model for code, a page as a headline clip plus one clip for the rest (voice starts in about 4 s, 10 of 10 clips complete), and transcribing clips to count words is how we check a voice.

- Thought: the fact check needs Anthropic's own Sonnet. Learned: the same Sonnet through Cheaper Inference caught as many planted mistakes (11 and 11 against 10 and 12) for about a third less, but took 4 s longer a chapter. Now: it runs there, Anthropic as backup (D143), and /admin's facts grades are the week's watch.

### GTM
- Thought: Google's voice limits were far away. Learned: AI Studio showed 99 of 100 requests a day and 19 a minute against 10; each paragraph was its own request. Now: two requests a page, and Lite's own 100 a day on top (I2-22).

## Sat 17 Oct, the day (day 16; the first handbook faster, cheaper, truer)

### Product/Tech
- **Thought:** plans were rewritten because the writer named pieces differently from the checker. **Learned:** replaying 60 plans showed the picture rule: Gemini's structured output drops any field that isn't in the schema, so the checker asked for a field the writer could never send; 24 of 60 plans were rewritten, 2 of 60 once the two agreed. **Now:** every field a checker reads is in the writer's schema, and a cause is replayed on real data before it's fixed.
- **Thought:** the expensive part of a book was the writing. **Learned:** 44% of last week's live AI spend (₹368 of ₹830) went to backup models after Gemini failed: an Opus chapter costs about ₹16, a Gemini one about ₹1.60, and an Opus chapter reads fine, so no quality score could see it. **Now:** the gate fails on cost (median ₹ per test book, limit ₹14.5), not only on quality.
- **Thought:** the cheapest planner was the sensible one. **Learned:** on whole books, Sonnet's plans kept their promises best (4 and 4 of 5, Gemini 2 and 1) for about ₹3 more a book, and it was the fastest planner (12 s). **Now:** compare models on whole books from the same research, not on one chapter.
- **Thought:** a gate baseline is a fixed truth. **Learned:** ours (outcome 3.22, facts 3.64) came from a run where some plans had quietly fallen to Opus; today's runs swung 0.2 with no change. **Now:** the baseline comes from a run on the settings that ship, and a change under 0.2 is read as noise.
- **Thought:** a low facts score needs a better model. **Learned:** reading the graders' reasons on the 3 always-low topics showed a pattern (a sum slip, an old expiry day, an old tax rule, plot details from memory); three lines in the fact check moved Nifty options from 2 to 3 per run to 3 to 4, and filing ITR to 4, 4, 4. **Now:** read the reasons before changing a model.

### GTM
- **Thought:** the wait before chapter 1 was a tech number. **Learned:** it's where we lose readers; research to chapter 1 went from about 190 s to 88 to 98 s on dev with no change a reader can see except the wait. **Now:** chapter 1's wait is watched like a funnel step.
- **Thought:** the Shelf judge's "rejected" meant a bad book. **Learned:** the inference routing book Prateek liked was rejected at 6 of 12, partly on quiz checks that can't apply to a chapter 1 with no quizzes. A wrong rejection costs the Shelf a book readers would have opened. **Now:** the Shelf review fixes facts first and only keeps out a book still false after fixing; Prateek's Approve still decides.

## Fri 16 Oct, the day (day 15; payments blocked, the level check)

### Product/Tech
- **Thought:** a domain move is done when the app and its settings use the new address. **Learned:** Razorpay checks the website a payment comes from against the websites on the account; ours listed only the .convex.site address, so every payment on www.igetit.now failed at the first step for six days, and nothing on our side logged an error. **Now:** after any address change, make one real attempt through each outside service from the new address.
- **Thought:** "Tapped Pay: 0" meant nobody tried to pay. **Learned:** Razorpay had an attempt our funnel never counted. **Now:** read the provider's own dashboard next to our numbers before saying nobody paid.
- **Thought:** a level quiz needs a prompt rewrite and an eval run. **Learned:** passing the result as one extra input line was enough: research started from what the reader knew ("you understand that index funds mirror benchmarks") and chapter 1 went straight to the missed idea (SIPs). Readers who skip get the same request as before. **Now:** new reader signals go in as input lines first; the prompt's text changes only if the line is ignored.

### GTM
- **Thought:** 10 people passing chapter 1 and 1 sign-up means the sign-up ask fails. **Learned:** the real ask comes after chapter 2, and only 2 readers reached it that week (1 signed up). **Now:** read where an ask sits in the code before judging its rate.

## Thu 15 Oct, the night (day 14; the C boards finished and launched)

### Product/Tech
- **Thought:** "close" screens needed small tweaks. **Learned:** the last seven took a schema field (kept answers), two queries, a new screen (C11) and a running-head name map; "close" hid one new flow (C7's sure step) and one new screen's worth of data. **Now:** a board marked close gets its gaps listed as work items with their data needs before it's called close.
- **Thought:** a 24 px margin is a one-line change. **Learned:** it moved every full-bleed band (C9's marigold band showed an 8 px edge) because those bands assumed the old margin. **Now:** after a margin change, check every band and sideways row at 390 px before calling it done.
- **Thought:** the screenshot script ran my tap scripts. **Learned:** three runs passed it the tap script as a setting, not an argument, so it never ran and the shots showed the page before the tap. **Now:** the script prints what the tap returned ("PRE: true"); no line means it didn't run.

### GTM
- **Thought:** the boards are the whole spec. **Learned:** working features the boards don't draw (C2's "Ready now" card, Done's reminder link, the pace question) need a yes or no from Prateek, not a quiet removal or a quiet keep. **Now:** each one is listed on the side-by-side page as "your call".

## Tue 13 Oct, the day (day 12; "I want to learn more" and the question after each chapter)

### Product/Tech
- **Thought:** the "Last time" quiz reviews the chapter before. **Learned:** it walked back to the last chapter that had any quizzes; since D62 (10 Oct) quick handbooks have none after chapter 1, so chapters 2 to 5 all asked chapter 1's question, for 3 days, on a shape 203 dev handbooks have. **Now:** review questions come only from the chapter just finished; when a change removes data, check every lookup that fell back to it.
- **Thought:** "Lost me" and "Too easy" reshape the next chapter. **Learned:** since 7 Oct, readers with no profile share one copy of each chapter, and a shared copy never gets the reading report; each rating paid for a rewrite (about ₹13) that never saw it. **Now:** only members' answers rewrite a chapter (D96); free answers are saved and change nothing.
- **Thought:** a member's note goes in the reading report with the missed quizzes. **Learned:** the writer only acts on what its instructions name there; "use examples from cricket commentary" got 0 mentions in 536 words. Moved into the Reader line, the next rewrite built an example around cricket commentators. **Now:** a new reader signal goes in the Reader line first; the prompt changes only if the line is ignored.
- **Thought:** a rewritten chapter keeps its pictures. **Learned:** a rewrite of a ready-topic copy kept the shelf's pictures, drawn for the old text, and a rewrite before they were copied left none. **Now:** any rewrite of a chapter that already had cards redraws its pictures.
- **Thought:** "more advanced" needs a new prompt. **Learned:** passing what the first handbook taught (each chapter's title and outcome line, at most 1,500 characters) was enough: the income tax follow-on went straight to capital gains, carry-forward losses, advance tax and ITR-U, and one line on names gave Elena and Mateo instead of Indian names. **Now:** a follow-on handbook gets the "Already learned" line, not a new prompt.
- **Thought:** resizing the Chrome window gives a 390 px check (D97). **Learned:** the docked window stayed 1,680 wide (innerWidth said so); the phone proof came from headless Chrome with device metrics. **Now:** read innerWidth before trusting any "phone" screenshot.

### GTM
- **Thought:** the 9:30 X draft would be waiting. **Learned:** it hadn't run on 10 or 11 Oct, and nothing said so; "Is my X post ready?" found only a cover image. **Now:** look for the draft in the morning, before posting time.
- **Thought:** posts need an idea each day. **Learned:** the "learned too late" entries were already posts: the analytics one ("269 people visited my app in 9 days. Officially, zero did.") became the day's 274-character X post in minutes. **Now:** late moments go into docs/learning.md as they happen, with a draft opener.
- **Thought:** a free reader's answer has to change something to be worth asking for. **Learned:** saying what members would get ("Members get chapter N+1 rewritten around this") at the moment they asked for it is the nudge, with no pop-up. No numbers yet on whether it moves anyone. **Now:** check "See membership" taps from that line once there's a week of data.

## Mon 12 Oct, the day (day 11; the teaching ads)

### Product/Tech
- **Thought:** a handbook Prateek types can go on the Shelf by the usual route. **Learned:** the automatic route (library.consider) turns down anything typed on our own phones, so the corporate handbook would never have reached his Approve queue. Adding it with library.publish as "pending", then his tap on /admin, kept the D32 rule (nothing typed goes public without him) in one step. **Now:** our own handbooks for posts go in as pending and wait for his tap; never set published by hand.

### GTM
- **Thought:** a feature list sells the product. **Learned:** feedback on the first ad was that the script could be a lot better; the rewrite teaches one real card ("26 times subscribed tells you about the crowd, not the company") and adds one sourced number (52 of 112 FY26 mainboard IPOs below issue price, Business Standard / PRIME Database). It cost 84 more credits (about ₹78) in new clips, and it gives the viewer something even if they never tap. **Now:** every ad teaches one card from the real chapter, with one number and its source on screen.
- **Thought:** a character sheet from 7 photos looks like the person. **Learned:** for Tanisha, take 1 came out lighter-skinned with a narrower face and a different nose; with two face close-ups as the first references and her features named ("round face, full cheeks, warm medium-brown skin, do not lighten"), take 2 matched. 2.5 credits a try. **Now:** put every sheet side by side with the real photos before using it, especially for skin tone.
- **Thought:** a clip made from another clip's last frame starts on that frame. **Learned:** Omni's first frame matched only 0.76 (SSIM) and its room drifted in one 10 s clip (the bookshelf moved up the wall). A 110% punch-in at the join, or the drifted clip's voice over app footage, hides both. **Now:** check the join frames and the background of every clip; plan cuts to the app where a clip drifts.
- **Thought:** Instagram's 30 s is enough room. **Learned:** clip A whole, a sourced number, two term cards, the chapter list and the call to action came to 29.9 s; the only cuts left were pauses at picture changes. **Now:** a teaching ad has one hook, one number, at most two taught terms and one call to action.

## Sun 11 Oct, the day (day 10; the first AI ad)

### Product/Tech
- **Thought:** pinning Opus for 16 handbooks costs what the chapter writes cost. **Learned:** it cost about $78, not the $35 estimated: the pin also moved the fact check (₹2,245) and the quiz versions (₹722) to Opus, and long chapters made the check rewrite more. **Now:** price a batch from one built handbook, every step, before starting the rest.
- **Thought:** a fallback is one more model in a list. **Learned:** Gemini 3.7 Flash writes chapters and plans fine (64 s, 36 s) but with Google Search and JSON mode together it hung past 170 s twice; search alone answered in 19 s. And when 3.8 was overloaded, 3.7 was too, twice in an hour, so Opus did the work. **Now:** test each fallback step on the job it backs up, and count on the last step (Claude) taking the load when Google is busy.
- **Thought:** a copy row per spelling is a cheap alias. **Learned:** 38 of them (a full handbook each, about 190 KB) pushed the cache read on every visit past 16 MB and the site failed for about 12 minutes; the read is 13.4 MB now. **Now:** aliases are redirects; any table read whole on the reader's path gets a size check before a batch lands.
- **Thought:** 16 picture jobs in parallel finish 16 times faster. **Learned:** Runway runs 3 at a time on our tier; about 80 queued pictures timed out every call at 10 minutes. **Now:** batches go through the one-at-a-time server queue.
- **Thought:** the Opus fact check makes a handbook safe to ship. **Learned:** a full read still found 134 things to fix in 112 checked chapters: 68 facts (rules that changed in 2025 and 2026: Thai cash, Vietnamese drug law, Australian card surcharges, US customs fines), 41 banned words, 12 quizzes, 12 broken sums. **Now:** a hand-planned batch is read against the web before it goes live, not only checked against its own brief.

### GTM
- **Thought:** an AI video model reads the script as written. **Learned:** on the first takes of a 15 s ad (Gemini Omni Flash, two 8 s clips), one clip said "sales" for "saved reels" and the other dropped the website name entirely, the one line the ad exists for. Written as separate words with a "say all five words" note ("Try I Get It dot now"), the second take said it; a transcript (whisper) caught both, and watching the frames wouldn't have. **Now:** transcribe every clip before editing; the call to action gets its own beat and is spelled out word by word.
- **Thought:** AI footage needs an AI-looking product. **Learned:** cutting to real 1080×1920 captures of the live app for 3.4 of 15 s shows the product honestly and covers the parts a video model can't draw (a phone screen). **Now:** every AI ad cuts to real screens for the product beat.

## Sun 11 Oct, the night (day 10, 05:00 to 13:00; the agent alone, Prateek asleep)

### Product/Tech
- **Thought:** the writer's "unchecked" chapters had unchecked facts. **Learned:** on the ten new handbooks, 27 chapters were "unchecked" and every one was a shape problem, not a fact problem: the checker wanted a plain "try" card typed "tryit" (the build fixes that afterwards) or didn't know the "picture" type, and the guard refuses a fix that changes a card's type. Checked again with Try it cards shown as their idea line, all 27 came back "fixed" (one, English chapter 4, after a story card typed as a dare was retyped), with 2 to 6 real fixes each. **Now:** showcase.recheck after every showcase build; the same guard will hide real fixes on readers' chapters until the checker knows every card type.
- **Thought:** a Try it card's caption is the writer's idea line. **Learned:** 5 of 29 captions did not fit for the page under them: two empty, two described a paper task ("Draw two columns"), one gave the answer away; readers see the caption above every page. **Now:** read every caption against its page before a handbook goes live (the tidy step lists them side by side).
- **Thought:** research always finds something. **Learned:** "Spot what India's past multibaggers had in common" came back with 2, then 3 facts from 5 searches and no sources, twice; every other topic got 14 to 28. **Now:** a thin brief means a full read before going live; research needs a "thin" signal that triggers the Claude backup, not only an outright failure.
- **Thought:** a rubric score tells you a chapter is good. **Learned:** the first live scores quote the line that decided them, and that is what makes them usable: "the reader never does it themselves" on chapter 1 of a regular handbook (L3), against L4 for the hand-built ones with a Try it card. The baseline run shows the same on compound interest and chess (outcome 3). **Now:** the writer change ("do it once inside every chapter") goes through the gate before it ships.
- **Thought:** fixing live text means copying the chapter again. **Learned:** a ready topic's pictures are drawn on prod after the copy, so a second copy from dev wipes them. **Now:** live fixes go through repairData.editChapterText (body text in the stored row and every reader's copy, pictures kept): 3 fixes, 7 copies each.
- **Thought:** Convex file names are free-form. **Learned:** a hyphen in convex/plans/lands-your-job.ts stopped the whole push ("Path component ... can only contain alphanumeric characters, underscores, or periods"). **Now:** underscores in every file under convex/.

### GTM
- **Thought:** our 269 visitors count for the sprint. **Learned:** the Virality rubric counts unique visitors only from PostHog, Plausible, GA4 or Datafast, and caps the 10x row at L2 without read-only access; we had none of the four until 04:20 today, so 9 days of visitors don't count there. **Now:** PostHog from today, with a public read-only dashboard; the lesson for any sprint: wire accepted analytics on day 1.
- **Thought:** Virality was our track. **Learned:** scored row by row, AI Agent as a Service fits what the product already does (a researcher, a planner, a writer, a fact checker, an illustrator and an interaction builder working per reader, observed in Langfuse and PostHog, scored and tested): about 131 to 151 of 164, against about 35 plus social numbers on Virality and 57 on Revenue. **Now:** Prateek picks; docs/sprint/scorecard.md has every row with its evidence.
- **Thought:** the handbook's selling steps are writing tasks. **Learned:** the handbook says never write posts with AI, and the sprint's next badges (watch three people, ask someone to pay, the launch video) need Prateek in person. **Now:** the agent prepares raw material with real numbers (docs/sprint/); the words and the asking are his.

## Sat 10 Oct, the day (day 9; the free eleven and Hold a room for 10 minutes)

### Product/Tech
- **Thought:** the plan's blocks decide the card types. **Learned:** Gemini Flash wrote a plain "try" card for 4 of the 5 "tryit" blocks in the 28-day build, even with a line saying "type exactly tryit"; the fact check spotted it, but its shape guard skipped the fix, so those days read "unchecked". **Now:** the showcase build converts the card after writing and builds its page (showcase.fixTryit).
- **Thought:** a running example stays the same person if it has a name. **Learned:** with only "Ananya, 26, a data analyst in Pune", day 1 had her on shipping delays and day 2 on retail checkout data; the ledger carries names, not facts. **Now:** her fixed facts (her one line, her proudest result, her team talk) go into every day's must-haves; 28 days held.
- **Thought:** replacing a ready topic means overwriting its row. **Learned:** a newer cache version swaps unread chapters into readers' own copies, so overwriting Public speaking would have put 28-day chapters under 47 readers' 7-chapter plans. **Now:** a new row, the old one off the shelf but kept, and a redirect for new starts only (freeTen.ts).
- **Thought:** a Try it page fits the 520 px it is asked for. **Learned:** day 1's page squeezed its buttons to fit and cut its own text; its content needed 618 px. **Now:** the wrapper lets any Try it page grow and scroll (sandbox.ts fit), for every reader's pages.
- **Thought:** the topic with the most hits is the best topic. **Learned:** Public speaking had 47 starts in 14 days against 6 for the next, but 36% passed chapter 1 against 3 of 6 for IPOs; it is the landing demo, first on Featured and the carousel, so placement explains part of it.

### GTM
- **Thought:** proof of demand is proof it will work. **Learned:** 8 of the 11 free picks have strong Indian numbers (7.8 crore ITRs, 18.3 crore CIBIL checks, 100M weekly ChatGPT users, SEBI's 91% of F&O traders losing), but none of it says a reader finishes in our app. **Now:** watch each pick's chapter 1 pass rate; procrastination went in on instinct with weak proof.
- **Thought:** "I hear and I forget, I do and I understand" is learning science. **Learned:** it is Xunzi, 3rd century BCE, popularised in the 1960s; the "learning styles" reading has no evidence (Pashler 2008) and the 10%/90% pyramid has no source, but doing has strong evidence (Freeman 2014: 33.8% failed lecture-only classes against 21.8% with active learning). **Now:** a post can use the true version.

## Sat 10 Oct, the night (day 9, 00:00 to 05:00; session e2)

### Product/Tech
- **Thought:** a coursemate's branch is a merge (e2). **Learned:** her branch already held our main; the delta was two commits, about 900 lines, plus one product call hidden in a commit message (D23/D27 left out). Cherry-pick without commit onto our main gave three small clashes, all where both sides had added code at the same spot. **Now:** read the diff and the evidence first, resolve by hand, her commits stay out of our history (D62, like D15).
- **Thought:** "unchecked" means the checker failed (e2). **Learned:** both dal chapters came back "unchecked" because our validFix accepted a corrected card only if it had a body or a prompt, so every fix to a "steps" card was skipped; the kit added steps cards on 8 Oct and nobody noticed, because the old checker rarely rewrote them. Her check v3 does. **Now:** a fix passes when it keeps the original card's keys and kinds of value; dal's re-check went from "unchecked" to "fixed, 2".
- **Thought:** a failed Flash call is a prompt problem (e2). **Learned:** tonight every Flash chapter try on dev ran to the 150 s abort, and research and plans stalled too, while prod's log shows Flash chapters at 16 s average and plans at 25 to 29 s a day earlier. Flash stalls at some hours; the Opus backup (D41) catches it, at ₹10 to 15 a chapter instead of ₹1. **Now:** the "₹15 a handbook" number holds only when Flash answers; the bounce rate on /admin is the number to watch, and a shorter per-try abort with a retry inside the step is the proposal, not a model change.
- **Thought:** a field in the prompt's JSON shape is a field in the reply (e2). **Learned:** Flash is held to the JSON schema we send and returns only what it declares; her ledger object came back from Opus (prompt-following) and never from Flash. Declaring it broke every Flash chapter call with "400 invalid argument": Gemini caps the schema at about 3,200 characters, our chapter schema was already at the edge, and the 400 comes mixed with 503s so single tries mislead. **Now:** a server-side probe (evalShape.probeKind) that sends the real schema and is run three times before any schema change ships; the ledger is one string; whyRight is a known gap on Flash chapters.
- **Thought:** the call log shows what the model saw (e2). **Learned:** dev keeps the first 2,000 characters of each input, so "Already taught" and the length line were invisible there. Calling the prompt functions directly on the saved handbook showed the full message: length, today, pieces, must-haves, chapter 1's ledger (names, opener, closing), the next chapter, own facts. **Now:** verify a prompt's content by running the function, not by reading the log.
- **Thought:** "format is the pace" only changes chapter counts (e2). **Learned:** chess ("play a full game with my nephew") came out "quick", 4 chapters, and a quick handbook carries no quizzes, so the rung mechanic never runs on it; dal came out quick, 3 chapters, with no forced analogy ("pictureWhyNot" set). **Now:** watch how many typed topics the research step calls quick, and whether readers of quick handbooks miss the checks; Prateek decides if quizzes should depend on something other than format.
- **Thought:** a prepaid key that runs out fails loudly (e2, from 58's prod find). **Learned:** the backup Gemini key answered 402 "credits depleted", the old loop treated that as the end of the call, and Claude's paid research ran instead; the log read like a safety block. **Now:** a 402 key is dropped and the other key carries on (her fix, in the port); the prod backup key still needs topping up or unsetting.

### GTM
- **Thought:** the number told to Shaktimaan is the number (e2). **Learned:** "₹15 a handbook" was true on Flash in daylight and false at 4 AM when Flash stalls; a promise about cost needs its condition said with it. **Now:** quote cost with the model that actually wrote the chapter, read from /admin, not from the plan.

## Fri 9 Oct, the day (day 8)

### Product/Tech
- **Thought:** a story prompt needs one good shape. **Learned:** two reels (Arvind Vijay Mohan) showed a second shape the Masala Lab one cannot do: a person, an object, time jumps with dates, turn lines, a mirrored last line. On dev the writer picked shape B by itself where the material named a real person (WWII: Ebert, Chamberlain) and stayed with shape A where it did not (pool swimming). **Now:** the prompt carries both shapes and the techniques they share; the beat ("**Pick a lie.**") is also the caption on the wait card, so the writing and the screen are one design.
- **Thought:** a story prompt is a shape. **Learned:** three Ray William Johnson reels showed that voice is half of it: present tense, a person tagged in one clause, a ladder with a refrain ("still not fired"), one cliff before a reveal, a verdict at the end. Added as one paragraph to the prompt; on dev, Socrates's trial came back with "Still nobody." as its refrain and "Good for him." as its last line, unprompted on the specifics. **Now:** every reel Prateek sends gets transcribed, torn down into craft moves, and the moves go into the prompt as rules the writer can follow on any topic, never as the reel's own lines.
- **Thought:** a shelf shows everything it has. **Learned:** 30 rows on the Shelf held two duplicate stock-market copies, a keyboard smash and a trading-agent handbook 7 people opened and none finished; with tens of readers in total, "best" cannot be ranked by taste, only by quality, duplication and finishes. **Now:** an on/off switch per row with the reason recorded, a Spotlight ranked by chapter-1 finishes (not starts: the landing demo inflates starts), and counts that skip our own phones (every review bot had been counting as a reader).
- **Thought:** a proof script that passes is proof. **Learned:** scripts/prove-path.mjs read the shared-handbook id from dev whenever it was given the prod .convex.site address, so its last step could only pass on igetit.now. **Now:** the script knows both prod addresses; a FAIL is read before it is believed, and so is a PASS.
- **Thought:** a UX review is a walk through the screens at 390 px. **Learned:** the walk, a code read and a resize sweep each caught what the others missed. Only the walk showed the quiz sheet's x hidden under "That's it." and the first chapter title cut in half on a 375x667 screen; only the code read found Hindi topics colliding and a paid-then-failed payment that says "Nothing was charged"; only the sweep across 9 sizes found the page sliding sideways at 320 px and books hanging off the plank at 640 to 899 px. Two "certain from code" P0s held when tapped (the dead "Make a free account", the Shelf chips). **Now:** a review is all three, every code-only claim is tagged until a tap proves it, and the list lives in docs/ux-review-2026-10-09.md.
- **Thought:** testing on dev is free. **Learned:** a ₹50 estimate became about ₹70 to 90: finishing chapter 1 of a shared handbook writes its chapter 2 live (about ₹15 each), one Ask on a point the card already covered went to the web (₹9.4), and a declined topic still paid for research first (about ₹7). **Now:** before a test walk, list the taps that write (finishing chapter 1 of a shared handbook, Ask, the rating chips, the comparison, typed topics) and budget them.
- **Thought:** an error message is written once, in the screen. **Learned:** on the live site a plain Error's words never reach the phone: the sign-in screen's "That email and password don't match" and Pricing's "You're already paid up" could only ever show their generic fallback there; dev passes the words through, so every test looked fine. **Now:** a reason the screen must act on travels as a ConvexError code (payments.ts since today), and a fallback message covers the likely causes without needing the reason.
- **Thought:** wait copy is a guess you write once. **Learned:** three screens said "two to four minutes", "a minute and a half" and "usually under a minute" for the same wait; prod's numbers (callStats, 3 days on Flash) said research 42 s, plan 25 s, chapter 1 24 s, check 8 s: about 100 s, 180 s at the slowest tenth. **Now:** time copy comes from callStats and says one number everywhere; when a model changes, the copy is re-measured.
- **Thought:** a fix I watched work at 390 px is done (58). **Learned:** I called the UX pass done (51 findings fixed, 0 P0 open) and a stranger found four problems in one walk. Why it slipped: "done" meant every item on my own list had a fix I had seen; D43's side effect (the side list's chapters became unstyled buttons: grey browser buttons, "1What counts as a good argument") was not on the list; the side list only renders at 900 px and up, and every check after D43 was at 390; screenshots answer "does it look right", not "is it 44 px", so targets of 16 (the contact email), 24 (the header name), 32 (the reading-style control) and 42 (every footer link) passed by eye although my own review set the 44 px rule; and prove-path's PASS walks the main path at 390, not the site. **Now:** "done" comes with numbers read from the live DOM at 390 and 1440 (getBoundingClientRect on what changed, plus a sweep listing every visible link and button under 44 px on each page; 0 on nine pages after this fix); a change to a shared piece is checked everywhere it renders (side list on a laptop, ☰ menu on a phone); the report names what was not seen.
- **Thought:** a plan's hooks match their chapters (58). **Learned:** 26 of 175 hooks across the 24 ready topics did not. In three plans every hook teased the chapter after it (the writer wrote "Next:" lines; philosophy's chapter 7 even ends "Next: Wittgenstein", a chapter that does not exist); n8n's were shuffled; six promised numbers or names their chapter never uses ("eleven steps", "Pick 15", Julian Treasure's 7 habits). A word-overlap score against the next chapter's opening card flagged the shifted plans; the rest took reading. **Now:** a bad hook is moved to the chapter that opens on it, or the line is lifted from its own chapter, never rewritten by a model (repairData.setHooks: hooks only, only where they still read as before). A guard on new plans is still to build.
- **Thought:** a teammate's brief is the spec (58). **Learned:** the brief said typed "Jump to next" suggestions still looked free; the live bundle had none since 00:29. The only suggestions left were on the declined screen, and my first label there would have told readers a free ready handbook costs their typed topic: dev showed those three were ready handbooks. **Now:** read the live bundle and the data behind a label before writing it; each suggestion now says what it is, from the ready names the server sends.

- **Thought:** the public numbers were clean (e2). **Learned:** /stats said 89 visitors and 13 chapter-1 finishes while the morning X chart said 90 and 9: direct visits, LinkedIn, our own devices and the reviewer's test runs were mixed in, and two counting rules lived in two files. **Now:** one rule on the server (a person counts once, under the source of their first visit; direct, LinkedIn, localhost, a first visit from the home-screen app and ?utm_source=internal are left out), /stats is the dashboard and the X chart reads it, so the post and the page cannot disagree.
- **Thought:** porting a coursemate's branch is a merge (e2). **Learned:** her branch already held our main; the real delta was two commits, about 900 lines, and one product decision hidden in a commit message ("his D23/D27 forced shapes and length floors left out"). Her own benchmark showed why those rules exist: dal in 4 chapters with a layer-cake analogy, chapter 2s at half their word target. **Now:** read the diff and the evidence before the code, split "her structure" from "your counts", and put the count decision to Prateek instead of taking it.
- **Thought:** a declined topic costs nothing (58's measurement, noted by e2 for the shape port). **Learned:** one refused line cost about ₹6.60: Google's filter blocked the research in under a second, the Claude backup researched it anyway, then Gemini and Opus both refused the plan. **Now:** in the port, a safety block on research skips the backup and goes straight to the plan's decline.

### GTM
- **Thought:** a reel is a hook plus a tip. **Learned:** the two reels Prateek sent are 3 minutes of one story told to camera with a 2-to-4-word caption at each beat and a picture inset; no tip, no list, and the hook is the whole story with the how withheld. **Now:** the same shape fits Prateek's own reels about building I Get It (the cold open: "A stranger typed a 200-character line into my app at 2 am. We gave him an award."), caption per beat, the picture under it.
- **Thought:** a post link drops a stranger at the chapter it names. **Learned:** a ?ch=2 link opened on two quizzes about chapter 1, which the stranger never read and had to answer, and chapter 1 could not be tapped; the Shelf could not be linked at all (/shelf showed the home page). **Now:** quizzes about a chapter come only after it was read, skipped chapters open from the path, and /shelf is a real address a post can point to.
- **Thought:** a teaser is marketing copy, so a loose one is harmless (58). **Learned:** Shaktimaan put it above every layout problem: "A preview that doesn't match its chapter makes readers doubt the content, and the content is the product." The free-topic rule was said only after the refusal, never before the first choice. **Now:** teasers are checked against their chapter like facts, and the one-typed-topic rule sits under every topic box before anyone types. His close after the second walk passed all four: "That was a clean day of fixes. Tomorrow, the ask."

- **Thought:** the daily X post needs a chart (e2). **Learned:** a screenshot of a public page beats a chart image: anyone can open /stats and check it, and the smaller honest numbers (58 visitors, 7 finishes) read as more credible than the bigger mixed ones did.
- **Thought:** today's post is whatever the calendar says (e2). **Learned:** the week's best post was a reader's own 200-character line ("Aaaaaaaaaa how to cook rice and dal and make chapati and also learn guitar…"), read from the handbooks table; the product's own data is the content, and a joke built on a real line needs nothing invented. Prateek's add ("Dear anon, please tell us how the sentence ends") was the line that made it.
- **Thought:** Shaktimaan gives advice that we act on later (e2). **Learned:** run him as a loop inside one evening: his review, fixes proved with DOM measurements, his re-walk. Two walks closed all four findings, and a plain question ("what number at the wall?") came back as a rule with a date (D56). He ranks content above layout every time.
- **Thought:** a mascot name only has to sound good (e2). **Learned:** "Dot" collided with an OpenAI launch, and Prateek had said no once already; Bindu, Nukta and Tittle failed "anyone in the world can say it"; Pikoo sounded like Pico AI, a micro-learning app. **Now:** check collisions and pronunciation before any draft. The name is Ooh, and it is in memory.

## Fri 9 Oct, the night (day 8, 00:00 to 05:00; session dc)

### Product/Tech

**Two guards that force a format need an order**
- Thought: adding "a skill is always a 7-chapter course" (D27) and "a recipe is one sitting" (D23) in the same hour was two independent fixes.
- Learned: the research step called "how to make dal" a skill, the course guard ran last, and the dal handbook was a 7-chapter course on prod for 20 minutes, the exact thing D23 was written to end.
- Now: the typed-line recipe rule runs before the course guard, and any new guard states which earlier guard it yields to (D23a).

**A ceiling reads as a target**
- Thought: "at most 80 words a card" keeps chapter 1 short.
- Learned: Flash wrote 20-word cards, 110 to 130 words a chapter; Opus wrote 400 to 530 under the same line. A model given a ceiling with no floor writes to the floor of the ceiling.
- Now: every length rule is a range with a floor (60 to 110 a card; 30 paragraphs and 800 words for chapters 2 to 7), counted by the server after the write, one retry with the counts stated (D27, D31).

**Floors need time**
- Thought: a floor is a prompt change.
- Learned: 30 paragraphs with thinking on plus one retry did not fit Gemini's 150 s step budget; a pinned Flash chapter 2 failed outright, and on prod it would have bounced to Opus on time, not quality.
- Now: 300 s a step, 150 s a try, and the bounce reason logged (budget or floor) so tomorrow's rate is readable in /admin.

**Which model: measure with the rule written first**
- Thought: the model choice is a taste call Prateek makes.
- Learned: three topics, both writers, same brief, judged on 12 checks: Opus medium about 8 a chapter, Flash with floors about 5.8 and one failure. Flash follows the shape of an instruction (schema satisfied, analogy null three times, one block list copied across chapters); Opus follows its intent. The rule written before the run (within one point, Flash stays) made the decision in a minute (D30, D33).
- Now: Opus medium writes plans and chapters, Flash keeps research. A cheaper writer gets another trial only against the same judge with the D31 prompts, never on cost alone.

**A silent skip is a pass mark**
- Learned: the fact check wrote 4 fixes for a Flash chapter, all 4 broke the card shape, all 4 were skipped, and the chapter went out "passed" with its errors in.
- Now: a shape-breaking fix is retried once with the error stated; otherwise the chapter is stored "unchecked", never "passed" (D31b).

**Judge the chapter you have**
- Learned: chapter 1 has no quizzes by design, so three of the judge's 12 checks fail on every chapter 1 and "reject under 9" would have rejected all but perfect ones (the first live test scored 8 on a quiz check).
- Now: chapter 1's bar is under 7, with the three quiz checks stored as n/a (D32a).

**The model's title is not the reader's**
- Learned: the plan prompt asked for a "clean topic" since 4 Oct and the library took it over the typed line since 7 Oct; Opus echoed the typed words, Flash rewrote them, and a reader's "Public speaking advanced level" became "Advanced Rhetoric and Persuasion" on the Shelf. Nobody noticed until the model changed.
- Now: the typed line is the name everywhere; the model's title is never shown (D28).

**Activities as gates trap readers**
- Learned: a "do it" timer counts seconds and was asked to time a 20-minute simmer; a chapter could not be left without logging a set or finding "Later".
- Now: no activity gates the arrow or the chapter; a chapter with no quiz passes at its end (D24).

**A stories prompt needs a shape, not an adjective**
- Thought: "surprising true story, 4 to 6 frames" is a brief.
- Learned: it produced one-paragraph summaries of example cards. The Masala Lab reel Prateek sent is a nine-step shape (contradiction, stakes with a number, the anchor you know, the chain of because-and-so, a named expert, the widening, the answer, a warm line); written as that shape, Opus produced Dunkirk and Midway stories that passed a fact check and a human read, and the drop rule removed the ones with invented specifics (D29c).
- Now: every content prompt carries a step-by-step shape with an example of the shape, not of the topic.

**Several sessions, one checkout**
- Learned: `git pull --autostash` ate another session's uncommitted edit; `npm run deploy` builds the site from the working tree, so one session's upload nearly shipped another's half-done screens; a deploy kills in-flight Convex actions, so a chain mid-run loses its topic.
- Now: no pull, no stash, stage by name; functions-only deploys from the backend owner and one site upload from the screens owner; stop a chain before deploying (D19, D19a).

- **A recipe is one evening (session 55).** Thought: "quick" handbooks of 1 to 3 chapters covered one-off tasks. Learned: a dal recipe split over three chapters with a sign-up wall between rinse and tadka, and a 30-second timer for "bring to a boil", is unusable at the stove; research also labelled "how to make dal" a skill and planned 7 chapters. Now: a typed "how to make/cook X" or "…recipe" is one chapter with every step, a "What you need" checklist first, no wall and no daily limit (D23), and the typed line wins over the research label.
- **Activities never gate (55).** Thought: a push-up is proved by a push-up, so a body chapter should pass on a logged set. Learned: Prateek wants no activity mandatory to leave a chapter; a logged set is a record. Now: a chapter with no quiz passes on its last card (D24).
- **Cheap model, short chapters (55).** Thought: Flash with a fact check matched Opus on truth (0 false on two topics). Learned: Flash chapters were 110 to 130 words and 7 to 10 frames against Opus's 400 to 530 and 12 to 17, invented numbers slipped in, and plans came back with no picture and one block list for every chapter. Now: Opus medium writes plans and chapters again; Flash stays for research; floors of 30 paragraphs and 800 words for chapters 2 to 7 with a retry and the counts on the call row (D27, D33).
- **A test string is a real person's topic (55).** Thought: hiding handbooks that matched the review agents' test strings was safe. Learned: "how to make dal" is what a real person types, and one of the 13 hidden was Prateek's own. Now: hide by phone token and creation window, list every hidden row with its reason, never by topic text alone.
- **Two chains, one hold (55).** Thought: a deploy kills a running scheduler chain. Learned: it killed only the in-flight action; the old chain's next link still fired, and two chains interleaved and double-built topics. Now: set the hold key, wait one topic, then restart a single chain with the exact list still to do.
- **Estimate the job, not the first version (55).** Thought: a wait story costs about ₹3. Learned: four nine-frame stories with Opus thinking plus a check cost about ₹24 a topic, and the first token cap (8,000) cut half of them off. Now: size the cap to the asked output and say the per-topic number before a chain of 24 runs.
- **Count what the reader sees (55).** Thought: "stories 0 on every topic" meant the build had failed. Learned: cache rows have versions; the shelf reads one row per topic and my counter read another. Now: verify on the row the screen reads (the shelf row, the live query), not the table.

### GTM
### GTM

**Written posts outlive the product rule they describe**
- Learned: the wall moved twice in one day (chapter 3 to chapter 1 to chapter 2) and five live posts still said "first 3 free, no sign-up".
- Now: a2's list of every live claim with its link is the first thing to fix in the morning; any rule change that touches a promise on a post goes to a2 the same hour (D14, D26).

**The Shelf is the front window**
- Learned: anything typed on prod went straight to the Shelf once chapter 1 passed, and test strings and spam reached it; the Shelf button looked like text and nobody tapped it.
- Now: a review queue with an automatic filter and Approve/Reject on /admin (D32); the Shelf as a printed button and a count strip on landing, plan and Done (D21).

## Thu 8 Oct (day 7)

### Product/Tech

**Chapter 1**
- Learned: the 6-short-card chapter 1 works. Before: 4 of 17 who opened it finished. After: 7 of 17.

**Sign-ups**
- Learned: 126 visitors, 58 started a handbook, 14 finished chapter 1, 0 sign-ups. People read; nobody makes an account yet. The next problem is the step after chapter 1, not traffic.

**Testing in production**
- Learned: an A/B test left running on a topic that was in a live post gave about half its new readers a blank chapter 1 (fixed 14:10). Topics in live posts stay frozen (convex/frozen.ts).
- Learned: our own testing pollutes the numbers. Today's UX review replays alone made about 20 visits and 17 handbooks, all counted as direct.
- Now: mark a phone or browser as ours (?utm_source=internal) before any test run.

**Own domain**
- Learned: on Convex's paid plan a custom domain is two DNS records and about 4 minutes. GoDaddy can't point a bare domain at Convex, so igetit.now forwards to www.igetit.now; https on the bare domain waits a few hours for GoDaddy's certificate. Sign-in is a typed code, so nothing in auth had to change.

**Link previews**
- Learned: the site sends no preview image, so a shared link shows no picture. A 1200x630 image is ready in docs/launch/link-image; adding it to the page is still to do.

**Lesson shape, one size doesn't fit (the calisthenics reader)**
- Thought: one chapter shape (story card, teach, three quizzes) works for every topic.
- Learned: a reader doing push-ups said the story time and the quizzes were in the way and it took too long to get to the point. The same shape scored 9/12 on "how tides work".
- Now: the plan picks each chapter's blocks from a kit (picture, teach, example, mistake, try, move, do it, steps, try it, quiz, watch, one breath) and its proof (set / result / predict / scenario / retell). Body skills pass on a logged set, no quiz. Calisthenics ×2 and Pool swimming chapter 1 rebuilt: picture → move (a drawn figure with cues) → do it (timer) → mistake → do it → one breath.

**Pictures**
- Thought: free Wikimedia photos could replace Runway drawings on 4 of 5 picture cards (last night's "Runway for the cover only").
- Learned: Wikimedia has almost no photos for teaching ideas ("owning versus lending"). New chapters got 0 or 1 picture; a reader called the lack of visuals an impediment. 19 of 24 ready topics still had 5 to 8 drawings a chapter; everything written after 7 Oct 20:00 had 1.
- Now: Runway draws every picture card again (up to 5 a chapter, ₹4.25 once, shared). Photos with an ink-and-wash filter (OpenCV, 0.8 s, ₹0) only for real things. Backfilled 162 pictures in 40 minutes.

**Interactive explainers**
- Thought: readers would need video for anything that moves.
- Learned: a one-call Sonnet page (drag the bakery's value, bend the screen, drag the Moon) lands about 2 in 3 one-shot, costs ₹3 once, 12 to 15 s, 3.5 to 4.6 KB. The weak third needs a look-and-fix pass.
- Now: "try it" is a block in the kit, in a locked iframe (sandbox allow-scripts + a CSP), done-message as proof but never a wall.

**Research model**
- Thought: moving research off Claude would need Cheaper Inference.
- Learned: Cheaper Inference has no web search at all. Gemini 3.8 Flash with Google Search costs about ₹1 to ₹1.4 a topic against Claude's ₹5 to ₹10, takes 28 to 66 s, and found the same current facts (Nifty's Tuesday expiry, lot size 65). Google's main key answered 503 on every call for hours; the backup key worked 3 of 3.
- Now: research runs on Gemini with Google Search, Claude Sonnet as the backup, two Google keys, a schema on the reply.

**Schemas on every model reply**
- Thought: JSON "mostly works".
- Learned: a Gemini chapter put prose in a card's "type"; an old rewrite shipped a "poll" card the screen could not show, which blanked chapter 1 for half of a frozen topic's new readers. And the schema you send shapes the reply: with only type/title/body described, Gemini dropped the quiz fields.
- Now: zod schemas on plan, chapter, check, versions, scenes, intent, match, teach, research and the explainers; one corrective retry, then a failure; the JSON schema goes with Cheaper Inference requests as a full union of card shapes.

**Writers, blind**
- Learned: DeepSeek V4.1 Flash wrote chapters 1 and 2 for ₹13 against Claude's ₹74, but planned 3 chapters where Claude planned 7, and its own fact check found 0 errors where the judge found several. Gemini 3.8 Flash end to end: ₹10 for research, plan and 4 chapters; judge 5 to 8 of 12 against Opus's usual 9. The neutral judge's verdict on A vs B is still open.

**Navigation**
- Thought: the ☰ menu was enough to get around.
- Learned: a visitor who finished a chapter could not find other topics (logo → Your handbooks → Start another → logo), reported by a reader who could have paid. The code read had rated it P2.
- Now: The Shelf (books on planks, one shelf per kind) is a header button on every screen; Start another starts empty with a back link; returning readers land on Your handbooks, not inside a chapter; sign-in copy says it is optional for the first 3 chapters.

**UX review method**
- Learned: a full-page screenshot draws the sticky action bar at the viewport's bottom edge over whatever scrolled there; 3 of 51 findings were withdrawn after a viewport check. A headless walk plus a code read found 51 items in an hour; 29 fixed the same day.
- Learned: a running A/B test outlived the frozen list that was meant to protect the topic. Gate at the moment of assignment, not only at creation.

**Small build traps**
- Learned: a raw line break inside a JavaScript string in prompts.ts broke the build twice today; prompt edits need `\n`. A Convex query cannot live in a "use node" file.

**The design pass (print shop)**
- Thought: "vastly improve the UI" meant a new look. Learned: the identity was already there (the poster, the books, the frames); the inside just didn't use it. Bringing one language inside took about 90 minutes of CSS and three JSX lines, not a redesign. Now: when a screen looks generic, ask which existing world it should belong to before inventing one.
- Learned: a highlight colour has to be chosen per background. The same 55% marigold wash read fine on ink and turned brown on indigo; a solid second ink with its own text colour per frame fixed all six at once.
- Learned: show the direction as the same screen drawn three ways and ask once; Prateek answered in under a minute. A written list of options would have taken longer to read than the pass took to build.
- Learned: three sessions on one working tree means a deploy ships whatever is on disk. Say which files you hold, commit only yours, and hand the deploy to whoever has the riskier change (today the wall), with a "go".

- **The sign-up wall.** Thought: sign-in optional until chapter 4 would show whether readers sign up when they don't have to. Learned: after a full day, 0 sign-ups and 1 reader at chapter 3, so a wall nobody reaches tests nothing. Now: the wall is after chapter 1 (live 20:37), and the first number to read tomorrow is how many of the chapter-1 finishers make an account. Second lesson from the same hour: a server rule written to rescue a post link (first opened chapter free) was reverted in ten minutes because Prateek wants every arrival to meet the same wall; ask before writing an exception for marketing.

- **Two sessions deploying at once took the site down for 12 minutes.** Thought: one session doing a clean-worktree function deploy while another runs npm run deploy from the shared tree is safe because pushes are atomic. Learned: the static-hosting component is not atomic with the function push; overlapping uploads left index rows whose blobs were gone ("Storage error", every page 500, 22:51 to 23:03). Now: one deploy at a time, announced before and after, and the static upload only from the session that owns the build; a readers-see-500 check (curl / and /stats) right after every deploy.
- **Cheaper writer, more fixes.** Thought: Gemini Flash chapters at ₹0.70 would need the same light fact check as Opus. Learned: on the first Flash chapter the check made 7 fixes (Opus chapters needed 0 to 3), so the check is now carrying more of the quality and costs ₹3.49 of the ₹7.23 handbook. Now: before 20 readers pass a Flash chapter, measure false and misleading claims the 6 Oct way (docs/measure) and compare with the Opus numbers; the switch back is one constant.

**The night pass (8 to 9 Oct)**
- Learned: a two-reviewer critique (design review in one head, detector and measurements in another) found the same two P0s independently, and each found things the other could not: the detector the contrast and 44 px numbers, the reviewer the order of the Done screen and the missing anchor on sign-in. Worth the two agents.
- Learned: three sessions deploying from one working tree can ship each other's half-edited files; a push that fails mid-upload leaves the static site serving index rows whose files never landed ("Storage error"). Now: announce every deploy, commit only your own files, and when the tree is mid-edit upload the static site from a clean worktree or with `npx vite build` only.
- Learned: a "fresh phone" proof script (scripts/prove-path.mjs) catches more than screenshots do: it caught the doubled wall button, the chapter-2 link, and my own stale assertion. Run it after every deploy; 40 s.
- Thought: the splash between a tap and the chapter was unavoidable. Learned: it was two renders (the query reload and the plan before chapter 1's cards). Keeping the Shelf or landing mounted through both, with the tapped book lifted, removed it and made the animation possible.
- Learned: a full-page screenshot lies about lazy images and sticky bars. Check the DOM (img.complete, class lists) before calling something a defect, and look at the chapter's own plate, not the first .story-pic in the document.

**One print language, inside and out (session 05, the night of 8 Oct)**
- Thought: the landing's risograph look was for strangers; the chapter and the plan could stay softer.
- Learned: the first critique scored the path 26/40 and called Done and sign-in "every freemium wall in this product's outlines". Screens that share no stroke weight read as two products. The one-sitting fix was tokens, not redesign: a 2.5 px ink stroke, a 4 px pressed shadow, a paper rule and a grain, applied to every frame, card and sheet.
- Now: design/style-anchor.md holds the anchor; new screens take the tokens, never a new look. Second critique on the same path: 27/40, with the remaining points in the picture weight and the typed-vs-ready plan copy, not in the surface.

**A screenshot is not a check**
- Thought: a 390 px capture of each screen was proof it was right.
- Learned: the Shelf's chips were 3 px out of line because links and a button sat on different baselines; the capture looked fine at a glance and Prateek saw it on his phone first. Lazy pictures and the sticky bar also fake defects in full-page shots.
- Now: every sweep measures from the DOM (getBoundingClientRect on every tappable, contrast on every text run) and reads the capture second. 14 screens, 0 open items at the end of the night.

**Motion that waits on nothing**
- Thought: a book that flies off the shelf and opens needs the chapter to be loaded first.
- Learned: the lift was torn down by the splash screen and the plan flashed in between, because the view changed while the animation ran. Holding the old screen mounted (hold/holdable in App.tsx) until the chapter has its cards costs nothing and removes both. A fixed-position lift escapes the scroll box; a scrim inside the section's own stacking context is the only one that paints above its neighbours.
- Now: lift, open and page turns are transform and opacity only, about a third of a second each, prefetch one picture ahead, nothing on save-data or 2G, all off under reduced motion.

**Sign-up from the wall bounced**
- Learned: after a new account the device's handbooks attach to the user in a mutation that lands a beat later; navigating straight to chapter 2 met "not yours" and fell back to sign-in. Waiting for the attach (afterSignedIn, 8 s cap) fixed it.

**Four sessions, one working tree**
- Learned: a stash by one session undid another's App.tsx fix for ten minutes; a clean deploy from a worktree shipped code a teammate had not finished. 
- Now: never git pull or stash in the shared tree, stage files by name, say "deploying <what>" to the coordinator first, run scripts/prove-path.mjs after every upload.

### GTM

**One permanent link**
- Thought: each ad can point at its own topic with a deep link in the bio.
- Learned: the bio link can't keep changing; every ad would break the last one.
- Now: www.igetit.now/?utm_source=ig stays in the bio for good.

**Reels**
- Thought: the 84-days reel was done.
- Learned (outside feedback): it looked like two videos stitched together at the cut into the app, and the jargon pile felt like the salary-day reel. The stronger angle is learning in bits from everywhere (saved reels, Watch later, a course at 4%, 47 tabs) with nothing sticking.
- Now: v2 opens on a New Year's resolution, pushes the camera into the laptop so the screen becomes the app, and ends on "still time". Every reel follows the 5-step formula (hook in 0-3 s, one step, rehook, save/share payoff, one CTA; captions on screen 2 s or more).
- Learned: a countdown line ("84 days left") is only true on the day it's made. Date-stamped posts go out the same day or get the number changed.

**Channels**
- Learned: communities beat feeds so far. GrowthX: 47 visitors, 5 finished chapter 1. Instagram: 12 visitors, 2 started, 1 finished (the first reader from a feed).

**Numbers we post**
- Thought: /admin and /stats would tell the same story.
- Learned: same data, different filters. /admin opens on Today and leaves out only phones marked as ours; /stats leaves out direct, LinkedIn and test setups. All time on /admin: 126 / 58 / 14. /stats: 64 / 29 / 7. Say which one a post uses.

**Copy**
- Thought: "Quickly go from 0-1 in any topic via personalised micro learning."
- Learned: startup and industry words ("0-1", "micro learning") aren't our voice. A one-line promise works when it names the reader's own habit: "That thing you keep saving? Get it in 7 nights."

**Build-in-public posts**
- Learned: a numbers-only post talks at people. Asking other builders what got their first 100 users invites replies, and readers' feedback with what we changed is a story in itself.

**Promises in posts expire**
- Thought: a post's offer line ("first 3 chapters free, no sign-up") was safe because it was true when posted.
- Learned: moving the wall after chapter 1 (20:37) made 5 live posts false at once: 2 Instagram captions, an Instagram reel still saying "28 days", the X ad and the pinned X post ("Week 1 free"). Posts outlive product changes.
- Now: offers in posts use the most stable line ("Chapter 1 is free, no sign-up"); any change to what's free comes with a sweep of live posts, bios and pinned posts before it ships (list in docs/night-report-2026-10-09.md).

**New accounts reach strangers through sends and replies, not followers**
- Thought: daily posts on fresh Instagram and X accounts would bring readers.
- Learned: with 18 and 23 followers, reach depends on strangers: Instagram tests each post on a small non-follower audience and weighs DM sends per view most (Mosseri, Jan 2025); on X, small accounts that grew spent most of their time replying (one grew 50 to 7K in about 16 months at 50+ replies a day). X sent us 1 visitor all week.
- Now: every post ends on a send line; 15-20 hand-written replies a day on X; a daily reel with a 3-second hook (the reel formula) and judging after 30 posts, not 5 (docs/growth-playbook.md).

**Hashtags and links: we were following folklore**
- Thought: more hashtags, more reach; links on X go in the first reply.
- Learned: Instagram's own guidance (Dec 2025) is up to 5 targeted hashtags; our posts carried 11-13. X's head of product said links aren't deboosted (Oct 2025, Apr 2026), though an outside test still found fewer views on link posts.
- Now: 3-5 hashtags, #IGetIt first; on X, a two-week test (link in the post on odd days, first reply on even days), judged by visitors with utm_source=x.

## Noted during the day

