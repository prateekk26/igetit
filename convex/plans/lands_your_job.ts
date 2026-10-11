// A hand-made showcase handbook of the free eleven (docs/free-ten.md, pick 2), planned the way HOLD_A_ROOM is
// (convex/showcasePlans.ts, D65): each chapter's delivery spec written by hand, one running example all the way.
// Every title and line here is (agent) copy until Prateek rewrites it.

type Day = { title: string; covers: string; outcome: string; hook: string; needs: string[]; blocks: string[]; proof: string; readMinutes?: number };

// The running example every chapter shows done. An invented person, so his numbers are an example, never a measured result.
const ARJUN = "Arjun, 29, an accounts executive at an auto-parts manufacturer in Ahmedabad";
// His facts stay the same in every chapter, so the example reads as one person's search growing, not seven strangers.
const ARJUN_FACTS = `His fixed facts, the same in every chapter: B.Com; five years at the same company, handling vendor payments; CTC (cost to company, the yearly total the employer spends on him) ₹6 lakh; his notice period is 60 days; his two proudest results: an Excel tracker that cut the month-end vendor payment close from 8 days to 5, and catching ₹4 lakh of duplicate vendor payments in one year; he wants a financial analyst role at a larger manufacturing or consumer-goods company in Ahmedabad or Pune, and his pay floor is ₹8 lakh CTC; he has 5 hours a week for the search (an hour on four weeknights, plus a Sunday review); last month, before this handbook, he sent 40 applications through job portals, heard back from 1 and got no interview; his tracker is a Google Sheet; his referral contact is Pooja, a college batchmate he hasn't spoken to in two years, now at a consumer-goods company in Pune. From chapter 7 only: a Pune company offers him ₹8.5 lakh CTC, of which ₹60,000 is yearly variable pay, and the offer letter also counts the employer's PF contribution and gratuity inside the CTC. His numbers are an example, never a measured result, and never a promise of what the reader will get.`;
const STEP = `Show this chapter's step done on the running example: ${ARJUN}. ${ARJUN_FACTS} Chapter by chapter he builds one search: his tracker, his one-line target, his CV lines, his profiles, his message to Pooja, his five interview stories, then reading his offer. Show his work before and after this step, in his words, consistent with what earlier chapters showed. Never name a real company as his employer, as hiring, or as making him an offer; describe them ("a consumer-goods company in Pune").`;
const TRYIT = `Include the plan's "tryit" block as a card whose type is exactly "tryit" (not "try"): {"type":"tryit","title":"Try it","idea":"<one line: what the reader taps and what they see>"}. The interactive page is built from the idea line afterwards; the card itself gives no answer away.`;
const TURN = `Make the plan's "try" block a "Your turn" card (type "try", titled "Your turn"): the same step for the reader's own job search, on paper, in a notes app or a sheet, in under 2 minutes. Optional: say so. If they aren't searching yet, they do it for the next job they'd want.`;

function day(d: Day, extra: { turn?: boolean } = {}) {
  return { ...d, needs: [...d.needs, ...(d.blocks.includes("tryit") ? [TRYIT] : []), STEP, ...(extra.turn === false ? [] : [TURN])], minutes: (d.readMinutes ?? 3) + 2, readMinutes: d.readMinutes ?? 3, pieces: [] as string[], assumes: [] as string[] };
}
const TEACH_TRY = ["picture", "teach", "tryit", "example", "exercise", "try", "breath"];
const TEACH_MISTAKE = ["picture", "teach", "example", "mistake", "exercise", "try", "breath"];

