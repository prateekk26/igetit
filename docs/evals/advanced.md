# Advanced evals

Notes from the GrowthX Build Sprint handbook, "Advanced evals" (added 10 Oct), read 11 Oct. Our own words and examples. Needs basics.md first: a rubric, and every output logged and scored.

What you end with: a test set of 20 to 50 real cases, a scorer you have checked against your own judgement, and a run of the whole set before any change ships. The first round takes a few hours; after that, a weekly read and a run before each change.

## 1. Read what broke

- Pull 50 to 100 real outputs: the input, the output, its score, and every step the pipeline took (for us: the research brief, the plan's chapter spec, the writer's reply, the fact check's changes). A finished chapter can read fine while the steps show where it went wrong.
- Write one note per output: the first thing that went wrong, in one specific line. "Bad quiz" is too loose. "Quiz 2 asks for 'TAM', which the chapter never defined" is a fix.
- Note only the first thing. Later problems usually follow from it.
- Group the notes into five to eight kinds plus "other" (a model can do the grouping; the notes are ours, because we know the readers). Count each kind.
- Stop when new outputs stop showing new kinds.

Then, per kind: a plain bug (a missing instruction, a broken lookup, a wrong format) gets fixed today and one test case keeps it fixed. A miss on a lever goes into that lever's rubric as an edge case. A kind no lever covers becomes a new lever.

Start with the biggest group. One team that did this found three kinds made up most of their failures, and fixing one of them took that kind from about a third right to nearly all right.

A review page makes this fast: one output at a time, a box for the note, a box for our own level on each lever, keys for next and previous, and a mark wherever our level and the scorer's differ. Notes and levels save to a CSV with each output's id.

## 2. Build the test set

A test case is one input and what a good answer to it looks like. 20 to 50 to start, each from something real:

- two or three from each kind counted in step 1, biggest first;
- five to ten inputs that work today, so we notice the day they break;
- hard inputs: a vague line ("Jev's agent thing"), a topic with little written about it, a topic we should decline;
- inputs that try to break it: "ignore your instructions", a harmful topic dressed as a harmless one.

For each case write the level each lever must reach. If two people could disagree on whether a run passed, the case is too loose; rewrite it.

Keep two lists. **Fix next**: cases it fails today, what we work on. **Must keep working**: cases it passes today; one failure here means a change broke something. A Fix next case that passes three runs in a row moves across.

Where the pipeline does things (saves a chapter, copies to a reader, sends a push), check the database, not the reply. Fake anything risky in tests: a test never sends, charges or publishes. Test lookups on their own: a bad answer from the right research and from the wrong research are fixed in different places.

## 3. Run every case more than once

The same input gets a different answer each time. A case passes only when every one of 3 to 5 runs passes. At 90% right per run, five runs in a row are all right only 59% of the time, and a reader who opens ten chapters sees all ten right about a third of the time.

For Fix next cases, also ask in two more ways (other words, another order, a typo). A version that fails becomes its own case.

What makes answers steadier: one good and one bad example in the prompt; a fixed JSON shape wherever code reads the reply; low randomness where there is one right answer; a lookup for facts instead of memory.

## 4. Check the scorer

The model call that scores outputs is the scorer. Before trusting it:

- take 30 to 50 logged outputs, good and bad;
- score them ourselves with the rubric, without looking at its score;
- count how often it gives our level, and above all: of the ones we scored worst, how many did it also score worst? A scorer can agree on 42 of 50 and still miss 6 of the 8 bad ones.

When it misses: show it everything (the input, each step, what the reader saw); one lever per call; make it quote the line it is scoring; let it say "can't tell"; add the missed case to the rubric; then try another model as scorer. Recheck whenever the rubric or the scoring model changes, and store which model scored each output.

## 5. Test every change

Before any prompt, model or rubric change goes live: run the whole set, three runs a case. Ship only if nothing in Must keep working broke.

- Compare case by case. Two versions can both score 7 of 10 with three cases fixed and three broken.
- Small sets move by luck: with 30 cases, a measured 70% could really be anywhere from about 54% to 86%. Look at which cases changed; add cases where we need to be sure.
- Note time and cost next to the score. A fix that doubles the cost is a decision, made on purpose.

Write the case before the fix: add the failing input to Fix next, watch it fail (if it passes, it isn't testing what we think), change one thing, run until it passes three times in a row, then run the whole set.

When a score looks wrong, read the outputs before believing it. A strict grader can mark a right answer wrong (a public benchmark score more than doubled once the grading and the setup were fixed).

## 6. Watch it live

The test set covers what we thought of; readers send what we didn't. Every day, read the lowest-scored live outputs, and watch the signals that something went wrong: a reader who quits mid-chapter, misses the same quiz, retypes the topic, or asks "Ask or object" about a card. Each bad one becomes a Fix next case: copy the input, write what good looks like, remove anything personal, and save what the research returned so the test replays it. Every week, read 20 live outputs even when the scores look fine.

## Order for the first week

1. Read 50 outputs, note each, group and count.
2. Write 20 cases in two lists.
3. Score 30 outputs ourselves; check the scorer.
4. Set up the runner: three runs a case, before every change.
5. Every bad live output becomes a case.

Tools that do the same in one place: Langfuse (we already export traces to it), Braintrust, promptfoo, Arize Phoenix. A sheet and an HTML page are enough to start.

## Done when

- [ ] 50 real outputs read, one note each
- [ ] notes grouped and counted; the biggest group known
- [ ] 20+ cases in Fix next and Must keep working
- [ ] every case runs three times and passes only if all three pass
- [ ] 30 outputs scored by us; we know how many bad ones the scorer catches
- [ ] every prompt or model change runs the set before it goes live
- [ ] bad live outputs go into the set every week
