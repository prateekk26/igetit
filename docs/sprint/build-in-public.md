# Build in Public: this week's raw material (agent, 11 Oct night)

The handbook is blunt: "Never write your posts with AI... What works is your words." So this is raw material, not posts: the true numbers, the story beats, five first lines to pick from, and the checks for each app. Prateek writes the post. House rules still apply (docs/launch, memory): 𝙄 𝙂𝙚𝙩 𝙄𝙩 in bold italic; Instagram 3 to 5 hashtags, #IGetIt first; X link in the post with ?utm_source=x; the mascot is Ooh, never Dot; offers use "Chapter 1 is free, no sign-up".

## The idea list (keep adding; pick from here when it's time to post)

- 34 of the 49 readers who quit chapter 1 left on card 1 or 2. The opening is the leak, not the length. (Lesson)
- Public speaking: 47 of 89 handbooks started in 30 days. We rebuilt it as 28 days. (Decision, done Sat)
- Gemini wrote 18 of the 28 days; on the last 9 it timed out on 8 and Claude took over. Why: each day's "already taught" list grows. (Behind the scenes)
- A reader asked "can I see what it costs you?": a chapter costs us ₹1 to ₹9; the 28-day handbook about ₹400 to write once. (Behind the scenes)
- We added a rubric that grades every chapter on three things and quotes the line it graded. (Behind the scenes)
- An agent built ten new free handbooks overnight, each with one running example person (Arjun's job hunt, Divya's raise, Pooja's spoken English). (Progress)
- Next.js vs what we have: we stayed on React + Vite because our host serves files only; cut the first download 22% instead. (Decision)
- Visitors were 269 but the sprint only counts PostHog: started counting today. (Lesson: wire analytics in week one)
- 1 sign-up in 10 days. The wall moved twice. (Honest, hard part)

## Monday: Progress, with a before and after

Story beats (true): we had one free handbook on Saturday; by Monday there are eleven, each a complete course you can finish without paying, built around one person you follow along with. Before: a subject list ("Public speaking", "Credit score"). After: a promise ("Hold a room for 10 minutes", "Make your credit card pay you back").
Image: the shelf before/after screenshot (take Monday on a phone).
First lines to choose from:
1. "We gave away eleven complete courses this weekend."
2. "Saturday: 1 free handbook. Monday: 11."
3. "Stop naming courses after subjects. Name them after the win."
4. "Our most-read topic got 53% of readers. So we made ten more like it, free."
5. "Eleven courses, eleven people you follow from day 1 to the end."
Ends with a question: "Which one would you start first?"

## Wednesday: Lesson or decision

Story beats (true): 34 of 49 readers who quit chapter 1 left on the first two cards. We'd been cutting chapter length; the leak was the opening. Every new handbook now puts a tap-to-try card at card 3, so the first thing you do is touch something, not read a paragraph. We'll know by Friday if it worked (/admin numbers).
Image: a raw screenshot of /admin's "where people stop" list.
First lines:
1. "70% of the people who quit our lessons quit on the first two cards."
2. "We spent a week making chapters shorter. The problem was the first 20 seconds."
3. "34 of 49."
4. "Our readers weren't bored. They were never hooked."
5. "The fix wasn't less reading. It was something to tap by card 3."
Ends with a question: "What makes you stay past the first screen of an app?"

## Friday: Behind the scenes

Story beats (true): how one chapter gets made, with real numbers: a research step searches the web (Gemini + Google Search, about ₹1), a plan step decides the chapters for your goal, a writer, a fact checker (Claude Sonnet), a picture step (Runway, ₹4 a picture), a tap-to-try page builder, and since this week a grader that scores every chapter on a rubric and quotes the line it graded. Every call is visible in Langfuse and PostHog.
Image: a Langfuse trace tree of one handbook, or the PostHog LLM analytics page (raw screenshot).
First lines:
1. "Six AI agents work on every chapter you read. Here's the org chart."
2. "What it costs to write one lesson for one person: ₹1 to ₹9."
3. "Our AI grades its own homework now. Here's the rubric."
4. "Every lesson on I Get It goes through a researcher, a writer and a fact checker. None of them is human."
5. "The pipeline behind a 5-minute lesson."
Ends with a question: "Builders: how do you know your AI's answers are good before users tell you?"

## Before you post (the handbook's checks)

- X: the first line is short, specific and works alone; a real image; it shows how or what broke; ends with a question; stay for the first hour and reply to every reply.
- LinkedIn: on your one topic; the first three lines earn "see more"; each paragraph pulls into the next; teaches something only you could.
- Instagram: one feeling and one thing to remember; first line, first shot, first sound all hook; something changes every 2 to 3 seconds; captions on.

## Numbers to note after each post (running note, Users & distribution)

Impressions, reactions, replies, profile visits, link clicks (utm_source), visitors (PostHog), handbooks started, sign-ups. Keep them in docs/launch/followers.csv's neighbour, docs/sprint/numbers.csv (create on Monday).