export const PLAN = {
  topic: "Build a system that lands your next job",
  mode: "skill",
  body: false,
  format: "course",
  caution: "none",
  goal: "Build a job search system that lands my next job: know where my search leaks, aim it at one role, and have the CV, profile, referrals and interview stories to fix each stage",
  outcome7: "By day 7 you'll run your job search as a weekly system: a tracker that shows which stage leaks, and the target, CV lines, profiles, referral message and interview stories that fix each stage.",
  picture: null,
  pictureWhyNot: "a running example (Arjun's search, tracked stage by stage) carries the handbook instead of an analogy",
  framing: null,
  series: `One running example through all 7 chapters: ${ARJUN}. Each chapter fixes one stage of his search, shows it done on his case, then hands the reader "Your turn". Value comes early: chapter 1 leaves the reader with a working tracker and the stage to fix first. Each chapter is under 5 minutes.`,
  sources: [
    { who: "Steve Dalton", what: "The 2-Hour Job Search", why: "a short target list and contacts inside those companies, instead of mass applying" },
    { who: "Mark Granovetter", what: "The Strength of Weak Ties (American Journal of Sociology, 1973)", why: "why acquaintances, more than close friends, pass on job leads" },
    { who: "Richard N. Bolles", what: "What Color Is Your Parachute?", why: "deciding what job you want before you apply" },
  ],
  next: ["Ask for a raise and get it", "Hold a room for 10 minutes", "Negotiate a job offer"],
  chapters: [
    day({ title: "Find the leak", readMinutes: 2, covers: "A job search has four stages: applied, heard back, interviewed, offered. Count each, and the weakest one tells you what to fix.", outcome: "You can set up a one-sheet tracker and name the stage where your search leaks.",
      hook: "Forty more applications won't fix a search that leaks at the first step.",
      needs: ["The aha by card 3, through the Try it card (card 3, type \"tryit\"): Arjun's last month as four stages (40 applied, 1 heard back, 0 interviews, 0 offers); on the page the reader taps the stage they'd fix first, and the page shows the leak is between applied and heard back, and that its fix is aim and the CV, not more applications. A second button shows a different search (10 applied, 4 heard back, 4 interviews, 0 offers) whose leak is the interview. The cards before it set up the question without answering it.",
        "The four stages and what fixes each, in one line apiece: few replies means the aim, the CV or the route in (chapters 2 to 5); interviews without offers means the stories (chapter 6); an offer means reading it well (chapter 7). Say plainly that this handbook builds one fix a day.",
        "By the end, Arjun's tracker, ready to copy: six columns (company, role, how he applied: portal, referral or direct, date, stage, next step and its date) and his first three rows, so the reader has a worked tracker in hand within 5 minutes.",
        "The Your turn: make the six columns in a sheet or on a notebook page and add one row, even a job you only saved."],
      blocks: ["picture", "teach", "tryit", "example", "try", "breath"], proof: "retell" }),
    day({ title: "Name the job you want", covers: "A one-line target: the role as job posts name it, the level, the cities, the kind of company, and your pay floor.", outcome: "You can write a one-line job target that tells you which postings to skip.",
      hook: "Arjun searched \"accountant\" for a month. The job he wanted is called something else.",
      needs: ["How to find the title companies use: read 10 postings for the job you want next, note the titles and the words that repeat in them. Arjun moves from \"accountant jobs\" to \"financial analyst\".",
        "The five parts of the target line: the role as postings title it, the level (years asked for), the cities or remote, the kind of company, and a pay floor (the lowest CTC, cost to company, he would move for; Arjun's is ₹8 lakh). Show his line before and after.",
        "What the target lets you skip: a posting that misses two of the five parts gets no application. Fewer, better-aimed applications are the point.",
        "The mistake: applying to everything to feel busy, told as Arjun's 40 portal applications."],
      blocks: TEACH_MISTAKE, proof: "scenario" }),
    day({ title: "Lines that prove it", covers: "Turn CV duties into results: what you did, for whom, and what changed, with a number.", outcome: "You can rewrite a CV line from a duty into a result with a number.",
      hook: "\"Responsible for vendor payments\" tells a recruiter nothing. One change makes it a reason to call.",
      needs: ["The Try it card: three of Arjun's old CV lines; the reader taps each to sort it as a duty or a result, and the page shows the result version of each duty (\"Cut the month-end vendor close from 8 days to 5 with an Excel tracker the whole team now uses\").",
        "The result line's shape: a doing word, what you did, and what changed, with a number. Where numbers come from when you think you have none: time, money, count, people, how often; an honest estimate says \"about\".",
        "Aim the top third of the CV at the target: use the words that repeat in the postings from chapter 2, because recruiters and the software many companies use to store applications search by those words. Do not claim that software rejects most CVs automatically; it isn't established.",
        "Every number must be one you can explain in an interview; never inflate one."],
      blocks: TEACH_TRY, proof: "scenario" }),
    day({ title: "Be found by recruiters", covers: "Recruiters search LinkedIn and Naukri by keywords. Put your target's words where their search looks.", outcome: "You can set up your LinkedIn and Naukri profiles so a search for your target role finds you.",
      hook: "A recruiter types three words into a search box. Are yours on your profile?",
      needs: ["Where the search looks: the headline (the target title and what you're good at, never \"Seeking opportunities\"), the current role, the skills, the location. Arjun's LinkedIn headline before and after, using the posting words from chapter 2.",
        "LinkedIn's Open to Work can be shown to recruiters only, not as the green photo frame; say that LinkedIn says it tries to keep it from your own company's recruiters but can't promise it. On Naukri: the same keywords in the profile and CV headline, the target cities, the notice period filled in. Any claim about how either site ranks profiles (for example, recently updated ones) only as the research brief states it.",
        "The mistake: a profile that describes the job you have, not the one you want.",
        "A checklist (doit, kind checklist) that is the reader's turn, optional with Later: headline names the target title; five skills taken from the postings' words; location set to the target cities; Open to Work set to recruiters only; Naukri headline and CV updated the same day."],
      blocks: ["picture", "teach", "example", "mistake", "doit", "breath"], proof: "set" }, { turn: false }),
    day({ title: "The message a friend can forward", covers: "A referral is often the shortest route in. Ask in four lines, and make it easy to say yes.", outcome: "You can write a referral request a contact can act on in two minutes.",
      hook: "The person most likely to get you in is often someone you rarely talk to.",
      needs: ["Who to ask: batchmates, former colleagues, alumni on LinkedIn at the companies on your target. Granovetter's 1973 study: people who found jobs through contacts more often heard through acquaintances than through close friends. Paraphrase it; no quotes.",
        "The four lines: who you are and how you know them; the exact role with its link or job ID; one result line from chapter 3 that fits it; an easy ask (\"Could I send my CV for a referral? If it's not a fit, no problem at all.\"). Attach a three-line note about you they can forward as it is.",
        "Many companies run referral programmes, some with a bonus for the employee, so a good, specific ask is useful to them too. Follow up once after about a week, then let it go.",
        "Arjun's message to Pooja on LinkedIn, before (\"Hi, any openings in your company?\") and after. The mistake: the vague ask that leaves the friend to do all the work."],
      blocks: TEACH_MISTAKE, proof: "scenario" }),
    day({ title: "Five stories for any question", covers: "Most \"tell me about a time\" questions can be answered from five prepared stories, each told in four parts.", outcome: "You can answer a \"tell me about a time\" question with a prepared story in under two minutes.",
      hook: "Interviewers can ask dozens of questions. You need about five stories.",
      needs: ["The four-part story, STAR: situation, task, action, result; most of the time on the action and the result, the result with a number.",
        "The five stories to have ready: a result you're proud of, a problem you solved, a mistake and what you changed, a disagreement handled well, something you learned fast. Arjun's five in one line each; tell the duplicate-payments one in full.",
        "The Try it card: six common interview questions; the reader taps a question, then taps which of Arjun's five stories answers it, and the page shows the match and the story's first sentence.",
        "\"Why do you want to leave?\" answered forward (what you want next), never by criticising the current employer."],
      blocks: TEACH_TRY, proof: "scenario" }),
    day({ title: "Read the offer, then resign", readMinutes: 4, covers: "What a CTC includes, what reaches your bank each month, and the steps before you resign.", outcome: "You can read an offer letter, ask what's missing, and resign only once the offer is in writing.",
      hook: "Arjun's ₹8.5 lakh offer won't put ₹8.5 lakh in his bank account. Here's where it goes.",
      needs: ["The Try it card: Arjun's ₹8.5 lakh CTC as parts (monthly fixed pay, yearly variable pay, the employer's PF contribution, gratuity); the reader taps each part to say whether it reaches his monthly bank credit, and the page shows the answer and why. No tax is calculated; for the real take-home, ask HR for the monthly salary breakup.",
        "Questions to ask before accepting: how much is fixed and how much variable, and how the variable is decided; the joining date against the notice period; whether the new company will wait 60 days or whether a buyout (paying to shorten the notice) is possible, which depends on both companies' rules.",
        "Resign only after the offer letter is in hand, signed. If the current employer makes a counter-offer, decide what you'd say before you resign, not in the meeting. Never tell the reader which offer to take.",
        "The mistake: resigning on a phone call's promise.",
        "This is the last chapter: end with what the reader can now do and the weekly habit that keeps the system running, 20 minutes each Sunday to update the tracker, find the leak and pick the week's five actions."],
      blocks: ["picture", "teach", "tryit", "example", "mistake", "exercise", "breath"], proof: "scenario" }, { turn: false }),
  ],
};
