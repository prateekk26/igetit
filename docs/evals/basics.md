# Eval basics

Notes from the GrowthX Build Sprint handbook, "Eval basics" (2 chapters, 7 Oct class), read 11 Oct. Written in our own words with our own examples; the handbook's text stays on growthx.club. Next: advanced.md. Where I Get It stands: where-we-stand.md.

An eval does two jobs: it defines what good means for one output, then it helps you make that output better. Nothing else.

## 1. Define quality

**Pick one output.** One thing the AI produces that sits closest to the job the reader hired us for. Not the whole product, not the whole pipeline. For us that is a chapter: the thing a reader reads and acts on. The plan, the research brief and the quiz versions matter, but they serve the chapter.

**Name the input levers.** The two or three things that make that output good. Improving quality means improving these, nothing vaguer. For a chapter:

1. It delivers its outcome line. The reader can do the thing by the end ("You can write the one line you want a stranger to remember about you").
2. Its facts are true. Nothing invented, nothing out of date, nothing a fact check would rewrite.
3. It teaches before it tests. Every quiz and every "Your turn" asks only for what the chapter taught.

**Write a rubric for each lever, in levels.** A lever is never yes or no. Write the worst and the best first, then one or two levels between. Three levels is a fine start; five is plenty.

| Lever | L1 (worst) | L3 | L5 (best) |
|---|---|---|---|
| Delivers its outcome | Never gets to the outcome; explains around it | Explains the outcome and shows an example, but the reader never does it | The reader does it once inside the chapter (a Try it, a "Your turn", a timer) and the closing line names what they can now do |
| True facts | A false claim the reader would act on | Correct but vague ("experts say", no number where one exists) | Specific and checkable, numbers from the research brief, India-first where it matters |
| Teaches before it tests | A quiz needs something the chapter never said | Answerable, but only by someone who already knew the topic | Every question maps to one card; every wrong option names a real confusion |

Write the rubric yourself, in a sheet. No model can decide what good means for our readers. This step alone gets most of the way (the class put it at 60 to 70% accuracy, sometimes more).

What we don't touch: the model's own abilities. Making the model do what we want is our job; making the model smarter is not.

## 2. Improve quality

**Track.** Log every output with what went in, what came out, and its score against the rubric. A model scores against a rubric well (that is how models are trained), so the scoring can be a model call. Store it next to the output in Convex and read it on a simple page.

**Fix the rubric, not the output.** When an output misses, don't patch that one answer. Add the case to the rubric: "L3 also covers a quiz that tests a term from the previous chapter." The rubric grows with every miss, and the prompts follow the rubric.

**Self-improvement comes after.** A system that improves itself before you can define "better" builds more broken things than good ones. Once evals work, the only self-improvement worth having is remembering one reader's preferences.

## The five steps, in order

1. Choose one output that is core to the job.
2. Define its input levers.
3. Write a rubric per lever: worst, best, levels between.
4. Track: log and score every output.
5. Fix: read the scores, add each miss to the rubric.
