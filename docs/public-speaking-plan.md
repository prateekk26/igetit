---
date: 2026-10-10
type: research
tags: [igetit, public-speaking, free-ten]
ai-first: true
---

# Public speaking: making it excellent (research, 10 Oct)

## For future agent
Research only; nothing built. Prateek asked (10 Oct): make Public speaking excellent, let readers choose "just teach me" or "teach me and make me practise", and teach them to research a topic and present it. Decisions still his are listed at the bottom. Chapter 1 is frozen (convex/frozen.ts, the 7 Oct carousel).

## What the app can do today
- Card types: picture, teach, example, mistake, try, watch, steps, tryit, the 3-option quiz (or poll), move and doit. doit is a rep counter, timer or checklist plus a "how did it feel" tap, saved to `sets` (convex/schemas.ts, src/components/DoIt.tsx).
- Typed input only in Teach it back (600 characters, Sonnet reply) and Ask or object. Nothing records audio or video.
- prompts.ts allows move and doit cards only when the plan says "body": true, so a speaking handbook gets no timer today.
- readingReport (handbooks.ts) reads only first-try quiz answers and the lost-me / too-easy tap, not sets or teach-backs.

## What the best do, and what the evidence says
- Yoodli, Orai, Speeko: record, score filler words, pace and energy, give one fix. Speeko adds a daily 5-minute warm-up. None publish proof that they work.
- Toastmasters: the first project is a 4 to 6 minute talk about yourself. On a first talk the feedback is notes only, no score.
- U Washington on Coursera: one recorded speech, reviewed by other learners, optional.
- Duolingo Video Call: speaking practice where mistakes cost nothing.
- Practice in small steps cuts the fear by a lot, whether in VR or real rooms (meta-analysis, effect sizes −1.39 and −1.41).
- Saying "I'm excited" beats "I'm calm" for how persuasive and confident speakers come across (Brooks 2014).
- Stories stick: 63% remembered a story from a one-minute talk; 5% remembered any statistic (Stanford, Chip Heath).
- 63.9% of 1,135 students fear public speaking.
- Caution: forcing people to watch their own recording kept their fear from dropping (Newburger 1994). Keep listen-back optional and guided.
- Chrome's speech-to-text sends audio to Google and Safari's is patchy. Don't build on it.

## Proposal
**The choice: "How do you want to learn?"** Ask it after chapter 1 is passed, not before. People already leave on card 1, so nothing more should stand in front of it, and chapter 1 is frozen anyway.
- Just teach me: cards and quizzes, as today.
- Teach me and make me practise: one speaking drill per chapter plus one step of a talk project, and a next-day reminder ("Say your 60 seconds out loud before lunch").
- Optional: "I have a talk on [date]": practise, paced to the date.

Practice cards are written once per chapter as a separate set, shown only to practise readers. The choice can be changed from the handbook menu.

**Practice on a phone, by effort:**
1. Speak-it card (small effort, high value): prompt, 30 to 60 s timer, "I said it out loud", how it felt. Reuses the doit timer; needs the prompt rule change.
2. Record and listen back on the phone (small to medium, high value): MediaRecorder, works on Safari since iOS 14.3. Nothing uploaded; deleted on leave. Listening back is optional and guided ("listen for one thing: did your first line make a promise?").
3. A typed check on their own lines (small, medium-high value): they type their one-sentence idea or opening, and get the same kind of Sonnet reply as Teach it back. No new service.
4. "What line do you remember?" (small, high value): after the real talk, they ask the listener and type the answer. This tests the vision title directly.
5. AI feedback on the recording (medium to large): Gemini audio, about 3,840 tokens for 2 minutes, under ₹1. Returns filler words, words per minute and one fix. Needs Prateek's yes (below).

**The 7 chapters ("Give a talk people repeat afterwards"), through-line: research a topic and give a 2 to 3 minute talk on it.**
1. Pick one summit (frozen). Drill: say your one idea in 30 s. Project: pick a topic (UPI, the Mumbai dabbawalas, your own job).
2. Shaky hands, racing heart: why it happens, "I'm excited", one slow breath out, a ladder of small exposures (a stand-up line, a wedding toast). Drill: 30 s to the phone camera.
3. Research it in 30 minutes: 3 facts and 1 story; people first, then PIB and RBI for Indian numbers; keep only what serves the summit.
4. Open with a promise: the first 20 seconds. Drill: record 3 openings, keep the best.
5. Build the path from what they already know: three stops, comparisons from cricket, chai or the local train; a story over a statistic. Drill: a 60 s middle.
6. Pace, pauses and rough patches: blanking, a hard question, a dead projector at a Pune college seminar. Drill: record and listen for one thing.
7. Give it: a 2 to 3 minute talk to a real person (family dinner, team meeting, a voice note to a friend). Ask what line they remember; a pass is that line matching the summit.

## What to measure
- How many leave on card 1, and chapter 1 pass rate (now 16 of 44, 36%).
- Share picking practise; drills done per chapter opened.
- Readers reaching chapter 7; share whose remembered line matches their summit.
- A fear tap (1 to 5) at chapter 2 and chapter 7.
- Next-day return, practise vs just teach me.

At 47 starts in 14 days, a comparison will take weeks to mean anything.

## Needs Prateek's yes or a rule change
- Speaking drills: change the "body: true only" rule in prompts.ts, or add a speak card.
- Audio or transcript to Gemini: it's reader data, which AGENTS.md section 4 does not allow. It needs a rule change, a privacy note, a free-vs-member limit, and never sending it to Langfuse.
- Measuring the change: chapter 1 is frozen and D7 blocks A/B tests on frozen topics. Either ship it as a new handbook under the vision title, or change D7.
- AI feedback stays a single reply, so it never becomes the tutor chat that's out of v1.
- Stage fear: teach it, never diagnose; whether to point severe cases elsewhere is Prateek's call.

## Sources
yoodli.ai · smithsonianmag.com/innovation/app-make-you-better-public-speaker-180963384 · setapp.com/apps/speeko · toastmasters.org Pathways evaluation resource · coursera.org/learn/public-speaking · blog.duolingo.com/video-call-research-report · pure.qub.ac.uk (VR vs in-vivo exposure meta-analysis) · pubmed.ncbi.nlm.nih.gov/24364682 (Brooks 2014) · bakadesuyo.com/2012/11/secret-communicating-memorably · scielo.br/j/codas/a/h5YK3qBbgqY7pQnbJxHWQrP · ecommons.udayton.edu/bcca/vol6/iss1/18 · webkit.org/blog/11353/mediarecorder-api · ai.google.dev/gemini-api/docs/audio
