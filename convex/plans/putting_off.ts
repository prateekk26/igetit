// Free-ten handbook "Start the thing you keep putting off" (docs/free-ten.md, pick 6), planned by hand in the shape of
// HOLD_A_ROOM (convex/showcasePlans.ts): one running example the reader follows, a step a chapter, then "Your turn".
// Every title and line here is (agent) copy until Prateek rewrites it.

type Day = { title: string; covers: string; outcome: string; hook: string; needs: string[]; blocks: string[]; proof: string; readMinutes?: number };

// The running example every chapter shows done. An invented person, so everything about her is an example, never a
// measured result.
const KAVYA = "Ritika, 27, a marketing executive at a biscuit company in Chennai, who keeps putting off the online data analytics course she paid for";
// Her facts stay the same in every chapter, so the example reads as one person getting started, not seven people.
const KAVYA_FACTS = `Her fixed facts, the same in every chapter: in March she paid ₹8,000 for an online data analytics course of 40 videos and has watched 3; she wants to move from marketing into a data role; she commutes about an hour each way and is home by 8 pm; after dinner she picks up her phone "for a minute" and it's 11; her line to herself is "I'm so lazy. I'll start properly on Monday." What she adds, chapter by chapter: her two-minute start (chapter 1): open the laptop and press play on video 4; her when-then plan (chapter 2): "When I finish dinner, I'll sit at the dining table, open the laptop and press play on the next video"; her setup (chapter 3): before bed, the laptop left open on the dining table with the next video's tab loaded and earphones beside it, her phone charging in the bedroom; her box (chapter 4): 25 minutes, one video and three lines of notes; her kinder line (chapter 5): "I avoided it because it felt huge. What's the two-minute start?"; in chapter 6 she misses Thursday (a late meeting and rain traffic) and does the two-minute version on Friday. Never show her using a step before the chapter that teaches it.`;
const STEP = `Show this chapter's step done on the running example: ${KAVYA}. ${KAVYA_FACTS} Show her before and after this step, in her words, consistent with what earlier chapters showed.`;
const TRYIT = `Include the plan's "tryit" block as a card whose type is exactly "tryit" (not "try"): {"type":"tryit","title":"Try it","idea":"<one line: what the reader taps and what they see>"}. The interactive page is built from the idea line afterwards; the card itself gives no answer away.`;
const TURN = `End with a "Your turn" card (type "try", titled "Your turn"): the same step for the thing the reader keeps putting off, done on paper, on the phone or on the spot in under 2 minutes. Optional: say so.`;

function day(d: Day, extra: { turn?: boolean } = {}) {
  return { ...d, needs: [...d.needs, ...(d.blocks.includes("tryit") ? [TRYIT] : []), STEP, ...(extra.turn === false ? [] : [TURN])], minutes: (d.readMinutes ?? 3) + 2, readMinutes: d.readMinutes ?? 3, pieces: [] as string[], assumes: [] as string[] };
}
const TEACH_TRY = ["picture", "teach", "tryit", "example", "exercise", "try", "breath"];
const TEACH_MISTAKE = ["picture", "teach", "example", "mistake", "exercise", "try", "breath"];
const GIVE_IT = ["picture", "teach", "example", "doit", "teach", "breath"];

