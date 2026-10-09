# Lessons, day by day

What each day taught us, not what shipped (that's PROGRESS.md). Every build day gets two halves, Product/Tech and GTM, written by whichever session did the work (Prateek, 8 Oct: "Product/Tech and GTM lessons every single day we build"). Each lesson: what we thought, what we learned, what we do now. Numbers over adjectives. Newest day on top.

Feeds the 9:30 X draft (scripts/x-nightly.sh reads yesterday's day) and the end-of-sprint write-up. A message that starts with "learned:" lands under "Noted during the day" at the bottom; fold those into the day before the session ends.


## Sat 10 Oct, the night (day 9, 00:00 to 05:00; session e2)

### Product/Tech
- **Thought:** a coursemate's branch is a merge (e2). **Learned:** her branch already held our main; the delta was two commits, about 900 lines, plus one product call hidden in a commit message (D23/D27 left out). Cherry-pick without commit onto our main gave three small clashes, all where both sides had added code at the same spot. **Now:** read the diff and the evidence first, resolve by hand, her commits stay out of our history (D62, like D15).
- **Thought:** "unchecked" means the checker failed (e2). **Learned:** both dal chapters came back "unchecked" because our validFix accepted a corrected card only if it had a body or a prompt, so every fix to a "steps" card was skipped; the kit added steps cards on 8 Oct and nobody noticed, because the old checker rarely rewrote them. Her check v3 does. **Now:** a fix passes when it keeps the original card's keys and kinds of value; dal's re-check went from "unchecked" to "fixed, 2".
- **Thought:** a failed Flash call is a prompt problem (e2). **Learned:** tonight every Flash chapter try on dev ran to the 150 s abort, and research and plans stalled too, while prod's log shows Flash chapters at 16 s average and plans at 25 to 29 s a day earlier. Flash stalls at some hours; the Opus backup (D41) catches it, at ₹10 to 15 a chapter instead of ₹1. **Now:** the "₹15 a handbook" number holds only when Flash answers; the bounce rate on /admin is the number to watch, and a shorter per-try abort with a retry inside the step is the proposal, not a model change.
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
