// A hand-made showcase handbook of the free eleven (docs/free-ten.md, pick 3), planned the way HOLD_A_ROOM is
// (convex/showcasePlans.ts, D65): each chapter's delivery spec written by hand, one running example all the way.
// Every title and line here is (agent) copy until Prateek rewrites it.

type Day = { title: string; covers: string; outcome: string; hook: string; needs: string[]; blocks: string[]; proof: string; readMinutes?: number };

// The running example every chapter shows done. An invented person, so her numbers are an example, never a measured result.
const DIVYA = "Divya, 30, a software test engineer at an IT services company in Hyderabad";
// Her facts stay the same in every chapter, so the example reads as one person's ask taking shape, not seven strangers.
const DIVYA_FACTS = `Her fixed facts, the same in every chapter: six years in software testing, three at this company; she leads testing for one client's mobile app; her manager is Suresh; CTC (cost to company, the yearly total the employer spends on her) ₹11 lakh, of which ₹10 lakh is fixed and ₹1 lakh is yearly variable pay; last year's hike was 7%; her two main results this year: she automated the release checks, so a 3-day manual test round now runs overnight, and she trained the 2 new joiners on her team; her company's appraisal year runs April to March, and ratings close in March; her market range, from three sources, is ₹12 lakh to ₹14.5 lakh CTC; her ask is ₹13 lakh CTC (about 18% more), with the rise in fixed pay; she books a 30-minute meeting with Suresh in the first week of February. From chapter 6 only: Suresh says the budget allows 10% this cycle; she asks what it would take to reach ₹13 lakh, and they agree on 10% now and a pay review in October against two written goals (automating release checks for a second client app, and running the training for all new joiners in the testing group). Her numbers are an example, never a measured result, and never a promise of what the reader will get.`;
const STEP = `Show this chapter's step done on the running example: ${DIVYA}. ${DIVYA_FACTS} Chapter by chapter she builds one ask: her three-line case, her results, her number, the timing, the words she says, her answer to "not now", and her recap email. Show her work before and after this step, in her words, consistent with what earlier chapters showed. Never name a real company as her employer or say what a real company pays; describe them ("an IT services company in Hyderabad").`;
const TRYIT = `Include the plan's "tryit" block as a card whose type is exactly "tryit" (not "try"): {"type":"tryit","title":"Try it","idea":"<one line: what the reader taps and what they see>"}. The interactive page is built from the idea line afterwards; the card itself gives no answer away.`;
const TURN = `Make the plan's "try" block a "Your turn" card (type "try", titled "Your turn"): the same step for the reader's own raise, on paper or in a notes app, in under 2 minutes. Optional: say so.`;

function day(d: Day, extra: { turn?: boolean } = {}) {
  return { ...d, needs: [...d.needs, ...(d.blocks.includes("tryit") ? [TRYIT] : []), STEP, ...(extra.turn === false ? [] : [TURN])], minutes: (d.readMinutes ?? 3) + 2, readMinutes: d.readMinutes ?? 3, pieces: [] as string[], assumes: [] as string[] };
}
const TEACH = ["picture", "teach", "example", "exercise", "try", "breath"];
const TEACH_TRY = ["picture", "teach", "tryit", "example", "exercise", "try", "breath"];
const TEACH_MISTAKE = ["picture", "teach", "example", "mistake", "exercise", "try", "breath"];