export const PLAN = {
  topic: "Start the thing you keep putting off",
  mode: "skill",
  body: false,
  format: "course",
  caution: "none",
  goal: "Start the thing I keep putting off and keep going: a first step today, then a plan that still works on a bad day",
  outcome7: "By day 7 you'll have started the thing you keep putting off, worked on it in short timed sessions, and have a one-page plan that gets you back to it after a missed day.",
  picture: null,
  pictureWhyNot: "a running example (Ritika finally starting the course she paid for) carries the handbook instead of an analogy",
  framing: null,
  series: `One running example through all 7 chapters: ${KAVYA}. Each chapter teaches one move that research supports, shows Ritika doing it, then hands the reader "Your turn". Value comes in chapter 1: the reader does the first two minutes of their own put-off thing before the chapter ends. Each chapter is under 5 minutes. Honest throughout: these moves make starting more likely, not certain.`,
  sources: [
    { who: "Fuschia Sirois and Timothy Pychyl", what: "Procrastination and the Priority of Short-Term Mood Regulation: Consequences for Future Self (2013)", why: "putting things off as a way to escape a bad feeling now, at a cost later" },
    { who: "Peter Gollwitzer", what: "Implementation Intentions: Strong Effects of Simple Plans (1999)", why: "\"When X, I will Y\" plans that make starting more likely" },
    { who: "Michael Wohl, Timothy Pychyl and Shannon Bennett", what: "I Forgive Myself, Now I Can Study: How Self-Forgiveness for Procrastinating Can Reduce Future Procrastination (2010)", why: "why being kind to yourself about a delay helps the next start" },
    { who: "Francesco Cirillo", what: "The Pomodoro Technique", why: "working in short timed blocks with a break" },
  ],
  next: ["Make one habit stick for good", "Plan your week in 15 minutes", "Stop scrolling your phone at night"],
  chapters: [
    day({ title: "Make it a two-minute start", readMinutes: 3, covers: "Putting things off is dodging a bad feeling, not laziness. Shrink the first step until it fits in two minutes, then do it.", outcome: "You can turn the thing you keep putting off into a two-minute first step, and do it.",
      hook: "You're not lazy. You're dodging a bad feeling, and the size of the task is feeding it.",
      needs: ["The aha by card 3, through the Try it card (card 3, type \"tryit\"): Ritika's task starts as \"Finish the data analytics course\"; the reader taps \"Smaller\" and it shrinks one step at a time (\"Do the next module\", \"Watch video 4\", \"Open the laptop and press play on video 4\") while a clock beside it drops to about two minutes, and the last step reads \"You could do this before you finish this chapter\". Cards 1 and 2 set up the dread without giving the fix.",
        "Teach it plainly: researchers who study procrastination (Fuschia Sirois and Timothy Pychyl) describe it as putting how you feel right now first: you avoid the task to escape the bad feeling it brings, feel better for a moment, then worse. Laziness is not wanting to do anything; putting off is wanting to and not starting. No statistics. Keep this chapter about the dread of the task; low mood and worry come in chapter 5.",
        "The deal: do only the two-minute start, with real permission to stop after two minutes. Often you keep going; never promise it. James Clear's \"Two-Minute Rule\" in Atomic Habits is the same idea (paraphrase it, no quotes).",
        "Then a timer (doit, kind timer, 120 seconds): write the two-minute start for your own put-off thing, and do it now. That is the win: before minute 4, the reader has started. Close the In one breath card with an optional one-line \"Your turn\": write tomorrow's two-minute start too."],
      blocks: ["picture", "teach", "tryit", "doit", "breath"], proof: "set" }, { turn: false }),
    day({ title: "When X, I will Y", covers: "Decide the exact moment and place you'll start, in one sentence, so tomorrow you don't have to decide.", outcome: "You can write a when-then plan that names the moment, the place and the first step.",
      hook: "\"Tomorrow\" isn't a time. One sentence with a real moment in it changes what happens.",
      needs: ["Teach implementation intentions, explained in the same sentence: the psychologist Peter Gollwitzer's name for a plan in the form \"When X happens, I will do Y\". A 2006 review of many studies by Gollwitzer and Paschal Sheeran found people who made such plans were more likely to act than people who only meant to. Give no effect sizes, percentages or study counts.",
        "The X is a moment you can't miss (when I finish dinner, when I sit at my desk, when the bus leaves my stop), never a vague one (this weekend, when I'm free). The Y is the two-minute start from chapter 1. Add one if-then for the usual obstacle: \"If I pick up my phone, then I put it in the bedroom.\"",
        "The Try it card (type \"tryit\"): the reader builds their own plan: taps a \"When\" from a few options or types one, then a first step; the page joins them into one sentence and gently flags a vague \"when\" (like \"this weekend\") with a nudge to name a moment.",
        "One scenario exercise: three plans from a new person (not Ritika); which one is most likely to happen tomorrow."],
      blocks: TEACH_TRY, proof: "scenario" }),
    day({ title: "Make starting the easy option", covers: "Set things up tonight so tomorrow's start takes one move, and the usual distraction takes several.", outcome: "You can set up your space so starting takes one move and distraction takes more.",
      hook: "Ritika didn't need more willpower at 9 pm. She needed her phone in another room.",
      needs: ["The idea: make the first step easier (fewer moves between you and starting) and the usual distraction harder (more moves). Each extra move is one more chance to stop. Say it as a practical rule, not a lab finding; no statistics.",
        "Set it up the night before, when it costs nothing: what goes out, what goes away, what is already open.",
        "The mistake card: counting on willpower at the end of the day, when you're most tired; or building a perfect study corner and never starting (setting up as one more way to put it off).",
        "One scenario exercise: a new person's evening; which change makes their start one move away."],
      blocks: TEACH_MISTAKE, proof: "scenario" }),
    day({ title: "Work in a box with an end", covers: "Give the task a fixed time with a real stop. A known end makes starting feel smaller.", outcome: "You can work in a timed box and stop when it ends.",
      hook: "A task with no end feels endless. Put a timer on it and it shrinks.",
      needs: ["Time-boxing: decide the length before you start (5, 10 or 25 minutes), set a timer, stop when it rings, take a short break. Francesco Cirillo's Pomodoro Technique uses 25 minutes of work and a 5-minute break. Honest: there is little direct research on the 25-minute number itself, so pick any length you will actually start.",
        "Why it helps: the end is in sight, so the task feels smaller; and stopping on time keeps tomorrow's start easy.",
        "Ritika's first box: 25 minutes, video 4 and three lines of notes; the timer rings mid-video and she stops anyway, leaving a note of where she was.",
        "The mistake card: ignoring the timer and going on for two hours, then dreading the next session; or pausing the timer to check the phone.",
        "A timer (doit, kind timer, 300 seconds): your first box, 5 minutes, on the thing you keep putting off. Tomorrow, 10 or 25."],
      blocks: ["picture", "teach", "example", "mistake", "doit", "breath"], proof: "set" }, { turn: false }),
    day({ title: "Swap \"I'm so lazy\"", covers: "Harsh words about yourself make the task feel worse. Forgiving the last delay makes the next start easier.", outcome: "You can catch a harsh line about yourself and swap it for one that leads to the next step.",
      hook: "Calling yourself lazy feels like motivation. In one study, forgiving yourself worked better.",
      needs: ["The finding, plainly: Michael Wohl, Timothy Pychyl and Shannon Bennett (2010) followed first-year university students in Canada; those who forgave themselves for putting off studying for a first exam put off studying less for the next one. One study, with students; say so.",
        "The swap, in three parts: say what happened without a label (\"I avoided it\"), give the kind reason (\"it felt huge\"), name the next two-minute start. Show Ritika's line before and after.",
        "The Try it card (type \"tryit\"): Ritika's harsh line appears; the reader taps through the three parts one at a time (drop the label, add the reason, add the next step) and watches it turn into her kinder line; then a box to type their own.",
        "If putting things off comes with low mood most days, or worry that won't switch off, say kindly in one line that a doctor or counsellor can help (Tele-MANAS, India's free 24x7 mental health helpline, 14416). No diagnosis, no therapy advice.",
        "One scenario exercise: a new person's harsh line; which rewrite leads to a next step."],
      blocks: TEACH_TRY, proof: "scenario" }),
    day({ title: "The day after a missed day", covers: "Missing a day is normal. What matters is the next day: restart with the two-minute version, never from scratch.", outcome: "You can restart the day after a miss, with a plan you made in advance.",
      hook: "The missed day isn't the problem. \"I'll start fresh on Monday\" is.",
      needs: ["One missed day barely matters; a run of them does. The rule: try never to miss twice in a row (James Clear's idea in Atomic Habits; paraphrase, no quotes). On a bad day, do the two-minute version: it keeps the plan alive.",
        "Plan the miss before it happens, with an if-then from chapter 2: \"If I get home after 9, then I only do the two-minute start.\"",
        "Ritika misses Thursday; on Friday her old line (\"I'll start properly on Monday\") comes back; she swaps it using chapter 5, does the two-minute start, and it turns into a full box.",
        "The mistake card: waiting for a fresh start (Monday, the 1st, after Diwali); each wait turns one missed day into several.",
        "One scenario exercise: a new person misses two days; which next move keeps their plan going."],
      blocks: TEACH_MISTAKE, proof: "scenario" }),
    day({ title: "Your week on one page", covers: "Put the six moves on one page for the next seven days, then start today's box.", outcome: "You can write a one-page plan for the thing you put off and use it to start each day.",
      hook: "Six moves, one page, kept where you'll see it. Then today's box.",
      needs: ["The one page, seven lines: the thing, the two-minute start, the when-then plan, the setup, the box length, the kind line, the restart rule. Ritika's page as the worked example, filled in from earlier chapters.",
        "A checklist (doit, kind checklist, those seven lines as the items): write your own page, then start today's box.",
        "Honest: these moves make starting more likely, not certain; some days will still slip, and the page is for those days.",
        "On this last chapter, end with what the reader can now do and one next step (the same page for the second thing on their list)."],
      blocks: GIVE_IT, proof: "set" }, { turn: false }),
  ],
};