export const PLAN = {
  topic: "Ask for a raise and get it",
  mode: "skill",
  body: false,
  format: "course",
  caution: "none",
  goal: "Ask my manager for a raise with a specific number, the proof behind it, the right timing, and a plan for whatever they answer",
  outcome7: "By day 7 you'll have a number backed by the market, your results on one page, the meeting booked at the right time, your first minute ready to say, an answer for \"not now\", and the email that puts it in writing.",
  picture: null,
  pictureWhyNot: "a running example (Divya's ask, built one piece a day) carries the handbook instead of an analogy",
  framing: null,
  series: `One running example through all 7 chapters: ${DIVYA}. Each chapter builds one piece of her ask, shows it done, then hands the reader "Your turn". Value comes early: chapter 1 leaves the reader with the three-line case the rest of the handbook fills in. Each chapter is under 5 minutes.`,
  sources: [
    { who: "Roger Fisher and William Ury", what: "Getting to Yes", why: "interests over positions, and knowing your best alternative before you ask" },
    { who: "Adam D. Galinsky and Thomas Mussweiler", what: "First offers as anchors: The role of perspective-taking and negotiator focus (Journal of Personality and Social Psychology, 2001)", why: "why the first specific number pulls the final one toward it" },
    { who: "Chris Voss with Tahl Raz", what: "Never Split the Difference", why: "open \"what\" and \"how\" questions when the answer is \"not now\"" },
  ],
  next: ["Build a system that lands your next job", "Hold a room for 10 minutes", "Read your salary slip"],
  chapters: [
    day({ title: "Give your manager the words", readMinutes: 2, covers: "Your manager often can't approve a raise alone. A three-line case (your results, the market, your number) gives them what to say upstairs.", outcome: "You can write a three-line raise case your manager could repeat to their own boss.",
      hook: "Your manager often can't say yes alone. So give them the words to ask for you.",
      needs: ["The aha by card 3, through the Try it card (card 3, type \"tryit\"): three ways Divya could open (her rent went up by ₹8,000 a month; \"I feel I deserve more\"; her three-line case); on the page the reader taps the one Suresh could take to his own boss, and the page shows why: reasons about the work and the market travel up the chain, personal costs and feelings don't. The cards before it set up the question without answering it.",
        "Say kindly that personal costs are real; they just aren't a reason the company can use to approve a raise.",
        "By the end, Divya's finished three-line case (result: release checks from 3 days to overnight; market: ₹12 to 14.5 lakh for her role in Hyderabad; number: ₹13 lakh), so the reader has a worked case in hand within 5 minutes. Say that chapters 2 and 3 show how she found each line.",
        "The Your turn: write the three line labels (result, market, number) and fill in the result line; leave the others blank for chapters 2 and 3."],
      blocks: ["picture", "teach", "tryit", "example", "try", "breath"], proof: "retell" }),
    day({ title: "What changed because of you", covers: "Your last 12 months as results with numbers: time saved, money saved or earned, problems fixed, people helped, work taken on.", outcome: "You can list three results from your past year, each with a number.",
      hook: "Your manager doesn't remember your year the way you do.",
      needs: ["The five kinds of number: time saved, money saved or earned, problems fixed, people helped, work taken on beyond the role.",
        "Where to find them in 10 minutes: sent emails, tickets or task lists, reports, thank-you messages from colleagues or clients.",
        "Divya's list before (\"worked hard on automation\", \"helped new joiners\") and after (\"a 3-day manual test round now runs overnight\", \"trained 2 new joiners on the team's test tools\").",
        "The mistake: listing effort and loyalty (late nights, years served) instead of what changed. Effort is real, but it isn't a result the company can price."],
      blocks: TEACH_MISTAKE, proof: "scenario" }),
    day({ title: "Find your number", covers: "A market range from three kinds of source, compared like for like, and one specific number near its top.", outcome: "You can name the number you'll ask for and say where it comes from.",
      hook: "Ask for \"something fair\" and you've let the other side pick the number.",
      needs: ["Three kinds of source: salary sites such as AmbitionBox, Glassdoor and Naukri (self-reported, so a range, not a fact); two or three people in similar roles (ask for a range, not their salary); job postings or recruiter calls that state a band.",
        "Like for like: the same role, city and years, and CTC against CTC (explain CTC, cost to company, the yearly total including parts that never reach your bank) or fixed against fixed. Ask for the rise in fixed pay where you can, since variable pay depends on ratings.",
        "One number, not a range, in the upper part of the market range, with a reason. Galinsky and Mussweiler (2001) found the first specific number put on the table pulled the final agreement toward it; paraphrase, no quotes. If the research brief gives a current India salary-increase survey figure, use it as context; otherwise leave it out.",
        "The Try it card: Divya's range as a line from ₹12 lakh to ₹14.5 lakh, with her current ₹11 lakh marked; the reader drags a marker to set her ask and the page says what each spot signals (below the range leaves money unasked; the upper part with a reason is the strong ask; above the range needs a reason she doesn't have)."],
      blocks: TEACH_TRY, proof: "scenario" }),
    day({ title: "Ask before the budget is set", covers: "Raises are decided when budgets and ratings are fixed, often weeks before hike letters. Ask before that, in a booked meeting.", outcome: "You can pick the week to ask and book the meeting with one clear line.",
      hook: "By the time hike letters arrive, the decision was made weeks earlier.",
      needs: ["Many Indian companies run appraisals on the April-to-March financial year; budgets and ratings are fixed before increments are announced, so the ask goes in before ratings close. Tell the reader to check their own company's HR calendar; current norms only as the research brief gives them.",
        "Good moments outside the cycle: right after a clear result, when you've taken on a bigger role, when you've absorbed a colleague's work after they left.",
        "Book it: a 30-minute meeting with a plain subject line, never a corridor ask or a chat message, and not the day after a team setback. Divya's invite to Suresh, word for word, for the first week of February."],
      blocks: TEACH, proof: "scenario" }),
    day({ title: "Say the number, then stop", covers: "The first minute of the meeting: why you're there, your results, your number. Then silence.", outcome: "You can say your ask out loud in under a minute and stop after the number.",
      hook: "The hardest part of asking for a raise is the five seconds after the number.",
      needs: ["The first minute in three parts: why we're meeting (one line, warm), the two or three results from chapter 2, the number from chapter 3 said as one number (\"₹13 lakh\"), never \"around 12 or 13\".",
        "After the number, stop talking and let them answer, even when the silence feels long. Calm tone, no apology, no threat. It works the same on a video call.",
        "Divya's first minute, word for word.",
        "The Your turn: write your own three sentences. Then a timer (doit, kind timer, 60 seconds): say them out loud once, alone; recording on your phone is optional."],
      blocks: ["picture", "teach", "example", "try", "doit", "breath"], proof: "set" }),
    day({ title: "When they say \"not now\"", covers: "The four replies you're likely to hear (yes, a lower number, not now, no) and what to say to each.", outcome: "You can answer \"not now\" with a question that gets you a date and a plan.",
      hook: "\"Not now\" is the start of the conversation, not the end of it.",
      needs: ["The Try it card: Suresh says the budget allows 10% this cycle; the reader taps one of three responses (accept and leave the room; repeat the case more firmly; ask what it would take to reach ₹13 lakh, and by when), and the page shows where each one leads.",
        "The four replies: yes (confirm the number and the date it starts); a lower number (ask about the gap, and about what else can move: title, scope, an earlier review, a learning budget); not now (\"What would need to be true for ₹13 lakh, and by when?\"); no (ask what would change it).",
        "Know your best alternative before the meeting (Fisher and Ury's term, explained plainly: what you'd do if no deal is reached). Never threaten to leave unless you mean it, and never invent an outside offer.",
        "Divya's real exchange from her fixed facts: 10% now and an October review against two written goals."],
      blocks: TEACH_TRY, proof: "scenario" }),
    day({ title: "Put it in writing", readMinutes: 3, covers: "The recap email the same day, the follow-up on the agreed date, and what to do if the answer stays no.", outcome: "You can write a recap email that turns a spoken promise into a dated plan.",
      hook: "A promise made in a meeting fades by next quarter. An email doesn't.",
      needs: ["The recap email, sent the same day, in five lines: thanks, what was agreed, the goals, the review date, \"Let me know if I've missed anything.\" Divya's email to Suresh, word for word.",
        "After it: a calendar reminder for the review date, and a monthly note of progress on each goal, with numbers, which becomes the next ask's chapter 2.",
        "If the answer stays no after the agreed date, the job market is the honest alternative (the handbook \"Build a system that lands your next job\"). An outside offer is mentioned only if you'd really take it. Never tell the reader whether to stay or leave.",
        "The mistake: leaving the meeting happy and writing nothing down.",
        "This is the last chapter: end with what the reader can now do."],
      blocks: TEACH_MISTAKE, proof: "scenario" }),
  ],
};
